import { useContext } from 'react';
import { EmailsContext } from '../contexts/AppContext';
import { IEmailsContext } from '../types';

export const useEmails = (): IEmailsContext => {
  const context = useContext(EmailsContext);
  if (context === undefined) {
    throw new Error('useEmails must be used within an AppProvider');
  }
  return context;
};

// This allows accessing the context value outside of a React component,
// for example, in the analyzeEmail callback.
// This is a simplified approach; more complex apps might use a library like Zustand or Jotai.
let state: IEmailsContext;
EmailsContext.Consumer.prototype.render = function() {
  state = this.props.value;
  return null;
}
Object.defineProperty(useEmails, 'getState', {
    get: () => state,
});
