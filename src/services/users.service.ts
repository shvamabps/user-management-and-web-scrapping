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

    const hashedPasswword = await hashPassword(password);

    const otp = generateOTP();

    // Send email to user

    await sendEmail(
      email.toLowerCase(),
      `OTP Validation for ${email.toLowerCase()}`,
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h1 style="color: #333; text-align: center;">Your OTP is ${otp}</h1>
        <p style="font-size: 16px; color: #555; text-align: center;">
          Please use the above OTP to complete your validation process.
        </p>
        <p style="font-size: 14px; color: #999; text-align: center;">
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
     OUTPUT Inserted.Email, Inserted.Role, Inserted.FullName, Inserted.UserId, Inserted.Role
     VALUES ('${email.toLowerCase()}', '${hashedPasswword}', '${fullName}');`;

    // Execute SQL query
    const result = await query(sql);

    await query(
      `UPDATE users SET ValidationCode='${otp}' WHERE Email='${email.toLowerCase()}'`
    );

    return {
      message: "User created successfully",
      status: 201,
      success: true,
      data: result.rows[0],
    };
  } catch (error: unknown) {
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

    if (!result?.rows[0]?.IsEmailValidated) {
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
        status: 400,
        success: false,
      };
    }

    const accessToken = await generateToken(
      {
        email: "" + result?.rows[0]?.Email,
        role: "" + result?.rows[0]?.Role,
        userId: "" + result?.rows[0]?.UserID,
      },
      "" + process.env.ACCESS_TOKEN_JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const refreshToken = await generateToken(
      {
        email: "" + result?.rows[0]?.Email,
        role: "" + result?.rows[0]?.Role,
        userId: "" + result?.rows[0]?.UserID,
      },
      "" + process.env.REFRESH_TOKEN_JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    await query(
      `UPDATE users SET AuthToken='${accessToken}', RefreshToken='${refreshToken}' WHERE Email='${email}'`
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
    console.log(error);
    return {
      message: error,
      status: 500,
      success: false,
    };
  }
};

export const validateEmailOTP = async (body: ValidateUserEmailType) => {
  try {
    const { email, otp } = body;

    const sql = `SELECT * FROM users WHERE Email = '${email}' AND ValidationCode = '${otp}'`;

    const result = await query(sql);

    if (result.rowCount === 0) {
      return {
        message: "Invalid OTP",
        status: 400,
        success: false,
      };
    }

    await query(
      `UPDATE users SET IsEmailValidated=1, ValidationCode=null WHERE Email='${email}'`
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

    const sql = `SELECT * FROM users WHERE RefreshToken = '${refreshToken}' and Email = '${email}'`;

    const result = await query(sql);

    if (result.rowCount === 0) {
      return {
        message: "Invalid refresh token",
        status: 400,
        success: false,
      };
    }

    const accessToken = await generateToken(
      {
        email: "" + result?.rows[0]?.Email,
        role: "" + result?.rows[0]?.Role,
        userId: "" + result?.rows[0]?.UserID,
      },
      "" + process.env.ACCESS_TOKEN_JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    await query(
      `UPDATE users SET AuthToken='${accessToken}' WHERE RefreshToken='${refreshToken}'`
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
