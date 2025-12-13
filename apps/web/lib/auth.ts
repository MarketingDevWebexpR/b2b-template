import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { validateCredentials } from '@/data/users';

/**
 * Zod schema for credentials validation
 * Note: email field accepts any string to support mock users like "user"
 */
const credentialsSchema = z.object({
  email: z.string().min(1, 'Identifiant requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

/**
 * NextAuth v5 configuration for luxury jewelry e-commerce
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        // Validate credentials with zod
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        // Validate against mock users
        const user = validateCredentials(email, password);

        if (!user) {
          return null;
        }

        // Return user without password
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user id and role to the JWT token on sign in
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: 'user' | 'admin' }).role;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user id and role to the session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'user' | 'admin';
      }
      return session;
    },
  },
  trustHost: true,
});
