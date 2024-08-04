CREATE DATABASE user_management_and_webscrapping;

USE user_management_and_webscrapping;

-- Create Table for Users.

CREATE TABLE [dbo].[users]
(
    [UserID] INT IDENTITY (1, 1) NOT NULL,
    [Email] NVARCHAR (255) NOT NULL,
    [Password] NVARCHAR (MAX) NOT NULL,
    [FullName] NVARCHAR (500) NOT NULL,
    [Role] NVARCHAR (10) DEFAULT ('USER') NOT NULL,
    [AuthToken] NVARCHAR (MAX) NULL,
    [RefreshToken] NVARCHAR (MAX) NULL,
    [isActive] INT DEFAULT ((1)) NOT NULL,
    [CreatedAt] DATETIME2 (7) DEFAULT (getdate()) NOT NULL,
    [UpdatedAt] DATETIME2 (7) DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_Users_UserID] PRIMARY KEY CLUSTERED ([UserID] ASC),
    UNIQUE CLUSTERED ([Email] ASC)
);

GO;




