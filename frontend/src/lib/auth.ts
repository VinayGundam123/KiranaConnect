import { create } from 'zustand';

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
}));

export async function signUp(email: string, password: string) {
  const userData = {
    id: Math.random().toString(36).substring(7),
    email,
  };
  
  console.log('Sign Up Data:', {
    email,
    password,
    userData
  });
  
  useAuth.getState().setUser(userData);
  useAuth.getState().setProfile({
    id: userData.id,
    first_name: null,
    last_name: null,
    phone: null,
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return { user: userData };
}

export async function signIn(email: string, password: string) {
  const userData = {
    id: Math.random().toString(36).substring(7),
    email,
  };
  
  console.log('Sign In Data:', {
    email,
    password,
    userData
  });
  
  useAuth.getState().setUser(userData);
  return { user: userData };
}

export async function signOut() {
  console.log('Sign Out');
  useAuth.getState().setUser(null);
  useAuth.getState().setProfile(null);
}

export async function resetPassword(email: string) {
  console.log('Reset Password:', { email });
  return true;
}

export async function updatePassword(newPassword: string) {
  console.log('Update Password:', { newPassword });
  return true;
}

export async function getProfile(): Promise<Profile | null> {
  return useAuth.getState().profile;
}

export async function updateProfile(profile: Partial<Profile>) {
  const currentProfile = useAuth.getState().profile;
  if (!currentProfile) {
    console.log('No profile found');
    throw new Error('No profile found');
  }
  
  const updatedProfile = {
    ...currentProfile,
    ...profile,
    updated_at: new Date().toISOString(),
  };
  
  console.log('Update Profile:', updatedProfile);
  
  useAuth.getState().setProfile(updatedProfile);
  return updatedProfile;
}