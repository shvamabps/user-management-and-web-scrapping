import { sign, SignOptions, verify } from "jsonwebtoken";

export const generateToken = (
  payload: Record<string, string>,
  secret: string,
  options?: SignOptions
): string => {
  return sign(payload, secret, options);
};

export const verifyToken = (
  token: string,
  secret: string
): Record<string, string> => {
  return verify(token, secret) as Record<string, string>;
};
