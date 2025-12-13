import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'bijoux_access_token',
  USER: 'bijoux_user',
};

export const secureStore = {
  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
  },

  async setUser(user: object): Promise<void> {
    await SecureStore.setItemAsync(KEYS.USER, JSON.stringify(user));
  },

  async getUser<T>(): Promise<T | null> {
    const user = await SecureStore.getItemAsync(KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  async removeUser(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.USER);
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(KEYS.USER),
    ]);
  },
};
