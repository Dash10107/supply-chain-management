import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'class-validator';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError | ValidationError[],
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  void req;
  void next;
  if (Array.isArray(err)) {
    // Validation errors
    const messages = err.map((e) => Object.values(e.constraints || {})).flat();
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: messages,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Unknown errors
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
};

