/**
 * MCP Server for cPanel File Upload
 * Main entry point for Claude integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { defaultConfig, validateConfig } from './config.js';
import { RequestHandler } from './handlers/request-handler.js';
import { Logger } from './utils/logger.js';

const logger = new Logger('MCPServer');

async function main(): Promise<void> {
  try {
    logger.info('Starting MCP Server for cPanel File Upload...');

    // Validate configuration
    validateConfig(defaultConfig);
    logger.info('Configuration validated');

    // Initialize server
    const server = new Server({
      name: defaultConfig.name,
      version: defaultConfig.version,
    });

    // Initialize request handler
    const requestHandler = new RequestHandler(defaultConfig);
    logger.info('Request handler initialized');

    // Set up MCP tools
    server.setRequestHandler('resources/list', async () => {
      return {
        resources: [
          {
            uri: 'cpanel://file-upload',
            name: 'cPanel File Upload',
            description: 'Upload files to cPanel',
            mimeType: 'application/x-cpanel',
          },
        ],
      };
    });

    server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'upload_file',
            description: 'Upload a file to cPanel server',
            inputSchema: {
              type: 'object',
              properties: {
                filename: {
                  type: 'string',
                  description: 'Name of the file to upload',
                },
                content: {
                  type: 'string',
                  description: 'File content (base64 encoded for binary)',
                },
                path: {
                  type: 'string',
                  description: 'Target path on cPanel server',
                },
                overwrite: {
                  type: 'boolean',
                  description: 'Whether to overwrite existing file',
                },
              },
              required: ['filename', 'content', 'path'],
            },
          },
          {
            name: 'list_files',
            description: 'List files in a cPanel directory',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Directory path to list',
                },
              },
              required: ['path'],
            },
          },
          {
            name: 'delete_file',
            description: 'Delete a file from cPanel server',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Full path of the file to delete',
                },
              },
              required: ['path'],
            },
          },
        ],
      };
    });

    server.setRequestHandler('tools/call', async (request: any) => {
      logger.info(`Tool called: ${request.params.name}`);
      return await requestHandler.handleToolCall(request.params);
    });

    // Setup stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info('MCP Server started successfully');
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

main();
