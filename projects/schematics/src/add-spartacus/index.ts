/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  chain,
  noop,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { NodeDependency } from '@schematics/angular/utility/dependencies';
import { WorkspaceProject } from '@schematics/angular/utility/workspace-models';
import { ANGULAR_HTTP, RXJS } from '../shared/constants';
import { SPARTACUS_STOREFRONTLIB } from '../shared/libs-constants';
import {
  analyzeCrossFeatureDependencies,
  analyzeCrossLibraryDependenciesByFeatures,
} from '../shared/utils/dependency-utils';
import { addFeatures, analyzeApplication } from '../shared/utils/feature-utils';
import { getIndexHtmlPath } from '../shared/utils/file-utils';
import { appendHtmlElementToHead } from '../shared/utils/html-utils';
import {
  addPackageJsonDependencies,
  finalizeInstallation,
  installPackageJsonDependencies,
} from '../shared/utils/lib-utils';
import { addModuleImport } from '../shared/utils/new-module-utils';
import {
  getPrefixedSpartacusSchematicsVersion,
  getSpartacusCurrentFeatureLevel,
  mapPackageToNodeDependencies,
  prepare3rdPartyDependencies,
  prepareSpartacusDependencies,
  readPackageJson,
  updatePackageJsonDependencies,
} from '../shared/utils/package-utils';
import { createProgram, saveAndFormat } from '../shared/utils/program';
import { getProjectTsConfigPaths } from '../shared/utils/project-tsconfig-paths';
import {
  getDefaultProjectNameFromWorkspace,
  getProjectFromWorkspace,
  getProjectTargets,
  getWorkspace,
  scaffoldStructure,
} from '../shared/utils/workspace-utils';
import { addSpartacusConfiguration } from './configuration';
import { Schema as SpartacusOptions } from './schema';
import { setupSpartacusModule } from './spartacus';
import { setupSpartacusFeaturesModule } from './spartacus-features';
import { setupStoreModules } from './store';

function installStyles(options: SpartacusOptions): Rule {
  return (tree: Tree, context: SchematicContext): void => {
    if (options.debug) {
      context.logger.info(`⌛️ Installing styles...`);
    }

    const project = getProjectFromWorkspace(tree, options);
    const rootStyles = getProjectTargets(project)?.build?.options?.styles?.[0];
    const styleFilePath =
      typeof rootStyles === 'object'
        ? ((rootStyles as any)?.input as string)
        : rootStyles;

    if (!styleFilePath) {
      context.logger.warn(
        `Could not find the default style file for this project.`
      );
      context.logger.warn(
        `Please consider manually setting up spartacus styles`
      );
      return;
    }

    if (styleFilePath.split('.').pop() !== 'scss') {
      context.logger.warn(
        `Could not find the default SCSS style file for this project. `
      );
      context.logger.warn(
        `Please make sure your project is configured with SCSS and consider manually setting up spartacus styles.`
      );
      return;
    }

    const buffer = tree.read(styleFilePath);

    if (!buffer) {
      context.logger.warn(
        `Could not read the default style file within the project ${styleFilePath}`
      );
      context.logger.warn(
        `Please consider manually importing spartacus styles.`
      );
      return;
    }

    const htmlContent = buffer.toString();
    let insertion =
      '\n' +
      `$styleVersion: ${
        options.featureLevel || getSpartacusCurrentFeatureLevel()
      };\n@import '@spartacus/styles/index';\n`;

    if (options?.theme) {
      insertion += `\n@import '@spartacus/styles/scss/theme/${options.theme}';\n`;
    }

    if (htmlContent.includes(insertion)) {
      return;
    }

    const recorder = tree.beginUpdate(styleFilePath);

    recorder.insertLeft(htmlContent.length, insertion);
    tree.commitUpdate(recorder);

    if (options.debug) {
      context.logger.info(`✅ Style installation complete.`);
    }
  };
}

