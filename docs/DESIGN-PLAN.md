# MCP Accessibility Helper - Design Plan

## Project Overview
A Model Context Protocol (MCP) server that provides accessibility checking tools for HTML/CSS code, specifically focused on navigation elements and dropdown buttons.

## Architecture

### MCP Server Structure
- **Single MCP Server** with **two tools**:
  - `check-nav-accessibility`: Validates `<nav>` element accessibility
  - `check-dropdown-accessibility`: Validates dropdown button accessibility
- **Language**: TypeScript/JavaScript
- **Transport**: stdio (for local development) and HTTP (for Render.com deployment)
- **Protocol**: JSON-RPC 2.0 as per MCP specification

### Two Tools Explanation
In MCP, "tools" are functions that the AI can call to perform specific actions. Your server will expose two distinct tools:
1. One tool for checking nav element accessibility
2. One tool for checking dropdown button accessibility

## Deployment Strategy

### Render.com Deployment
- **Recommendation**: Deploy as a **web service** on Render.com that exposes an HTTP endpoint
- **MCP Integration**: Configure Cursor to connect to your deployed server via HTTP transport
- **Configuration**: Add server URL to Cursor's MCP settings (`~/.cursor/mcp.json`)

### Local Development
- Use stdio transport for local testing
- Environment variables for configuration

## Functionality Specifications

### Tool 1: Nav Element Checker (`check-nav-accessibility`)

**Purpose**: Check `<nav>` elements for proper accessibility attributes

**Accessibility Rules** (based on WCAG research):
- **Priority**: `aria-labelledby` > `aria-label` (prefer referencing visible labels)
- **Multiple nav elements**: Each must have unique labels
- **Required attributes**: Either `aria-label` or `aria-labelledby`
- **Structure validation**: Should contain semantic list structure (`<ul>/<li>`)

**Parameters**:
```typescript
{
  mode: 'realtime' | 'on-demand',
  content: string, // HTML content to analyze
  notificationType: 'diagnostic' | 'notification' | 'inline',
  provideSuggestions: boolean
}
```

**Output**:
- Issues found with specific line numbers
- Suggested fixes with example code
- Severity level (warning/error)

### Tool 2: Dropdown Button Checker (`check-dropdown-accessibility`)

**Purpose**: Check dropdown buttons for proper ARIA attributes

**Accessibility Rules** (based on research):
- **Required attributes**: `aria-expanded`, `aria-haspopup`, `aria-controls`
- **Pattern detection**: `<button>` + `aria-expanded` combinations
- **State management**: Proper true/false values for `aria-expanded`
- **Focus management**: Keyboard navigation support indicators

**Parameters**:
```typescript
{
  mode: 'realtime' | 'on-demand',
  content: string,
  notificationType: 'diagnostic' | 'notification' | 'inline',
  provideSuggestions: boolean
}
```

**Output**:
- Missing ARIA attributes
- Incorrect attribute values
- Suggested label text based on context
- Code examples for proper implementation

## Interaction Types & Notification Methods

### Mode Parameter Options
- **`realtime`**: Analyze code as user types (resource-intensive)
- **`on-demand`**: Analyze only when explicitly called

### Notification Type Options (Best Practices)
- **`diagnostic`**: VS Code/Cursor diagnostic messages (recommended for errors)
- **`notification`**: Editor notifications (good for warnings)
- **`inline`**: Inline suggestions/hints (least intrusive)

**Recommendation**: Start with `diagnostic` as primary method - it integrates well with editor workflows

## File Processing

### Scope
- **Target**: Active file in editor
- **File types**: `.html`, `.htm` files initially
- **Future expansion**: `.vue`, `.jsx`, `.tsx` components

### Processing Strategy
1. Parse HTML content using a robust parser (jsdom or similar)
2. Query for `<nav>` elements and button patterns
3. Validate against accessibility rules
4. Generate structured feedback

## Technical Implementation Plan

### Core Dependencies
```json
{
  "@anthropic/mcp": "latest",
  "jsdom": "^22.0.0",
  "typescript": "^5.0.0"
}
```

### Project Structure
```
src/
├── server.ts              # Main MCP server
├── tools/
│   ├── nav-checker.ts     # Nav accessibility tool
│   ├── dropdown-checker.ts # Dropdown accessibility tool
│   └── html-parser.ts     # HTML parsing utilities
├── rules/
│   ├── nav-rules.ts       # Nav accessibility rules
│   └── dropdown-rules.ts  # Dropdown accessibility rules
└── types/
    └── index.ts           # TypeScript definitions
```

### Error Handling
- Graceful degradation when HTML parsing fails
- Clear error messages for invalid input
- Fallback suggestions when specific context cannot be determined

## Configuration Options

### Environment Variables
```bash
MCP_SERVER_PORT=3000
MCP_LOG_LEVEL=info
MCP_NOTIFICATION_DEFAULTS=diagnostic
```

### Cursor MCP Configuration
```json
{
  "mcpServers": {
    "accessibility-helper": {
      "command": "node",
      "args": ["/path/to/server/dist/server.js"],
      "env": {
        "MCP_LOG_LEVEL": "info"
      }
    }
  }
}
```

### Render.com Configuration
```json
{
  "accessibility-helper-remote": {
    "transport": "http",
    "url": "https://your-app.onrender.com/mcp"
  }
}
```

## Future Enhancements

### Phase 2 Features
- Support for React/Vue components
- Integration with existing linters (ESLint accessibility rules)
- Custom rule configuration
- Batch file processing

### Advanced Accessibility Checks
- Color contrast validation
- Focus management patterns
- ARIA live regions
- Form accessibility

## Success Metrics
- Successful deployment on Render.com
- Proper integration with Cursor MCP
- Accurate detection of accessibility issues
- Helpful suggestion generation
- Stable realtime and on-demand modes

This design provides a solid foundation for your MCP accessibility helper while allowing for future expansion and customization.