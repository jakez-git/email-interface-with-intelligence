
// This is a mock service. In a real application, this would make API calls
// to a backend service that connects to an email server via IMAP/POP3.
// For this frontend-only demo, we are using static data.

import { MOCK_EMAILS } from '../constants';
import type { Email } from '../types';

export const fetchEmails = async (): Promise<Email[]> => {
  console.log("Simulating fetching emails...");
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_EMAILS;
};
