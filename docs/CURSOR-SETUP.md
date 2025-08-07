# MCP Configuration for Cursor IDE

## Local Development Setup
To use this MCP server locally with Cursor:

1. Build the project:
```bash
npm run build
```

2. Add to your Cursor MCP config (`~/.cursor/mcp.json`):
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

## Remote Deployment Setup
For deployed version (Render.com):
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

## Available Tools
- `check-nav-accessibility`: Check `<nav>` elements for WCAG compliance
- `check-dropdown-accessibility`: Check dropdown buttons for proper ARIA attributes

## Usage Examples
```html
<!-- Test HTML for nav checking -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

<!-- Test HTML for dropdown checking -->
<button aria-expanded="false" aria-haspopup="menu" aria-controls="menu">
  Menu
</button>
<ul id="menu">
  <li><a href="/item">Item</a></li>
</ul>
```