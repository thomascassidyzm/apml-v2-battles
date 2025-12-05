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
  UIElement,
  ConditionalElement,
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
    const interfaceIndent = this.getIndentLevel();
    this.advance();

    const elements: UIElement[] = [];

    // Parse elements that are children of this interface (indented more than the interface line)
    while (this.hasMore()) {
      const currentIndent = this.getIndentLevel();
      const elementLine = this.getCurrentLine().trim();

      // Stop if we've dedented back to or past the interface level
      if (currentIndent <= interfaceIndent && elementLine) {
        break;
      }

      // Skip empty lines and comments
      if (!elementLine || elementLine.startsWith('#')) {
        this.advance();
        continue;
      }

      // Parse UI elements (show, when, for each, etc.)
      const element = this.parseUIElement(currentIndent);
      if (element) {
        elements.push(element);
      }
    }

    return { name, elements };
  }

  /**
   * Parse a UI element (show, when, for each, etc.)
   */
  private parseUIElement(parentIndent: number): UIElement | null {
    const line = this.getCurrentLine().trim();

    // Handle 'when' conditionals
    if (line.startsWith('when ')) {
      return this.parseConditionalElement(parentIndent);
    }

    // Handle 'show' statements
    if (line.startsWith('show ')) {
      return this.parseShowElement(parentIndent);
    }

    // Handle 'for each' loops (future)
    // if (line.startsWith('for each ')) {
    //   return this.parseForEachElement(parentIndent);
    // }

    // Unknown element, skip
    this.advance();
    return null;
  }

  /**
   * Parse a 'when' conditional element
   */
  private parseConditionalElement(parentIndent: number): ConditionalElement {
    const line = this.getCurrentLine().trim();
    const match = line.match(/^when\s+(.+):$/);
    if (!match) throw new Error(`Invalid when statement: ${line}`);

    const condition = match[1];
    this.advance();

    const thenElements: UIElement[] = [];
    const baseIndent = this.getIndentLevel();

    // Parse child elements
    while (this.hasMore() && this.getIndentLevel() >= baseIndent) {
      const element = this.parseUIElement(baseIndent);
      if (element) {
        thenElements.push(element);
      }
    }

    return {
      type: 'when',
      condition,
      then: thenElements,
    };
  }

  /**
   * Parse a 'show' element
   * Handles both: show <type>: and show <type> <name>:
   */
  private parseShowElement(parentIndent: number): ShowElement {
    const line = this.getCurrentLine().trim();

    // Match: show <type> <name>: OR show <type>:
    // Regex explanation:
    // - ^show\s+ : starts with "show" followed by whitespace
    // - (\w+) : capture element type (required)
    // - (?:\s+(\w+))? : optionally capture element name (non-capturing group for the space)
    // - : : must end with colon
    const match = line.match(/^show\s+(\w+)(?:\s+(\w+))?:$/);
    if (!match) throw new Error(`Invalid show statement: ${line}`);

    const elementType = match[1];
    const elementName = match[2] || elementType; // Use type as name if no name provided

    this.advance();

    const properties: Record<string, string> = {};
    const children: UIElement[] = [];
    const elementIndent = this.getIndentLevel();

    // Parse properties and nested elements (children of this show element)
    while (this.hasMore()) {
      const currentIndent = this.getIndentLevel();
      const propLine = this.getCurrentLine().trim();

      // Stop if we've dedented to or past the element's level (but skip empty lines)
      if (propLine && currentIndent < elementIndent) {
        break;
      }

      // Skip empty lines and comments
      if (!propLine || propLine.startsWith('#')) {
        this.advance();
        continue;
      }

      // Check for nested show statements or when conditionals
      if (propLine.startsWith('show ') || propLine.startsWith('when ') || propLine.startsWith('template ')) {
        const childElement = this.parseUIElement(currentIndent);
        if (childElement) {
          children.push(childElement);
        }
        continue;
      }

      // Check for special multi-line sections (on click, on scroll_near_end, etc.)
      if (propLine.startsWith('on ') && propLine.endsWith(':')) {
        // Skip event handlers for now
        const eventBaseIndent = this.getIndentLevel();
        this.advance();
        // Skip all lines that are more indented than the 'on' line
        while (this.hasMore() && this.getIndentLevel() > eventBaseIndent) {
          this.advance();
        }
        continue;
      }

      // Check for special sections like 'pagination:', 'template:', etc.
      if (propLine === 'pagination:' || propLine === 'template:') {
        // Skip these sections for now
        this.advance();
        const sectionIndent = this.getIndentLevel();
        while (this.hasMore() && this.getIndentLevel() >= sectionIndent) {
          this.advance();
        }
        continue;
      }

      // Parse regular properties
      const propMatch = propLine.match(/^(\w+):\s*(.*)$/);
      if (propMatch) {
        const propName = propMatch[1];
        const propValue = propMatch[2];
        properties[propName] = propValue;
        this.advance();
        continue;
      }

      // Unknown line, skip
      this.advance();
    }

    // Store the element name as a property if it was explicitly provided
    if (match[2]) {
      properties['id'] = match[2];
    }

    return {
      type: 'show',
      elementName: elementType,
      properties,
      children: children.length > 0 ? children : undefined,
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

        // Check for multi-line value using pipe (|) syntax
        const multilineMatch = propLine.match(/^(\w+):\s*\|$/);
        if (multilineMatch && multilineMatch[1] === 'value') {
          this.advance();

          // Collect all indented lines as the multi-line value
          const valueLines: string[] = [];
          const valueIndent = this.getIndentLevel();

          while (this.hasMore()) {
            const valueLine = this.getCurrentLine();
            const currentIndent = this.getIndentLevel();

            // Empty lines are preserved
            if (!valueLine.trim()) {
              valueLines.push('');
              this.advance();
              continue;
            }

            // Stop if we encounter a line with less indentation than valueIndent
            if (currentIndent < valueIndent) {
              break;
            }

            // Preserve original indentation relative to the value block
            const relativeIndent = ' '.repeat(Math.max(0, currentIndent - valueIndent));
            valueLines.push(relativeIndent + valueLine.trim());
            this.advance();
          }

          value = valueLines.join('\n').trim();
          continue;
        }

        // Single-line property
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
