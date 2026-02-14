# Claude Integration Guide

This guide explains how to integrate the MCP cPanel Server with Claude for file management operations.

## Overview

The MCP cPanel Server provides Claude with three main capabilities:
1. Upload files to your cPanel hosting
2. List files and directories
3. Delete files from your server

## Setup Steps

### 1. Start the MCP Server

First, ensure the server is running:

```bash
npm start
```

The server will connect via stdio transport and wait for Claude requests.

### 2. Configure Claude Client

Configure your Claude client to connect to this MCP server. The exact steps depend on your Claude interface:

- **Node.js/API**: Pass the server in the MCP configuration
- **VS Code Extension**: Add server configuration in settings
- **Web Interface**: Use the MCP server URL

### 3. Request Format

Claude sends requests in this format:

```typescript
{
  name: string;              // Tool name: upload_file, list_files, delete_file
  arguments: {
    [key: string]: any;      // Tool-specific arguments
  }
}
```

## Common Workflows

### Upload HTML/CSS/JavaScript Files

```json
{
  "name": "upload_file",
  "arguments": {
    "filename": "style.css",
    "content": "/* CSS content here */",
    "path": "/public_html/assets",
    "overwrite": true
  }
}
```

### List Website Files

```json
{
  "name": "list_files",
  "arguments": {
    "path": "/public_html"
  }
}
```

### Delete Outdated Files

```json
{
  "name": "delete_file",
  "arguments": {
    "path": "/public_html/old-file.html"
  }
}
```

## Response Handling

Claude will receive responses in this format:

```typescript
{
  requestId: "req_1707899445123_abc123",
  success: true,
  data: {
    // Tool-specific response data
  },
  executionTime: 145  // milliseconds
}
```

## Error Scenarios

### Validation Errors

```json
{
  "requestId": "req_...",
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "File size exceeds maximum allowed size of 52428800 bytes"
  },
  "executionTime": 2
}
```

### cPanel Connection Errors

```json
{
  "requestId": "req_...",
  "success": false,
  "error": {
    "code": "EXECUTION_ERROR",
    "message": "Failed to connect to cPanel server",
    "details": "Connection timeout"
  },
  "executionTime": 30000
}
```

## File Size Limits

- Default maximum: 50MB
- Configure via `MAX_FILE_SIZE` environment variable
- Content should be base64 encoded if binary

## File Type Restrictions

By default, all file types are allowed. To restrict:

```bash
ALLOWED_FILE_TYPES=html,css,js,jpg,png,pdf
```

## Security Best Practices

1. **Credentials**: Store cPanel credentials in `.env` file, never in code
2. **Token Auth**: Prefer token-based auth over password when possible
3. **Path Validation**: The server prevents path traversal attacks
4. **HTTPS**: Always use HTTPS (port 2083) for cPanel connections
5. **Permissions**: Set appropriate file permissions via `permissions` parameter

## Monitoring & Debugging

### Check Server Logs

Server logs all requests with request IDs:

```
[2024-02-14T10:30:45.123Z] INFO [RequestHandler] Processing request: upload_file {"requestId":"req_1707899445123_abc123"}
[2024-02-14T10:30:45.234Z] INFO [CpanelClient] File uploaded successfully {"fileId":"file_1707899445123","filename":"style.css"}
```

### Request ID Tracking

Every request gets a unique ID (format: `req_<timestamp>_<random>`):
- Use this ID to correlate requests with log entries
- Include in error reports for debugging

### Cache Inspection

Check cache status via logs:
```
[...] DEBUG [CacheService] Cache hit {"key":"list_files:/public_html"}
```

## Performance Optimization

### Caching Strategy

File listings are automatically cached for 5 minutes. This reduces:
- Network traffic to cPanel
- Response time for repeated queries
- Server load

### Retry Logic

The server automatically retries failed operations:
- Default: 3 retry attempts
- Delay between retries: 1 second (configurable)
- Prevents temporary network issues from causing failures

## Troubleshooting

### Server Won't Start

```bash
# Check Node.js version (requires 16+)
node --version

# Check for port conflicts
lsof -i :3000

# Check environment variables
cat .env
```

### cPanel Connection Fails

1. Verify credentials in `.env`
2. Check cPanel host and port
3. Ensure firewall allows port 2083
4. Test with cURL:
   ```bash
   curl -k https://your-cpanel-host:2083
   ```

### File Upload Fails

1. Check file size against `MAX_FILE_SIZE`
2. Verify file type is allowed
3. Ensure upload directory exists
4. Check directory permissions
5. Review server logs for specific error

### Cache Issues

Clear cache by restarting server or implementing manual endpoint if needed.

## API Reference

### upload_file

**Purpose**: Upload a file to cPanel

**Parameters**:
- `filename` (string, required): Name of the file
- `content` (string, required): File content
- `path` (string, required): Target directory
- `overwrite` (boolean, optional): Overwrite existing file
- `permissions` (string, optional): File permissions (e.g., "0644")

**Response**:
```typescript
{
  fileId: string;
  filename: string;
  path: string;
  size: number;
  uploadedAt: string;
  message: string;
}
```

### list_files

**Purpose**: List files in a directory

**Parameters**:
- `path` (string, required): Directory path

**Response**:
```typescript
{
  path: string;
  files: Array<{
    name: string;
    type: string;
    size: number;
    permissions: string;
    modified: string;
  }>;
  directories: string[];
}
```

### delete_file

**Purpose**: Delete a file

**Parameters**:
- `path` (string, required): Full file path

**Response**:
```typescript
{
  success: boolean;
  path: string;
  message: string;
}
```

## Advanced Configuration

### Token-Based Authentication

```bash
CPANEL_USE_TOKEN_AUTH=true
CPANEL_TOKEN=your-api-token
# Comment out CPANEL_PASSWORD
```

### Custom Upload Directory

```bash
UPLOAD_DIR=/home/username/public_html
```

### File Type Whitelist

```bash
ALLOWED_FILE_TYPES=html,css,js,jpg,png,gif,pdf,doc,docx
```

### Compression Support

```bash
ENABLE_COMPRESSION=true
```

## Contact & Support

For issues or questions:
1. Check server logs first
2. Review error code and message
3. Consult this guide's troubleshooting section
4. Contact cPanel support if server credentials are the issue
