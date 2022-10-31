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
  cartBaseFeatureModulePath,
  checkoutFeatureModulePath,
  checkoutWrapperModulePath,
  CHECKOUT_B2B_FEATURE_NAME,
  CHECKOUT_BASE_FEATURE_NAME,
  CHECKOUT_SCHEDULED_REPLENISHMENT_FEATURE_NAME,
  LibraryOptions as SpartacusCheckoutOptions,
  orderFeatureModulePath,
  SpartacusOptions,
  SPARTACUS_CHECKOUT,
  SPARTACUS_CONFIGURATION_MODULE,
  SPARTACUS_SCHEMATICS,
  userFeatureModulePath,
} from '@spartacus/schematics';
import * as path from 'path';
import { peerDependencies } from '../../package.json';

const collectionPath = path.join(__dirname, '../collection.json');
const scssFilePath = 'src/styles/spartacus/checkout.scss';

describe('Spartacus Checkout schematics: ng-add', () => {
  const schematicRunner = new SchematicTestRunner(
    SPARTACUS_CHECKOUT,
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

  const libraryNoFeaturesOptions: SpartacusCheckoutOptions = {
    project: 'schematics-test',
    lazy: true,
    features: [],
  };

  const checkoutBaseFeatureOptions: SpartacusCheckoutOptions = {
    ...libraryNoFeaturesOptions,
    features: [CHECKOUT_BASE_FEATURE_NAME],
  };

  const checkoutB2BFeatureOptions: SpartacusCheckoutOptions = {
    ...libraryNoFeaturesOptions,
    features: [CHECKOUT_B2B_FEATURE_NAME],
  };

  const checkoutScheduledReplenishmentFeatureOptions: SpartacusCheckoutOptions =
    {
      ...libraryNoFeaturesOptions,
      features: [CHECKOUT_SCHEDULED_REPLENISHMENT_FEATURE_NAME],
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
        .runSchematicAsync(
          'ng-add',
          { ...libraryNoFeaturesOptions, features: [] },
          appTree
        )
        .toPromise();
    });

    it('should not create any of the feature modules', () => {
      expect(appTree.exists(checkoutFeatureModulePath)).toBeFalsy();
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

  describe('Checkout feature', () => {
    describe('base', () => {
      describe('general setup', () => {
        beforeEach(async () => {
          appTree = await schematicRunner
            .runSchematicAsync('ng-add', checkoutBaseFeatureOptions, appTree)
            .toPromise();
        });

        it('should add the feature using the lazy loading syntax', async () => {
          const module = appTree.readContent(checkoutFeatureModulePath);
          expect(module).toMatchSnapshot();

          expect(appTree.readContent(checkoutWrapperModulePath)).toBeFalsy();
        });

        it('should NOT install the required feature dependencies', async () => {
          const cartBaseFeatureModule = appTree.readContent(
            cartBaseFeatureModulePath
          );
          expect(cartBaseFeatureModule).toBeFalsy();

          const orderFeatureModule = appTree.readContent(
            orderFeatureModulePath
          );
          expect(orderFeatureModule).toBeFalsy();

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
      });

      describe('eager loading', () => {
        beforeEach(async () => {
          appTree = await schematicRunner
            .runSchematicAsync(
              'ng-add',
              { ...checkoutBaseFeatureOptions, lazy: false },
              appTree
            )
            .toPromise();
        });

        it('should import appropriate modules', async () => {
          const module = appTree.readContent(checkoutFeatureModulePath);
          expect(module).toMatchSnapshot();

          expect(appTree.readContent(checkoutWrapperModulePath)).toBeFalsy();
        });
      });
    });

    describe('b2b', () => {
      describe('general setup', () => {
        beforeEach(async () => {
          appTree = await schematicRunner
            .runSchematicAsync('ng-add', checkoutBaseFeatureOptions, appTree)
            .toPromise();
          appTree = await schematicRunner
            .runSchematicAsync('ng-add', checkoutB2BFeatureOptions, appTree)
            .toPromise();
        });

        it('should add the feature using the lazy loading syntax', async () => {
          const module = appTree.readContent(checkoutFeatureModulePath);
          expect(module).toMatchSnapshot();

          const wrapperModule = appTree.readContent(checkoutWrapperModulePath);
          expect(wrapperModule).toMatchSnapshot();
        });

        it('should NOT install the required feature dependencies', async () => {
          const cartBaseFeatureModule = appTree.readContent(
            cartBaseFeatureModulePath
          );
          expect(cartBaseFeatureModule).toBeFalsy();

          const orderFeatureModule = appTree.readContent(
            orderFeatureModulePath
          );
          expect(orderFeatureModule).toBeFalsy();

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
              { ...checkoutBaseFeatureOptions, lazy: false },
              appTree
            )
            .toPromise();
          appTree = await schematicRunner
            .runSchematicAsync(
              'ng-add',
              { ...checkoutB2BFeatureOptions, lazy: false },
              appTree
            )
            .toPromise();
        });

        it('should import appropriate modules', async () => {
          const module = appTree.readContent(checkoutFeatureModulePath);
          expect(module).toMatchSnapshot();

          expect(appTree.readContent(checkoutWrapperModulePath)).toBeFalsy();
        });
      });
    });

    describe('scheduled replenishment', () => {
      describe('general setup', () => {
        beforeEach(async () => {
          appTree = await schematicRunner
            .runSchematicAsync('ng-add', checkoutBaseFeatureOptions, appTree)
            .toPromise();
          appTree = await schematicRunner
            .runSchematicAsync('ng-add', checkoutB2BFeatureOptions, appTree)
            .toPromise();
          appTree = await schematicRunner
            .runSchematicAsync(
              'ng-add',
              checkoutScheduledReplenishmentFeatureOptions,
              appTree
            )
            .toPromise();
        });

        it('should add the feature using the lazy loading syntax', async () => {
          const module = appTree.readContent(checkoutFeatureModulePath);
          expect(module).toMatchSnapshot();

          const wrapperModule = appTree.readContent(checkoutWrapperModulePath);
          expect(wrapperModule).toMatchSnapshot();
        });

        it('should NOT install the required feature dependencies', async () => {
          const cartBaseFeatureModule = appTree.readContent(
            cartBaseFeatureModulePath
          );
          expect(cartBaseFeatureModule).toBeFalsy();

          const orderFeatureModule = appTree.readContent(
            orderFeatureModulePath
          );
          expect(orderFeatureModule).toBeFalsy();

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
              { ...checkoutBaseFeatureOptions, lazy: false },
              appTree
            )
            .toPromise();
          appTree = await schematicRunner
            .runSchematicAsync(
              'ng-add',
              { ...checkoutB2BFeatureOptions, lazy: false },
              appTree
            )
            .toPromise();
          appTree = await schematicRunner
            .runSchematicAsync(
              'ng-add',
              { ...checkoutScheduledReplenishmentFeatureOptions, lazy: false },
              appTree
            )
            .toPromise();
        });

        it('should import appropriate modules', async () => {
          const module = appTree.readContent(checkoutFeatureModulePath);
          expect(module).toMatchSnapshot();

          expect(appTree.readContent(checkoutWrapperModulePath)).toBeFalsy();
        });
      });
    });
  });
});
