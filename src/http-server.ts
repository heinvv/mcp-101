#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { NavAccessibilityChecker } from './tools/nav-checker';
import { DropdownAccessibilityChecker } from './tools/dropdown-checker';
import { ToolParameters } from './types/index';
import express from 'express';
import cors from 'cors';

class AccessibilityHelperHTTPServer {
  private server: Server;
  private app: express.Application;

  constructor() {
    this.server = new Server(
      {
        name: 'accessibility-helper',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.app = express();
    this.setupExpress();
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupExpress(): void {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'check-nav-accessibility',
            description: 'Check navigation elements for accessibility compliance (WCAG guidelines)',
            inputSchema: {
              type: 'object',
              properties: {
                mode: {
                  type: 'string',
                  enum: ['realtime', 'on-demand'],
                  description: 'Analysis mode - realtime for live checking, on-demand for explicit calls',
                  default: 'on-demand'
                },
                content: {
                  type: 'string',
                  description: 'HTML content to analyze for navigation accessibility'
                },
                notificationType: {
                  type: 'string',
                  enum: ['diagnostic', 'notification', 'inline'],
                  description: 'Type of notification format for results',
                  default: 'diagnostic'
                },
                provideSuggestions: {
                  type: 'boolean',
                  description: 'Whether to include fix suggestions and example code',
                  default: true
                }
              },
              required: ['content']
            }
          },
          {
            name: 'check-dropdown-accessibility',
            description: 'Check dropdown buttons for proper ARIA attributes and accessibility compliance',
            inputSchema: {
              type: 'object',
              properties: {
                mode: {
                  type: 'string',
                  enum: ['realtime', 'on-demand'],
                  description: 'Analysis mode - realtime for live checking, on-demand for explicit calls',
                  default: 'on-demand'
                },
                content: {
                  type: 'string',
                  description: 'HTML content to analyze for dropdown accessibility'
                },
                notificationType: {
                  type: 'string',
                  enum: ['diagnostic', 'notification', 'inline'],
                  description: 'Type of notification format for results',
                  default: 'diagnostic'
                },
                provideSuggestions: {
                  type: 'boolean',
                  description: 'Whether to include fix suggestions and example code',
                  default: true
                }
              },
              required: ['content']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'check-nav-accessibility': {
            if (!args || typeof args.content !== 'string') {
              throw new Error('Content parameter is required and must be a string');
            }
            
            const params: ToolParameters = {
              mode: (args.mode as 'realtime' | 'on-demand') || 'on-demand',
              content: args.content,
              notificationType: (args.notificationType as 'diagnostic' | 'notification' | 'inline') || 'diagnostic',
              provideSuggestions: args.provideSuggestions !== false
            };

            const result = await NavAccessibilityChecker.check(params);
            const formattedOutput = NavAccessibilityChecker.formatResult(result, params.notificationType);

            return {
              content: [
                {
                  type: 'text',
                  text: formattedOutput
                }
              ]
            };
          }

          case 'check-dropdown-accessibility': {
            if (!args || typeof args.content !== 'string') {
              throw new Error('Content parameter is required and must be a string');
            }
            
            const params: ToolParameters = {
              mode: (args.mode as 'realtime' | 'on-demand') || 'on-demand',
              content: args.content,
              notificationType: (args.notificationType as 'diagnostic' | 'notification' | 'inline') || 'diagnostic',
              provideSuggestions: args.provideSuggestions !== false
            };

            const result = await DropdownAccessibilityChecker.check(params);
            const formattedOutput = DropdownAccessibilityChecker.formatResult(result, params.notificationType);

            return {
              content: [
                {
                  type: 'text',
                  text: formattedOutput
                }
              ]
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error: ${errorMessage}`
            }
          ],
          isError: true
        };
      }
    });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const port = process.env.PORT || 3000;
    
    // Create SSE transport for MCP
    this.app.use('/mcp', express.raw({ type: 'application/json' }));
    
    // Setup SSE endpoint
    this.app.post('/mcp', async (req, res) => {
      const transport = new SSEServerTransport('/mcp', res);
      await this.server.connect(transport);
      
      // Keep connection alive
      req.on('close', () => {
        transport.close();
      });
    });
    
    this.app.listen(port, () => {
      console.log(`[MCP HTTP Server] Accessibility Helper listening on port ${port}`);
      console.log(`[MCP HTTP Server] Health check: http://localhost:${port}/health`);
      console.log(`[MCP HTTP Server] MCP endpoint: http://localhost:${port}/mcp`);
    });
  }
}

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new AccessibilityHelperHTTPServer();
  server.run().catch((error) => {
    console.error('[MCP HTTP Server] Failed to start:', error);
    process.exit(1);
  });
}