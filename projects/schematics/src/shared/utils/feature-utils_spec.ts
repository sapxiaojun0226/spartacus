import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import {
  Schema as ApplicationOptions,
  Style,
} from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import * as path from 'path';
import { Schema as SpartacusOptions } from '../../add-spartacus/schema';
import { UTF_8 } from '../constants';
import {
  CHECKOUT_B2B_FEATURE_NAME,
  CHECKOUT_BASE_FEATURE_NAME,
  CHECKOUT_SCHEDULED_REPLENISHMENT_FEATURE_NAME,
  DIGITAL_PAYMENTS_FEATURE_NAME,
  ORDER_FEATURE_NAME,
  SPARTACUS_CHECKOUT,
  SPARTACUS_SCHEMATICS,
  USER_ACCOUNT_FEATURE_NAME,
} from '../libs-constants';
import {
  addFeatures,
  getDynamicallyImportedLocalSourceFile,
} from './feature-utils';
import { collectDynamicImports } from './import-utils';
import { LibraryOptions } from './lib-utils';
import { createProgram } from './program';
import { getProjectTsConfigPaths } from './project-tsconfig-paths';
import {
  checkoutFeatureModulePath,
  checkoutWrapperModulePath,
  userFeatureModulePath,
} from './test-utils';

describe('Feature utils', () => {
  const schematicRunner = new SchematicTestRunner(
    SPARTACUS_SCHEMATICS,
    path.join(__dirname, '../../collection.json')
  );

  let appTree: Tree;
  let buildPath: string;

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    version: '0.5.0',
  };

  const appOptions: ApplicationOptions = {
    name: 'schematics-test',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: Style.Scss,
    skipTests: false,
    projectRoot: '',
  };

  const spartacusDefaultOptions: SpartacusOptions = {
    project: 'schematics-test',
    lazy: true,
    features: [],
  };

  const BASE_OPTIONS: LibraryOptions = {
    project: 'schematics-test',
    lazy: true,
  };

  beforeEach(async () => {
    appTree = await schematicRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'workspace',
        workspaceOptions
      )
      .toPromise();
    appTree = await schematicRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        appOptions,
        appTree
      )
      .toPromise();
    appTree = await schematicRunner
      .runSchematicAsync(
        'add-spartacus',
        { ...spartacusDefaultOptions, name: 'schematics-test' },
        appTree
      )
      .toPromise();

    buildPath = getProjectTsConfigPaths(appTree, BASE_OPTIONS.project)
      .buildPaths[0];
  });

  describe('addFeatures', () => {
    it('should generate feature modules for the given array of features', async () => {
      appTree = await schematicRunner
        .callRule(
          addFeatures(BASE_OPTIONS, [USER_ACCOUNT_FEATURE_NAME]),
          appTree
        )
        .toPromise();

      expect(
        appTree.read(userFeatureModulePath)?.toString(UTF_8)
      ).toMatchSnapshot();
    });
  });

  describe('getDynamicallyImportedLocalSourceFile', () => {
    it('should return falsy if not local import', async () => {
      appTree = await schematicRunner
        .runSchematicAsync(
          'ng-add',
          {
            ...spartacusDefaultOptions,
            name: 'schematics-test',
            features: [USER_ACCOUNT_FEATURE_NAME],
          },
          appTree
        )
        .toPromise();

      const { program } = createProgram(appTree, appTree.root.path, buildPath);
      const userFeatureModule = program.getSourceFileOrThrow(
        userFeatureModulePath
      );
      const dynamicImport = collectDynamicImports(userFeatureModule)[0];

      const result = getDynamicallyImportedLocalSourceFile(dynamicImport);
      expect(result).toBeFalsy();
    });

    it('should return the locally referenced source file', async () => {
      appTree = await schematicRunner
        .runSchematicAsync(
          'ng-add',
          {
            ...spartacusDefaultOptions,
            name: 'schematics-test',
            features: [CHECKOUT_BASE_FEATURE_NAME],
          },
          appTree
        )
        .toPromise();
      appTree = await schematicRunner
        .runSchematicAsync(
          'ng-add',
          {
            ...spartacusDefaultOptions,
            name: 'schematics-test',
            features: [CHECKOUT_B2B_FEATURE_NAME],
          },
          appTree
        )
        .toPromise();

      const { program } = createProgram(appTree, appTree.root.path, buildPath);
      const checkoutFeatureModule = program.getSourceFileOrThrow(
        checkoutFeatureModulePath
      );
      const dynamicImport = collectDynamicImports(checkoutFeatureModule)[0];

      const result = getDynamicallyImportedLocalSourceFile(dynamicImport);
      expect(result?.print()).toMatchSnapshot();
    });
  });

  describe('analyzeApplication', () => {
    describe('dependent features check', () => {
      it('should throw when a feature is not configured in the existing Spartacus application', async () => {
        appTree = await schematicRunner
          .runSchematicAsync(
            'ng-add',
            {
              ...spartacusDefaultOptions,
              name: 'schematics-test',
              features: [CHECKOUT_BASE_FEATURE_NAME],
            },
            appTree
          )
          .toPromise();
        try {
          appTree = await schematicRunner
            .runSchematicAsync(
              'ng-add',
              {
                ...spartacusDefaultOptions,
                name: 'schematics-test',
                features: [CHECKOUT_SCHEDULED_REPLENISHMENT_FEATURE_NAME],
              },
              appTree
            )
            .toPromise();
        } catch (e) {
          expect(e).toBeTruthy();
        }
      });

      it('should throw when a feature is not configured, but library is present in package.json', async () => {
        appTree = await schematicRunner
          .runSchematicAsync(
            'ng-add',
            {
              ...spartacusDefaultOptions,
              name: 'schematics-test',
              features: [ORDER_FEATURE_NAME],
            },
            appTree
          )
          .toPromise();

        const packageJson = JSON.parse(
          appTree.read('package.json')?.toString(UTF_8) ?? ''
        );
        packageJson.dependencies[SPARTACUS_CHECKOUT] = '9.9.9';
        appTree.overwrite('package.json', JSON.stringify(packageJson, null, 2));

        try {
          appTree = await schematicRunner
            .runSchematicAsync(
              'ng-add',
              {
                ...spartacusDefaultOptions,
                name: 'schematics-test',
                features: [CHECKOUT_SCHEDULED_REPLENISHMENT_FEATURE_NAME],
              },
              appTree
            )
            .toPromise();
        } catch (e) {
          expect(e).toBeTruthy();
        }
      });

      describe('when the dependent feature is eagerly configured', () => {
        it('should succeed', async () => {
          appTree = await schematicRunner
            .runSchematicAsync(
              'ng-add',
              {
                ...spartacusDefaultOptions,
                name: 'schematics-test',
                features: [CHECKOUT_BASE_FEATURE_NAME],
                lazy: false,
              },
              appTree
            )
            .toPromise();
          appTree = await schematicRunner
            .runSchematicAsync(
              'ng-add',
              {
                ...spartacusDefaultOptions,
                name: 'schematics-test',
                features: [DIGITAL_PAYMENTS_FEATURE_NAME],
              },
              appTree
            )
            .toPromise();

          const { program } = createProgram(
            appTree,
            appTree.root.path,
            buildPath
          );
          const checkoutFeatureModule = program.getSourceFileOrThrow(
            checkoutFeatureModulePath
          );
          expect(checkoutFeatureModule.print()).toMatchSnapshot();
        });
      });
      describe('when the dependent feature is lazily configured', () => {
        it('should succeed', async () => {
          appTree = await schematicRunner
            .runSchematicAsync(
              'ng-add',
              {
                ...spartacusDefaultOptions,
                name: 'schematics-test',
                features: [CHECKOUT_BASE_FEATURE_NAME],
              },
              appTree
            )
            .toPromise();
          appTree = await schematicRunner
            .runSchematicAsync(
              'ng-add',
              {
                ...spartacusDefaultOptions,
                name: 'schematics-test',
                features: [DIGITAL_PAYMENTS_FEATURE_NAME],
              },
              appTree
            )
            .toPromise();

          const { program } = createProgram(
            appTree,
            appTree.root.path,
            buildPath
          );
          const checkoutWrapperModule = program.getSourceFileOrThrow(
            checkoutWrapperModulePath
          );
          const checkoutFeatureModule = program.getSourceFileOrThrow(
            checkoutFeatureModulePath
          );
          expect(checkoutWrapperModule.print()).toMatchSnapshot();
          expect(checkoutFeatureModule.print()).toMatchSnapshot();
        });
      });
    });
  });
});
