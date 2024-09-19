import * as bcrypt from 'bcrypt';
import { compareHashedText, hashText } from './jwt';

type BcryptMock = {
  hash: jest.Mock;
  compare: jest.Mock;
};

describe('JWT Utilities', () => {
  let bcryptMock: BcryptMock;

  beforeEach(() => {
    bcryptMock = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    jest.mock('bcrypt', () => bcryptMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashText', () => {
    it('should hash the plain text', async () => {
      const plainText = 'password123';
      const hashedText = 'hashedPassword123';

      //(bcrypt.hash as jest.Mock).mockResolvedValue(hashedText);
      jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => hashedText);
      const result = await hashText(plainText);

      expect(bcrypt.hash).toHaveBeenCalledWith(plainText, 10);
      expect(result).toBe(hashedText);
    });

    it('should throw an error if hashing fails', async () => {
      const plainText = 'password123';
      const errorMessage = 'Hashing error';

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
      const result = () => hashText(plainText);

      expect(result).rejects.toThrow(errorMessage);
    });
  });

  describe('compareHashedText', () => {
    it('should return true if the plain text matches the hashed text', async () => {
      const plainText = 'password123';
      const hashedText = 'hashedPassword123';

      const compareSpy = jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => true);

      const result = await compareHashedText(plainText, hashedText);

      expect(compareSpy).toHaveBeenCalledWith(plainText, hashedText);
      expect(result).toBe(true);
      expect(result).toBeTruthy();
    });

    it('should return false if the plain text does not match the hashed text', async () => {
      const plainText = 'password123';
      const hashedText = 'hashedPassword123';

      const compareSpy = jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => false);

      const result = await compareHashedText(plainText, hashedText);

      expect(compareSpy).toHaveBeenCalledWith(plainText, hashedText);
      expect(result).toBe(false);
      expect(result).toBeFalsy();
    });

    it('should throw an error if comparison fails', async () => {
      const plainText = 'password123';
      const hashedText = 'hashedPassword123';
      const errorMessage: string = 'Comparison error';

      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.reject(new Error(errorMessage)));

      await expect(compareHashedText(plainText, hashedText)).rejects.toThrow(
        errorMessage,
      );
    });
  });
});
