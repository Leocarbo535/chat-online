import { User } from './types';

// Pre-populated users in our "database"
export const INITIAL_DB_USERS: User[] = [
  {
    id: 'user_1',
    name: 'Sofia Martinez',
    username: 'sofia_m',
    email: 'sofia@gmail.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia'
  },
  {
    id: 'user_2',
    name: 'Alex Johnson',
    username: 'tech_alex',
    email: 'alex@gmail.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
  },
  {
    id: 'user_3',
    name: 'Grandma',
    username: 'granny_love',
    email: 'grandma@gmail.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grandma'
  }
];

export const DEFAULT_WALLPAPER = "https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png";