function updateMainComponent(
  project: WorkspaceProject,
  options: SpartacusOptions
): Rule {
  return (host: Tree, context: SchematicContext): Tree | void => {
    if (options.debug) {
      context.logger.info(`⌛️ Updating main component...`);
    }

    const filePath = project.sourceRoot + '/app/app.component.html';
    const buffer = host.read(filePath);

    if (!buffer) {
      context.logger.warn(`Could not read app.component.html file.`);
      return;
    }

    const htmlContent = buffer.toString();
    const insertion = `<cx-storefront></cx-storefront>\n`;

    if (htmlContent.includes(insertion)) {
      return;
    }

    const recorder = host.beginUpdate(filePath);

    if (options && options.overwriteAppComponent) {
      recorder.remove(0, htmlContent.length);
      recorder.insertLeft(0, insertion);
    } else {
      recorder.insertLeft(htmlContent.length, `\n${insertion}`);
    }

    host.commitUpdate(recorder);

    if (options.debug) {
      context.logger.info(`✅ Main component update complete.`);
    }
    return host;
  };
}

function updateIndexFile(tree: Tree, options: SpartacusOptions): Rule {
  return (host: Tree, context: SchematicContext): Tree => {
    if (options.debug) {
      context.logger.info(`⌛️ Updating index file...`);
    }

    const projectIndexHtmlPath = getIndexHtmlPath(tree);
    const baseUrl = options.baseUrl || 'OCC_BACKEND_BASE_URL_VALUE';

    const metaTags = [
      `<meta name="occ-backend-base-url" content="${baseUrl}" />`,
      `<meta name="media-backend-base-url" content="MEDIA_BACKEND_BASE_URL_VALUE" />`,
    ];

    metaTags.forEach((metaTag) => {
      appendHtmlElementToHead(host, projectIndexHtmlPath, metaTag);
    });

    if (options.debug) {
      context.logger.info(`✅ Index file update complete`);
    }
    return host;
  };
}

function increaseBudgets(options: SpartacusOptions): Rule {
  return (tree: Tree, context: SchematicContext): Tree => {
    if (options.debug) {
      context.logger.info(`⌛️ Increasing budgets...`);
    }

    const { path, workspace: angularJson } = getWorkspace(tree);
    const projectName = getDefaultProjectNameFromWorkspace(tree);

    const project = angularJson.projects[projectName];
    const architect = project.architect;
    const build = architect?.build;
    const configurations = build?.configurations;
    const productionConfiguration = configurations?.production;
    const productionBudgets = (
      ((productionConfiguration as any).budgets ?? []) as {
        type: string;
        maximumError: string;
      }[]
    ).map((budget) => {
      if (budget.type === 'initial') {
        return {
          ...budget,
          maximumError: '2.5mb',
        };
      }
      return budget;
    });

    const updatedAngularJson = {
      ...angularJson,
      projects: {
        ...angularJson.projects,
        [projectName]: {
          ...project,
          architect: {
            ...architect,
            build: {
              ...build,
              configurations: {
                ...configurations,
                production: {
                  ...productionConfiguration,
                  budgets: productionBudgets,
                },
              },
            },
          },
        },
      },
    };

    tree.overwrite(path, JSON.stringify(updatedAngularJson, null, 2));

    if (options.debug) {
      context.logger.info(`✅ Budget increase complete.`);
    }
    return tree;
  };
}

export function createStylePreprocessorOptions(
  options?: SpartacusOptions
): Rule {
  return (tree: Tree, context: SchematicContext): Tree => {
    if (options?.debug) {
      context.logger.info(`⌛️ Updating style preprocessor...`);
    }

    const { path, workspace: angularJson } = getWorkspace(tree);
    const projectName = getDefaultProjectNameFromWorkspace(tree);
    const project = angularJson.projects[projectName];
    const architect = project.architect;

    // `build` architect section
    const architectBuild = architect?.build;
    const buildStylePreprocessorOptions = createStylePreprocessorOptionsArray(
      (architectBuild?.options as any)?.stylePreprocessorOptions
    );
    const buildOptions = {
      ...architectBuild?.options,
      stylePreprocessorOptions: buildStylePreprocessorOptions,
    };

    // `test` architect section
    const architectTest = architect?.test;
    const testStylePreprocessorOptions = createStylePreprocessorOptionsArray(
      (architectBuild?.options as any)?.stylePreprocessorOptions
    );
    const testOptions = {
      ...architectTest?.options,
      stylePreprocessorOptions: testStylePreprocessorOptions,
    };

    const updatedAngularJson = {
      ...angularJson,
      projects: {
        ...angularJson.projects,
        [projectName]: {
          ...project,
          architect: {
            ...architect,
            build: {
              ...architectBuild,
              options: buildOptions,
            },
            test: {
              ...architectTest,
              options: testOptions,
            },
          },
        },
      },
    };

    tree.overwrite(path, JSON.stringify(updatedAngularJson, null, 2));
    if (options?.debug) {
      context.logger.info(`✅ Style preprocessor update complete.`);
    }
    return tree;
  };
}

