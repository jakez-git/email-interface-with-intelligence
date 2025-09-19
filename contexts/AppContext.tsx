import React, { createContext, useState, useReducer, useCallback, ReactNode } from 'react';
// FIX: Import UI-related types from types.ts after moving them there.
import type { Email, Folder, Rule, TrainingData, EmailAccount, Contact, SpamSettings, Label, IEmailsContext, ISettingsContext, IUIContext, SortConfig, FilterCondition, FilterLogic, ActiveFilter, ComposerState } from '../types';
import { INITIAL_FOLDERS, MOCK_EMAILS, INITIAL_RULES, INITIAL_ACCOUNTS, INITIAL_CONTACTS, FOLDER_NAMES } from '../constants';
import { analyzeEmailForLabels } from '../services/geminiService';
import { applyRulesToEmails } from '../services/ruleService';
import { emailsReducer } from '../reducers/emailReducer';

// --- Type Definitions for Contexts ---

// --- Context Creation ---

export const EmailsContext = createContext<IEmailsContext | undefined>(undefined);
export const SettingsContext = createContext<ISettingsContext | undefined>(undefined);
export const UIContext = createContext<IUIContext | undefined>(undefined);


// --- Main Provider Component ---

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // --- Emails State ---
  const [emails, dispatchEmails] = useReducer(emailsReducer, []);
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // --- Settings State ---
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);
  const [accounts, setAccounts] = useState<EmailAccount[]>(INITIAL_ACCOUNTS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [spamSettings, setSpamSettings] = useState<SpamSettings>({ enabled: true, confidenceThreshold: 0.9 });
  const [folders] = useState<Folder[]>(INITIAL_FOLDERS);

  // --- UI State ---
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>({ type: 'folder', name: 'Inbox' });
  const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'timestamp', direction: 'desc' });
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [filterLogic, setFilterLogic] = useState<FilterLogic>('AND');
  const [composerState, setComposerState] = useState<ComposerState>({ isOpen: false, mode: 'new' });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);

  // --- Combined Logic & Callbacks ---
  
  const initializeEmails = useCallback(() => {
    const emailsWithRulesApplied = applyRulesToEmails(MOCK_EMAILS, rules);
    dispatchEmails({ type: 'SET_EMAILS', payload: emailsWithRulesApplied });

    if (emailsWithRulesApplied.length > 0) {
      const firstInboxEmailId = emailsWithRulesApplied.find(e => e.folder === FOLDER_NAMES.INBOX)?.id;
      if (firstInboxEmailId) {
        setSelectedEmailIds([firstInboxEmailId]);
      }
    }
  }, [rules]);

  const analyzeEmail = useCallback(async (email: Email) => {
    if (!email || email.labels.some(l => l.source === 'ai') || email.analysisSkipped) {
      return;
    }
    
    setIsAnalyzing(true);
    try {
        const suggestedLabels = await analyzeEmailForLabels(email.body);
        // FIX: Replaced useEmails.getState() with `emails` from closure.
        // The `emails` variable is correctly updated via the useCallback dependency array.
        const currentEmail = emails.find(e => e.id === email.id);
        if (!currentEmail) return;

        const existingLabelNames = new Set(currentEmail.labels.map(l => l.name.toLowerCase()));
        
        const newLabels = suggestedLabels
          .filter(l => !existingLabelNames.has(l.name.toLowerCase()))
          .map(l => ({
            ...l,
            id: `label-${email.id}-${l.name}-${Math.random()}`,
            source: 'ai' as const
          }));

        let labelsWithSpam = [...currentEmail.labels, ...newLabels];

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
        dispatchEmails({ type: 'UPDATE_LABELS', payload: { emailId: email.id, labels: labelsWithSpam } });
    } catch (error) {
        console.error("Failed to analyze email:", error);
    } finally {
        setIsAnalyzing(false);
    }
  }, [spamSettings, emails]);

  // --- Context Values ---
  const emailsContextValue: IEmailsContext = { emails, dispatchEmails, isAnalyzing, analyzeEmail, trainingData, setTrainingData, initializeEmails };
  const settingsContextValue: ISettingsContext = { rules, setRules, accounts, setAccounts, contacts, setContacts, spamSettings, setSpamSettings, folders };
  const uiContextValue: IUIContext = { activeFilter, setActiveFilter, selectedEmailIds, setSelectedEmailIds, isSettingsOpen, setIsSettingsOpen, isSidebarVisible, setIsSidebarVisible, sortConfig, setSortConfig, filterConditions, setFilterConditions, filterLogic, setFilterLogic, composerState, setComposerState, isFilterPanelOpen, setIsFilterPanelOpen };

  return (
    <EmailsContext.Provider value={emailsContextValue}>
      <SettingsContext.Provider value={settingsContextValue}>
        <UIContext.Provider value={uiContextValue}>
          {children}
        </UIContext.Provider>
      </SettingsContext.Provider>
    </EmailsContext.Provider>
  );
};