# Quick Start Guide

Get your MCP cPanel Server running in 5 minutes.

## Prerequisites

- Node.js 16+ installed
- cPanel account with API access
- Terminal access

## Step 1: Clone and Install

```bash
cd /Users/taiaburrahman/Desktop/git/mcp-cpanel
npm install
```

## Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your cPanel credentials:

```bash
CPANEL_HOST=your-host.com
CPANEL_USERNAME=your-username
CPANEL_PASSWORD=your-password
```

## Step 3: Build Project

```bash
npm run build
```

## Step 4: Start Server

```bash
npm start
```

You should see:
```
[2024-02-14T...] INFO [MCPServer] Starting MCP Server for cPanel File Upload...
[2024-02-14T...] INFO [MCPServer] MCP Server started successfully
```

## Step 5: Test with Claude

Claude can now use these tools:

### Upload a File
```json
{
  "name": "upload_file",
  "arguments": {
    "filename": "test.html",
    "content": "<h1>Hello</h1>",
    "path": "/public_html"
  }
}
```

### List Files
```json
{
  "name": "list_files",
  "arguments": {
    "path": "/public_html"
  }
}
```

### Delete a File
```json
{
  "name": "delete_file",
  "arguments": {
    "path": "/public_html/test.html"
  }
}
```

## File Structure created

```
src/
├── index.ts                 # Main MCP server
├── config.ts               # Configuration management
├── types.ts                # TypeScript definitions
├── handlers/
│   ├── request-handler.ts  # Request processing
│   └── cpanel-client.ts    # cPanel API client
├── services/
│   ├── validation.ts       # Input validation
│   └── cache.ts            # Caching service
└── utils/
    └── logger.ts           # Logging utility
```

## Configuration Options

### Basic (Required)
```bash
CPANEL_HOST=your-host.com
CPANEL_USERNAME=your-username
CPANEL_PASSWORD=your-password
```

### Advanced (Optional)
```bash
# File upload limits
MAX_FILE_SIZE=52428800          # 50MB
ALLOWED_FILE_TYPES=html,css,js  # Comma-separated

# Retry logic
RETRY_ATTEMPTS=3
RETRY_DELAY=1000

# Features
LOG_REQUESTS=true
ENABLE_COMPRESSION=false
```

## Troubleshooting

### "Cannot find module" error
```bash
# Rebuild TypeScript
npm run build

# Check node_modules
ls node_modules/@modelcontextprotocol
```

### "Connection refused" error
- Check cPanel host in `.env`
- Verify port 2083 is open
- Confirm credentials are correct

### "File too large" error
- Increase `MAX_FILE_SIZE` in `.env`
- Default is 50MB, set in bytes

## Next Steps

1. **Read Full Documentation**: See [README.md](README.md)
2. **Integration Guide**: See [CLAUDE_INTEGRATION.md](CLAUDE_INTEGRATION.md)
3. **Code Examples**: See [EXAMPLES.md](EXAMPLES.md)
4. **Project Structure**: See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

## Development

### Run in Development Mode
```bash
npm run dev
```

### Watch for Changes
TypeScript doesn't auto-compile. Run `npm run build` after changes.

### Check Logs
The server outputs detailed logs including:
- Request IDs for tracking
- Execution times
- Error details
- Cache hit/miss status

## Common Tasks

### Upload HTML Website
1. Prepare HTML/CSS/JS files
2. Use `upload_file` tool for each file
3. Files are stored in `/public_html` by default

### Backup Website
1. Use `list_files` to get file list
2. Use download API (if available)
3. Store in local directory

### Clean Up Old Files
1. Use `list_files` to list directory
2. Identify old files
3. Use `delete_file` to remove them

## Security Checklist

- [ ] `.env` file is in `.gitignore` (credentials not in repo)
- [ ] Using HTTPS (port 2083 default)
- [ ] Strong credentials set in `.env`
- [ ] File upload limits configured
- [ ] File type restrictions if needed
- [ ] Upload directory is correct

## Performance Tips

1. **Use Caching**: File lists cached for 5 minutes
2. **Batch Operations**: Upload multiple files in sequence
3. **Monitor Logs**: Watch for slow operations
4. **Configure Timeouts**: Adjust if experiencing issues

## Support

Check detailed documentation:
- [README.md](README.md) - Full feature documentation
- [CLAUDE_INTEGRATION.md](CLAUDE_INTEGRATION.md) - Claude integration details
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Architecture overview
- [EXAMPLES.md](EXAMPLES.md) - Code examples

## Environment Template

```bash
# cPanel Configuration
CPANEL_HOST=
CPANEL_USERNAME=
CPANEL_PASSWORD=
CPANEL_TOKEN=
CPANEL_PORT=2083
CPANEL_PROTOCOL=https
CPANEL_TIMEOUT=30000
CPANEL_USE_TOKEN_AUTH=false

# File Upload Settings
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=*
UPLOAD_DIR=/public_html
RETRY_ATTEMPTS=3
RETRY_DELAY=1000
LOG_REQUESTS=true
ENABLE_COMPRESSION=false

# Server Settings
PORT=3000
LOG_LEVEL=info
NODE_ENV=development
```

## FAQ

**Q: Can I upload binary files?**
A: Yes, use base64 encoding for binary content.

**Q: How large can files be?**
A: Default 50MB, configurable via `MAX_FILE_SIZE`.

**Q: Is it secure?**
A: Yes, includes validation, path safety checks, and HTTPS support.

**Q: Can I use with shared hosting?**
A: Yes, as long as cPanel API access is available.

**Q: How do I add new tools?**
A: Edit `src/index.ts` to add new tools, then implement handlers.

## Ready to Go!

Your MCP cPanel Server is now configured and ready for Claude integration. 🚀
