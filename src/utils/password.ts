import { compare, hash } from "bcrypt";

const SALT_ROUNDS: number = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return await hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  dbPassword: string,
  password: string
): Promise<boolean> => {
  return await compare(password, dbPassword);
};
