/// <reference types="jest" />

import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import {
  Schema as ApplicationOptions,
  Style,
} from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import {
  cdcFeatureModulePath,
  CDC_FEATURE_NAME,
  LibraryOptions as SpartacusCdcOptions,
  SpartacusOptions,
  SPARTACUS_ASM,
  SPARTACUS_CDC,
  SPARTACUS_SCHEMATICS,
  SPARTACUS_USER,
  userAccountWrapperModulePath,
  userProfileWrapperModulePath,
  USER_ACCOUNT_FEATURE_NAME,
  USER_PROFILE_FEATURE_NAME,
} from '@spartacus/schematics';
import * as path from 'path';
import { peerDependencies } from '../../package.json';

const collectionPath = path.join(__dirname, '../collection.json');

describe('Spartacus CDC schematics: ng-add', () => {
  const schematicRunner = new SchematicTestRunner(
    SPARTACUS_CDC,
    collectionPath
  );

  let appTree: UnitTestTree;

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

  const libraryNoFeaturesOptions: SpartacusCdcOptions = {
    project: 'schematics-test',
    lazy: true,
    features: [],
  };

  const cdcFeatureOptions: SpartacusCdcOptions = {
    ...libraryNoFeaturesOptions,
    features: [CDC_FEATURE_NAME],
  };

  beforeEach(async () => {
    schematicRunner.registerCollection(
      SPARTACUS_SCHEMATICS,
      path.join(
        __dirname,
        '../../../../projects/schematics/src/collection.json'
      )
    );
    schematicRunner.registerCollection(
      SPARTACUS_ASM,
      require.resolve('../../../../feature-libs/asm/schematics/collection.json')
    );
    schematicRunner.registerCollection(
      SPARTACUS_USER,
      path.join(
        __dirname,
        '../../../../feature-libs/user/schematics/collection.json'
      )
    );

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
      .runExternalSchematicAsync(
        SPARTACUS_SCHEMATICS,
        'ng-add',
        { ...spartacusDefaultOptions, name: 'schematics-test' },
        appTree
      )
      .toPromise();
  });

  describe('Without features', () => {
    beforeEach(async () => {
      appTree = await schematicRunner
        .runSchematicAsync('ng-add', libraryNoFeaturesOptions, appTree)
        .toPromise();
    });

    it('should not create any of the feature modules', () => {
      expect(appTree.exists(cdcFeatureModulePath)).toBeFalsy();
    });
  });

  describe('CDC feature', () => {
    describe('validation of jsSDKUrl', () => {
      beforeEach(async () => {
        appTree = await schematicRunner
          .runSchematicAsync(
            'ng-add',
            {
              ...cdcFeatureOptions,
              features: [USER_ACCOUNT_FEATURE_NAME, USER_PROFILE_FEATURE_NAME],
            },
            appTree
          )
          .toPromise();
        appTree = await schematicRunner
          .runSchematicAsync(
            'ng-add',
            { ...cdcFeatureOptions, javascriptUrl: '<dc>.gigya.com/<api-key>' },
            appTree
          )
          .toPromise();
      });

      it('should set the given javascriptUrl', async () => {
        const featureModule = appTree.readContent(cdcFeatureModulePath);
        expect(featureModule).toMatchSnapshot();
      });
    });

    describe('general setup', () => {
      beforeEach(async () => {
        appTree = await schematicRunner
          .runSchematicAsync(
            'ng-add',
            {
              ...cdcFeatureOptions,
              features: [USER_ACCOUNT_FEATURE_NAME, USER_PROFILE_FEATURE_NAME],
            },
            appTree
          )
          .toPromise();
        appTree = await schematicRunner
          .runSchematicAsync('ng-add', cdcFeatureOptions, appTree)
          .toPromise();
      });

      it('should install necessary Spartacus libraries', () => {
        const packageJson = JSON.parse(appTree.readContent('package.json'));
        let dependencies: Record<string, string> = {};
        dependencies = { ...packageJson.dependencies };
        dependencies = { ...dependencies, ...packageJson.devDependencies };

        for (const toAdd in peerDependencies) {
          // skip the SPARTACUS_SCHEMATICS, as those are added only when running by the Angular CLI, and not in the testing environment
          if (
            !peerDependencies.hasOwnProperty(toAdd) ||
            toAdd === SPARTACUS_SCHEMATICS
          ) {
            continue;
          }
          // TODO: after 4.0: use this test, as we'll have synced versions between lib's and root package.json
          // const expectedVersion = (peerDependencies as Record<
          //   string,
          //   string
          // >)[toAdd];
          const expectedDependency = dependencies[toAdd];
          expect(expectedDependency).toBeTruthy();
          // expect(expectedDependency).toEqual(expectedVersion);
        }
      });

      it('should add the feature using the lazy loading syntax', async () => {
        const featureModule = appTree.readContent(cdcFeatureModulePath);
        expect(featureModule).toMatchSnapshot();
      });

      it('should install the appropriate dependencies', async () => {
        const userAccountWrapperModule = appTree.readContent(
          userAccountWrapperModulePath
        );
        expect(userAccountWrapperModule).toMatchSnapshot();

        const userProfileWrapperModule = appTree.readContent(
          userProfileWrapperModulePath
        );
        expect(userProfileWrapperModule).toMatchSnapshot();
      });
    });

    describe('eager loading', () => {
      beforeEach(async () => {
        appTree = await schematicRunner
          .runSchematicAsync(
            'ng-add',
            {
              ...cdcFeatureOptions,
              features: [USER_ACCOUNT_FEATURE_NAME, USER_PROFILE_FEATURE_NAME],
            },
            appTree
          )
          .toPromise();
        appTree = await schematicRunner
          .runSchematicAsync(
            'ng-add',
            { ...cdcFeatureOptions, lazy: false },
            appTree
          )
          .toPromise();
      });

      it('should import appropriate modules', async () => {
        const featureModule = appTree.readContent(cdcFeatureModulePath);
        expect(featureModule).toMatchSnapshot();
      });
    });
  });
});
