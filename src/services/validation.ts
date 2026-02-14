/**
 * Validation Service
 * Validates Claude requests and file operations
 */

import { ClaudeRequestConfig } from '../config.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('ValidationService');

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export class ValidationService {
  private config: ClaudeRequestConfig;

  constructor(config: ClaudeRequestConfig) {
    this.config = config;
  }

  validateFileUpload(request: Record<string, any>): ValidationResult {
    // Check required fields
    if (!request.filename) {
      return {
        valid: false,
        error: 'filename is required',
      };
    }

    if (!request.content) {
      return {
        valid: false,
        error: 'content is required',
      };
    }

    if (!request.path) {
      return {
        valid: false,
        error: 'path is required',
      };
    }

    // Check file size
    const contentSize = Buffer.byteLength(
      typeof request.content === 'string' ? request.content : request.content.toString(),
    );

    if (contentSize > this.config.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.config.maxFileSize} bytes`,
      };
    }

    // Check file type if allowedFileTypes is not '*'
    if (this.config.allowedFileTypes[0] !== '*') {
      const fileExtension = this.getFileExtension(request.filename);
      if (!this.config.allowedFileTypes.includes(fileExtension)) {
        return {
          valid: false,
          error: `File type .${fileExtension} is not allowed`,
        };
      }
    }

    // Check path safety
    if (!this.isPathSafe(request.path)) {
      return {
        valid: false,
        error: 'Invalid or unsafe path provided',
      };
    }

    logger.info('File upload validation passed', { filename: request.filename });
    return { valid: true };
  }

  validatePath(path: string): ValidationResult {
    if (!path) {
      return {
        valid: false,
        error: 'path is required',
      };
    }

    if (!this.isPathSafe(path)) {
      return {
        valid: false,
        error: 'Invalid or unsafe path provided',
      };
    }

    return { valid: true };
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  private isPathSafe(path: string): boolean {
    // Check for path traversal attempts
    if (path.includes('..') || path.includes('\\')) {
      return false;
    }

    // Check for absolute paths outside upload directory
    if (path.startsWith('/') && !path.startsWith(this.config.uploadDir)) {
      // Allow relative paths starting with /
      return true;
    }

    return true;
  }
}
