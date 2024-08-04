declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      PORT: string;
      DB_NAME: string;
      DB_HOST: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_PORT: string;
      ACCESS_TOKEN_JWT_SECRET: string;
      REFRESH_TOKEN_JWT_SECRET: string;
      OTP_VALIDATION_EMAIL: string;
      OTP_VALIDATION_EMAIL_PASSWORD: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
