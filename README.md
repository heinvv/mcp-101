# MCP Accessibility Helper

A Model Context Protocol (MCP) server that provides accessibility checking tools for HTML navigation and dropdown elements, following WCAG guidelines.

## Features

- **Navigation Accessibility Checker**: Validates `<nav>` elements for proper ARIA labeling, semantic structure, and uniqueness
- **Dropdown Accessibility Checker**: Validates dropdown buttons for proper ARIA attributes like `aria-expanded`, `aria-haspopup`, and `aria-controls`
- **Multiple Output Formats**: Diagnostic, notification, and inline reporting modes
- **Detailed Suggestions**: Provides fix suggestions and example code for accessibility issues
- **Dual Transport Support**: Both stdio (local) and HTTP (remote deployment) transports

## Quick Start

### Installation

```bash
npm install
npm run build
```

### Local Development

```bash
# Start stdio server for local MCP integration
npm run dev

# Start HTTP server for testing
npm run dev:http
```

### Cursor IDE Integration

Add to your Cursor MCP configuration (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "accessibility-helper": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-101/dist/server.js"],
      "env": {
        "MCP_LOG_LEVEL": "info"
      }
    }
  }
}
```

## Usage

### Navigation Accessibility Check

```javascript
// Example usage in MCP client
const result = await callTool('check-nav-accessibility', {
  content: `
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  `,
  notificationType: 'diagnostic',
  provideSuggestions: true
});
```

### Dropdown Accessibility Check

```javascript
// Example usage in MCP client
const result = await callTool('check-dropdown-accessibility', {
  content: `
    <button aria-expanded="false" aria-haspopup="menu" aria-controls="dropdown-menu">
      Menu
    </button>
    <ul id="dropdown-menu">
      <li><a href="/item1">Item 1</a></li>
      <li><a href="/item2">Item 2</a></li>
    </ul>
  `,
  notificationType: 'diagnostic',
  provideSuggestions: true
});
```

## Tool Parameters

Both tools accept the same parameters:

- `content` (required): HTML string to analyze
- `mode`: `'realtime' | 'on-demand'` (default: 'on-demand')
- `notificationType`: `'diagnostic' | 'notification' | 'inline'` (default: 'diagnostic')
- `provideSuggestions`: `boolean` (default: true)

## Accessibility Rules

### Navigation Rules

- **Required Labels**: Nav elements must have `aria-label` or `aria-labelledby`
- **Unique Labels**: Multiple nav elements must have distinct labels
- **Label Quality**: Non-empty, meaningful label text
- **Semantic Structure**: Preference for `<ul>/<li>` structure
- **Reference Validation**: `aria-labelledby` must point to existing elements

### Dropdown Rules

- **State Indication**: `aria-expanded` with valid boolean values
- **Popup Type**: `aria-haspopup` with appropriate values
- **Control Relationship**: `aria-controls` referencing controlled content
- **Accessible Names**: Clear text content or `aria-label`
- **Keyboard Hints**: Guidance for complex dropdown navigation

## Deployment

### Render.com Deployment

1. Connect your repository to Render.com
2. Use the included `render.yaml` configuration
3. Set environment variables as needed
4. Deploy as a web service

### Environment Variables

```bash
PORT=3000                          # Server port
NODE_ENV=production               # Environment
MCP_LOG_LEVEL=info               # Logging level
MCP_NOTIFICATION_DEFAULTS=diagnostic  # Default notification type
```

### MCP Configuration for Remote Server

```json
{
  "mcpServers": {
    "accessibility-helper-remote": {
      "transport": "http",
      "url": "https://your-app.onrender.com/mcp"
    }
  }
}
```

## Development

### Project Structure

```
src/
├── server.ts              # Main MCP server (stdio)
├── http-server.ts         # HTTP MCP server
├── tools/                 # Accessibility checking tools
│   ├── nav-checker.ts     # Navigation accessibility tool
│   ├── dropdown-checker.ts # Dropdown accessibility tool
│   └── html-parser.ts     # HTML parsing utilities
├── rules/                 # Accessibility rule engines
│   ├── nav-rules.ts       # Navigation accessibility rules
│   └── dropdown-rules.ts  # Dropdown accessibility rules
└── types/
    └── index.ts           # TypeScript definitions

docs/                      # Documentation
├── DESIGN-PLAN.md         # Technical design and architecture
├── MCP-DESIGN.md          # MCP integration details
└── CURSOR-SETUP.md        # Cursor IDE setup guide

examples/                  # Example HTML files for testing
└── accessibility-test-cases.html # Test cases with good/bad examples

tests/                     # Test files
└── test-integration.js    # MCP integration test

scripts/                   # Build and utility scripts
└── fix-imports.js         # ES module import fixer
```

### Scripts

```bash
npm run build          # Build TypeScript + fix ES module imports
npm run fix-imports    # Fix imports in compiled JS (auto-runs after build)
npm run dev           # Start stdio server
npm run dev:http      # Start HTTP server
npm run start         # Start built stdio server
npm run start:http    # Start built HTTP server
npm run test          # Run integration tests
npm run test:integration # Run MCP integration test
npm run lint          # Run linter
npm run lint:fix      # Run linter with auto-fix
npm run clean         # Clean build directory
```

### Pure TypeScript Development

This project uses pure TypeScript imports (without `.js` extensions) in source files. A post-build script automatically adds the required `.js` extensions to the compiled JavaScript for proper ES module compatibility with Node.js.

## License

MIT