import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { secureStore } from '@/lib/secureStore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  image: string | null;
}

interface MockUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users matching the web app
const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'Utilisateur Test',
    email: 'user',
    password: 'password',
    image: null,
    role: 'user',
  },
  {
    id: '2',
    name: 'Marie Dupont',
    email: 'demo@luxuryjewels.com',
    password: 'demo123',
    image: null,
    role: 'user',
  },
  {
    id: '3',
    name: 'Admin Bijoux',
    email: 'admin@luxuryjewels.com',
    password: 'admin123',
    image: null,
    role: 'admin',
  },
];

// Simulated registered users (in real app, this would be backend storage)
let registeredUsers: MockUser[] = [...mockUsers];

function validateCredentials(email: string, password: string): MockUser | null {
  const user = registeredUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
}

function findUserByEmail(email: string): MockUser | undefined {
  return registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function userToPublic(user: MockUser): User {
  const { password, ...publicUser } = user;
  return publicUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from secure storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await secureStore.getUser<User>();
        if (savedUser) {
          setUser(savedUser);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const validUser = validateCredentials(email, password);

      if (!validUser) {
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }

      const publicUser = userToPublic(validUser);

      // Generate a mock token
      const token = `mock_token_${validUser.id}_${Date.now()}`;

      // Save to secure storage
      await Promise.all([
        secureStore.setToken(token),
        secureStore.setUser(publicUser),
      ]);

      setUser(publicUser);
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Une erreur est survenue lors de la connexion' };
    }
  };

  const signUp = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if email already exists
      if (findUserByEmail(email)) {
        return { success: false, error: 'Un compte existe déjà avec cet email' };
      }

      // Validate inputs
      if (!name.trim()) {
        return { success: false, error: 'Le nom est requis' };
      }
      if (!email.trim() || !email.includes('@')) {
        return { success: false, error: 'Email invalide' };
      }
      if (password.length < 6) {
        return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' };
      }

      // Create new user
      const newUser: MockUser = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        image: null,
        role: 'user',
      };

      // Add to registered users
      registeredUsers.push(newUser);

      const publicUser = userToPublic(newUser);

      // Generate a mock token
      const token = `mock_token_${newUser.id}_${Date.now()}`;

      // Save to secure storage
      await Promise.all([
        secureStore.setToken(token),
        secureStore.setUser(publicUser),
      ]);

      setUser(publicUser);
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: "Une erreur est survenue lors de l'inscription" };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await secureStore.clearAll();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
