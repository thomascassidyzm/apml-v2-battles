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
  UIElement,
  ShowElement,
  ConditionalElement,
  IterationElement,
  Expression,
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
      const computedBody = this.generateComputedBody(comp);
      lines.push(`${this.indent}const ${comp.name} = computed(() => {`);

      // Add the generated body with proper indentation
      const bodyLines = computedBody.split('\n');
      for (const bodyLine of bodyLines) {
        if (bodyLine.trim()) {
          lines.push(`${this.indent}${this.indent}${bodyLine}`);
        } else {
          lines.push('');
        }
      }

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

  /**
   * Generate the body of a computed property from APML expression
   */
  private generateComputedBody(comp: ComputedValue): string {
    const expression = comp.expression || comp.value;

    if (!expression) {
      return 'return null; // No expression provided';
    }

    // Convert expression to string if needed
    const expressionStr = this.expressionToString(expression);

    // Check if expression is a multi-line function definition
    if (expressionStr.trim().startsWith('function(')) {
      // For function expressions, just return the function itself
      return `return ${expressionStr};`;
    }

    // Check for arrow functions
    if (expressionStr.includes('=>') && !expressionStr.includes('?')) {
      return `return ${expressionStr};`;
    }

    // Simple expression - convert APML operators to JavaScript
    const jsExpression = this.convertAPMLToJS(expressionStr);

    return `return ${jsExpression};`;
  }

  /**
   * Convert Expression type to string representation
   */
  private expressionToString(expr: any): string {
    if (typeof expr === 'string') {
      return expr;
    }
    if (typeof expr === 'number' || typeof expr === 'boolean') {
      return String(expr);
    }
    // For complex expression objects, convert to JSON for now
    // TODO: Implement proper expression tree to JS conversion
    return JSON.stringify(expr);
  }

  /**
   * Convert APML expression syntax to JavaScript
   */
  private convertAPMLToJS(expression: string): string {
    let result = expression;

    // Convert APML comparison operators to JavaScript
    result = result.replace(/\s+equals\s+/g, ' === ');
    result = result.replace(/\s+not equals\s+/g, ' !== ');
    result = result.replace(/\s+and\s+/g, ' && ');
    result = result.replace(/\s+or\s+/g, ' || ');
    result = result.replace(/\s+not\s+/g, ' !');

    return result;
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

    // Generate template structure from UI elements
    for (const element of iface.elements) {
      this.generateUIElement(element, lines, 2);
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

  /**
   * Generate a UI element (show, when, for_each)
   */
  private generateUIElement(element: UIElement, lines: string[], indentLevel: number): void {
    const indent = this.indent.repeat(indentLevel);

    if (element.type === 'show') {
      this.generateShowElement(element, lines, indentLevel);
    } else if (element.type === 'when' || element.type === 'if') {
      this.generateConditionalElement(element, lines, indentLevel);
    } else if (element.type === 'for_each') {
      this.generateIterationElement(element, lines, indentLevel);
    }
  }

  /**
   * Generate a show element with proper HTML tag
   */
  private generateShowElement(element: ShowElement, lines: string[], indentLevel: number): void {
    const indent = this.indent.repeat(indentLevel);
    const tag = this.getHTMLTag(element.elementName);
    const className = this.toKebabCase(element.elementName);
    const attributes: string[] = [];

    // Add class attribute
    attributes.push(`class="${className}"`);

    // Process properties to generate attributes
    const textContent = this.processProperties(element.properties, attributes);

    // Build opening tag
    const openTag = attributes.length > 0
      ? `<${tag} ${attributes.join(' ')}>`
      : `<${tag}>`;

    lines.push(`${indent}${openTag}`);

    // Add text content if present
    if (textContent) {
      lines.push(`${indent}${this.indent}${textContent}`);
    }

    // Generate children
    if (element.children && element.children.length > 0) {
      for (const child of element.children) {
        this.generateUIElement(child, lines, indentLevel + 1);
      }
    }

    // Close tag
    lines.push(`${indent}</${tag}>`);
  }

  /**
   * Generate a conditional element (when/if) with v-if
   */
  private generateConditionalElement(element: ConditionalElement, lines: string[], indentLevel: number): void {
    const indent = this.indent.repeat(indentLevel);
    const condition = this.expressionToVueCondition(element.condition);

    // Wrap conditional content in a div with v-if
    lines.push(`${indent}<div v-if="${condition}">`);

    // Generate then block
    for (const thenElement of element.then) {
      this.generateUIElement(thenElement, lines, indentLevel + 1);
    }

    lines.push(`${indent}</div>`);

    // Generate else block if present
    if (element.else && element.else.length > 0) {
      lines.push(`${indent}<div v-else>`);
      for (const elseElement of element.else) {
        this.generateUIElement(elseElement, lines, indentLevel + 1);
      }
      lines.push(`${indent}</div>`);
    }
  }

  /**
   * Generate an iteration element (for_each) with v-for
   */
  private generateIterationElement(element: IterationElement, lines: string[], indentLevel: number): void {
    const indent = this.indent.repeat(indentLevel);
    const collection = this.expressionToString(element.collection);
    const itemName = element.itemName;

    // Wrap iteration content in a div with v-for
    lines.push(`${indent}<div v-for="${itemName} in ${collection}" :key="${itemName}.id">`);

    // Generate body
    for (const bodyElement of element.body) {
      this.generateUIElement(bodyElement, lines, indentLevel + 1);
    }

    lines.push(`${indent}</div>`);
  }

  /**
   * Map APML element names to HTML tags
   */
  private getHTMLTag(elementName: string): string {
    const lowerName = elementName.toLowerCase();

    // Special cases first (more specific)
    // Only map to button if it's specifically a tab or button, not a selector/container
    if ((lowerName.endsWith('_tab') || lowerName === 'tab') && !lowerName.includes('table')) {
      return 'button';
    }

    // Direct mappings
    const tagMap: Record<string, string> = {
      header: 'header',
      footer: 'footer',
      nav: 'nav',
      main: 'main',
      section: 'section',
      article: 'article',
      aside: 'aside',
      button: 'button',
      input: 'input',
      textarea: 'textarea',
      form: 'form',
      label: 'label',
      img: 'img',
      video: 'video',
      audio: 'audio',
      canvas: 'canvas',
      svg: 'svg',
      table: 'table',
      ul: 'ul',
      ol: 'ol',
      li: 'li',
      span: 'span',
      p: 'p',
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      h5: 'h5',
      h6: 'h6',
    };

    // Check if element name contains known tag
    for (const [key, tag] of Object.entries(tagMap)) {
      if (lowerName === key || lowerName.includes('_' + key) || lowerName.includes(key + '_')) {
        return tag;
      }
    }

    // Default to div
    return 'div';
  }

  /**
   * Process element properties and generate attributes
   * Returns text content if any
   */
  private processProperties(properties: Record<string, string | Expression>, attributes: string[]): string | null {
    let textContent: string | null = null;

    for (const [key, value] of Object.entries(properties)) {
      const valueStr = this.expressionToString(value);

      if (key === 'text' || key === 'label') {
        // Check if it's a dynamic expression
        if (valueStr.includes('.') || valueStr.includes('(') || valueStr.includes('+')) {
          textContent = `{{ ${valueStr} }}`;
        } else if (valueStr.startsWith('"') || valueStr.startsWith("'")) {
          // Static string - remove quotes
          textContent = valueStr.slice(1, -1);
        } else {
          textContent = `{{ ${valueStr} }}`;
        }
      } else if (key === 'active') {
        // Convert active property to dynamic class binding
        const cleanValue = this.expressionToVueCondition(valueStr);
        const classBinding = `:class="{ active: ${cleanValue} }"`;
        attributes.push(classBinding);
      } else if (key === 'src') {
        // Image/video source
        if (valueStr.includes('.')) {
          attributes.push(`:src="${valueStr}"`);
        } else {
          attributes.push(`src="${valueStr}"`);
        }
      } else if (key === 'icon') {
        // Icon - check if dynamic or static
        if (valueStr.includes('?') || valueStr.includes('.')) {
          // Dynamic icon - use Vue binding
          attributes.push(`:data-icon="${valueStr}"`);
        } else {
          // Static icon - remove quotes from icon value for cleaner output
          const cleanIcon = valueStr.replace(/^["']|["']$/g, '');
          attributes.push(`data-icon="${cleanIcon}"`);
        }
      } else if (key.startsWith('on_')) {
        // Event handlers - skip for now, handle in script section
        continue;
      } else {
        // Style properties - add as comments for now
        // These should be handled by the style section
        continue;
      }
    }

    return textContent;
  }

  /**
   * Convert expression to Vue condition syntax
   */
  private expressionToVueCondition(expr: Expression | string): string {
    const exprStr = this.expressionToString(expr);

    // Convert APML operators to JavaScript
    let result = this.convertAPMLToJS(exprStr);

    // Convert 'not' to '!' if it appears at the start
    result = result.replace(/^not\s+/, '!');
    result = result.replace(/\(\s*not\s+/g, '(!');

    // Convert snake_case to camelCase for variables
    result = result.replace(/\b[a-z]+(_[a-z]+)+\b/g, (match) => {
      return this.snakeToCamelCase(match);
    });

    return result;
  }

  /**
   * Convert snake_case to camelCase
   */
  private snakeToCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
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
