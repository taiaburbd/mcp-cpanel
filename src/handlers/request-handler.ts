/**
 * Request Handler for Claude MCP Server
 * Processes Claude requests and routes to appropriate handlers
 */

import { McpServerConfig } from '../config.js';
import { ClaudeRequest, ClaudeResponse, FileUploadRequest } from '../types.js';
import { Logger } from '../utils/logger.js';
import { CpanelClient } from './cpanel-client.js';
import { ValidationService } from '../services/validation.js';
import { CacheService } from '../services/cache.js';

const logger = new Logger('RequestHandler');

export class RequestHandler {
  private config: McpServerConfig;
  private cpanelClient: CpanelClient;
  private validator: ValidationService;
  private cache: CacheService;

  constructor(config: McpServerConfig) {
    this.config = config;
    this.cpanelClient = new CpanelClient(config.cpanel);
    this.validator = new ValidationService(config.claude);
    this.cache = new CacheService();
  }

  async handleToolCall(params: {
    name: string;
    arguments?: Record<string, any>;
  }): Promise<any> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      logger.info(`Processing request: ${params.name}`, { requestId });

      switch (params.name) {
        case 'upload_file':
          return await this.handleFileUpload(params.arguments || {}, requestId);
        case 'list_files':
          return await this.handleListFiles(params.arguments || {}, requestId);
        case 'delete_file':
          return await this.handleDeleteFile(params.arguments || {}, requestId);
        default:
          throw new Error(`Unknown tool: ${params.name}`);
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(`Request failed: ${params.name}`, { requestId, error });

      return {
        requestId,
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        executionTime,
      };
    }
  }

  private async handleFileUpload(
    args: Record<string, any>,
    requestId: string,
  ): Promise<ClaudeResponse> {
    const startTime = Date.now();

    // Validate request
    const validation = this.validator.validateFileUpload(args);
    if (!validation.valid) {
      return {
        requestId,
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error || 'Validation failed',
        },
        executionTime: Date.now() - startTime,
      };
    }

    try {
      const uploadRequest: FileUploadRequest = {
        filename: args.filename,
        content: args.content,
        path: args.path,
        overwrite: args.overwrite || false,
        permissions: args.permissions || '0755',
      };

      const result = await this.cpanelClient.uploadFile(uploadRequest, requestId);

      return {
        requestId,
        success: true,
        data: result,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      throw error;
    }
  }

  private async handleListFiles(
    args: Record<string, any>,
    requestId: string,
  ): Promise<ClaudeResponse> {
    const startTime = Date.now();

    try {
      const path = args.path || '/';
      const cacheKey = `list_files:${path}`;

      // Check cache
      const cached = this.cache.get(cacheKey);
      if (cached) {
        logger.info('Returning cached file list', { requestId, path });
        return {
          requestId,
          success: true,
          data: cached,
          executionTime: Date.now() - startTime,
        };
      }

      const result = await this.cpanelClient.listFiles(path, requestId);
      this.cache.set(cacheKey, result, 300); // Cache for 5 minutes

      return {
        requestId,
        success: true,
        data: result,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      throw error;
    }
  }

  private async handleDeleteFile(
    args: Record<string, any>,
    requestId: string,
  ): Promise<ClaudeResponse> {
    const startTime = Date.now();

    try {
      const path = args.path;

      if (!path) {
        return {
          requestId,
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File path is required',
          },
          executionTime: Date.now() - startTime,
        };
      }

      const result = await this.cpanelClient.deleteFile(path, requestId);

      return {
        requestId,
        success: true,
        data: result,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      throw error;
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
