import type React from 'react';

// FIX: Moved UI-related types from AppContext.tsx to types.ts to serve as a single source of truth and fix circular dependencies.
export type SortConfig = { key: 'timestamp' | 'read' | 'sender'; direction: 'asc' | 'desc' };
export type FilterCondition = { id: string; field: 'sender' | 'subject' | 'labelName' | 'labelConfidence'; operator: 'contains' | 'not-contains' | 'equals' | 'not-equals' | '>' | '<'; value: string; };
export type FilterLogic = 'AND' | 'OR';
export type ActiveFilter = { type: 'folder' | 'label', name: string };
export type ComposerState = { isOpen: boolean; mode: 'new' | 'reply' | 'forward'; emailToReply?: Email; }


// This string union is kept in sync with the FOLDER_NAMES object in `constants.ts`.
// It breaks a potential circular dependency while providing strong type safety.
export type EmailFolderName = 'Inbox' | 'Sent' | 'Spam' | 'Archive' | 'Trash';

export interface Email {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  folder: EmailFolderName;
  labels: Label[];
  analysisSkipped?: boolean;
}

export interface Label {
  id:string;
  name: string;
  confidence: number;
  source: 'ai' | 'user' | 'rule';
}

export interface Folder {
  id: string;
  name: EmailFolderName;
  icon: React.ElementType;
}

export interface RuleActionAddLabel {
  type: 'addLabel';
  value: string;
}

export interface RuleActionMoveToFolder {
  type: 'moveToFolder';
  value: EmailFolderName;
}

export type RuleAction = RuleActionAddLabel | RuleActionMoveToFolder;


export interface Rule {
  id: string;
  condition: {
    field: 'sender' | 'subject' | 'body';
    operator: 'contains' | 'equals';
    value: string;
  };
  action: RuleAction;
}

export interface TrainingData {
  id: string;
  emailBody: string;
  label: string;
  feedback: 'positive' | 'negative';
  timestamp: string;
}

export interface EmailAccount {
  id:string;
  name: string;
  emailAddress: string;
  usernameEnvVar: string;
  passwordEnvVar: string;
}

export interface Contact {
  id: string;
  name: string;
  emails: string[];
}

export interface SpamSettings {
  enabled: boolean;
  confidenceThreshold: number; // A value between 0 and 1
}

/**
 * Defines all possible actions that can be dispatched to modify the email state.
 * This ensures that state transitions are predictable and type-safe.
 */
export type EmailAction =
  | { type: 'SET_EMAILS'; payload: Email[] }
  | { type: 'SET_READ_STATUS'; payload: { ids: string[]; read: boolean } }
  | { type: 'MOVE_TO_FOLDER'; payload: { ids: string[]; folder: EmailFolderName } }
  | { type: 'ADD_JUNK_LABEL_AND_MOVE'; payload: { ids: string[] } }
  | { type: 'UPDATE_LABELS'; payload: { emailId: string; labels: Label[] } }
  | { type: 'ADD_EMAIL'; payload: Email }
  | { type: 'EMPTY_TRASH' };


// --- Context API Types ---

export interface IEmailsContext {
  emails: Email[];
  dispatchEmails: React.Dispatch<EmailAction>;
  isAnalyzing: boolean;
  analyzeEmail: (email: Email) => Promise<void>;
  trainingData: TrainingData[];
  setTrainingData: React.Dispatch<React.SetStateAction<TrainingData[]>>;
  initializeEmails: () => void;
}

export interface ISettingsContext {
  rules: Rule[];
  setRules: React.Dispatch<React.SetStateAction<Rule[]>>;
  accounts: EmailAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<EmailAccount[]>>;
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  spamSettings: SpamSettings;
  setSpamSettings: React.Dispatch<React.SetStateAction<SpamSettings>>;
  folders: Folder[];
}

export interface IUIContext {
  activeFilter: ActiveFilter;
  setActiveFilter: React.Dispatch<React.SetStateAction<ActiveFilter>>;
  selectedEmailIds: string[];
  setSelectedEmailIds: React.Dispatch<React.SetStateAction<string[]>>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSidebarVisible: boolean;
  setIsSidebarVisible: React.Dispatch<React.SetStateAction<boolean>>;
  sortConfig: SortConfig;
  setSortConfig: React.Dispatch<React.SetStateAction<SortConfig>>;
  filterConditions: FilterCondition[];
  setFilterConditions: React.Dispatch<React.SetStateAction<FilterCondition[]>>;
  filterLogic: FilterLogic;
  setFilterLogic: React.Dispatch<React.SetStateAction<FilterLogic>>;
  composerState: ComposerState;
  setComposerState: React.Dispatch<React.SetStateAction<ComposerState>>;
  isFilterPanelOpen: boolean;
  setIsFilterPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}