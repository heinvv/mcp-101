import { NavAccessibilityRule, AccessibilityIssue } from '../types/index';
import { HTMLParser } from '../tools/html-parser';

export const navAccessibilityRules: NavAccessibilityRule[] = [
  {
    id: 'nav-requires-label',
    name: 'Navigation requires accessible label',
    description: 'Nav elements must have either aria-label or aria-labelledby attributes',
    check: (element: Element): AccessibilityIssue | null => {
      const hasAriaLabel = element.hasAttribute('aria-label');
      const hasAriaLabelledby = element.hasAttribute('aria-labelledby');
      
      if (!hasAriaLabel && !hasAriaLabelledby) {
        return {
          type: 'error',
          message: 'Navigation element is missing aria-label or aria-labelledby attribute',
          element: element.tagName.toLowerCase(),
          suggestion: 'Add aria-label="Main navigation" or aria-labelledby="nav-heading-id" to provide an accessible name',
          exampleCode: '<nav aria-label="Main navigation">\n  <ul>\n    <li><a href="/">Home</a></li>\n  </ul>\n</nav>'
        };
      }
      
      return null;
    }
  },
  
  {
    id: 'nav-empty-label',
    name: 'Navigation label must not be empty',
    description: 'aria-label attributes must have meaningful content',
    check: (element: Element): AccessibilityIssue | null => {
      const ariaLabel = element.getAttribute('aria-label');
      
      if (ariaLabel !== null && ariaLabel.trim() === '') {
        return {
          type: 'error',
          message: 'Navigation element has empty aria-label attribute',
          element: element.tagName.toLowerCase(),
          suggestion: 'Provide a meaningful label like "Main navigation" or "Secondary navigation"',
          exampleCode: '<nav aria-label="Main navigation">...</nav>'
        };
      }
      
      return null;
    }
  },
  
  {
    id: 'nav-labelledby-target-exists',
    name: 'aria-labelledby must reference existing element',
    description: 'aria-labelledby must point to an element with a matching ID',
    check: (element: Element): AccessibilityIssue | null => {
      const labelledby = element.getAttribute('aria-labelledby');
      
      if (labelledby) {
        const document = element.ownerDocument;
        const referencedElement = document?.getElementById(labelledby);
        
        if (!referencedElement) {
          return {
            type: 'error',
            message: `Navigation element references non-existent ID "${labelledby}" in aria-labelledby`,
            element: element.tagName.toLowerCase(),
            suggestion: `Create an element with id="${labelledby}" or update the aria-labelledby value`,
            exampleCode: `<h2 id="${labelledby}">Navigation</h2>\n<nav aria-labelledby="${labelledby}">...</nav>`
          };
        }
      }
      
      return null;
    }
  },
  
  {
    id: 'nav-prefers-labelledby',
    name: 'Prefer aria-labelledby over aria-label when visible label exists',
    description: 'Use aria-labelledby when there is visible heading text that labels the navigation',
    check: (element: Element): AccessibilityIssue | null => {
      const hasAriaLabel = element.hasAttribute('aria-label');
      const hasAriaLabelledby = element.hasAttribute('aria-labelledby');
      
      if (hasAriaLabel && !hasAriaLabelledby) {
        // Check if there's a nearby heading that could be used as labelledby
        const document = element.ownerDocument;
        if (document) {
          const previousSibling = element.previousElementSibling;
          const parent = element.parentElement;
          
          // Look for headings before the nav element
          if (previousSibling?.matches('h1, h2, h3, h4, h5, h6')) {
            const headingId = previousSibling.id;
            if (headingId) {
              return {
                type: 'warning',
                message: 'Consider using aria-labelledby instead of aria-label when visible heading is available',
                element: element.tagName.toLowerCase(),
                suggestion: `Use aria-labelledby="${headingId}" to reference the visible heading`,
                exampleCode: `<h2 id="${headingId}">${previousSibling.textContent}</h2>\n<nav aria-labelledby="${headingId}">...</nav>`
              };
            }
          }
          
          // Look for headings within parent container
          if (parent) {
            const headingsInParent = parent.querySelectorAll('h1, h2, h3, h4, h5, h6');
            if (headingsInParent.length > 0) {
              const firstHeading = headingsInParent[0] as Element;
              if (firstHeading.id) {
                return {
                  type: 'warning',
                  message: 'Consider using aria-labelledby instead of aria-label when visible heading is available',
                  element: element.tagName.toLowerCase(),
                  suggestion: `Use aria-labelledby="${firstHeading.id}" to reference the visible heading`,
                  exampleCode: `<h2 id="${firstHeading.id}">${firstHeading.textContent}</h2>\n<nav aria-labelledby="${firstHeading.id}">...</nav>`
                };
              }
            }
          }
        }
      }
      
      return null;
    }
  },
  
  {
    id: 'nav-semantic-structure',
    name: 'Navigation should use semantic list structure',
    description: 'Nav elements should contain ul/ol lists for better screen reader support',
    check: (element: Element): AccessibilityIssue | null => {
      const hasSemanticStructure = HTMLParser.hasSemanticListStructure(element);
      
      if (!hasSemanticStructure) {
        const hasLinks = element.querySelectorAll('a').length > 0;
        
        if (hasLinks) {
          return {
            type: 'warning',
            message: 'Navigation should use semantic list structure (ul/li) for better accessibility',
            element: element.tagName.toLowerCase(),
            suggestion: 'Wrap navigation links in an unordered list',
            exampleCode: '<nav aria-label="Main navigation">\n  <ul>\n    <li><a href="/">Home</a></li>\n    <li><a href="/about">About</a></li>\n    <li><a href="/contact">Contact</a></li>\n  </ul>\n</nav>'
          };
        }
      }
      
      return null;
    }
  },
  
  {
    id: 'nav-unique-labels',
    name: 'Multiple navigation elements must have unique labels',
    description: 'When multiple nav elements exist, each must have a unique accessible name',
    check: (element: Element): AccessibilityIssue | null => {
      const document = element.ownerDocument;
      if (!document) return null;
      
      const allNavElements = document.querySelectorAll('nav');
      
      if (allNavElements.length > 1) {
        const currentLabel = element.getAttribute('aria-label') || 
                           (element.getAttribute('aria-labelledby') ? 
                            document.getElementById(element.getAttribute('aria-labelledby')!)?.textContent?.trim() : 
                            '');
        
        if (!currentLabel) {
          return {
            type: 'error',
            message: 'Multiple navigation elements detected - each must have a unique label',
            element: element.tagName.toLowerCase(),
            suggestion: 'Add unique aria-label like "Main navigation", "Secondary navigation", or "Footer navigation"',
            exampleCode: '<nav aria-label="Main navigation">...</nav>\n<nav aria-label="Footer navigation">...</nav>'
          };
        }
        
        // Check for duplicate labels
        let duplicateFound = false;
        allNavElements.forEach((nav) => {
          if (nav !== element) {
            const otherLabel = nav.getAttribute('aria-label') ||
                             (nav.getAttribute('aria-labelledby') ? 
                              document.getElementById(nav.getAttribute('aria-labelledby')!)?.textContent?.trim() :
                              '');
            
            if (otherLabel === currentLabel) {
              duplicateFound = true;
            }
          }
        });
        
        if (duplicateFound) {
          return {
            type: 'error',
            message: `Multiple navigation elements have the same label: "${currentLabel}"`,
            element: element.tagName.toLowerCase(),
            suggestion: 'Ensure each navigation has a unique label to help users distinguish between them',
            exampleCode: '<nav aria-label="Main navigation">...</nav>\n<nav aria-label="Breadcrumb navigation">...</nav>'
          };
        }
      }
      
      return null;
    }
  }
];