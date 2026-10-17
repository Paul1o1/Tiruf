import { betterAuth } from 'better-auth';
import { getPool } from './db';

export const auth = betterAuth({
  database: process.env.DATABASE_URL
    ? getPool()
    : undefined,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      userType: {
        type: 'string',
        required: true,
        defaultValue: 'worker',
      },
    },
  },
  secret: process.env.JWT_SECRET || 'tiruf-dev-secret-change-in-production',
});
