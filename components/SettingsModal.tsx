import React, { useState } from 'react';
import type { Rule, TrainingData, EmailAccount, Contact, Folder, RuleAction, SpamSettings, EmailFolderName } from '../types';
import { XMarkIcon, SettingsIcon, ScaleIcon, BookOpenIcon, TrashIcon, UserCircleIcon, PlusIcon, UserGroupIcon, ShieldExclamationIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: Rule[];
  onAddRule: (rule: Omit<Rule, 'id'>) => void;
  onDeleteRule: (ruleId: string) => void;
  trainingData: TrainingData[];
  accounts: EmailAccount[];
  onAddAccount: (account: Omit<EmailAccount, 'id'>) => void;
  onDeleteAccount: (accountId: string) => void;
  contacts: Contact[];
  onAddContact: (contact: Omit<Contact, 'id'>) => void;
  onDeleteContact: (contactId: string) => void;
  folders: Folder[];
  spamSettings: SpamSettings;
  onSpamSettingsChange: (settings: SpamSettings) => void;
}

const RulesManager: React.FC<{rules: Rule[], onAddRule: (rule: Omit<Rule, 'id'>) => void, onDeleteRule: (id: string) => void, folders: Folder[]}> = ({ rules, onAddRule, onDeleteRule, folders }) => {
    const [condition, setCondition] = useState({ field: 'sender' as 'sender' | 'subject' | 'body', operator: 'contains' as 'contains' | 'equals', value: '' });
    const [action, setAction] = useState<RuleAction>({ type: 'addLabel', value: ''});
    
    const handleAdd = () => {
        if (condition.value.trim() && action.value.trim()) {
            onAddRule({ condition, action });
            setCondition({ field: 'sender', operator: 'contains', value: '' });
            setAction({ type: 'addLabel', value: '' });
        }
    };
    
    const renderActionValueInput = () => {
        if (action.type === 'addLabel') {
            return <input type="text" placeholder="Apply Label..." value={action.value} onChange={e => setAction({ type: 'addLabel', value: e.target.value })} className="flex-grow p-1 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />;
        }
        if (action.type === 'moveToFolder') {
            return (
                <select value={action.value} onChange={e => setAction({ type: 'moveToFolder', value: e.target.value as EmailFolderName })} className="flex-grow p-1 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    {folders.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                </select>
            );
        }
        return null;
    }
    
    return (
        <div className="space-y-4">
            <div className="p-4 border rounded-md dark:border-gray-600 space-y-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Add New Rule</h4>
                 <div className="flex items-center space-x-2 text-sm">
                    <span>If</span>
                    <select value={condition.field} onChange={e => setCondition(p => ({...p, field: e.target.value as any}))} className="p-1 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <option value="sender">Sender</option>
                        <option value="subject">Subject</option>
                        <option value="body">Body</option>
                    </select>
                    <select value={condition.operator} onChange={e => setCondition(p => ({...p, operator: e.target.value as any}))} className="p-1 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <option value="contains">contains</option>
                        <option value="equals">equals</option>
                    </select>
                    <input type="text" placeholder="Value..." value={condition.value} onChange={e => setCondition(p => ({...p, value: e.target.value}))} className="flex-grow p-1 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                 </div>
                 <div className="flex items-center space-x-2 text-sm">
                    <span>Then</span>
                     <select value={action.type} onChange={e => setAction({ type: e.target.value as any, value: ''})} className="p-1 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                         <option value="addLabel">Add Label</option>
                         <option value="moveToFolder">Move to Folder</option>
                     </select>
                     {renderActionValueInput()}
                 </div>
                 <button onClick={handleAdd} className="w-full px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">Add Rule</button>
            </div>
            <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Existing Rules</h4>
                {rules.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No rules configured.</p>}
                <ul className="max-h-60 overflow-y-auto space-y-2">
                    {rules.map(rule => (
                        <li key={rule.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm">
                            <span className="font-mono text-xs">IF {rule.condition.field} {rule.condition.operator} "{rule.condition.value}" THEN {rule.action.type === 'addLabel' ? 'add label' : 'move to'} "{rule.action.value}"</span>
                            <button onClick={() => onDeleteRule(rule.id)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                                <TrashIcon className="w-4 h-4 text-red-500" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

const TrainingDataViewer: React.FC<{data: TrainingData[]}> = ({ data }) => (
    <div className="space-y-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">When you manually confirm, add, or remove a label, it's added here. This data would be used to retrain and improve the AI model.</p>
        {data.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No training data yet. Interact with labels to generate data.</p>}
        <ul className="max-h-80 overflow-y-auto space-y-2">
            {data.slice().reverse().map(item => (
                <li key={item.id} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm">
                    <p className="font-mono text-xs truncate mb-1">EMAIL: "{item.emailBody}"</p>
                    <div className="flex items-center">
                        <span className={`font-semibold mr-2 ${item.feedback === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                           {item.feedback === 'positive' ? 'SHOULD HAVE LABEL:' : 'SHOULD NOT HAVE LABEL:'} 
                        </span>
                        <span className="font-normal px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">{item.label}</span>
                    </div>
                </li>
            ))}
        </ul>
    </div>
)

const AccountManager: React.FC<{accounts: EmailAccount[], onAddAccount: (acc: Omit<EmailAccount, 'id'>) => void, onDeleteAccount: (id: string) => void}> = ({ accounts, onAddAccount, onDeleteAccount }) => {
    const [newAccount, setNewAccount] = useState({ name: '', emailAddress: '', usernameEnvVar: '', passwordEnvVar: ''});
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = () => {
        if (Object.values(newAccount).every(field => field.trim() !== '')) {
            onAddAccount(newAccount);
            setNewAccount({ name: '', emailAddress: '', usernameEnvVar: '', passwordEnvVar: '' });
            setIsAdding(false);
        }
    }

    return (
        <div className="space-y-4 text-sm">
             <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Connected Accounts</h3>
                 <p className="text-xs text-gray-500 dark:text-gray-400">Manage connections to your email accounts. The application will use the specified environment variable names to find authentication credentials on startup.</p>
                {accounts.length === 0 && !isAdding && <p className="text-sm text-gray-500 dark:text-gray-400">No accounts configured.</p>}
                <ul className="space-y-2">
                    {accounts.map(acc => (
                        <li key={acc.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <div className="flex items-center">
                                <UserCircleIcon className="w-6 h-6 mr-3 text-gray-400"/>
                                <div>
                                    <p className="font-semibold">{acc.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{acc.emailAddress}</p>
                                </div>
                            </div>
                            <button onClick={() => onDeleteAccount(acc.id)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                                <TrashIcon className="w-4 h-4 text-red-500" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {isAdding && (
                <div className="p-4 border rounded-md dark:border-gray-600 space-y-3">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Add New Account</h4>
                    <input type="text" placeholder="Account Name (e.g. 'Personal')" value={newAccount.name} onChange={e => setNewAccount(p => ({...p, name: e.target.value}))} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <input type="email" placeholder="Email Address" value={newAccount.emailAddress} onChange={e => setNewAccount(p => ({...p, emailAddress: e.target.value}))} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <input type="text" placeholder="Username Environment Variable" value={newAccount.usernameEnvVar} onChange={e => setNewAccount(p => ({...p, usernameEnvVar: e.target.value}))} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <input type="text" placeholder="Password Environment Variable" value={newAccount.passwordEnvVar} onChange={e => setNewAccount(p => ({...p, passwordEnvVar: e.target.value}))} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <div className="flex space-x-2">
                        <button onClick={handleAdd} className="w-full px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">Save Account</button>
                        <button onClick={() => setIsAdding(false)} className="w-full px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    </div>
                </div>
            )}
            
            {!isAdding && (
                <button onClick={() => setIsAdding(true)} className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 text-sm border-2 border-dashed rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                    <PlusIcon className="w-4 h-4" />
                    <span>Add Account</span>
                </button>
            )}

             <div className="p-4 border rounded-md dark:border-gray-600 space-y-2 mt-6">
                 <h3 className="font-semibold text-gray-800 dark:text-gray-200">AI Model Configuration</h3>
                 <p className="text-xs text-gray-500 dark:text-gray-400">The application is configured to use the Google Gemini API. The API Key is loaded from the `API_KEY` environment variable.</p>
                 <label className="block font-medium text-gray-700 dark:text-gray-300">LLM Endpoint</label>
                 <input type="text" value="Google Gemini API" disabled className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-md dark:border-gray-600 cursor-not-allowed" />
             </div>
        </div>
    )
};

const ContactManager: React.FC<{ contacts: Contact[]; onAddContact: (contact: Omit<Contact, 'id'>) => void; onDeleteContact: (id: string) => void; }> = ({ contacts, onAddContact, onDeleteContact }) => {
    const [newContact, setNewContact] = useState({ name: '', email: '' });
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = () => {
        if (newContact.name.trim() && newContact.email.trim()) {
            onAddContact(newContact);
            setNewContact({ name: '', email: '' });
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-4 text-sm">
            <ul className="space-y-2 max-h-80 overflow-y-auto">
                {contacts.map(contact => (
                    <li key={contact.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <div className="flex items-center">
                            <UserCircleIcon className="w-6 h-6 mr-3 text-gray-400" />
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{contact.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{contact.email}</p>
                            </div>
                        </div>
                        <button onClick={() => onDeleteContact(contact.id)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                            <TrashIcon className="w-4 h-4 text-red-500" />
                        </button>
                    </li>
                ))}
            </ul>
            {isAdding && (
                <div className="p-4 border rounded-md dark:border-gray-600 space-y-3">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Add New Contact</h4>
                    <input type="text" placeholder="Contact Name" value={newContact.name} onChange={e => setNewContact(p => ({...p, name: e.target.value}))} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <input type="email" placeholder="Email Address" value={newContact.email} onChange={e => setNewContact(p => ({...p, email: e.target.value}))} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <div className="flex space-x-2">
                        <button onClick={handleAdd} className="w-full px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">Save Contact</button>
                        <button onClick={() => setIsAdding(false)} className="w-full px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    </div>
                </div>
            )}
            {!isAdding && (
                <button onClick={() => setIsAdding(true)} className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 text-sm border-2 border-dashed rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                    <PlusIcon className="w-4 h-4" />
                    <span>Add Contact</span>
                </button>
            )}
        </div>
    );
};

const JunkMailManager: React.FC<{ settings: SpamSettings; onChange: (settings: SpamSettings) => void; }> = ({ settings, onChange }) => {
    return (
        <div className="space-y-4 text-sm">
            <div className="p-4 border rounded-md dark:border-gray-600 space-y-3">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">AI Junk Mail Filter</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Automatically apply a "Junk" label to emails that the AI identifies as potential spam. You can then create a rule to automatically move emails with this label to your Spam folder.</p>
                
                <div className="flex items-center justify-between">
                    <label htmlFor="spam-enabled" className="font-medium text-gray-700 dark:text-gray-300">Enable AI Junk Detection</label>
                    <button onClick={() => onChange({ ...settings, enabled: !settings.enabled })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enabled ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className={`space-y-2 ${!settings.enabled ? 'opacity-50' : ''}`}>
                    <label htmlFor="spam-threshold" className="font-medium text-gray-700 dark:text-gray-300">Confidence Threshold</label>
                    <div className="flex items-center space-x-4">
                        <input
                            type="range"
                            id="spam-threshold"
                            min="50"
                            max="100"
                            step="1"
                            value={settings.confidenceThreshold * 100}
                            onChange={e => onChange({ ...settings, confidenceThreshold: parseInt(e.target.value) / 100 })}
                            disabled={!settings.enabled}
                            className="w-full"
                        />
                        <span className="font-mono text-base text-gray-800 dark:text-gray-200 w-12 text-center">
                            {(settings.confidenceThreshold * 100).toFixed(0)}%
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">The AI will only apply the "Junk" label if its confidence is above this threshold.</p>
                </div>

            </div>
        </div>
    );
};


const SettingsModal: React.FC<SettingsModalProps> = (props) => {
  const { isOpen, onClose, rules, onAddRule, onDeleteRule, trainingData, accounts, onAddAccount, onDeleteAccount, contacts, onAddContact, onDeleteContact, folders, spamSettings, onSpamSettingsChange } = props;
  const [activeTab, setActiveTab] = useState<'accounts' | 'rules' | 'data' | 'contacts' | 'junk'>('accounts');

  if (!isOpen) return null;

  const tabs = [
      { id: 'accounts' as const, name: 'Accounts', icon: UserCircleIcon },
      { id: 'contacts' as const, name: 'Contacts', icon: UserGroupIcon },
      { id: 'rules' as const, name: 'Rules', icon: ScaleIcon },
      { id: 'junk' as const, name: 'Junk Mail', icon: ShieldExclamationIcon },
      { id: 'data' as const, name: 'Training Data', icon: BookOpenIcon },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl mx-4 transform transition-all flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${
                        activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                        <tab.icon className="w-5 h-5 mr-2" />
                        {tab.name}
                    </button>
                ))}
            </nav>
        </div>
        
        <div className="overflow-y-auto flex-grow pr-2 -mr-2">
            {activeTab === 'rules' && <RulesManager rules={rules} onAddRule={onAddRule} onDeleteRule={onDeleteRule} folders={folders} />}
            {activeTab === 'data' && <TrainingDataViewer data={trainingData} />}
            {activeTab === 'accounts' && <AccountManager accounts={accounts} onAddAccount={onAddAccount} onDeleteAccount={onDeleteAccount} />}
            {activeTab === 'contacts' && <ContactManager contacts={contacts} onAddContact={onAddContact} onDeleteContact={onDeleteContact} />}
            {activeTab === 'junk' && <JunkMailManager settings={spamSettings} onChange={onSpamSettingsChange} />}
        </div>


        <div className="mt-6 pt-4 border-t dark:border-gray-600 flex justify-end items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
