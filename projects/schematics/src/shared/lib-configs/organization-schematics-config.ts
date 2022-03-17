import {
  CLI_ORGANIZATION_ADMINISTRATION_FEATURE,
  CLI_ORGANIZATION_ORDER_APPROVAL_FEATURE,
  CLI_USER_PROFILE_FEATURE,
  SPARTACUS_ADMINISTRATION,
  SPARTACUS_ORGANIZATION,
  SPARTACUS_ORGANIZATION_ADMINISTRATION_ASSETS,
  SPARTACUS_ORGANIZATION_ADMINISTRATION_ROOT,
  SPARTACUS_ORGANIZATION_ORDER_APPROVAL,
  SPARTACUS_ORGANIZATION_ORDER_APPROVAL_ASSETS,
  SPARTACUS_ORGANIZATION_ORDER_APPROVAL_ROOT,
  SPARTACUS_USER,
} from '../libs-constants';
import { FeatureConfig } from '../utils/lib-utils';

export const ORGANIZATION_FOLDER_NAME = 'organization';
export const ORGANIZATION_SCSS_FILE_NAME = 'organization.scss';

export const ADMINISTRATION_MODULE = 'AdministrationModule';
export const ADMINISTRATION_ROOT_MODULE = 'AdministrationRootModule';
export const ORGANIZATION_ADMINISTRATION_MODULE_NAME =
  'OrganizationAdministration';
export const ORGANIZATION_ADMINISTRATION_FEATURE_NAME_CONSTANT =
  'ORGANIZATION_ADMINISTRATION_FEATURE';
export const ORGANIZATION_TRANSLATIONS = 'organizationTranslations';
export const ORGANIZATION_TRANSLATION_CHUNKS_CONFIG =
  'organizationTranslationChunksConfig';

export const ORGANIZATION_ADMINISTRATION_SCHEMATICS_CONFIG: FeatureConfig = {
  library: {
    cli: CLI_ORGANIZATION_ADMINISTRATION_FEATURE,
    mainScope: SPARTACUS_ORGANIZATION,
    featureScope: SPARTACUS_ADMINISTRATION,
  },
  folderName: ORGANIZATION_FOLDER_NAME,
  moduleName: ORGANIZATION_ADMINISTRATION_MODULE_NAME,
  featureModule: {
    name: ADMINISTRATION_MODULE,
    importPath: SPARTACUS_ADMINISTRATION,
  },
  rootModule: {
    name: ADMINISTRATION_ROOT_MODULE,
    importPath: SPARTACUS_ORGANIZATION_ADMINISTRATION_ROOT,
  },
  lazyLoadingChunk: {
    moduleSpecifier: SPARTACUS_ORGANIZATION_ADMINISTRATION_ROOT,
    namedImports: [ORGANIZATION_ADMINISTRATION_FEATURE_NAME_CONSTANT],
  },
  i18n: {
    resources: ORGANIZATION_TRANSLATIONS,
    chunks: ORGANIZATION_TRANSLATION_CHUNKS_CONFIG,
    importPath: SPARTACUS_ORGANIZATION_ADMINISTRATION_ASSETS,
  },
  styles: {
    scssFileName: ORGANIZATION_SCSS_FILE_NAME,
    importStyle: SPARTACUS_ORGANIZATION,
  },
  dependencyManagement: {
    [SPARTACUS_USER]: [CLI_USER_PROFILE_FEATURE],
  },
};

export const ORDER_APPROVAL_MODULE = 'OrderApprovalModule';
export const ORDER_APPROVAL_ROOT_MODULE = 'OrderApprovalRootModule';
export const ORGANIZATION_ORDER_APPROVAL_MODULE_NAME =
  'OrganizationOrderApproval';
export const ORGANIZATION_ORDER_APPROVAL_FEATURE_NAME_CONSTANT =
  'ORGANIZATION_ORDER_APPROVAL_FEATURE';
export const ORDER_APPROVAL_TRANSLATIONS = 'orderApprovalTranslations';
export const ORDER_APPROVAL_TRANSLATION_CHUNKS_CONFIG =
  'orderApprovalTranslationChunksConfig';

export const ORGANIZATION_ORDER_APPROVAL_SCHEMATICS_CONFIG: FeatureConfig = {
  library: {
    cli: CLI_ORGANIZATION_ORDER_APPROVAL_FEATURE,
    mainScope: SPARTACUS_ORGANIZATION,
    featureScope: SPARTACUS_ORGANIZATION_ORDER_APPROVAL,
  },
  folderName: ORGANIZATION_FOLDER_NAME,
  moduleName: ORGANIZATION_ORDER_APPROVAL_MODULE_NAME,
  featureModule: {
    name: ORDER_APPROVAL_MODULE,
    importPath: SPARTACUS_ORGANIZATION_ORDER_APPROVAL,
  },
  rootModule: {
    name: ORDER_APPROVAL_ROOT_MODULE,
    importPath: SPARTACUS_ORGANIZATION_ORDER_APPROVAL_ROOT,
  },
  lazyLoadingChunk: {
    moduleSpecifier: SPARTACUS_ORGANIZATION_ORDER_APPROVAL_ROOT,
    namedImports: [ORGANIZATION_ORDER_APPROVAL_FEATURE_NAME_CONSTANT],
  },
  i18n: {
    resources: ORDER_APPROVAL_TRANSLATIONS,
    chunks: ORDER_APPROVAL_TRANSLATION_CHUNKS_CONFIG,
    importPath: SPARTACUS_ORGANIZATION_ORDER_APPROVAL_ASSETS,
  },
  styles: {
    scssFileName: ORGANIZATION_SCSS_FILE_NAME,
    importStyle: SPARTACUS_ORGANIZATION,
  },
  dependencyManagement: {
    [SPARTACUS_USER]: [CLI_USER_PROFILE_FEATURE],
  },
};
