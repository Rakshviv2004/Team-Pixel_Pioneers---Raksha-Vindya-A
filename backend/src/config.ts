import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000"),
  jwtSecret: process.env.JWT_SECRET || "mend-default-secret",
  jwtExpiresIn: "7d",
  databasePath: process.env.DATABASE_PATH || "./data/mend.db",
};
