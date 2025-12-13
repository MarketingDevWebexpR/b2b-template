import { MockUser } from '@/types';

export const mockUsers: MockUser[] = [
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

export function findUserByEmail(email: string): MockUser | undefined {
  return mockUsers.find((user) => user.email === email);
}

export function validateCredentials(email: string, password: string): MockUser | null {
  const user = mockUsers.find(
    (u) => u.email === email && u.password === password
  );
  return user || null;
}
