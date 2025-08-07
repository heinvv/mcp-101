import { DropdownAccessibilityRule, AccessibilityIssue } from '../types/index';

export const dropdownAccessibilityRules: DropdownAccessibilityRule[] = [
  {
    id: 'dropdown-requires-aria-expanded',
    name: 'Dropdown button requires aria-expanded',
    description: 'Dropdown buttons must have aria-expanded attribute to indicate state',
    check: (element: Element): AccessibilityIssue | null => {
      const hasAriaExpanded = element.hasAttribute('aria-expanded');
      
      if (!hasAriaExpanded) {
        return {
          type: 'error',
          message: 'Dropdown button is missing aria-expanded attribute',
          element: element.tagName.toLowerCase(),
          suggestion: 'Add aria-expanded="false" (or "true" if expanded) to indicate dropdown state',
          exampleCode: '<button aria-expanded="false" aria-haspopup="true">Menu</button>'
        };
      }
      
      return null;
    }
  },
  
  {
    id: 'dropdown-aria-expanded-value',
    name: 'aria-expanded must have valid boolean value',
    description: 'aria-expanded should be "true" or "false", not other values',
    check: (element: Element): AccessibilityIssue | null => {
      const ariaExpanded = element.getAttribute('aria-expanded');
      
      if (ariaExpanded !== null && ariaExpanded !== 'true' && ariaExpanded !== 'false') {
        return {
          type: 'error',
          message: `aria-expanded has invalid value "${ariaExpanded}". Must be "true" or "false"`,
          element: element.tagName.toLowerCase(),
          suggestion: 'Use aria-expanded="false" for collapsed state or aria-expanded="true" for expanded state',
          exampleCode: '<button aria-expanded="false" aria-haspopup="true">Menu</button>'
        };
      }
      
      return null;
    }
  },
  
  {
    id: 'dropdown-requires-aria-haspopup',
    name: 'Dropdown button should have aria-haspopup',
    description: 'Dropdown buttons should indicate they trigger a popup with aria-haspopup',
    check: (element: Element): AccessibilityIssue | null => {
      const hasAriaHaspopup = element.hasAttribute('aria-haspopup');
      const hasAriaExpanded = element.hasAttribute('aria-expanded');
      
      // Only check if element has aria-expanded (indicating it's a dropdown)
      if (hasAriaExpanded && !hasAriaHaspopup) {
        return {
          type: 'warning',
          message: 'Dropdown button should have aria-haspopup attribute',
          element: element.tagName.toLowerCase(),
          suggestion: 'Add aria-haspopup="true" for generic popup, "menu" for menu, or "listbox" for listbox',
          exampleCode: '<button aria-expanded="false" aria-haspopup="menu">Options</button>'
        };
      }
      
      return null;
    }
  },
  
  {
    id: 'dropdown-aria-haspopup-value',
    name: 'aria-haspopup should have appropriate value',
    description: 'aria-haspopup should use specific values like "menu", "listbox", "tree", "grid", or "dialog"',
    check: (element: Element): AccessibilityIssue | null => {
      const ariaHaspopup = element.getAttribute('aria-haspopup');
      
      if (ariaHaspopup !== null) {
        const validValues = ['true', 'false', 'menu', 'listbox', 'tree', 'grid', 'dialog'];
        
        if (!validValues.includes(ariaHaspopup)) {
          return {
            type: 'warning',
            message: `aria-haspopup value "${ariaHaspopup}" is not standard. Consider using specific popup type`,
            element: element.tagName.toLowerCase(),
            suggestion: 'Use "menu" for navigation menus, "listbox" for option lists, or "dialog" for modal content',
            exampleCode: '<button aria-expanded="false" aria-haspopup="menu">Navigation Menu</button>'
          };
        }
        
        // Suggest more specific values over generic "true"
        if (ariaHaspopup === 'true') {
          return {
            type: 'warning',
            message: 'Consider using specific aria-haspopup value instead of generic "true"',
            element: element.tagName.toLowerCase(),
            suggestion: 'Use "menu" for navigation menus, "listbox" for option lists, or "dialog" for modal content',
            exampleCode: '<button aria-expanded="false" aria-haspopup="menu">Menu</button>'
          };
        }
      }
      
      return null;
    }
  },
  
  {
    id: 'dropdown-requires-aria-controls',
    name: 'Dropdown button should have aria-controls',
    description: 'Dropdown buttons should reference the controlled element with aria-controls',
    check: (element: Element): AccessibilityIssue | null => {
      const hasAriaControls = element.hasAttribute('aria-controls');
      const hasAriaExpanded = element.hasAttribute('aria-expanded');
      
      if (hasAriaExpanded && !hasAriaControls) {
        return {
          type: 'warning',
          message: 'Dropdown button should have aria-controls attribute to reference the controlled content',
          element: element.tagName.toLowerCase(),
          suggestion: 'Add aria-controls with the ID of the dropdown content element',
          exampleCode: '<button aria-expanded="false" aria-controls="dropdown-menu">Menu</button>\n<ul id="dropdown-menu">...</ul>'
        };
      }
      
      return null;
    }
  },
  
  {
    id: 'dropdown-aria-controls-target-exists',
    name: 'aria-controls must reference existing element',
    description: 'aria-controls must point to an element with a matching ID',
    check: (element: Element): AccessibilityIssue | null => {
      const ariaControls = element.getAttribute('aria-controls');
      
      if (ariaControls) {
        const document = element.ownerDocument;
        const controlledElement = document?.getElementById(ariaControls);
        
        if (!controlledElement) {
          return {
            type: 'error',
            message: `Dropdown button references non-existent ID "${ariaControls}" in aria-controls`,
            element: element.tagName.toLowerCase(),
            suggestion: `Create an element with id="${ariaControls}" or update the aria-controls value`,
            exampleCode: `<button aria-controls="${ariaControls}" aria-expanded="false">Menu</button>\n<ul id="${ariaControls}">...</ul>`
          };
        }
      }
      
      return null;
    }
  },
  
  {
    id: 'dropdown-accessible-name',
    name: 'Dropdown button must have accessible name',
    description: 'Dropdown buttons must have clear text content or aria-label',
    check: (element: Element): AccessibilityIssue | null => {
      const textContent = element.textContent?.trim() || '';
      const ariaLabel = element.getAttribute('aria-label')?.trim() || '';
      const ariaLabelledby = element.getAttribute('aria-labelledby');
      
      let hasAccessibleName = false;
      
      // Check for text content
      if (textContent.length > 0) {
        hasAccessibleName = true;
      }
      
      // Check for aria-label
      if (ariaLabel.length > 0) {
        hasAccessibleName = true;
      }
      
      // Check for aria-labelledby
      if (ariaLabelledby) {
        const document = element.ownerDocument;
        const labelElement = document?.getElementById(ariaLabelledby);
        if (labelElement && labelElement.textContent?.trim()) {
          hasAccessibleName = true;
        }
      }
      
      if (!hasAccessibleName) {
        return {
          type: 'error',
          message: 'Dropdown button must have accessible name (text content, aria-label, or aria-labelledby)',
          element: element.tagName.toLowerCase(),
          suggestion: 'Add meaningful text content or aria-label to describe the button\'s purpose',
          exampleCode: '<button aria-expanded="false" aria-label="Open main menu">☰</button>'
        };
      }
      
      // Check if using only symbols without accessible name
      if (textContent.length > 0 && !ariaLabel && /^[^\w\s]*$/.test(textContent)) {
        return {
          type: 'warning',
          message: 'Dropdown button uses only symbols - consider adding aria-label for clarity',
          element: element.tagName.toLowerCase(),
          suggestion: 'Add aria-label to provide clear description of the button\'s function',
          exampleCode: `<button aria-expanded="false" aria-label="Toggle menu">${textContent}</button>`
        };
      }
      
      return null;
    }
  },
  
  {
    id: 'dropdown-keyboard-hint',
    name: 'Consider keyboard navigation hints',
    description: 'Complex dropdowns should provide keyboard navigation guidance',
    check: (element: Element): AccessibilityIssue | null => {
      const ariaHaspopup = element.getAttribute('aria-haspopup');
      const ariaControls = element.getAttribute('aria-controls');
      
      // Only suggest for menu-type dropdowns that have controlled content
      if (ariaHaspopup === 'menu' && ariaControls) {
        const document = element.ownerDocument;
        const controlledElement = document?.getElementById(ariaControls);
        
        if (controlledElement) {
          // Check if controlled element has many items (suggesting complex navigation)
          const menuItems = controlledElement.querySelectorAll('a, button, [role="menuitem"]');
          
          if (menuItems.length > 5) {
            const hasKeyboardInstructions = element.hasAttribute('aria-describedby') ||
                                          element.getAttribute('title') ||
                                          controlledElement.hasAttribute('aria-describedby');
            
            if (!hasKeyboardInstructions) {
              return {
                type: 'warning',
                message: 'Complex dropdown menu should provide keyboard navigation hints',
                element: element.tagName.toLowerCase(),
                suggestion: 'Consider adding aria-describedby to reference keyboard instructions',
                exampleCode: '<button aria-expanded="false" aria-controls="menu" aria-describedby="menu-help">Menu</button>\n<div id="menu-help" class="sr-only">Use arrow keys to navigate, Enter to select</div>'
              };
            }
          }
        }
      }
      
      return null;
    }
  }
];