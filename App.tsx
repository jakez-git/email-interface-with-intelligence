import React, { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import type { Email, Folder, Rule, TrainingData, EmailAccount, Label, Contact, SpamSettings, EmailFolderName } from './types';
import { INITIAL_FOLDERS, MOCK_EMAILS, INITIAL_RULES, INITIAL_ACCOUNTS, INITIAL_CONTACTS, FOLDER_NAMES } from './constants';
import { analyzeEmailForLabels } from './services/geminiService';
import { applyRulesToEmails } from './services/ruleService';
import { emailsReducer } from './reducers/emailReducer';
import { getNextSelectedIdInList } from './utils/selection';
import Sidebar from './components/Sidebar';
import EmailList from './components/EmailList';
import EmailView from './components/EmailView';
import SettingsModal from './components/SettingsModal';
import { SettingsIcon, MenuIcon } from './components/icons';
import FilterPanel from './components/FilterPanel';
import ComposeModal from './components/ComposeModal';

type SortConfig = { key: 'timestamp' | 'read' | 'sender'; direction: 'asc' | 'desc' };
export type FilterCondition = { id: string; field: 'sender' | 'subject' | 'labelName' | 'labelConfidence'; operator: 'contains' | 'not-contains' | 'equals' | 'not-equals' | '>' | '<'; value: string; };
export type FilterLogic = 'AND' | 'OR';
type ActiveFilter = { type: 'folder' | 'label', name: string };
type ComposerState = { isOpen: boolean; mode: 'new' | 'reply' | 'forward'; emailToReply?: Email; }

const App: React.FC = () => {
  const [emails, dispatchEmails] = useReducer(emailsReducer, []);
  const [folders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);
  const [accounts, setAccounts] = useState<EmailAccount[]>(INITIAL_ACCOUNTS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>({ type: 'folder', name: 'Inbox' });
  const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'timestamp', direction: 'desc' });
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [filterLogic, setFilterLogic] = useState<FilterLogic>('AND');
  const [composerState, setComposerState] = useState<ComposerState>({ isOpen: false, mode: 'new' });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const [spamSettings, setSpamSettings] = useState<SpamSettings>({ enabled: true, confidenceThreshold: 0.9 });


  useEffect(() => {
    const emailsWithRulesApplied = applyRulesToEmails(MOCK_EMAILS, rules);
    dispatchEmails({ type: 'SET_EMAILS', payload: emailsWithRulesApplied });

    if (emailsWithRulesApplied.length > 0) {
      const firstInboxEmailId = emailsWithRulesApplied.find(e => e.folder === FOLDER_NAMES.INBOX)?.id;
      if (firstInboxEmailId) {
        setSelectedEmailIds([firstInboxEmailId]);
      }
    }
  }, [rules]);

  const selectedEmail = useMemo(() => {
    if (selectedEmailIds.length === 0) return null;
    return emails.find(email => email.id === selectedEmailIds[0]) || null;
  }, [selectedEmailIds, emails]);

  const analyzeSelectedEmail = useCallback(async () => {
    if (selectedEmail && !selectedEmail.labels.some(l => l.source === 'ai') && !selectedEmail.analysisSkipped) {
      setIsAnalyzing(true);
      try {
        const suggestedLabels = await analyzeEmailForLabels(selectedEmail.body);
        
        const currentEmail = emails.find(e => e.id === selectedEmail.id);
        if(!currentEmail) return;

        const existingLabelNames = new Set(currentEmail.labels.map(l => l.name.toLowerCase()));
        
        const newLabels = suggestedLabels
          .filter(l => !existingLabelNames.has(l.name.toLowerCase()))
          .map(l => ({
            ...l,
            id: `label-${selectedEmail.id}-${l.name}-${Math.random()}`,
            source: 'ai' as const
          }));

        let labelsWithSpam = [...currentEmail.labels, ...newLabels];

        // Automatically add "Junk" label if AI is confident and settings are enabled
        if (spamSettings.enabled) {
            const spamSuggestion = newLabels.find(l => (l.name.toLowerCase() === 'junk' || l.name.toLowerCase() === 'spam'));
            if (spamSuggestion && spamSuggestion.confidence >= spamSettings.confidenceThreshold) {
                const hasJunkLabel = labelsWithSpam.some(l => l.name.toLowerCase() === 'junk');
                if (!hasJunkLabel) {
                    labelsWithSpam.push({
                        id: `label-ai-${currentEmail.id}-Junk`,
                        name: 'Junk',
                        confidence: spamSuggestion.confidence,
                        source: 'ai'
                    });
                }
            }
        }
        dispatchEmails({ type: 'UPDATE_LABELS', payload: { emailId: selectedEmail.id, labels: labelsWithSpam } });

      } catch (error) {
        console.error("Failed to analyze email:", error);
        // We can dispatch an action to mark it as skipped
        const currentEmail = emails.find(e => e.id === selectedEmail.id);
        if (currentEmail) {
            // This is not in the reducer, could be added or handled locally.
            // For now, we update it via a specific label update.
             dispatchEmails({ type: 'UPDATE_LABELS', payload: { emailId: selectedEmail.id, labels: currentEmail.labels } });
        }
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [selectedEmail, spamSettings, emails]);

  useEffect(() => {
    analyzeSelectedEmail();
  }, [analyzeSelectedEmail]);
  
  const handleUpdateLabel = (emailId: string, labelId: string, newName: string) => {
    const emailToUpdate = emails.find(e => e.id === emailId);
    if (!emailToUpdate) return;
    
    const newLabelName = newName.trim();
    if (!newLabelName) return;

    const labelNameExists = emailToUpdate.labels.some(l => l.name.toLowerCase() === newLabelName.toLowerCase() && l.id !== labelId);
    if(labelNameExists) return; // Prevent adding duplicate label name

    const existingLabelIndex = emailToUpdate.labels.findIndex(l => l.id === labelId);
    const updatedLabels = [...emailToUpdate.labels];
    
    if (existingLabelIndex > -1) {
        updatedLabels[existingLabelIndex] = { ...updatedLabels[existingLabelIndex], name: newLabelName, confidence: 1, source: 'user' };
    } else {
        updatedLabels.push({ id: labelId, name: newLabelName, confidence: 1, source: 'user' });
    }
    
    dispatchEmails({ type: 'UPDATE_LABELS', payload: { emailId, labels: updatedLabels } });

    setTrainingData(prev => [...prev, {
        id: `td-${Date.now()}`,
        emailBody: emailToUpdate.body,
        label: newLabelName,
        feedback: 'positive',
        timestamp: new Date().toISOString()
    }]);
  };

  const handleConfirmAiLabel = (emailId: string, labelId: string) => {
    const emailToUpdate = emails.find(e => e.id === emailId);
    if (!emailToUpdate) return;

    const updatedLabels = emailToUpdate.labels.map(label => 
      label.id === labelId ? { ...label, source: 'user' as const, confidence: 1.0 } : label
    );
    dispatchEmails({ type: 'UPDATE_LABELS', payload: { emailId, labels: updatedLabels } });
    
    const confirmedLabel = updatedLabels.find(l => l.id === labelId);
    if(confirmedLabel) {
        setTrainingData(prev => [...prev, {
            id: `td-${Date.now()}`,
            emailBody: emailToUpdate.body,
            label: confirmedLabel.name,
            feedback: 'positive',
            timestamp: new Date().toISOString()
        }]);
    }
  };

  const handleRemoveLabel = (emailId: string, labelId: string) => {
    const emailToUpdate = emails.find(e => e.id === emailId);
    if (!emailToUpdate) return;

    const removedLabel = emailToUpdate.labels.find(l => l.id === labelId);
    if (removedLabel && (removedLabel.source === 'user' || removedLabel.source === 'ai')) {
         setTrainingData(prev => [...prev, {
            id: `td-neg-${Date.now()}`,
            emailBody: emailToUpdate.body,
            label: removedLabel.name,
            feedback: 'negative',
            timestamp: new Date().toISOString()
        }]);
    }
    const updatedLabels = emailToUpdate.labels.filter(l => l.id !== labelId);
    dispatchEmails({ type: 'UPDATE_LABELS', payload: { emailId, labels: updatedLabels } });
  };
  
  const handleRejectAiLabel = (emailId: string, label: Label) => {
    const emailToUpdate = emails.find(e => e.id === emailId);
    if (!emailToUpdate) return;
    
    const updatedLabels = emailToUpdate.labels.filter(l => l.id !== label.id);
    dispatchEmails({ type: 'UPDATE_LABELS', payload: { emailId, labels: updatedLabels } });
    
    setTrainingData(prev => [...prev, {
        id: `td-neg-${Date.now()}`,
        emailBody: emailToUpdate.body,
        label: label.name,
        feedback: 'negative',
        timestamp: new Date().toISOString()
    }]);
  }

  const uniqueLabels = useMemo(() => {
    const labelCounts: Record<string, number> = {};
    emails.forEach(email => {
        const seenLabels = new Set<string>();
        email.labels.forEach(label => {
            if (!seenLabels.has(label.name)) {
                labelCounts[label.name] = (labelCounts[label.name] || 0) + 1;
                seenLabels.add(label.name);
            }
        });
    });
    return Object.entries(labelCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));
  }, [emails]);

  const filteredAndSortedEmails = useMemo(() => {
    let baseFiltered: Email[];

    if (activeFilter.type === 'folder') {
        baseFiltered = emails.filter(email => email.folder === activeFilter.name);
    } else { // 'label'
        baseFiltered = emails.filter(email => email.labels.some(l => l.name === activeFilter.name));
    }
    
    let advancedFiltered = baseFiltered;
    if (filterConditions.length > 0) {
        advancedFiltered = baseFiltered.filter(email => {
            const checkCondition = (condition: FilterCondition): boolean => {
                const { field, operator, value } = condition;
                const val = value.toLowerCase();
                switch (field) {
                    case 'sender':
                    case 'subject':
                        const emailVal = email[field].toLowerCase();
                        if (operator === 'contains') return emailVal.includes(val);
                        if (operator === 'not-contains') return !emailVal.includes(val);
                        if (operator === 'equals') return emailVal === val;
                        if (operator === 'not-equals') return emailVal !== val;
                        return false;
                    case 'labelName':
                        return email.labels.some(l => l.name.toLowerCase().includes(val));
                    case 'labelConfidence':
                        const numValue = parseFloat(value) / 100;
                        if (isNaN(numValue)) return false;
                        return email.labels.some(l => {
                            if (operator === '>') return l.confidence > numValue;
                            if (operator === '<') return l.confidence < numValue;
                            return false;
                        });
                    default: return false;
                }
            };
            if (filterLogic === 'AND') return filterConditions.every(checkCondition);
            else return filterConditions.some(checkCondition);
        });
    }

    return [...advancedFiltered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        if (typeof aVal === 'string' && typeof bVal === 'string') return aVal.localeCompare(bVal) * direction;
        if (typeof aVal === 'boolean' && typeof bVal === 'boolean') return (aVal === bVal ? 0 : aVal ? -1 : 1) * direction;
        if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * direction;
        return (new Date(bVal as string).getTime() - new Date(aVal as string).getTime()) * (sortConfig.key === 'timestamp' ? direction : 1);
    });
  }, [emails, activeFilter, sortConfig, filterConditions, filterLogic]);

  const unreadFolderCounts = useMemo(() => {
    return folders.reduce((acc, folder) => {
        acc[folder.name] = emails.filter(e => e.folder === folder.name && !e.read).length;
        return acc;
    }, {} as Record<string, number>);
  }, [emails, folders]);
  
  const unreadLabelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const unreadEmails = emails.filter(e => !e.read);
    unreadEmails.forEach(email => {
      const seenLabels = new Set<string>();
      email.labels.forEach(label => {
        if (!seenLabels.has(label.name)) {
          counts[label.name] = (counts[label.name] || 0) + 1;
          seenLabels.add(label.name);
        }
      });
    });
    return counts;
  }, [emails]);

  const handleSetReadStatus = useCallback((ids: string[], read: boolean) => {
    dispatchEmails({ type: 'SET_READ_STATUS', payload: { ids, read } });
  }, []);
  
  const handleSelectionAfterAction = useCallback((ids: string[]) => {
    if (selectedEmailIds.length > 0 && selectedEmailIds.every(id => ids.includes(id))) {
        const firstIdToMove = selectedEmailIds[0];
        const currentIndex = filteredAndSortedEmails.findIndex(e => e.id === firstIdToMove);
        if (currentIndex > -1) {
            const nextId = getNextSelectedIdInList(filteredAndSortedEmails, currentIndex, ids.length);
            setSelectedEmailIds(nextId ? [nextId] : []);
        } else {
            setSelectedEmailIds([]);
        }
    } else {
        setSelectedEmailIds(prev => prev.filter(id => !ids.includes(id)));
    }
  }, [selectedEmailIds, filteredAndSortedEmails]);

  const handleMoveToFolder = useCallback((ids: string[], folder: EmailFolderName) => {
    handleSelectionAfterAction(ids);
    dispatchEmails({ type: 'MOVE_TO_FOLDER', payload: { ids, folder } });
  }, [handleSelectionAfterAction]);

  const handleDeleteEmails = useCallback((ids: string[]) => handleMoveToFolder(ids, FOLDER_NAMES.TRASH), [handleMoveToFolder]);
  
  const handleArchiveEmails = useCallback((ids: string[]) => {
      dispatchEmails({ type: 'SET_READ_STATUS', payload: { ids, read: true } });
      handleMoveToFolder(ids, FOLDER_NAMES.ARCHIVE);
  }, [handleMoveToFolder])

  const handleJunkEmails = useCallback((ids: string[]) => {
    handleSelectionAfterAction(ids);
    dispatchEmails({ type: 'ADD_JUNK_LABEL_AND_MOVE', payload: { ids } });
  }, [handleSelectionAfterAction]);

  const handleEmptyTrash = useCallback(() => {
      dispatchEmails({ type: 'EMPTY_TRASH' });
      setSelectedEmailIds([]);
  }, []);

  const handleSendEmail = useCallback((payload: { to: string; subject: string; body: string; }, originalEmailId?: string) => {
    const newEmail: Email = {
        id: `email-${Date.now()}`,
        sender: accounts[0]?.emailAddress || 'user@example.com',
        recipient: payload.to,
        subject: payload.subject,
        body: payload.body,
        timestamp: new Date().toISOString(),
        read: true,
        folder: FOLDER_NAMES.SENT,
        labels: [],
    };
    
    if (originalEmailId) {
        dispatchEmails({ type: 'SET_READ_STATUS', payload: { ids: [originalEmailId], read: true } });
    }
    dispatchEmails({ type: 'ADD_EMAIL', payload: newEmail });

    setComposerState({ isOpen: false, mode: 'new' });
    setActiveFilter({ type: 'folder', name: FOLDER_NAMES.SENT });
    setSelectedEmailIds([newEmail.id]);
  }, [accounts]);

  const handleAddContact = (contact: Omit<Contact, 'id'>) => {
    setContacts(prev => [...prev, { ...contact, id: `contact-${Date.now()}` }]);
  };
  
  const handleDeleteContact = (contactId: string) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
  };


  return (
    <div className="h-screen w-screen flex flex-col font-sans text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
            <div className="flex items-center space-x-2">
                <button onClick={() => setIsSidebarVisible(!isSidebarVisible)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden"><MenuIcon className="w-6 h-6" /></button>
                <h1 className="text-xl font-semibold">AI Email Assistant</h1>
            </div>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><SettingsIcon className="w-6 h-6" /></button>
        </header>
        
        {/* Main Content */}
        <div className="flex flex-grow overflow-hidden">
            <aside className={`transition-all duration-300 ${isSidebarVisible ? 'w-64' : 'w-0'} overflow-hidden flex-shrink-0 md:w-64`}>
                <Sidebar 
                    folders={folders} 
                    labels={uniqueLabels}
                    activeFilter={activeFilter} 
                    onFilterChange={ (filter) => { setActiveFilter(filter); setSelectedEmailIds([]); }} 
                    unreadFolderCounts={unreadFolderCounts}
                    unreadLabelCounts={unreadLabelCounts}
                    onCompose={() => setComposerState({ isOpen: true, mode: 'new' })}
                />
            </aside>
            <main className="flex-grow flex border-l border-gray-200 dark:border-gray-700">
                <div className="w-full md:w-1/3 xl:w-1/4 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    <EmailList 
                        emails={filteredAndSortedEmails} 
                        selectedEmailIds={selectedEmailIds} 
                        onSelectEmails={setSelectedEmailIds} 
                        sortConfig={sortConfig} 
                        onSortChange={(key) => setSortConfig(prev => ({ key: key as SortConfig['key'], direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' }))} 
                        onToggleFilter={() => setIsFilterPanelOpen(p => !p)}
                        onSetReadStatus={handleSetReadStatus}
                        onArchive={handleArchiveEmails}
                        onDelete={handleDeleteEmails}
                        onJunk={handleJunkEmails}
                        onMove={handleMoveToFolder}
                        folders={folders}
                        activeFilter={activeFilter}
                        onEmptyTrash={handleEmptyTrash}
                    />
                </div>
                <div className="hidden md:flex flex-grow w-2/3 xl:w-3/4">
                    <EmailView 
                        email={selectedEmail} 
                        folders={folders}
                        onUpdateLabel={handleUpdateLabel} 
                        onConfirmAiLabel={handleConfirmAiLabel} 
                        onRemoveLabel={handleRemoveLabel} 
                        onRejectAiLabel={handleRejectAiLabel} 
                        isAnalyzing={isAnalyzing}
                        onArchive={(id) => handleArchiveEmails([id])}
                        onDelete={(id) => handleDeleteEmails([id])}
                        onJunk={(id) => handleJunkEmails([id])}
                        onMove={(id, folder) => handleMoveToFolder([id], folder)}
                        onSetReadStatus={(id, read) => handleSetReadStatus([id], read)}
                        onReply={(email) => setComposerState({ isOpen: true, mode: 'reply', emailToReply: email })}
                        onForward={(email) => setComposerState({ isOpen: true, mode: 'forward', emailToReply: email })}
                        contacts={contacts}
                        onAddContact={handleAddContact}
                    />
                </div>
            </main>
        </div>

        {/* Settings Modal */}
        <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)}
            rules={rules}
            onAddRule={(rule) => setRules(prev => [...prev, { ...rule, id: `rule-${Date.now()}` }])}
            onDeleteRule={(id) => setRules(prev => prev.filter(r => r.id !== id))}
            trainingData={trainingData}
            accounts={accounts}
            onAddAccount={(acc) => setAccounts(prev => [...prev, { ...acc, id: `acc-${Date.now()}` }])}
            onDeleteAccount={(id) => setAccounts(prev => prev.filter(a => a.id !== id))}
            contacts={contacts}
            onAddContact={handleAddContact}
            onDeleteContact={handleDeleteContact}
            folders={folders}
            spamSettings={spamSettings}
            onSpamSettingsChange={setSpamSettings}
        />
        
        {/* Filter Panel */}
        <FilterPanel 
            isOpen={isFilterPanelOpen}
            onClose={() => setIsFilterPanelOpen(false)}
            conditions={filterConditions}
            onConditionsChange={setFilterConditions}
            logic={filterLogic}
            onLogicChange={setFilterLogic}
        />
        
        {/* Compose Modal */}
        <ComposeModal
          isOpen={composerState.isOpen}
          onClose={() => setComposerState({ isOpen: false, mode: 'new' })}
          onSend={handleSendEmail}
          mode={composerState.mode}
          email={composerState.emailToReply}
        />
    </div>
  );
};

export default App;
