import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class ResponseHandler {
  static success<T>(res: Response, data: T, message?: string) {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message
    };
    return res.status(200).json(response);
  }

  static error(res: Response, message: string, statusCode: number = 400) {
    const response: ApiResponse = {
      success: false,
      error: message
    };
    return res.status(statusCode).json(response);
  }

  static unauthorized(res: Response, message: string = '未授权') {
    return this.error(res, message, 401);
  }

  static notFound(res: Response, message: string = '资源不存在') {
    return this.error(res, message, 404);
  }

  static serverError(res: Response, message: string = '服务器错误') {
    return this.error(res, message, 500);
  }
}
