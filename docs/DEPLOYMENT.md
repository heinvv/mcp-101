# Deployment Guide

## Render.com Deployment

### Configuration Files
- `render.yaml` - Main deployment configuration
- `package.json` - Dependencies and scripts

### Key Settings
- **Start Command**: `node dist/http-server.js` (HTTP server, not stdio server)
- **Build Command**: `npm install && npm run build`
- **Health Check**: `/health`
- **Port**: Uses `process.env.PORT` from Render.com

### Deployment Process
1. **Dependencies**: TypeScript types are included as regular dependencies for build process
2. **Build**: Compiles TypeScript and fixes ES module imports
3. **Start**: Runs HTTP server that binds to `0.0.0.0:PORT`

### Endpoints
- `/` - Server info and status
- `/health` - Health check for monitoring  
- `/mcp` - MCP protocol endpoint for tools

### Troubleshooting

**If server exits early:**
- Check that `startCommand` in render.yaml is `node dist/http-server.js`
- Verify HTTP server is binding to `0.0.0.0` not just `localhost`
- Confirm PORT environment variable is being used

**If build fails:**
- Ensure TypeScript types are in regular dependencies, not devDependencies
- Check that all required packages are installed during build
- Verify `npm run build` works locally

**If wrong server runs:**
- Make sure render.yaml `startCommand` is explicit: `node dist/http-server.js`
- Check that `package.json` main field points to HTTP server
- Clear any cached configurations on Render.com

### Manual Deployment
If render.yaml is not being read:
1. Set Build Command: `npm install && npm run build`
2. Set Start Command: `node dist/http-server.js`
3. Set Environment Variables: `NODE_ENV=production`, `MCP_LOG_LEVEL=info`
4. Set Health Check Path: `/health`