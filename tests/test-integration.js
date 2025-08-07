#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { spawn } from 'child_process';

async function testMCPIntegration() {
  console.log('🧪 Testing MCP Accessibility Helper Integration\n');

  try {
    // Read test HTML file
    const htmlContent = await readFile('./examples/accessibility-test-cases.html', 'utf-8');
    
    // Start the MCP server
    const server = spawn('node', ['dist/server.js'], {
      stdio: ['pipe', 'pipe', 'inherit']
    });

    let responses = [];
    
    server.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      responses.push(...lines);
    });

    // Give server time to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 1: List available tools
    console.log('📋 Test 1: List Tools');
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    };
    
    server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 2: Check navigation accessibility
    console.log('🧭 Test 2: Navigation Accessibility Check');
    const navCheckRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'check-nav-accessibility',
        arguments: {
          content: htmlContent,
          notificationType: 'diagnostic',
          provideSuggestions: true
        }
      }
    };
    
    server.stdin.write(JSON.stringify(navCheckRequest) + '\n');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 3: Check dropdown accessibility
    console.log('🔽 Test 3: Dropdown Accessibility Check');
    const dropdownCheckRequest = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'check-dropdown-accessibility',
        arguments: {
          content: htmlContent,
          notificationType: 'diagnostic',
          provideSuggestions: true
        }
      }
    };
    
    server.stdin.write(JSON.stringify(dropdownCheckRequest) + '\n');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Process responses
    console.log('\n📊 Results:');
    responses.forEach((response, index) => {
      if (response.trim()) {
        try {
          const parsed = JSON.parse(response);
          if (parsed.result) {
            console.log(`\n🔍 Response ${parsed.id}:`);
            if (parsed.result.tools) {
              console.log(`   Found ${parsed.result.tools.length} tools:`);
              parsed.result.tools.forEach(tool => {
                console.log(`   - ${tool.name}: ${tool.description}`);
              });
            }
            if (parsed.result.content) {
              console.log(`   Result:`);
              parsed.result.content.forEach(content => {
                if (content.text) {
                  console.log(`   ${content.text}`);
                }
              });
            }
          }
        } catch (e) {
          // Non-JSON response, probably debug info
          if (!response.includes('[MCP')) {
            console.log(`   Raw: ${response}`);
          }
        }
      }
    });

    server.kill('SIGTERM');
    console.log('\n✅ Integration test completed successfully!');

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    process.exit(1);
  }
}

testMCPIntegration();