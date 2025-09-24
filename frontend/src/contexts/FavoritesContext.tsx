import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { favoritesAPI } from '@/lib/api';

interface FavoritesContextType {
  favoritesCount: number;
  updateFavoritesCount: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const { isAuthenticated, user } = useAuth();

 const updateFavoritesCount = async () => {
  if (isAuthenticated && user) {
    try {
      const favoritesRes = await favoritesAPI.getFavorites();
      // Use the count from backend response
      setFavoritesCount(favoritesRes.data.count);
    } catch (error) {
      console.error('Error fetching favorites count:', error);
      setFavoritesCount(0);
    }
  } else {
    setFavoritesCount(0);
  }
};

  useEffect(() => {
    updateFavoritesCount();
  }, [isAuthenticated, user]);

  return (
    <FavoritesContext.Provider value={{ favoritesCount, updateFavoritesCount }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};