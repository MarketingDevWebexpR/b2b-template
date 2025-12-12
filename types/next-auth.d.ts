import 'next-auth';
import { type DefaultSession } from 'next-auth';

/**
 * Module augmentation for NextAuth types
 * Extends the default session and JWT to include user id and role
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'user' | 'admin';
    } & DefaultSession['user'];
  }

  interface User {
    role?: 'user' | 'admin';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: 'user' | 'admin';
  }
}
