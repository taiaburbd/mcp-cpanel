# MCP Server for cPanel File Upload

A Model Context Protocol (MCP) server that enables Claude to interact with cPanel file management systems. This server provides a secure interface for uploading, listing, and deleting files on cPanel-based hosting environments.

## Features

- **File Upload**: Upload files to cPanel server with validation and retry logic
- **File Listing**: List files and directories on the server with caching
- **File Deletion**: Remove files from the server safely
- **Request Validation**: Comprehensive validation for file size, type, and path safety
- **Caching**: In-memory caching for frequently accessed file listings
- **Structured Logging**: Detailed request/response logging for debugging
- **Configuration Management**: Environment-based configuration with sensible defaults
- **Error Handling**: Comprehensive error handling and retry mechanisms

## Project Structure

```
src/
├── index.ts                 # MCP Server entry point
├── config.ts               # Configuration management
├── types.ts                # TypeScript type definitions
├── handlers/
│   ├── request-handler.ts  # Claude request processing
│   └── cpanel-client.ts    # cPanel API client
├── services/
│   ├── validation.ts       # Request validation logic
│   └── cache.ts            # Caching service
└── utils/
    └── logger.ts           # Structured logging utility
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# cPanel Settings
CPANEL_HOST=your-cpanel-host.com
CPANEL_USERNAME=your-username
CPANEL_PASSWORD=your-password
CPANEL_TOKEN=your-api-token
CPANEL_PORT=2083
CPANEL_PROTOCOL=https
CPANEL_TIMEOUT=30000
CPANEL_USE_TOKEN_AUTH=false

# Claude Request Settings
MAX_FILE_SIZE=52428800          # 50MB in bytes
ALLOWED_FILE_TYPES=*             # Comma-separated or * for all
UPLOAD_DIR=/public_html
RETRY_ATTEMPTS=3
RETRY_DELAY=1000

# Server Settings
PORT=3000
LOG_LEVEL=info
NODE_ENV=development
```

## Installation

1. Clone the repository:
```bash
cd /Users/taiaburrahman/Desktop/git/mcp-cpanel
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your cPanel credentials
```

## Usage

### Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### MCP Tools Available

#### 1. Upload File

Upload a file to the cPanel server:

```json
{
  "name": "upload_file",
  "arguments": {
    "filename": "index.html",
    "content": "base64-encoded-content",
    "path": "/public_html",
    "overwrite": true
  }
}
```

#### 2. List Files

List files in a directory:

```json
{
  "name": "list_files",
  "arguments": {
    "path": "/public_html"
  }
}
```

#### 3. Delete File

Delete a file from the server:

```json
{
  "name": "delete_file",
  "arguments": {
    "path": "/public_html/index.html"
  }
}
```

## API Response Format

All responses follow this structure:

```typescript
{
  requestId: string;          // Unique request identifier
  success: boolean;           // Operation success status
  data?: any;                 // Response data if successful
  error?: {
    code: string;            // Error code
    message: string;         // Error message
    details?: string;        // Additional error details
  };
  executionTime: number;      // Execution time in milliseconds
}
```

## Validation Rules

- **File Size**: Default max 50MB (configurable)
- **File Types**: All types allowed by default, customize via `ALLOWED_FILE_TYPES`
- **Path Safety**: Prevents path traversal and unsafe characters
- **Required Fields**: filename, content, and path for uploads

## Caching Strategy

- File listings are cached for 5 minutes
- Cache keys use format: `list_files:{path}`
- Automatic cleanup of expired entries
- Manual cache clearing available

## Logging

Logs are structured and include:
- Timestamp
- Log level (DEBUG, INFO, WARN, ERROR)
- Module name
- Message
- Associated data/context

Example log output:
```
[2024-02-14T10:30:45.123Z] INFO [RequestHandler] Processing request: upload_file {"requestId":"req_1707899445123_abc123"}
```

## Security Considerations

1. **Path Validation**: All paths are validated against traversal attacks
2. **File Size Limits**: Configurable maximum file size
3. **File Type Filtering**: Optional file type restrictions
4. **Authentication**: Support for both password and token-based cPanel auth
5. **HTTPS**: Default SSL/TLS connection to cPanel
6. **Timeout Protection**: Configurable request timeout

## Development

### Build the TypeScript Code

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## Error Handling

The server handles various error scenarios:
- Invalid file input validation
- cPanel API errors
- Network timeouts
- File system errors
- Path traversal attempts

Each error returns a structured response with error code and message.

## License

MIT

## Contributing

Contributions are welcome. Please ensure:
1. Code is TypeScript with proper types
2. New features include validation
3. Errors are handled gracefully
4. Logging is implemented for debugging
