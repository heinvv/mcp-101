export interface AccessibilityIssue {
  type: 'error' | 'warning';
  message: string;
  line?: number;
  column?: number;
  element?: string;
  suggestion?: string;
  exampleCode?: string;
}

export interface AccessibilityCheckResult {
  issues: AccessibilityIssue[];
  summary: {
    errors: number;
    warnings: number;
    elementsChecked: number;
  };
}

export interface ToolParameters {
  mode: 'realtime' | 'on-demand';
  content: string;
  notificationType: 'diagnostic' | 'notification' | 'inline';
  provideSuggestions: boolean;
}

export interface NavAccessibilityRule {
  id: string;
  name: string;
  description: string;
  check: (element: Element) => AccessibilityIssue | null;
}

export interface DropdownAccessibilityRule {
  id: string;
  name: string;
  description: string;
  check: (element: Element) => AccessibilityIssue | null;
}

export interface ParsedHTML {
  document: Document;
  navElements: NodeListOf<Element>;
  dropdownButtons: NodeListOf<Element>;
}