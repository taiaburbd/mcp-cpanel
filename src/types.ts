/**
 * Type definitions for Claude MCP Server
 * Handles cPanel file upload requests
 */

export interface FileUploadRequest {
  filename: string;
  content: string | Buffer;
  path: string;
  overwrite?: boolean;
  permissions?: string;
  encoding?: string;
}

export interface FileUploadResponse {
  success: boolean;
  fileId: string;
  filename: string;
  path: string;
  size: number;
  uploadedAt: string;
  message?: string;
  error?: string;
}

export interface CpanelApiRequest {
  module: string;
  function: string;
  params?: Record<string, any>;
}

export interface CpanelApiResponse {
  status: number;
  statusmsg: string;
  data?: any;
  errors?: string[];
}

export interface ClaudeRequest {
  id: string;
  type: 'file_upload' | 'file_delete' | 'file_list' | 'file_info';
  timestamp: string;
  payload: any;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ClaudeResponse {
  requestId: string;
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  executionTime: number;
}

export interface LogEntry {
  timestamp: string;
  requestId: string;
  action: string;
  status: 'success' | 'error' | 'pending';
  details: Record<string, any>;
}

export interface CacheEntry {
  key: string;
  value: any;
  expiresAt: number;
  createdAt: string;
}
