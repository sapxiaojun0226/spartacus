import {
  chain,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import {
  addFeatures,
  addPackageJsonDependenciesForLibrary,
  analyzeCrossFeatureDependencies,
  CDS_CONFIG,
  CDS_SCHEMATICS_CONFIG,
  CLI_CDS_FEATURE,
  CustomConfig,
  FeatureConfig,
  FeatureConfigurationOverrides,
  readPackageJson,
  SPARTACUS_CDS,
  validateSpartacusInstallation,
} from '@spartacus/schematics';
import { peerDependencies } from '../../../package.json';
import { Schema as SpartacusCdsOptions } from './schema';

export function addCdsFeature(options: SpartacusCdsOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const packageJson = readPackageJson(tree);
    validateSpartacusInstallation(packageJson);

    const features = analyzeCrossFeatureDependencies(options.features ?? []);

    const cdsOptions: SpartacusCdsOptions = {
      ...options,
      lazy: false,
    };
    const cdsSchematicsConfig: FeatureConfig = buildCdsConfig(
      cdsOptions,
      context
    );

    const overrides: FeatureConfigurationOverrides = {
      schematics: {
        [CLI_CDS_FEATURE]: cdsSchematicsConfig,
      },
      options: {
        [CLI_CDS_FEATURE]: cdsOptions,
      },
    };

    return chain([
      addFeatures(options, features, overrides),
      addPackageJsonDependenciesForLibrary(peerDependencies, options),
    ]);
  };
}

function buildCdsConfig(
  options: SpartacusCdsOptions,
  context: SchematicContext
): FeatureConfig {
  validateCdsOptions(options, context);

  const customConfig: CustomConfig[] = [
    {
      import: [
        {
          moduleSpecifier: SPARTACUS_CDS,
          namedImports: [CDS_CONFIG],
        },
      ],
      content: `<${CDS_CONFIG}>{
      cds: {
        tenant: '${options.tenant}',
        baseUrl: '${options.baseUrl}',
        endpoints: {
          strategyProducts: '/strategy/\${tenant}/strategies/\${strategyId}/products',
        },
        merchandising: {
          defaultCarouselViewportThreshold: 80,
        },
      },
    }`,
    },
  ];
  if (options.profileTagLoadUrl && options.profileTagConfigUrl) {
    customConfig.push({
      import: [
        {
          moduleSpecifier: SPARTACUS_CDS,
          namedImports: [CDS_CONFIG],
        },
      ],
      content: `<${CDS_CONFIG}>{
          cds: {
            profileTag: {
              javascriptUrl:
                '${options.profileTagLoadUrl}',
              configUrl:
                '${options.profileTagConfigUrl}',
              allowInsecureCookies: true,
            },
          },
        }`,
    });
  }

  return {
    ...CDS_SCHEMATICS_CONFIG,
    customConfig,
  };
}

function validateCdsOptions(
  {
    tenant,
    baseUrl,
    profileTagConfigUrl,
    profileTagLoadUrl,
  }: SpartacusCdsOptions,
  context: SchematicContext
): void {
  if (!tenant) {
    throw new SchematicsException(`Please specify tenant name.`);
  }
  if (!baseUrl) {
    throw new SchematicsException(`Please specify the base URL.`);
  }

  if (
    !(
      (profileTagConfigUrl && profileTagLoadUrl) ||
      (!profileTagConfigUrl && !profileTagLoadUrl)
    )
  ) {
    context.logger.warn(
      `Profile tag will not be added. Please run the schematic again, and make sure you provide both profile tag options.`
    );
  }
}
