export interface ErrorResponseSchema {
  statusCode: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}
