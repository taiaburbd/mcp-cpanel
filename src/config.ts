/**
 * Claude MCP Server Configuration
 * Settings for cPanel file upload requests
 */

export interface CpanelConfig {
  host: string;
  username: string;
  password?: string;
  token?: string;
  port: number;
  protocol: 'http' | 'https';
  timeout: number;
  useTokenAuth: boolean;
}

export interface ClaudeRequestConfig {
  maxFileSize: number; // in bytes
  allowedFileTypes: string[];
  uploadDir: string;
  retryAttempts: number;
  retryDelay: number; // in milliseconds
  logRequests: boolean;
  enableCompression: boolean;
}

export interface McpServerConfig {
  name: string;
  version: string;
  description: string;
  cpanel: CpanelConfig;
  claude: ClaudeRequestConfig;
}

/**
 * Default configuration for Claude MCP Server
 */
export const defaultConfig: McpServerConfig = {
  name: 'mcp-cpanel',
  version: '1.0.0',
  description: 'MCP Server for cPanel File Upload',
  cpanel: {
    host: process.env.CPANEL_HOST || 'localhost',
    username: process.env.CPANEL_USERNAME || '',
    password: process.env.CPANEL_PASSWORD,
    token: process.env.CPANEL_TOKEN,
    port: parseInt(process.env.CPANEL_PORT || '2083'),
    protocol: (process.env.CPANEL_PROTOCOL as 'http' | 'https') || 'https',
    timeout: parseInt(process.env.CPANEL_TIMEOUT || '30000'),
    useTokenAuth: process.env.CPANEL_USE_TOKEN_AUTH === 'true',
  },
  claude: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || '*').split(','),
    uploadDir: process.env.UPLOAD_DIR || '/public_html',
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.RETRY_DELAY || '1000'),
    logRequests: process.env.LOG_REQUESTS === 'true',
    enableCompression: process.env.ENABLE_COMPRESSION === 'true',
  },
};

export function validateConfig(config: McpServerConfig): boolean {
  if (!config.cpanel.host) {
    throw new Error('cPanel host is required');
  }
  if (!config.cpanel.username) {
    throw new Error('cPanel username is required');
  }
  if (!config.cpanel.useTokenAuth && !config.cpanel.password && !config.cpanel.token) {
    throw new Error('Either password or token authentication is required');
  }
  return true;
}
