/**
 * Example: Using the MCP cPanel Server with Claude
 * This file demonstrates how to use the server in different contexts
 */

// ============ Example 1: Server Startup ============

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { defaultConfig, validateConfig } from './config.js';
import { RequestHandler } from './handlers/request-handler.js';

async function startServer() {
  // Validate configuration first
  validateConfig(defaultConfig);

  // Create MCP server
  const server = new Server({
    name: 'mcp-cpanel',
    version: '1.0.0',
  });

  // Initialize request handler
  const handler = new RequestHandler(defaultConfig);

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// ============ Example 2: Handling Upload Requests ============

interface UploadRequest {
  filename: string;
  content: string; // Base64 encoded for binary files
  path: string;
  overwrite?: boolean;
}

async function handleFileUpload(request: UploadRequest) {
  const response = await handler.handleToolCall({
    name: 'upload_file',
    arguments: {
      filename: request.filename,
      content: request.content,
      path: request.path,
      overwrite: request.overwrite || false,
    },
  });

  if (response.success) {
    console.log(`File uploaded: ${response.data.fileId}`);
  } else {
    console.error(`Upload failed: ${response.error.message}`);
  }

  return response;
}

// Example usage:
/*
const uploadResponse = await handleFileUpload({
  filename: 'index.html',
  content: '<html>...</html>',
  path: '/public_html',
  overwrite: true,
});
*/

// ============ Example 3: Listing Files ============

async function listDirectoryFiles(path: string) {
  const response = await handler.handleToolCall({
    name: 'list_files',
    arguments: {
      path,
    },
  });

  if (response.success) {
    const files = response.data.files;
    files.forEach((file: any) => {
      console.log(`${file.name} (${file.size} bytes)`);
    });
  } else {
    console.error(`Listing failed: ${response.error.message}`);
  }

  return response;
}

// Example usage:
/*
const listResponse = await listDirectoryFiles('/public_html');
*/

// ============ Example 4: Deleting Files ============

async function deleteFile(path: string) {
  const response = await handler.handleToolCall({
    name: 'delete_file',
    arguments: {
      path,
    },
  });

  if (response.success) {
    console.log(`File deleted: ${path}`);
  } else {
    console.error(`Deletion failed: ${response.error.message}`);
  }

  return response;
}

// Example usage:
/*
const deleteResponse = await deleteFile('/public_html/old-file.html');
*/

// ============ Example 5: Batch Upload Operations ============

async function uploadMultipleFiles(
  files: Array<{ filename: string; content: string; path: string }>,
) {
  const results = [];

  for (const file of files) {
    const response = await handler.handleToolCall({
      name: 'upload_file',
      arguments: {
        filename: file.filename,
        content: file.content,
        path: file.path,
      },
    });

    results.push({
      filename: file.filename,
      success: response.success,
      timestamp: new Date().toISOString(),
      executionTime: response.executionTime,
    });

    if (!response.success) {
      console.log(`Failed: ${file.filename} - ${response.error.message}`);
    }
  }

  return results;
}

// Example usage:
/*
const filesToUpload = [
  { filename: 'index.html', content: '...', path: '/public_html' },
  { filename: 'style.css', content: '...', path: '/public_html/assets' },
  { filename: 'script.js', content: '...', path: '/public_html/assets' },
];

const uploadResults = await uploadMultipleFiles(filesToUpload);
console.log(uploadResults);
*/

// ============ Example 6: Error Handling ============

async function uploadWithErrorHandling(
  filename: string,
  content: string,
  path: string,
) {
  try {
    const response = await handler.handleToolCall({
      name: 'upload_file',
      arguments: { filename, content, path },
    });

    if (!response.success) {
      switch (response.error.code) {
        case 'VALIDATION_ERROR':
          console.error(`Validation Error: ${response.error.message}`);
          // Handle validation error (e.g., file too large)
          break;

        case 'EXECUTION_ERROR':
          console.error(`Execution Error: ${response.error.message}`);
          // Handle cPanel API error
          break;

        default:
          console.error(`Unknown Error: ${response.error.message}`);
      }
    }

    return response;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
}

// ============ Example 7: Configuration Override ============

import { McpServerConfig } from './config.js';

function createCustomConfig(): McpServerConfig {
  return {
    name: 'mcp-cpanel-custom',
    version: '1.0.0',
    description: 'Custom MCP cPanel Server',
    cpanel: {
      host: 'custom-host.com',
      username: 'custom-user',
      token: 'custom-token',
      port: 2083,
      protocol: 'https',
      timeout: 45000,
      useTokenAuth: true,
    },
    claude: {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedFileTypes: ['html', 'css', 'js', 'png', 'jpg'],
      uploadDir: '/home/user/public_html',
      retryAttempts: 5,
      retryDelay: 2000,
      logRequests: true,
      enableCompression: true,
    },
  };
}

// ============ Example 8: Request Tracking ============

interface TrackedRequest {
  requestId: string;
  timestamp: string;
  action: string;
  status: 'pending' | 'success' | 'failed';
  executionTime: number;
  error?: string;
}

const requestLog: TrackedRequest[] = [];

async function trackFileOperation(
  action: 'upload' | 'delete' | 'list',
  args: Record<string, any>,
): Promise<any> {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  const logEntry: TrackedRequest = {
    requestId,
    timestamp: new Date().toISOString(),
    action,
    status: 'pending',
    executionTime: 0,
  };

  try {
    const tool = action === 'upload' ? 'upload_file' : action === 'delete' ? 'delete_file' : 'list_files';

    const response = await handler.handleToolCall({
      name: tool,
      arguments: args,
    });

    logEntry.status = response.success ? 'success' : 'failed';
    logEntry.executionTime = response.executionTime;

    if (!response.success) {
      logEntry.error = response.error.message;
    }

    requestLog.push(logEntry);
    return response;
  } catch (error) {
    logEntry.status = 'failed';
    logEntry.executionTime = Date.now() - startTime;
    logEntry.error = error instanceof Error ? error.message : 'Unknown error';
    requestLog.push(logEntry);

    throw error;
  }
}

// Export examples for documentation
export { uploadWithErrorHandling, uploadMultipleFiles, trackFileOperation, listDirectoryFiles };
