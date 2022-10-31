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
  LibraryOptions as SpartacusOrganizationOptions,
  orderFeatureModulePath,
  organizationAdministrationFeatureModulePath,
  organizationOrderApprovalFeatureModulePath,
  organizationAccountSummaryFeatureModulePath,
  ORGANIZATION_ADMINISTRATION_FEATURE_NAME,
  ORGANIZATION_ORDER_APPROVAL_FEATURE_NAME,
  ORGANIZATION_ACCOUNT_SUMMARY_FEATURE_NAME,
  SpartacusOptions,
  SPARTACUS_CONFIGURATION_MODULE,
  SPARTACUS_ORGANIZATION,
  SPARTACUS_SCHEMATICS,
  userFeatureModulePath,
} from '@spartacus/schematics';
import * as path from 'path';
import { peerDependencies } from '../../package.json';

const collectionPath = path.join(__dirname, '../collection.json');
const scssFilePath = 'src/styles/spartacus/organization.scss';

describe('Spartacus Organization schematics: ng-add', () => {
  const schematicRunner = new SchematicTestRunner(
    SPARTACUS_ORGANIZATION,
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

  const libraryNoFeaturesOptions: SpartacusOrganizationOptions = {
    project: 'schematics-test',
    lazy: true,
    features: [],
  };

  const administrationFeatureOptions: SpartacusOrganizationOptions = {
    ...libraryNoFeaturesOptions,
    features: [ORGANIZATION_ADMINISTRATION_FEATURE_NAME],
  };

  const orderApprovalFeatureOptions: SpartacusOrganizationOptions = {
    ...libraryNoFeaturesOptions,
    features: [ORGANIZATION_ORDER_APPROVAL_FEATURE_NAME],
  };

  const accountSummaryFeatureOptions: SpartacusOrganizationOptions = {
    ...libraryNoFeaturesOptions,
    features: [ORGANIZATION_ACCOUNT_SUMMARY_FEATURE_NAME],
  };

  beforeEach(async () => {
    schematicRunner.registerCollection(
      SPARTACUS_SCHEMATICS,
      '../../projects/schematics/src/collection.json'
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

    it('should not install administration, order-approval and account-summary features', () => {
      expect(
        appTree.exists(organizationAdministrationFeatureModulePath)
      ).toBeFalsy();
      expect(
        appTree.exists(organizationOrderApprovalFeatureModulePath)
      ).toBeFalsy();
      expect(
        appTree.exists(organizationAccountSummaryFeatureModulePath)
      ).toBeFalsy();
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
  });

  describe('Administration feature', () => {
    describe('general setup', () => {
      beforeEach(async () => {
        appTree = await schematicRunner
          .runSchematicAsync('ng-add', administrationFeatureOptions, appTree)
          .toPromise();
      });

      it('should add the feature using the lazy loading syntax', async () => {
        const module = appTree.readContent(
          organizationAdministrationFeatureModulePath
        );
        expect(module).toMatchSnapshot();
      });

      it('should NOT install the required feature dependencies', async () => {
        const userFeatureModule = appTree.readContent(userFeatureModulePath);
        expect(userFeatureModule).toBeFalsy();
      });

      describe('styling', () => {
        it('should create a proper scss file', () => {
          const scssContent = appTree.readContent(scssFilePath);
          expect(scssContent).toMatchSnapshot();
        });

        it('should update angular.json', async () => {
          const content = appTree.readContent('/angular.json');
          expect(content).toMatchSnapshot();
        });
      });

      describe('b2b features', () => {
        it('configuration should be added', () => {
          const configurationModule = appTree.readContent(
            `src/app/spartacus/${SPARTACUS_CONFIGURATION_MODULE}.module.ts`
          );
          expect(configurationModule).toMatchSnapshot();
        });
      });
    });

    describe('eager loading', () => {
      beforeEach(async () => {
        appTree = await schematicRunner
          .runSchematicAsync(
            'ng-add',
            { ...administrationFeatureOptions, lazy: false },
            appTree
          )
          .toPromise();
      });

      it('should import appropriate modules', async () => {
        const module = appTree.readContent(
          organizationAdministrationFeatureModulePath
        );
        expect(module).toMatchSnapshot();
      });
    });
  });

  describe('Order approval feature', () => {
    describe('general setup', () => {
      beforeEach(async () => {
        appTree = await schematicRunner
          .runSchematicAsync('ng-add', orderApprovalFeatureOptions, appTree)
          .toPromise();
      });

      it('should add the feature using the lazy loading syntax', async () => {
        const module = appTree.readContent(
          organizationOrderApprovalFeatureModulePath
        );
        expect(module).toMatchSnapshot();
      });

      it('should NOT install the required feature dependencies', async () => {
        const userFeatureModule = appTree.readContent(userFeatureModulePath);
        expect(userFeatureModule).toBeFalsy();

        const orderFeatureModule = appTree.readContent(orderFeatureModulePath);
        expect(orderFeatureModule).toBeFalsy();
      });

      describe('styling', () => {
        it('should create a proper scss file', () => {
          const scssContent = appTree.readContent(scssFilePath);
          expect(scssContent).toMatchSnapshot();
        });

        it('should update angular.json', async () => {
          const content = appTree.readContent('/angular.json');
          expect(content).toMatchSnapshot();
        });
      });

      describe('b2b features', () => {
        it('configuration should be added', () => {
          const configurationModule = appTree.readContent(
            `src/app/spartacus/${SPARTACUS_CONFIGURATION_MODULE}.module.ts`
          );
          expect(configurationModule).toMatchSnapshot();
        });
      });
    });

    describe('eager loading', () => {
      beforeEach(async () => {
        appTree = await schematicRunner
          .runSchematicAsync(
            'ng-add',
            { ...orderApprovalFeatureOptions, lazy: false },
            appTree
          )
          .toPromise();
      });

      it('should import appropriate modules', async () => {
        const module = appTree.readContent(
          organizationOrderApprovalFeatureModulePath
        );
        expect(module).toMatchSnapshot();
      });
    });
  });

  describe('Account summary feature', () => {
    describe('general setup', () => {
      beforeEach(async () => {
        appTree = await schematicRunner
          .runSchematicAsync('ng-add', accountSummaryFeatureOptions, appTree)
          .toPromise();
      });

      it('should add the feature using the lazy loading syntax', async () => {
        const module = appTree.readContent(
          organizationAccountSummaryFeatureModulePath
        );
        expect(module).toMatchSnapshot();
      });

      it('should NOT install the required feature dependencies', async () => {
        const administrationFeatureModule = appTree.readContent(
          organizationAdministrationFeatureModulePath
        );
        expect(administrationFeatureModule).toBeFalsy();
      });

      describe('styling', () => {
        it('should create a proper scss file', () => {
          const scssContent = appTree.readContent(scssFilePath);
          expect(scssContent).toMatchSnapshot();
        });

        it('should update angular.json', async () => {
          const content = appTree.readContent('/angular.json');
          expect(content).toMatchSnapshot();
        });
      });

      describe('b2b features', () => {
        it('configuration should be added', () => {
          const configurationModule = appTree.readContent(
            `src/app/spartacus/${SPARTACUS_CONFIGURATION_MODULE}.module.ts`
          );
          expect(configurationModule).toMatchSnapshot();
        });
      });
    });

    describe('eager loading', () => {
      beforeEach(async () => {
        appTree = await schematicRunner
          .runSchematicAsync(
            'ng-add',
            { ...accountSummaryFeatureOptions, lazy: false },
            appTree
          )
          .toPromise();
      });

      it('should import appropriate modules', async () => {
        const module = appTree.readContent(
          organizationAccountSummaryFeatureModulePath
        );
        expect(module).toMatchSnapshot();
      });
    });
  });
});
