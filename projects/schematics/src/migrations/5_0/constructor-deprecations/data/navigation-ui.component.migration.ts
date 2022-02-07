import { ConstructorDeprecation } from '../../../../shared/utils/file-utils';
import {
  ANGULAR_CORE,
  ANGULAR_ROUTER,
  ELEMENT_REF,
  HAMBURGER_MENU_SERVICE,
  NAVIGATION_UI_COMPONENT,
  RENDERER_2,
  ROUTER,
  SPARTACUS_CORE,
  SPARTACUS_STOREFRONTLIB,
  WINDOW_REF,
} from '../../../../shared/constants';

export const NAVIGATION_UI_COMPONENT_MIGRATION: ConstructorDeprecation = {
  // projects/storefrontlib/cms-components/navigation/navigation/navigation-ui.component.ts
  class: NAVIGATION_UI_COMPONENT,
  importPath: SPARTACUS_STOREFRONTLIB,
  deprecatedParams: [
    { className: ROUTER, importPath: ANGULAR_ROUTER },
    { className: RENDERER_2, importPath: ANGULAR_CORE },
    { className: ELEMENT_REF, importPath: ANGULAR_CORE },
    { className: HAMBURGER_MENU_SERVICE, importPath: SPARTACUS_STOREFRONTLIB },
  ],
  addParams: [{ className: WINDOW_REF, importPath: SPARTACUS_CORE }],
};
