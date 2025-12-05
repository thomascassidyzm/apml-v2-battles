/**
 * Vue 3 SFC Generator
 *
 * Transforms an APML AST into Vue 3 Single File Components (.vue files).
 *
 * Generates:
 * - TypeScript interfaces from data models
 * - Pinia stores for state management
 * - Vue components for interfaces
 * - Computed properties for computed values
 */

import type {
  APMLDocument,
  DataModel,
  Field,
  InterfaceSection,
  ComputedValue,
} from '../types/ast.js';

export interface GeneratedFile {
  path: string;
  content: string;
}

export class VueGenerator {
  private indent = '  ';

  /**
   * Generate all files from an APML document
   */
  generate(doc: APMLDocument): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Generate TypeScript interfaces from data models
    if (doc.data.length > 0) {
      files.push(this.generateTypes(doc.data));
    }

    // Generate Pinia store
    if (doc.data.length > 0 || doc.computed.length > 0) {
      files.push(this.generateStore(doc.data, doc.computed));
    }

    // Generate Vue components for each interface
    for (const iface of doc.interfaces) {
      files.push(this.generateComponent(iface, doc.computed));
    }

    return files;
  }

  // ==========================================================================
  // TypeScript Interfaces
  // ==========================================================================

  private generateTypes(models: DataModel[]): GeneratedFile {
    const lines: string[] = [];

    lines.push('/**');
    lines.push(' * Generated TypeScript types from APML data models');
    lines.push(' * DO NOT EDIT - This file is auto-generated');
    lines.push(' */');
    lines.push('');

    for (const model of models) {
      lines.push(`export interface ${model.name} {`);

      for (const field of model.fields) {
        const tsType = this.fieldTypeToTS(field);
        const optional = field.modifiers.includes('optional') ? '?' : '';
        lines.push(`${this.indent}${field.name}${optional}: ${tsType};`);
      }

      lines.push('}');
      lines.push('');
    }

    return {
      path: 'src/types/models.ts',
      content: lines.join('\n'),
    };
  }

  private fieldTypeToTS(field: Field): string {
    const { type, modifiers } = field;

    let baseType: string;

    if (typeof type === 'string') {
      baseType = this.primitiveTypeToTS(type);
    } else if ('list' in type) {
      const itemType = typeof type.list === 'string'
        ? this.primitiveTypeToTS(type.list)
        : ('model' in type.list ? type.list.model : 'any');
      baseType = `${itemType}[]`;
    } else if ('model' in type) {
      baseType = type.model;
    } else {
      baseType = 'any';
    }

    return baseType;
  }

  private primitiveTypeToTS(type: string): string {
    const typeMap: Record<string, string> = {
      text: 'string',
      number: 'number',
      boolean: 'boolean',
      date: 'Date',
      timestamp: 'Date',
      email: 'string',
      url: 'string',
      unique_id: 'string',
      money: 'number',
      percentage: 'number',
    };

    return typeMap[type] || 'any';
  }

  // ==========================================================================
  // Pinia Store
  // ==========================================================================

  private generateStore(models: DataModel[], computed: ComputedValue[]): GeneratedFile {
    const lines: string[] = [];

    lines.push("import { defineStore } from 'pinia';");
    lines.push("import { ref, computed } from 'vue';");

    // Import types if we have models
    if (models.length > 0) {
      const modelNames = models.map(m => m.name).join(', ');
      lines.push(`import type { ${modelNames} } from '../types/models';`);
    }

    lines.push('');
    lines.push('/**');
    lines.push(' * Generated Pinia store from APML data and computed values');
    lines.push(' * DO NOT EDIT - This file is auto-generated');
    lines.push(' */');
    lines.push('');
    lines.push("export const useAppStore = defineStore('app', () => {");
    lines.push(`${this.indent}// State`);

    // Generate state refs for each model
    for (const model of models) {
      const varName = this.modelToVarName(model.name);
      lines.push(`${this.indent}const ${varName} = ref<${model.name}[]>([]);`);
    }

    lines.push('');
    lines.push(`${this.indent}// Computed properties`);

    // Generate computed values
    for (const comp of computed) {
      lines.push(`${this.indent}const ${comp.name} = computed(() => {`);
      if (comp.expression) {
        lines.push(`${this.indent}${this.indent}// TODO: Implement expression: ${comp.expression}`);
      } else if (comp.value) {
        lines.push(`${this.indent}${this.indent}// TODO: Implement expression: ${comp.value}`);
      }
      lines.push(`${this.indent}${this.indent}return null; // Placeholder`);
      lines.push(`${this.indent}});`);
      lines.push('');
    }

    lines.push(`${this.indent}// Actions`);
    lines.push(`${this.indent}// TODO: Add CRUD actions for models`);
    lines.push('');

    lines.push(`${this.indent}return {`);

    // Export state
    for (const model of models) {
      const varName = this.modelToVarName(model.name);
      lines.push(`${this.indent}${this.indent}${varName},`);
    }

    // Export computed
    for (const comp of computed) {
      lines.push(`${this.indent}${this.indent}${comp.name},`);
    }

    lines.push(`${this.indent}};`);
    lines.push('});');

    return {
      path: 'src/stores/app.ts',
      content: lines.join('\n'),
    };
  }

  private modelToVarName(modelName: string): string {
    // Convert PascalCase to camelCase and pluralize
    const camelCase = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    // Simple pluralization
    return camelCase.endsWith('s') ? camelCase : camelCase + 's';
  }

  // ==========================================================================
  // Vue Components
  // ==========================================================================

  private generateComponent(iface: InterfaceSection, computed: ComputedValue[]): GeneratedFile {
    const lines: string[] = [];
    const componentName = this.toComponentName(iface.name);

    // Template section
    lines.push('<template>');
    lines.push(`${this.indent}<div class="${this.toKebabCase(iface.name)}">`);
    lines.push(`${this.indent}${this.indent}<!-- TODO: Generated template -->`);

    // Generate basic template structure from show elements
    for (const element of iface.elements) {
      if (element.type === 'show') {
        lines.push(`${this.indent}${this.indent}<div class="${element.elementName}">`);

        // Add properties as comments for now
        for (const [key, value] of Object.entries(element.properties)) {
          lines.push(`${this.indent}${this.indent}${this.indent}<!-- ${key}: ${value} -->`);
        }

        lines.push(`${this.indent}${this.indent}</div>`);
      }
    }

    lines.push(`${this.indent}</div>`);
    lines.push('</template>');
    lines.push('');

    // Script section
    lines.push('<script setup lang="ts">');
    lines.push("import { computed } from 'vue';");
    lines.push("import { useAppStore } from '../stores/app';");
    lines.push('');
    lines.push('const store = useAppStore();');
    lines.push('');

    // Add component-specific computed if referenced
    if (computed.length > 0) {
      lines.push('// Computed properties from store');
      for (const comp of computed) {
        lines.push(`// const ${comp.name} = store.${comp.name};`);
      }
      lines.push('');
    }

    lines.push('// TODO: Add component logic');
    lines.push('</script>');
    lines.push('');

    // Style section
    lines.push('<style scoped>');
    lines.push(`.${this.toKebabCase(iface.name)} {`);
    lines.push(`${this.indent}/* TODO: Add component styles */`);
    lines.push('}');
    lines.push('</style>');

    return {
      path: `src/components/${componentName}.vue`,
      content: lines.join('\n'),
    };
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  private toComponentName(name: string): string {
    // Convert to PascalCase
    return name
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  private toKebabCase(name: string): string {
    return name.replace(/_/g, '-').toLowerCase();
  }
}

/**
 * Convenience function to generate Vue files from APML
 */
export function generateVue(doc: APMLDocument): GeneratedFile[] {
  const generator = new VueGenerator();
  return generator.generate(doc);
}
