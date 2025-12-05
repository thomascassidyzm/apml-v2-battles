/**
 * APML Parser
 *
 * Converts APML text into an Abstract Syntax Tree (AST).
 * This is a basic regex-based parser - sufficient for the scaffold.
 *
 * TODO: Replace with proper parser (PEG/ANTLR) for production use.
 */

import type {
  APMLDocument,
  DataModel,
  Field,
  FieldType,
  FieldModifier,
  InterfaceSection,
  ShowElement,
  ComputedValue,
  LogicSection,
} from '../types/ast.js';

export class APMLParser {
  private lines: string[] = [];
  private currentLine = 0;

  /**
   * Parse APML text into an AST
   */
  parse(input: string): APMLDocument {
    this.lines = input.split('\n');
    this.currentLine = 0;

    const doc: APMLDocument = {
      data: [],
      interfaces: [],
      logic: [],
      computed: [],
      state_machines: [],
      realtime: [],
      external: [],
    };

    while (this.currentLine < this.lines.length) {
      const line = this.getCurrentLine();
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        this.advance();
        continue;
      }

      // Parse top-level constructs
      if (trimmed.startsWith('app ')) {
        doc.app = this.parseApp();
      } else if (trimmed.startsWith('data ')) {
        doc.data.push(this.parseDataModel());
      } else if (trimmed.startsWith('interface ')) {
        doc.interfaces.push(this.parseInterface());
      } else if (trimmed.startsWith('computed ')) {
        doc.computed.push(this.parseComputed());
      } else if (trimmed.startsWith('logic ')) {
        doc.logic.push(this.parseLogic());
      } else {
        // Unknown construct - skip for now
        this.advance();
      }
    }

