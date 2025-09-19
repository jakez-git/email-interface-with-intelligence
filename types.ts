import type React from 'react';

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
  id: string;
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
  id: string;
  name: string;
  emailAddress: string;
  usernameEnvVar: string;
  passwordEnvVar: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
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
