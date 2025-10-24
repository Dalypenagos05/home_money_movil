import React, { createContext, useContext, useState } from 'react';

type ProfileContextType = {
  imageUri: string | null;
  setImageUri: (uri: string | null) => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  return <ProfileContext.Provider value={{ imageUri, setImageUri }}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
};
