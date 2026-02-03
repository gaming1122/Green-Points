
import { UserProfile, UserRole } from '../types';

const DB_KEY = 'gp_global_database';
const MASTER_KEY_STORAGE = 'gp_master_network_key';

export interface GlobalDatabase {
  ADMIN: Record<string, { password: string; profile: UserProfile }>;
  USER: Record<string, { password: string; profile: UserProfile }>;
  EMPLOYEE: Record<string, { password: string; profile: UserProfile }>;
  metadata: {
    networkId: string;
    lastSync: string;
    version: string;
  };
}

const createEmptyDb = (networkId: string): GlobalDatabase => ({
  ADMIN: {},
  USER: {},
  EMPLOYEE: {},
  metadata: {
    networkId,
    lastSync: new Date().toISOString(),
    version: '2.0.0'
  }
});

export const dbService = {
  getDb(): GlobalDatabase {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      const newId = 'GP-NET-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      const newDb = createEmptyDb(newId);
      this.saveDb(newDb);
      return newDb;
    }
    return JSON.parse(data);
  },

  saveDb(db: GlobalDatabase) {
    db.metadata.lastSync = new Date().toISOString();
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    // In a real production environment, this is where an axios.post to a real server would happen.
  },

  getMasterKey(): string {
    return localStorage.getItem(MASTER_KEY_STORAGE) || this.getDb().metadata.networkId;
  },

  setMasterKey(key: string) {
    localStorage.setItem(MASTER_KEY_STORAGE, key);
  },

  getAllUsers(): UserProfile[] {
    const db = this.getDb();
    // Fix: Explicitly typing the map parameters to avoid 'unknown' type errors when accessing 'profile'
    return [
      ...Object.values(db.ADMIN).map((u: any) => u.profile),
      ...Object.values(db.USER).map((u: any) => u.profile),
      ...Object.values(db.EMPLOYEE).map((u: any) => u.profile)
    ];
  },

  updateUserProfile(user: UserProfile) {
    const db = this.getDb();
    const role = user.role;
    const id = user.id;

    if (db[role][id]) {
      db[role][id].profile = user;
      this.saveDb(db);
    }
  }
};
