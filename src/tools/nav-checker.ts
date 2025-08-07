import { ToolParameters, AccessibilityCheckResult, AccessibilityIssue } from '../types/index';
import { HTMLParser } from './html-parser';
import { navAccessibilityRules } from '../rules/nav-rules';

export class NavAccessibilityChecker {
  static async check(params: ToolParameters): Promise<AccessibilityCheckResult> {
    try {
      const { content, provideSuggestions } = params;
      const parsed = HTMLParser.parse(content);
      const issues: AccessibilityIssue[] = [];
      
      // Check each nav element against all rules
      parsed.navElements.forEach((navElement) => {
        navAccessibilityRules.forEach((rule) => {
          const issue = rule.check(navElement);
          if (issue) {
            // Add position information
            const position = HTMLParser.getElementPosition(navElement, content);
            if (position) {
              issue.line = position.line;
              issue.column = position.column;
            }
            
            // Only include suggestions if requested
            if (!provideSuggestions) {
              delete issue.suggestion;
              delete issue.exampleCode;
            }
            
            issues.push(issue);
          }
        });
      });
      
      // Calculate summary
      const errors = issues.filter(issue => issue.type === 'error').length;
      const warnings = issues.filter(issue => issue.type === 'warning').length;
      
      return {
        issues,
        summary: {
          errors,
          warnings,
          elementsChecked: parsed.navElements.length
        }
      };
      
    } catch (error) {
      return {
        issues: [{
          type: 'error',
          message: `Failed to parse HTML: ${error instanceof Error ? error.message : 'Unknown error'}`,
          suggestion: 'Please check that the provided content is valid HTML'
        }],
        summary: {
          errors: 1,
          warnings: 0,
          elementsChecked: 0
        }
      };
    }
  }
  
  static formatResult(result: AccessibilityCheckResult, notificationType: 'diagnostic' | 'notification' | 'inline'): string {
    const { issues, summary } = result;
    
    if (issues.length === 0) {
      return `✅ No accessibility issues found in ${summary.elementsChecked} navigation element(s)`;
    }
    
    let output = '';
    
    switch (notificationType) {
      case 'diagnostic':
        output += `🔍 Navigation Accessibility Report\n`;
        output += `Elements checked: ${summary.elementsChecked}\n`;
        output += `Errors: ${summary.errors} | Warnings: ${summary.warnings}\n\n`;
        
        issues.forEach((issue, index) => {
          const position = issue.line ? ` (Line ${issue.line}${issue.column ? `, Col ${issue.column}` : ''})` : '';
          const icon = issue.type === 'error' ? '❌' : '⚠️';
          
          output += `${icon} ${issue.type.toUpperCase()}${position}: ${issue.message}\n`;
          
          if (issue.suggestion) {
            output += `   💡 ${issue.suggestion}\n`;
          }
          
          if (issue.exampleCode) {
            output += `   📝 Example:\n`;
            output += issue.exampleCode.split('\n').map(line => `      ${line}`).join('\n') + '\n';
          }
          
          if (index < issues.length - 1) output += '\n';
        });
        break;
        
      case 'notification':
        output += `Navigation A11y: ${summary.errors} errors, ${summary.warnings} warnings`;
        if (issues.length > 0) {
          output += `\n• ${issues[0].message}`;
          if (issues.length > 1) {
            output += `\n• ... and ${issues.length - 1} more issues`;
          }
        }
        break;
        
      case 'inline':
        issues.forEach((issue) => {
          const icon = issue.type === 'error' ? '❌' : '⚠️';
          output += `${icon} ${issue.message}`;
          if (issue.suggestion) {
            output += ` (${issue.suggestion})`;
          }
          output += '\n';
        });
        break;
    }
    
    return output.trim();
  }
}