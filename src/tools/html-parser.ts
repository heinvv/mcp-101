import { JSDOM } from 'jsdom';
import { ParsedHTML } from '../types/index';

export class HTMLParser {
  static parse(htmlContent: string): ParsedHTML {
    try {
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      
      const navElements = document.querySelectorAll('nav');
      
      // Find dropdown buttons - buttons with aria-expanded or aria-haspopup
      const dropdownButtons = document.querySelectorAll(
        'button[aria-expanded], button[aria-haspopup], [role="button"][aria-expanded], [role="button"][aria-haspopup]'
      );
      
      return {
        document,
        navElements,
        dropdownButtons
      };
    } catch (error) {
      throw new Error(`Failed to parse HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static getElementPosition(element: Element, originalContent: string): { line: number; column: number } | null {
    try {
      const outerHTML = element.outerHTML;
      const lines = originalContent.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const columnIndex = lines[i].indexOf(outerHTML);
        if (columnIndex !== -1) {
          return { line: i + 1, column: columnIndex + 1 };
        }
      }
      
      // Fallback: try to find by tag name and attributes
      const tagName = element.tagName.toLowerCase();
      const id = element.getAttribute('id');
      const className = element.getAttribute('class');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes(`<${tagName}`)) {
          if ((id && line.includes(`id="${id}"`)) || 
              (className && line.includes(`class="${className}"`)) ||
              (!id && !className)) {
            const columnIndex = line.indexOf(`<${tagName}`);
            return { line: i + 1, column: columnIndex + 1 };
          }
        }
      }
    } catch (error) {
      // Return null if position cannot be determined
    }
    
    return null;
  }
  
  static getElementText(element: Element): string {
    return element.textContent?.trim() || '';
  }
  
  static hasSemanticListStructure(navElement: Element): boolean {
    const lists = navElement.querySelectorAll('ul, ol');
    return lists.length > 0;
  }
}