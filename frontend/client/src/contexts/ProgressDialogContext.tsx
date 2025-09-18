import { createContext, useContext, useState, ReactNode } from 'react';
import { queryClient } from '@/lib/queryClient';

interface ProgressDialogContextType {
  isProgressDialogOpen: boolean;
  openProgressDialog: () => void;
  closeProgressDialog: () => void;
}

const ProgressDialogContext = createContext<ProgressDialogContextType | undefined>(undefined);

export function ProgressDialogProvider({ children }: { children: ReactNode }) {
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);

  const openProgressDialog = () => {
    console.log("Opening progress dialog and refreshing analytics data");
    
    // Immediately refresh all analytics data when opening the dialog
    queryClient.invalidateQueries({ queryKey: ['/api/analytics/detailed'] });
    queryClient.invalidateQueries({ queryKey: ['/api/analytics/overall-progress'] });
    queryClient.invalidateQueries({ queryKey: ['/api/study-sessions/streak'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user/badges'] });
    queryClient.invalidateQueries({ queryKey: ['/api/daily-progress'] });
    
    setIsProgressDialogOpen(true);
  };
  const closeProgressDialog = () => setIsProgressDialogOpen(false);

  return (
    <ProgressDialogContext.Provider value={{
      isProgressDialogOpen,
      openProgressDialog,
      closeProgressDialog
    }}>
      {children}
    </ProgressDialogContext.Provider>
  );
}

export function useProgressDialog() {
  const context = useContext(ProgressDialogContext);
  if (context === undefined) {
    throw new Error('useProgressDialog must be used within a ProgressDialogProvider');
  }
  return context;
}