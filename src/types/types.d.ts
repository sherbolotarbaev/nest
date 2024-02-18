type UserRole = 'USER' | 'ADMIN';

type User = {
  id: number;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  photo?: string;
  password: string;
  resetPasswordToken?: string;
  verificationToken?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Message = {
  id: number;
  userId: number;
  user: User;
  text: string;
  ai?: boolean;
  audioSource?: string;
  createdAt: string;
  updatedAt: string;
};

type LocationData = {
  city: string;
  region: string;
  country: string;
  timezone: string;
};
