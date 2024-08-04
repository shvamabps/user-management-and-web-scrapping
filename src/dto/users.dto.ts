import { z } from "zod";

const RegisterUserDTO = z.object({
  body: z
    .object({
      email: z
        .string({ required_error: "Email is required." })
        .email({ message: "Invalid email." }),
      password: z
        .string({ required_error: "Password is required." })
        .min(6)
        .max(20),
      fullName: z
        .string({ required_error: "Name is required." })
        .min(3)
        .max(255),
    })
    .strict(),
});

const LoginUserDTO = z.object({
  body: z
    .object({
      email: z
        .string({ required_error: "Email is required." })
        .email({ message: "Invalid email." }),
      password: z
        .string({ required_error: "Password is required." })
        .min(6)
        .max(20),
    })
    .strict(),
});

const ValidateUserEmailDTO = z.object({
  body: z
    .object({
      email: z
        .string({ required_error: "Email is required." })
        .email({ message: "Invalid email." }),
      otp: z.string({ required_error: "OTP is required." }).min(6).max(6),
    })
    .strict(),
});

const GenerateNewAccessTokenDTO = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: "Refresh token is required." }),
    email: z
      .string({ required_error: "Email is required." })
      .email({ message: "Invalid email." }),
  }),
});

export {
  GenerateNewAccessTokenDTO,
  LoginUserDTO,
  RegisterUserDTO,
  ValidateUserEmailDTO,
};

export type RegisterUserType = z.infer<typeof RegisterUserDTO.shape.body>;
export type GenerateNewAccessTokenType = z.infer<
  typeof GenerateNewAccessTokenDTO.shape.body
>;
export type LoginUserType = z.infer<typeof LoginUserDTO.shape.body>;
export type ValidateUserEmailType = z.infer<
  typeof ValidateUserEmailDTO.shape.body
>;
