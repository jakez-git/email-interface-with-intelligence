import React, { useEffect, useMemo } from 'react';
import { FOLDER_NAMES } from './constants';
import { useEmails } from './hooks/useEmails';
import { useUI } from './hooks/useUI';
import Sidebar from './components/Sidebar';
import EmailList from './components/EmailList';
import EmailView from './components/EmailView';
import SettingsModal from './components/SettingsModal';
import { SettingsIcon, MenuIcon } from './components/icons';
import FilterPanel from './components/FilterPanel';
import ComposeModal from './components/ComposeModal';

const App: React.FC = () => {
  const { emails, initializeEmails } = useEmails();
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    isSidebarVisible, 
    setIsSidebarVisible, 
    composerState, 
    isFilterPanelOpen,
    // FIX: Destructure selectedEmailIds from the useUI hook.
    selectedEmailIds
  } = useUI();

  // Initialize emails on first load
  useEffect(() => {
    initializeEmails();
  }, [initializeEmails]);

  const selectedEmail = useMemo(() => {
    // FIX: Use selectedEmailIds from hook state instead of getState().
    if (selectedEmailIds.length === 0) return null;
    return emails.find(email => email.id === selectedEmailIds[0]) || null;
    // FIX: Update dependency array to be reactive to selectedEmailIds changes.
  }, [selectedEmailIds, emails]);

  return (
    <div className="h-screen w-screen flex flex-col font-sans text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-900 overflow-hidden">
        <header className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
            <div className="flex items-center space-x-2">
                <button onClick={() => setIsSidebarVisible(!isSidebarVisible)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden"><MenuIcon className="w-6 h-6" /></button>
                <h1 className="text-xl font-semibold">AI Email Assistant</h1>
            </div>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><SettingsIcon className="w-6 h-6" /></button>
        </header>
        
        <div className="flex flex-grow overflow-hidden">
            <aside className={`transition-all duration-300 ${isSidebarVisible ? 'w-64' : 'w-0'} overflow-hidden flex-shrink-0 md:w-64`}>
                <Sidebar />
            </aside>
            <main className="flex-grow flex border-l border-gray-200 dark:border-gray-700">
                <div className="w-full md:w-1/3 xl:w-1/4 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    <EmailList />
                </div>
                <div className="hidden md:flex flex-grow w-2/3 xl:w-3/4">
                    <EmailView email={selectedEmail} />
                </div>
            </main>
        </div>

        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <FilterPanel isOpen={isFilterPanelOpen} />
        <ComposeModal
          isOpen={composerState.isOpen}
          mode={composerState.mode}
          email={composerState.emailToReply}
        />
    </div>
  );
};

export default App;