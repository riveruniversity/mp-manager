import dotenv from 'dotenv';
import { createMPInstance } from "mp-api";

dotenv.config();

export const mp = createMPInstance({
  auth: {
    username: process.env.CLIENT_ID || '',
    password: process.env.CLIENT_SECRET || ''
  }
});
