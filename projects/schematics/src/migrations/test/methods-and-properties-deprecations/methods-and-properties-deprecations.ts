import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { MethodPropertyDeprecation } from '../../../shared/utils/file-utils';
import { CONFIGURATOR_ATTRIBUTE_MULTI_SELECTION_BUNDLE_COMPONENT_MIGRATION } from './data/configurator-attribute-multi-selection-bundle.component.migration';
import { CONFIGURATOR_ATTRIBUTE_SINGLE_SELECTION_BUNDLE_COMPONENT_MIGRATION } from './data/configurator-attribute-single-selection-bundle.component.migration';
import { migrateMethodPropertiesDeprecation } from '../../mechanism/methods-and-properties-deprecations/methods-and-properties-deprecations';
import { CMS_ACTIONS_MIGRATION } from './data/cms-group.actions.migration';
import { CMS_SELECTORS_MIGRATION } from './data/cms-group.selectors.migration';

export const METHOD_PROPERTY_DATA: MethodPropertyDeprecation[] = [
  ...CMS_SELECTORS_MIGRATION,
  ...CMS_ACTIONS_MIGRATION,
  ...CONFIGURATOR_ATTRIBUTE_MULTI_SELECTION_BUNDLE_COMPONENT_MIGRATION,
  ...CONFIGURATOR_ATTRIBUTE_SINGLE_SELECTION_BUNDLE_COMPONENT_MIGRATION,
];

export function migrate(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    return migrateMethodPropertiesDeprecation(
      tree,
      context,
      METHOD_PROPERTY_DATA
    );
  };
}
