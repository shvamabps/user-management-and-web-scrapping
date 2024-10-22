import { config } from "dotenv";
import sql, { Request as IRequest, Transaction } from "mssql";

config();

async function initializeDB() {
  const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST!,
    port: +process.env.DB_PORT!,
    options: {
      encrypt: false,
    },
  };

  const pool = new sql.ConnectionPool(dbConfig);

  await pool.connect();

  // Create the database
  const createDbRequest: IRequest = new sql.Request(pool);
  await createDbRequest.query(`
    IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'user_management_and_webscrapping')
    BEGIN
      CREATE DATABASE user_management_and_webscrapping;
    END
  `);

  // Connect to the new database
  const newDbConfig = {
    ...dbConfig,
    database: "user_management_and_webscrapping",
  };

  const newPool = new sql.ConnectionPool(newDbConfig);
  await newPool.connect();

  const transaction: Transaction = new sql.Transaction(newPool);
  await transaction.begin();
  const request: IRequest = transaction.request();
  await request.query(`
    -- Create Table for Users.

    DROP TABLE IF EXISTS dbo.users;

    IF NOT EXISTS (SELECT *
    FROM sys.tables
    WHERE name = 'users' AND schema_id = SCHEMA_ID('dbo'))
    BEGIN
        CREATE TABLE [dbo].[users]
        (
            [UserID] BIGINT IDENTITY (1, 1) NOT NULL,
            [Email] NVARCHAR (255) NOT NULL,
            [Password] NVARCHAR (MAX) NOT NULL,
            [FullName] NVARCHAR (500) NOT NULL,
            [Role] NVARCHAR (10) DEFAULT ('ADMIN') NOT NULL,
            [AuthToken] NVARCHAR (MAX) NULL,
            [RefreshToken] NVARCHAR (MAX) NULL,
            [isActive] INT DEFAULT ((1)) NOT NULL,
            [isEmailValidated] INT DEFAULT ((1)) NOT NULL,
            [ValidationCode] NVARCHAR (MAX) NULL,
            [CreatedAt] DATETIME2 (7) DEFAULT (getdate()) NOT NULL,
            [UpdatedAt] DATETIME2 (7) DEFAULT (getdate()) NOT NULL,
            CONSTRAINT [PK_Users_UserID] PRIMARY KEY CLUSTERED ([UserID] ASC),
            CONSTRAINT [UQ_Users_Email] UNIQUE NONCLUSTERED ([Email] ASC)
        );
    END
  `);
  await transaction.commit();
  console.log("DONE");
  process.exit(0);
}

initializeDB();
