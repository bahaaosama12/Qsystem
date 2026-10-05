export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(code: string, statusCode: number) {
    super(code);
    this.statusCode = statusCode;
    this.code = code;
  }
}