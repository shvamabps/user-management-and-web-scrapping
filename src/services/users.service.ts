import type {
  GenerateNewAccessTokenType,
  LoginUserType,
  RegisterUserType,
  ValidateUserEmailType,
} from "../dto/users.dto";
import { query } from "../utils/db";
import { generateOTP, sendEmail } from "../utils/email";
import { comparePassword, hashPassword } from "../utils/password";
import { generateToken } from "../utils/token";

export const registerUsers = async (body: RegisterUserType) => {
  try {
    const { email, password, fullName } = body;

    const checkUserQuery = `SELECT * FROM users WHERE Email = '${email.toLowerCase()}'`;

    const checkUser = await query(checkUserQuery);

    if (checkUser.rowCount > 0) {
      return {
        message: "User already exists",
        status: 400,
        success: false,
      };
    }

    const hashedPassword = await hashPassword(password);

    const otp = generateOTP();

    // Send email to user

    await sendEmail(
      email.toLowerCase(),
      `OTP Validation for ${email.toLowerCase()}`,
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #333; text-align: center; font-size: 24px;">Your OTP is ${otp}</h1>
        <p style="font-size: 16px; color: #555; text-align: center; margin: 20px 0;">
            Please use the above OTP to complete your validation process.
        </p>
        <p style="font-size: 14px; color: #999; text-align: center; margin: 20px 0;">
            If you did not request this OTP, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">
            This is an automated message, please do not reply.
        </p>
      </div>
      `
    );

    // Save user to database

    const sql = `INSERT INTO users (Email, Password, FullName)
     OUTPUT Inserted.Email, Inserted.Role, Inserted.FullName, Inserted.UserId
     VALUES ('${email.toLowerCase()}', '${hashedPassword}', '${fullName}');`;

    // Execute SQL query
    const result = await query(sql);

    await query(
      `UPDATE users SET ValidationCode='${otp}', UpdatedAt='${new Date().toISOString()}' WHERE Email='${email.toLowerCase()}'`
    );

    return {
      message: "User created successfully",
      status: 201,
      success: true,
      data: result.rows[0],
    };
  } catch (error: unknown) {
    console.info("Error while registering users: ", error);
    return {
      message: error,
      status: 500,
      success: false,
    };
  }
};

export const loginUsers = async (body: LoginUserType) => {
  try {
    const { email, password } = body;

    const sql = `SELECT * FROM users WHERE Email = '${email.toLowerCase()}'`;

    const result = await query(sql);

    if (result.rowCount === 0) {
      return {
        message: "User not found",
        status: 404,
        success: false,
      };
    }

    if (!result?.rows[0]?.isEmailValidated) {
      return {
        message: "Email not validated",
        status: 401,
        success: false,
      };
    }

    const validatePassword = await comparePassword(
      result?.rows[0]?.Password as string,
      password
    );

    if (!validatePassword) {
      return {
        message: "Invalid credentials",
        status: 403,
        success: false,
      };
    }

    const tokenData = {
      email: "" + result?.rows[0]?.Email?.toString().toLowerCase(),
      role: "" + result?.rows[0]?.Role?.toString().toLowerCase(),
      userId: "" + result?.rows[0]?.UserID,
    };

    const accessToken = await generateToken(
      tokenData,
      "" + process.env.ACCESS_TOKEN_JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const refreshToken = await generateToken(
      tokenData,
      "" + process.env.REFRESH_TOKEN_JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    await query(
      `UPDATE users SET AuthToken='${accessToken}', RefreshToken='${refreshToken}', UpdatedAt='${new Date().toISOString()}' WHERE Email='${email.toLowerCase()}'`
    );

    return {
      message: "Login successful",
      status: 200,
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    };
  } catch (error: unknown) {
    console.info("Error while logging in users: ", error);
    return {
      message: error instanceof Error ? error.message : error,
      status: 500,
      success: false,
    };
  }
};

export const validateEmailOTP = async (body: ValidateUserEmailType) => {
  try {
    const { email, otp } = body;

    const sql = `SELECT * FROM users WHERE Email = '${email.toLowerCase()}' AND ValidationCode = '${otp}'`;

    const result = await query(sql);

    if (result.rowCount === 0) {
      return {
        message: "Invalid OTP",
        status: 400,
        success: false,
      };
    }

    await query(
      `UPDATE users SET isEmailValidated=1, ValidationCode=null, UpdatedAt='${new Date().toISOString()}' WHERE Email='${email.toLowerCase()}'`
    );

    return {
      message: "Email validated successfully",
      status: 200,
      success: true,
    };
  } catch (error: unknown) {
    return {
      message: error,
      status: 500,
      success: false,
    };
  }
};

export const generateNewAccessToken = async (
  body: GenerateNewAccessTokenType
) => {
  try {
    const { email, refreshToken } = body;

    const sql = `SELECT * FROM users WHERE RefreshToken = '${refreshToken}' and Email = '${email.toLowerCase()}'`;

    const result = await query(sql);

    if (result.rowCount === 0) {
      return {
        message: "Invalid refresh token",
        status: 400,
        success: false,
      };
    }

    const tokenData = {
      email: "" + result?.rows[0]?.Email?.toString().toLowerCase(),
      role: "" + result?.rows[0]?.Role?.toString().toLowerCase(),
      userId: "" + result?.rows[0]?.UserID,
    };

    const accessToken = await generateToken(
      tokenData,
      "" + process.env.ACCESS_TOKEN_JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    await query(
      `UPDATE users SET AuthToken='${accessToken}', UpdatedAt='${new Date().toISOString()}' WHERE RefreshToken='${refreshToken}'`
    );

    return {
      message: "Access token generated successfully",
      status: 200,
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    };
  } catch (error: unknown) {
    return {
      message: error,
      status: 500,
      success: false,
    };
  }
};
