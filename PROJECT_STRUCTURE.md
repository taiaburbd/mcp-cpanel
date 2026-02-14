# Project Directory Structure

```
mcp-cpanel/
├── src/
│   ├── index.ts                          # Main MCP server entry point
│   ├── config.ts                         # Configuration management (env-based)
│   ├── types.ts                          # TypeScript type definitions
│   │
│   ├── handlers/                         # Request handlers
│   │   ├── request-handler.ts           # Main Claude request processor
│   │   └── cpanel-client.ts             # cPanel API client
│   │
│   ├── services/                         # Business logic services
│   │   ├── validation.ts                # Request/file validation
│   │   └── cache.ts                     # In-memory caching service
│   │
│   └── utils/                            # Utility modules
│       └── logger.ts                    # Structured logging utility
│
├── dist/                                 # Compiled JavaScript output (auto-generated)
│   ├── index.js
│   ├── config.js
│   ├── types.js
│   ├── handlers/
│   │   ├── request-handler.js
│   │   └── cpanel-client.js
│   ├── services/
│   │   ├── validation.js
│   │   └── cache.js
│   └── utils/
│       └── logger.js
│
├── .env.example                          # Environment variables template
├── .env                                  # Local environment (ignored by git)
├── .gitignore                            # Git ignore rules
├── package.json                          # Project metadata and dependencies
├── tsconfig.json                         # TypeScript configuration
├── README.md                             # Main project documentation
├── CLAUDE_INTEGRATION.md                 # Claude integration guide
├── EXAMPLES.md                           # Code examples and usage
└── PROJECT_STRUCTURE.md                  # This file
```

## Module Responsibilities

### src/index.ts
- **Purpose**: MCP server initialization and setup
- **Responsibility**: 
  - Server instantiation
  - Tool registration (upload_file, list_files, delete_file)
  - Stdio transport setup
  - Error handling and startup

### src/config.ts
- **Purpose**: Configuration management
- **Exports**:
  - `CpanelConfig`: cPanel connection settings
  - `ClaudeRequestConfig`: Claude request handling settings
  - `McpServerConfig`: Combined server configuration
  - `defaultConfig`: Environment-based default configuration
  - `validateConfig()`: Configuration validation function

### src/types.ts
- **Purpose**: TypeScript type definitions
- **Exports**:
  - `FileUploadRequest`: Upload request structure
  - `FileUploadResponse`: Upload response structure
  - `CpanelApiRequest/Response`: cPanel API types
  - `ClaudeRequest/Response`: Claude integration types
  - `LogEntry`: Logging structure
  - `CacheEntry`: Cache entry structure

### src/handlers/request-handler.ts
- **Purpose**: Main request processing logic
- **Responsibility**:
  - Route Claude tool requests to handlers
  - Validate incoming requests
  - Handle upload, list, delete operations
  - Generate request IDs and track execution time
  - Error handling and response formatting

### src/handlers/cpanel-client.ts
- **Purpose**: cPanel API communication
- **Responsibility**:
  - File upload to cPanel
  - Directory listing
  - File deletion
  - API request formation
  - Error handling for API calls

### src/services/validation.ts
- **Purpose**: Request and file validation
- **Exports**:
  - `ValidationService` class
  - `validateFileUpload()`: Validates file uploads
  - `validatePath()`: Validates file paths
  - File type checking
  - Path safety validation

### src/services/cache.ts
- **Purpose**: In-memory caching
- **Exports**:
  - `CacheService` class
  - `set()`: Store cache entry with TTL
  - `get()`: Retrieve cache entry
  - `delete()`: Remove cache entry
  - `clear()`: Clear all cache
  - `getStats()`: Retrieve cache statistics
  - Automatic cleanup routine

### src/utils/logger.ts
- **Purpose**: Structured logging
- **Exports**:
  - `Logger` class
  - `LogLevel` enum
  - Logging methods: debug, info, warn, error
  - Format control

## Data Flow

```
Claude Request
    ↓
index.ts (MCP Server)
    ↓
request-handler.ts (Route & Validate)
    ↓
validation.ts (Validate Input)
    ↓
cpanel-client.ts (Execute Operation)
    ↓
cache.ts (Cache Results)
    ↓
logger.ts (Log Activity)
    ↓
Response to Claude
```

## Configuration Flow

```
.env file
    ↓
config.ts (Load & Validate)
    ↓
Exported defaultConfig
    ↓
Used by RequestHandler & Services
```

## Dependencies

### External Dependencies
- `@modelcontextprotocol/sdk`: MCP protocol implementation

### Development Dependencies
- `typescript`: Language compiler
- `@types/node`: Node.js type definitions
- `ts-node`: TypeScript runtime

## File Size Estimates

- `config.ts`: ~1.5KB
- `types.ts`: ~2KB
- `index.ts`: ~2.5KB
- `request-handler.ts`: ~3.5KB
- `cpanel-client.ts`: ~2.5KB
- `validation.ts`: ~2.5KB
- `cache.ts`: ~2KB
- `logger.ts`: ~2KB

**Total**: ~18.5KB of TypeScript code

## Build Output

TypeScript files in `src/` are compiled to JavaScript in `dist/`:
- Source maps are generated for debugging
- Declaration files (.d.ts) are created
- Module format: ES2020

## Environment Variables

### Required
- `CPANEL_HOST`: cPanel server hostname
- `CPANEL_USERNAME`: cPanel account username
- Either `CPANEL_PASSWORD` or `CPANEL_TOKEN` (depending on `CPANEL_USE_TOKEN_AUTH`)

### Optional
- `CPANEL_PORT`: cPanel port (default: 2083)
- `CPANEL_PROTOCOL`: http or https (default: https)
- `CPANEL_TIMEOUT`: Request timeout in ms (default: 30000)
- `MAX_FILE_SIZE`: Max upload size in bytes (default: 52428800)
- `ALLOWED_FILE_TYPES`: Comma-separated or * for all
- `UPLOAD_DIR`: Default upload directory (default: /public_html)
- `RETRY_ATTEMPTS`: Number of retries (default: 3)
- `RETRY_DELAY`: Delay between retries in ms (default: 1000)
- `LOG_REQUESTS`: Enable request logging (default: true)
- `ENABLE_COMPRESSION`: Enable compression (default: false)

## Execution Runtime

- **Node.js Version**: 16.0.0 or higher
- **Module System**: ES2020 (ESM)
- **TypeScript Target**: ES2020

## Testing Recommendations

1. **Unit Tests**: Test each service independently
2. **Integration Tests**: Test handler with mocked cPanel client
3. **E2E Tests**: Full flow with real cPanel connection
4. **Security Tests**: Path traversal, file type bypass, size limits