    return doc;
  }

  // ==========================================================================
  // App Declaration
  // ==========================================================================

  private parseApp() {
    const line = this.getCurrentLine();
    const match = line.match(/^app\s+(\w+):/);
    if (!match) throw new Error(`Invalid app declaration: ${line}`);

    const name = match[1];
    this.advance();

    // TODO: Parse app properties (title, description, version, etc.)
    // For now, skip to next section
    while (this.hasMore() && this.getIndentLevel() > 0) {
      this.advance();
    }

    return { name };
  }

  // ==========================================================================
  // Data Models
  // ==========================================================================

  private parseDataModel(): DataModel {
    const line = this.getCurrentLine();
    const match = line.match(/^data\s+(\w+):/);
    if (!match) throw new Error(`Invalid data declaration: ${line}`);

    const name = match[1];
    const baseIndent = this.getIndentLevel();
    this.advance();

    const fields: Field[] = [];

    while (this.hasMore() && this.getIndentLevel() > baseIndent) {
      const fieldLine = this.getCurrentLine().trim();

      // Skip empty lines and comments
      if (!fieldLine || fieldLine.startsWith('#')) {
        this.advance();
        continue;
      }

      // Check for relationships section (skip for now)
      if (fieldLine === 'relationships:') {
        // TODO: Parse relationships
        this.advance();
        while (this.hasMore() && this.getIndentLevel() > baseIndent + 1) {
          this.advance();
        }
        continue;
      }

      // Parse field
      const fieldMatch = fieldLine.match(/^(\w+):\s+(.+)$/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        const fieldDef = fieldMatch[2];
        fields.push(this.parseField(fieldName, fieldDef));
      }

      this.advance();
    }

    return { name, fields };
  }

  private parseField(name: string, definition: string): Field {
    const parts = definition.split(/\s+/);
    const type = this.parseFieldType(parts[0]);
    const modifiers: FieldModifier[] = [];
    let defaultValue: string | undefined;

    // Parse modifiers
    let i = 1;
    while (i < parts.length) {
      const modifier = parts[i];
      if (modifier === 'required' || modifier === 'optional' || modifier === 'unique' || modifier === 'auto') {
        modifiers.push(modifier);
        i++;
      } else if (modifier === 'default:') {
        // Next part is the default value
        if (i + 1 < parts.length) {
          defaultValue = parts[i + 1];
          modifiers.push({ default: defaultValue });
          i += 2;
        } else {
          i++;
        }
      } else if (modifier.startsWith('default:')) {
        // Handle case where there's no space: "default:0"
        defaultValue = modifier.substring(8);
        modifiers.push({ default: defaultValue });
        i++;
      } else {
        // Unknown modifier, skip
        i++;
      }
    }

    return { name, type, modifiers, defaultValue };
  }

  private parseFieldType(typeStr: string): FieldType {
    // Handle list types
    if (typeStr.startsWith('list')) {
      const match = typeStr.match(/list\s+of\s+(\w+)/);
      if (match) {
        return { list: match[1] as FieldType };
      }
    }

    // Handle basic types
    const basicTypes = ['text', 'number', 'boolean', 'date', 'timestamp', 'email', 'url', 'unique_id', 'money', 'percentage'];
    if (basicTypes.includes(typeStr)) {
      return typeStr as FieldType;
    }

    // Assume it's a model reference
    return { model: typeStr };
  }

  // ==========================================================================
  // Interface Sections
  // ==========================================================================

  private parseInterface(): InterfaceSection {
    const line = this.getCurrentLine();
    const match = line.match(/^interface\s+(\w+):/);
    if (!match) throw new Error(`Invalid interface declaration: ${line}`);

    const name = match[1];
    this.advance();

    const elements: ShowElement[] = [];
    const baseIndent = this.getIndentLevel();

    while (this.hasMore() && this.getIndentLevel() >= baseIndent) {
      const elementLine = this.getCurrentLine().trim();

      if (!elementLine || elementLine.startsWith('#')) {
        this.advance();
        continue;
      }

      // Parse show statements
      if (elementLine.startsWith('show ')) {
        elements.push(this.parseShowElement());
      } else {
        this.advance();
      }
    }

    return { name, elements };
  }

  private parseShowElement(): ShowElement {
    const line = this.getCurrentLine().trim();
    const match = line.match(/^show\s+(\w+)(?::(.*))?$/);
    if (!match) throw new Error(`Invalid show statement: ${line}`);

    const elementName = match[1];
    const inlineProps = match[2];

    this.advance();

    const properties: Record<string, string> = {};

    // Parse inline properties if present
    if (inlineProps) {
      // TODO: Parse inline properties properly
    }

    // Parse block properties
    const baseIndent = this.getIndentLevel();
    while (this.hasMore() && this.getIndentLevel() >= baseIndent) {
      const propLine = this.getCurrentLine().trim();

      if (!propLine || propLine.startsWith('#')) {
        this.advance();
        continue;
      }

      const propMatch = propLine.match(/^(\w+):\s*(.+)$/);
      if (propMatch) {
        properties[propMatch[1]] = propMatch[2];
      }

      this.advance();
    }

    return {
      type: 'show',
      elementName,
      properties,
    };
  }

  // ==========================================================================
  // Computed Values
  // ==========================================================================

  private parseComputed(): ComputedValue {
    const line = this.getCurrentLine().trim();

    // Simple syntax: computed name: expression
    const simpleMatch = line.match(/^computed\s+(\w+):\s*(.+)$/);
    if (simpleMatch) {
      const name = simpleMatch[1];
      const expression = simpleMatch[2];
      this.advance();
      return { name, expression };
    }

    // Block syntax: computed name:
    const blockMatch = line.match(/^computed\s+(\w+):$/);
    if (blockMatch) {
      const name = blockMatch[1];
      this.advance();

      let value: string | undefined;
      let format: ComputedValue['format'] | undefined;
      let cache: boolean | undefined;

      const baseIndent = this.getIndentLevel();
      while (this.hasMore() && this.getIndentLevel() >= baseIndent) {
        const propLine = this.getCurrentLine().trim();

        if (!propLine || propLine.startsWith('#')) {
          this.advance();
          continue;
        }

        const propMatch = propLine.match(/^(\w+):\s*(.+)$/);
        if (propMatch) {
          const key = propMatch[1];
          const val = propMatch[2];

          if (key === 'value') {
            value = val;
          } else if (key === 'format') {
            format = val as ComputedValue['format'];
          } else if (key === 'cache') {
            cache = val === 'true';
          }
        }

        this.advance();
      }

      return { name, value, format, cache };
    }

    throw new Error(`Invalid computed declaration: ${line}`);
  }

  // ==========================================================================
  // Logic Sections
  // ==========================================================================

  private parseLogic(): LogicSection {
    const line = this.getCurrentLine();
    const match = line.match(/^logic\s+(\w+):/);
    if (!match) throw new Error(`Invalid logic declaration: ${line}`);

    const name = match[1];
    this.advance();

    // TODO: Parse processes, calculations, validations
    // For now, just skip the section
    const baseIndent = this.getIndentLevel();
    while (this.hasMore() && this.getIndentLevel() >= baseIndent) {
      this.advance();
    }

    return {
      name,
      processes: [],
      calculations: [],
      validations: [],
    };
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  private getCurrentLine(): string {
    return this.lines[this.currentLine] || '';
  }

  private advance(): void {
    this.currentLine++;
  }

  private hasMore(): boolean {
    return this.currentLine < this.lines.length;
  }

  private getIndentLevel(): number {
    const line = this.getCurrentLine();
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }
}

/**
 * Convenience function to parse APML text
 */
export function parseAPML(input: string): APMLDocument {
  const parser = new APMLParser();
  return parser.parse(input);
}
