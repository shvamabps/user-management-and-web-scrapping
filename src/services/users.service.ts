import type { RegisterUserType } from "../dto/users.dto";
import { query } from "../utils/db";
import { hashPassword } from "../utils/password";

export const registerUsers = async (body: RegisterUserType) => {
  try {
    const { email, password } = body;

    const hashedPasswword = await hashPassword(password);

    // Save user to database

    const sql = `INSERT INTO users (email, password, role) VALUES (${email}, ${hashedPasswword}, 'standard') returning email, role`;

    // Execute SQL query
    const result = await query(sql);

    return {
      message: "User created successfully",
      status: 201,
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    return {
      message: error,
      status: 500,
      success: false,
    };
  }
};
