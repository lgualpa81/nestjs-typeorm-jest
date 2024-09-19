import { HttpException, HttpStatus } from '@nestjs/common';

export class ErrorManager extends Error {
  constructor({
    type,
    message,
  }: {
    type: keyof typeof HttpStatus;
    message: string;
  }) {
    super(`${type} :: ${message}`);
  }

  public static createSignatureError(message: string) {
    if (!message.trim()) {
      throw new HttpException(
        'Empty error message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const parts: string[] = message.split('::').map((part) => part.trim());
    const name: string = parts[0];

    if (name && HttpStatus[name]) {
      throw new HttpException(message, HttpStatus[name]);
    } else {
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
