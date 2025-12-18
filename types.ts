export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  password?: string;
  about?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string; // For direct messages
  groupId?: string;    // For group messages
  senderName?: string; // Helper for groups
  text: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

export interface Group {
  id: string;
  name: string;
  avatar: string;
  description: string;
  memberIds: string[];
  adminId: string;
  createdAt: Date;
  lastMessage?: string;
  lastMessageTime?: Date;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  email: string;
  username: string;
  about?: string;
  isGroup?: boolean; // Helper to distinguish in lists
}

export interface ChatSession {
  contactId: string;
  messages: Message[];
}