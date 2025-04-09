"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface CreditsContextType {
  credits: number;
  isPremium: boolean;
  loadUserCredits: () => Promise<void>;
  updateCredits: (newCredits: number) => Promise<void>;
}

// Credit Context
const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState<number>(0);
  const [isPremium, setIsPremium] = useState(false);

  const loadUserCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData, error } = await supabase
        .from('users')
        .select('credits_remaining, is_premium')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading user credits:', error);
        return;
      }

      if (userData) {
        setCredits(userData.credits_remaining);
        setIsPremium(userData.is_premium);
      }
    } catch (error) {
      console.error('Error loading credits:', error);
    }
  };

  const updateCredits = async (newCredits: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('users')
        .update({ credits_remaining: newCredits })
        .eq('id', user.id);

      if (error) throw error;

      setCredits(newCredits);
    } catch (error) {
      console.error('Error updating credits:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadUserCredits();
  }, []);

  return (
    <CreditsContext.Provider value={{ credits, isPremium, loadUserCredits, updateCredits }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
} 