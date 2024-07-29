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
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      JWT_REFRESH_SECRET: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