function createStylePreprocessorOptionsArray(angularJsonStylePreprocessorOptions: {
  includePaths: string[];
}): { includePaths: string[] } {
  if (!angularJsonStylePreprocessorOptions) {
    angularJsonStylePreprocessorOptions = {
      includePaths: ['node_modules/'],
    };
  } else {
    if (!angularJsonStylePreprocessorOptions.includePaths) {
      angularJsonStylePreprocessorOptions.includePaths = ['node_modules/'];
    } else {
      if (
        !angularJsonStylePreprocessorOptions.includePaths.includes(
          'node_modules/'
        )
      ) {
        angularJsonStylePreprocessorOptions.includePaths.push('node_modules/');
      }
    }
  }

  return angularJsonStylePreprocessorOptions;
}

function prepareDependencies(features: string[]): NodeDependency[] {
  const spartacusDependencies = prepareSpartacusDependencies();

  const libraries = analyzeCrossLibraryDependenciesByFeatures(features);
  const spartacusVersion = getPrefixedSpartacusSchematicsVersion();
  const spartacusLibraryDependencies = libraries.map((library) =>
    mapPackageToNodeDependencies(library, spartacusVersion)
  );

  const dependencies: NodeDependency[] = spartacusDependencies
    .concat(spartacusLibraryDependencies)
    .concat(prepare3rdPartyDependencies());

  return dependencies;
}

function updateAppModule(options: SpartacusOptions): Rule {
  return (tree: Tree, context: SchematicContext): Tree => {
    if (options.debug) {
      context.logger.info(`⌛️ Updating AppModule...`);
    }

    const { buildPaths } = getProjectTsConfigPaths(tree, options.project);

    if (!buildPaths.length) {
      throw new SchematicsException(
        'Could not find any tsconfig file. Cannot configure AppModule.'
      );
    }

    const basePath = process.cwd();
    for (const tsconfigPath of buildPaths) {
      const { appSourceFiles } = createProgram(tree, basePath, tsconfigPath);

      for (const sourceFile of appSourceFiles) {
        if (sourceFile.getFilePath().includes(`app.module.ts`)) {
          addModuleImport(sourceFile, {
            order: 1,
            import: {
              moduleSpecifier: ANGULAR_HTTP,
              namedImports: ['HttpClientModule'],
            },
            content: 'HttpClientModule',
          });
          addModuleImport(sourceFile, {
            order: 2,
            import: {
              moduleSpecifier: SPARTACUS_STOREFRONTLIB,
              namedImports: ['AppRoutingModule'],
            },
            content: 'AppRoutingModule',
          });

          saveAndFormat(sourceFile);
          break;
        }
      }
    }

    if (options.debug) {
      context.logger.info(`✅ AppModule update complete.`);
    }
    return tree;
  };
}

export function addSpartacus(options: SpartacusOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const features = analyzeCrossFeatureDependencies(options.features ?? []);
    const dependencies = prepareDependencies(features);

    const spartacusRxjsDependency: NodeDependency[] = [
      dependencies.find((dep) => dep.name === RXJS) as NodeDependency,
    ];
    const packageJsonFile = readPackageJson(tree);
    return chain([
      analyzeApplication(options, features),

      setupStoreModules(options),

      scaffoldStructure(options),

      setupSpartacusModule(options),

      setupSpartacusFeaturesModule(options),

      addSpartacusConfiguration(options),

      updateAppModule(options),
      installStyles(options),
      updateMainComponent(getProjectFromWorkspace(tree, options), options),
      options.useMetaTags ? updateIndexFile(tree, options) : noop(),

      increaseBudgets(options),
      createStylePreprocessorOptions(options),

      addFeatures(options, features),

      chain([
        addPackageJsonDependencies(
          prepareDependencies(features),
          packageJsonFile
        ),
        /**
         * Force installing versions of dependencies used by Spartacus.
         * E.g. ng13 uses rxjs 7, but Spartacus uses rxjs 6.
         */
        updatePackageJsonDependencies(spartacusRxjsDependency, packageJsonFile),
        installPackageJsonDependencies(),
      ]),

      finalizeInstallation(options, features),
    ])(tree, context);
  };
}
