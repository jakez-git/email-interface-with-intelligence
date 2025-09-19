import type { Email, Folder, Rule, EmailAccount, Contact } from './types';
import { InboxIcon, PaperAirplaneIcon, ExclamationCircleIcon, ArchiveBoxIcon, TrashIcon } from './components/icons';

/**
 * A centralized object of folder names. Using this constant prevents typos
 * and makes it easy to update folder names across the application.
 */
export const FOLDER_NAMES = {
  INBOX: 'Inbox',
  SENT: 'Sent',
  SPAM: 'Spam',
  ARCHIVE: 'Archive',
  TRASH: 'Trash',
} as const;


export const INITIAL_FOLDERS: Folder[] = [
  { id: '1', name: FOLDER_NAMES.INBOX, icon: InboxIcon },
  { id: '2', name: FOLDER_NAMES.SENT, icon: PaperAirplaneIcon },
  { id: '3', name: FOLDER_NAMES.SPAM, icon: ExclamationCircleIcon },
  { id: '4', name: FOLDER_NAMES.ARCHIVE, icon: ArchiveBoxIcon },
  { id: '5', name: FOLDER_NAMES.TRASH, icon: TrashIcon },
];

export const INITIAL_RULES: Rule[] = [
  {
    id: 'rule-1',
    condition: { field: 'sender', operator: 'contains', value: 'billing' },
    action: { type: 'addLabel', value: 'Finance' }
  },
  {
    id: 'rule-2',
    condition: { field: 'subject', operator: 'contains', value: 'sale' },
    action: { type: 'addLabel', value: 'Promotion' }
  },
  {
    id: 'rule-3',
    condition: { field: 'sender', operator: 'contains', value: 'newsletter' },
    action: { type: 'addLabel', value: 'Newsletter' }
  }
];

export const INITIAL_ACCOUNTS: EmailAccount[] = [
    {
        id: 'acc-1',
        name: 'Personal Gmail',
        emailAddress: 'user@gmail.com',
        usernameEnvVar: 'GMAIL_USER_PERSONAL',
        passwordEnvVar: 'GMAIL_PASS_PERSONAL',
    },
    {
        id: 'acc-2',
        name: 'Work Email',
        emailAddress: 'user@work.com',
        usernameEnvVar: 'GMAIL_USER_WORK',
        passwordEnvVar: 'GMAIL_PASS_WORK',
    }
];

export const MOCK_EMAILS: Email[] = [
  {
    id: '1',
    sender: 'newsletter@techweekly.com',
    recipient: 'user@example.com',
    subject: 'Your Weekly Tech Roundup!',
    body: 'This week in tech: AI breakthroughs, the future of quantum computing, and a deep dive into the latest frameworks. Plus, an exclusive interview with a leading innovator. Don\'t miss out!',
    timestamp: '2024-07-29T10:00:00Z',
    read: false,
    folder: FOLDER_NAMES.INBOX,
    labels: [],
  },
  {
    id: '2',
    sender: 'billing@cloudservice.com',
    recipient: 'user@example.com',
    subject: 'Your Invoice #CS12345 is due',
    body: 'Dear Valued Customer, this is a reminder that your invoice for Cloud Service Pro Plan is due on August 15, 2024. The total amount is $49.99. Please log in to your account to make a payment. Thank you for your business.',
    timestamp: '2024-07-29T09:30:00Z',
    read: true,
    folder: FOLDER_NAMES.INBOX,
    labels: [{ id: 'l-finance-ai', name: 'Finance', confidence: 0.98, source: 'ai' }],
  },
  {
    id: '3',
    sender: 'support@projectmanager.app',
    recipient: 'user@example.com',
    subject: 'Re: Question about task dependencies',
    body: 'Hi there, thanks for reaching out. To create a task dependency, simply drag the handle from one task to another on the timeline view. Let us know if you have any other questions! Best, The Support Team.',
    timestamp: '2024-07-28T15:12:00Z',
    read: false,
    folder: FOLDER_NAMES.INBOX,
    labels: [],
  },
    {
    id: '4',
    sender: 'marketing@e-commercestore.com',
    recipient: 'user@example.com',
    subject: '🎉 48-Hour Flash Sale! Up to 50% Off!',
    body: 'Don\'t miss out on our biggest sale of the season! For the next 48 hours, get up to 50% off on all items site-wide. Click here to shop now and save big. Your next great find is just a click away. Happy shopping!',
    timestamp: '2024-07-28T11:00:00Z',
    read: false,
    folder: FOLDER_NAMES.INBOX,
    labels: [],
  },
  {
    id: '5',
    sender: 'Jane Doe',
    recipient: 'user@example.com',
    subject: 'Project Alpha Update & Next Steps',
    body: 'Hi team, great work on the Q3 projections. I\'ve attached the final report. Let\'s schedule a meeting for early next week to discuss our strategy for Q4. Please send me your availability. Thanks, Jane.',
    timestamp: '2024-07-27T18:45:00Z',
    read: true,
    folder: FOLDER_NAMES.INBOX,
    labels: [{ id: 'l-important-user', name: 'Important', confidence: 1.0, source: 'user' }],
  },
  {
    id: '6',
    sender: 'user@example.com',
    recipient: 'john.smith@work.com',
    subject: 'Sending over the assets',
    body: 'Hi John, as discussed, here are the design assets for the new landing page. Let me know if you need anything else from my end.',
    timestamp: '2024-07-26T14:20:00Z',
    read: true,
    folder: FOLDER_NAMES.SENT,
    labels: [],
  },
];

export const INITIAL_CONTACTS: Contact[] = [
  { id: 'contact-1', name: 'Tech Weekly', email: 'newsletter@techweekly.com' },
  { id: 'contact-2', name: 'Cloud Service Billing', email: 'billing@cloudservice.com' },
  { id: 'contact-3', name: 'Support PM', email: 'support@projectmanager.app' },
  { id: 'contact-4', name: 'E-Commerce Store', email: 'marketing@e-commercestore.com' },
  { id: 'contact-5', name: 'Jane Doe', email: 'jane.doe@example.com' },
  { id: 'contact-6', name: 'John Smith', email: 'john.smith@work.com' },
];
