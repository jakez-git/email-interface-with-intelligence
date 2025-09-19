import { useContext } from 'react';
import { SettingsContext } from '../contexts/AppContext';
import { ISettingsContext } from '../types';

export const useSettings = (): ISettingsContext => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within an AppProvider');
  }
  return context;
};
