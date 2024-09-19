import * as bcrypt from 'bcrypt';

export const compareHashedText = async (
  plainText: string,
  hashedText: string,
) => await bcrypt.compare(plainText, hashedText);

export const hashText = async (plainText: string) =>
  await bcrypt.hash(plainText, 10);
