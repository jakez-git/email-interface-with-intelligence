import type { Email, EmailAction } from '../types';
import { FOLDER_NAMES } from '../constants';

/**
 * A reducer function to manage the state of the emails list.
 * It handles all CRUD-like operations on emails based on dispatched actions.
 * @param state - The current array of emails.
 * @param action - The action to perform on the state.
 * @returns The new state of the emails array.
 */
export const emailsReducer = (state: Email[], action: EmailAction): Email[] => {
  switch (action.type) {
    case 'SET_EMAILS':
      return action.payload;

    case 'SET_READ_STATUS':
      return state.map(email =>
        action.payload.ids.includes(email.id)
          ? { ...email, read: action.payload.read }
          : email
      );

    case 'MOVE_TO_FOLDER':
      return state.map(email =>
        action.payload.ids.includes(email.id)
          ? { ...email, folder: action.payload.folder }
          : email
      );
    
    case 'ADD_JUNK_LABEL_AND_MOVE':
      return state.map(email => {
        if (action.payload.ids.includes(email.id)) {
            const hasJunkLabel = email.labels.some(l => l.name.toLowerCase() === 'junk');
            const newLabels = hasJunkLabel ? email.labels : [
                ...email.labels,
                { id: `label-user-${email.id}-Junk`, name: 'Junk', confidence: 1, source: 'user' as const }
            ];
            return { ...email, folder: FOLDER_NAMES.SPAM, labels: newLabels, read: true };
        }
        return email;
    });

    case 'UPDATE_LABELS':
        return state.map(email => 
            email.id === action.payload.emailId
            ? { ...email, labels: action.payload.labels }
            : email
        );

    case 'ADD_EMAIL':
        return [action.payload, ...state];

    case 'EMPTY_TRASH':
        return state.filter(email => email.folder !== FOLDER_NAMES.TRASH);

    default:
      return state;
  }
};
