import { Message, User, Contact, Group } from '../types';
import { INITIAL_DB_USERS } from '../constants';

const STORAGE_KEY = 'whatschat_db_v3'; // Incremented version
const CHANNEL_NAME = 'whatschat_realtime';

interface DB {
  users: User[];
  messages: Message[];
  contacts: Record<string, string[]>;
  groups: Group[];
}

const getDB = (): DB => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    parsed.messages = parsed.messages.map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp)
    }));
    if (parsed.groups) {
        parsed.groups = parsed.groups.map((g: any) => ({
            ...g,
            createdAt: new Date(g.createdAt)
        }));
    }
    return parsed;
  }
  return {
    users: INITIAL_DB_USERS,
    messages: [],
    contacts: {
      'user_1': ['user_2', 'user_3'],
      'user_2': ['user_1'],
      'user_3': ['user_1']
    },
    groups: []
  };
};

const saveDB = (db: DB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

const channel = new BroadcastChannel(CHANNEL_NAME);

export const chatService = {
  subscribe: (callback: (data: any) => void) => {
    channel.onmessage = (event) => callback(event.data);
    return () => { channel.onmessage = null; };
  },

  sendTypingStatus: (senderId: string, receiverId: string, isTyping: boolean) => {
    channel.postMessage({ type: 'typing', senderId, receiverId, isTyping });
  },

  login: async (identifier: string, password: string): Promise<User | null> => {
    const db = getDB();
    return db.users.find(u => 
      (u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase()) && 
      u.password === password
    ) || null;
  },

  register: async (name: string, username: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    const db = getDB();
    if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) return { success: false, error: 'Username taken' };
    const newUser: User = {
      id: 'u_' + Math.floor(100000 + Math.random() * 900000),
      name, username, email, password,
      about: "Hey there! I am using WhatsChat.",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
    };
    db.users.push(newUser);
    db.contacts[newUser.id] = [];
    saveDB(db);
    return { success: true, user: newUser };
  },

  // --- Groups Logic ---
  createGroup: (name: string, description: string, memberIds: string[], adminId: string): Group => {
    const db = getDB();
    const newGroup: Group = {
      id: 'g_' + Date.now(),
      name,
      description,
      memberIds: [...new Set([...memberIds, adminId])],
      adminId,
      