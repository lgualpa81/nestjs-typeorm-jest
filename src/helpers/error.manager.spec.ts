import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorManager } from './';

describe('ErrorManager', () => {
  describe('constructor', () => {
    it('should create an instance of ErrorManager with correct message format', () => {
      const errorType = 'BAD_REQUEST';
      const errorMessage = 'Validation failed';

      const errorManager = new ErrorManager({
        type: errorType,
        message: errorMessage,
      });

      expect(errorManager).toBeInstanceOf(ErrorManager);
      expect(errorManager.message).toBe(`${errorType} :: ${errorMessage}`);
    });
  });

  describe('createSignatureError', () => {
    it('should throw HttpException with specific HttpStatus', () => {
      const errorMessage = 'NOT_FOUND :: Resource not found';

      try {
        ErrorManager.createSignatureError(errorMessage);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });

    it('should throw HttpException with INTERNAL_SERVER_ERROR for unknown errors', () => {
      const errorMessage = 'INVALID_ERROR';

      try {
        ErrorManager.createSignatureError(errorMessage);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should throw HttpException with INTERNAL_SERVER_ERROR if message is empty', () => {
      const emptyErrorMessage = '';

      try {
        ErrorManager.createSignatureError(emptyErrorMessage);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
