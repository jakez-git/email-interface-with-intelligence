import { useContext } from 'react';
import { UIContext } from '../contexts/AppContext';
import { IUIContext } from '../types';

export const useUI = (): IUIContext => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within an AppProvider');
  }
  return context;
};

// This allows accessing the context value outside of a React component,
// similar to the useEmails hook.
let state: IUIContext;
UIContext.Consumer.prototype.render = function() {
  state = this.props.value;
  return null;
}
Object.defineProperty(useUI, 'getState', {
    get: () => state,
});
