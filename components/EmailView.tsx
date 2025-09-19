import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Email, Label, Contact, EmailFolderName } from '../types';
import { useEmailActions } from '../hooks/useEmailActions';
import { useSettings } from '../hooks/useSettings';
import { useEmails } from '../hooks/useEmails';
import { useUI } from '../hooks/useUI';
import { TagIcon, SparklesIcon, UserIcon, ScaleIcon, XMarkIcon, PlusIcon, MinusCircleIcon, ArchiveBoxIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, TrashIcon, EnvelopeIcon, EnvelopeOpenIcon, FolderArrowDownIcon, ShieldExclamationIcon, UserPlusIcon } from './icons';

const AILabelPill: React.FC<{ label: Label; onRemove?: () => void; }> = ({ label, onRemove }) => {
  const getLabelStyle = () => {
    switch(label.source) {
      case 'ai': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'user': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'rule': return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }
  const getIcon = () => {
    switch(label.source) {
      case 'ai': return <SparklesIcon className="w-3 h-3 mr-1.5 text-purple-500" />;
      case 'user': return <UserIcon className="w-3 h-3 mr-1.5 text-blue-500" />;
      case 'rule': return <ScaleIcon className="w-3 h-3 mr-1.5 text-gray-500" />;
      default: return null;
    }
  }
  return (
    <div className={`flex items-center text-xs font-medium pl-2.5 pr-1 py-1 rounded-full ${getLabelStyle()}`}>
      {getIcon()}
      <span>{label.name}</span>
      {label.source === 'ai' && (
        <span className="ml-1.5 text-purple-600 dark:text-purple-300 opacity-90">
          ({(label.confidence * 100).toFixed(0)}%)
        </span>
      )}
      {onRemove && (
        <button onClick={onRemove} className="ml-1.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/20">
            <XMarkIcon className="w-3 h-3"/>
        </button>
      )}
    </div>
  );
};

const AIAnalysisView: React.FC<{
  labels: Label[];
  onConfirmLabel: (labelId: string) => void;
  onRejectLabel: (label: Label) => void;
}> = ({ labels, onConfirmLabel, onRejectLabel }) => {
  const [filter, setFilter] = useState('');
  const aiLabels = labels.filter(l => l.source === 'ai').sort((a,b) => b.confidence - a.confidence);

  const filteredLabels = useMemo(() => {
    if (!filter) return aiLabels;
    
    const isThresholdFilter = filter.startsWith('>') || filter.startsWith('<');
    if (isThresholdFilter) {
      try {
        const operator = filter[0];
        const value = parseFloat(filter.substring(1)) / 100;
        if (isNaN(value)) return aiLabels;
        return aiLabels.filter(l => operator === '>' ? l.confidence > value : l.confidence < value);
      } catch {
        return aiLabels;
      }
    }
    return aiLabels.filter(l => l.name.toLowerCase().includes(filter.toLowerCase()));
  }, [filter, aiLabels]);

  if(aiLabels.length === 0) return null;

  return (
    <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
        <SparklesIcon className="w-5 h-5 mr-2 text-purple-500" />
        AI Analysis & Suggestions
      </h3>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter labels or use > / < (e.g., >80)"
        className="w-full text-xs p-2 mb-3 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
      />
      <ul className="space-y-1 max-h-48 overflow-y-auto">
        {filteredLabels.map(label => (
          <li key={label.id} className="w-full flex items-center p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 group">
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200 w-1/3 text-left truncate">{label.name}</span>
              <div className="w-2/3 flex items-center pl-2">
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 mr-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${label.confidence * 100}%` }}></div>
                </div>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{(label.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button onClick={() => onConfirmLabel(label.id)} title="Confirm Label" className="p-1 rounded-full hover:bg-green-200 dark:hover:bg-green-800"><PlusIcon className="w-4 h-4 text-green-600 dark:text-green-400"/></button>
                <button onClick={() => onRejectLabel(label)} title="Reject Suggestion" className="p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800"><MinusCircleIcon className="w-4 h-4 text-red-600 dark:text-red-400"/></button>
              </div>
          </li>
        ))}
        {filteredLabels.length === 0 && (
          <li className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">No suggestions match your filter.</li>
        )}
      </ul>
    </div>
  );
};


interface EmailViewProps {
  email: Email | null;
}

const EmailView: React.FC<EmailViewProps> = ({ email }) => {
  const { isAnalyzing, analyzeEmail } = useEmails();
  const { setComposerState } = useUI();
  const { 
    updateLabel, confirmAiLabel, removeLabel, rejectAiLabel,
    archiveEmails, deleteEmails, junkEmails, moveToFolder, setReadStatus,
  } = useEmailActions();
  const { folders, contacts, setContacts } = useSettings();
  
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const moveMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (email) {
      analyzeEmail(email);
    }
  }, [email, analyzeEmail]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moveMenuRef.current && !moveMenuRef.current.contains(event.target as Node)) {
        setIsMoveMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const senderInfo = useMemo(() => {
    if (!email) return null;
    const senderEmailMatch = email.sender.toLowerCase();
    let matchedEmail: string | undefined;
    const contact = contacts.find(c => {
        matchedEmail = c.emails.find(e => 
            e.toLowerCase() === senderEmailMatch || 
            senderEmailMatch.includes(`<${e.toLowerCase()}>`)
        );
        return !!matchedEmail;
    });

    if (contact && matchedEmail) {
        return { name: contact.name, email: matchedEmail, isContact: true };
    }
    const match = email.sender.match(/(.*)<(.*)>/);
    if (match && match[2]) {
        return { name: match[1].trim(), email: match[2].trim(), isContact: false };
    }
    return { name: email.sender, email: email.sender, isContact: false };
  }, [email, contacts]);

  const handleAddSenderToContacts = () => {
    if (!senderInfo || senderInfo.isContact) return;
    const name = senderInfo.name === senderInfo.email 
        ? senderInfo.email.split('@')[0]
        : senderInfo.name;
    const newContact: Omit<Contact, 'id'> = { name, emails: [senderInfo.email]};
    setContacts(prev => [...prev, { ...newContact, id: `contact-${Date.now()}` }]);
  };

  if (!email) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
        <p>Select an email to read</p>
      </div>
    );
  }

  const handleAddNewLabel = () => {
    const newLabelName = prompt("Enter new label name:");
    if (newLabelName && newLabelName.trim() !== '') {
        const newId = `label-user-${Date.now()}`;
        updateLabel(email.id, newId, newLabelName);
    }
  };
  
  const ActionButton: React.FC<{ onClick?: () => void; icon: React.ElementType; children?: React.ReactNode; title: string; className?: string; }> = ({ onClick, icon: Icon, children, title, className }) => (
    <button onClick={onClick} title={title} className={`flex items-center space-x-2 p-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}>
        <Icon className="w-5 h-5" />
        {children && <span>{children}</span>}
    </button>
  );

  const userAndRuleLabels = email.labels.filter(l => l.source === 'user' || l.source === 'rule');

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900 p-6 overflow-y-auto">
      <header className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{email.subject}</h1>
            <div className="flex items-center space-x-1 flex-shrink-0 ml-4">
                <ActionButton onClick={() => setComposerState({ isOpen: true, mode: 'reply', emailToReply: email })} icon={ArrowUturnLeftIcon} title="Reply"/>
                <ActionButton onClick={() => setComposerState({ isOpen: true, mode: 'forward', emailToReply: email })} icon={ArrowUturnRightIcon} title="Forward"/>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                <ActionButton onClick={() => archiveEmails([email.id])} icon={ArchiveBoxIcon} title="Archive"/>
                <ActionButton onClick={() => junkEmails([email.id])} icon={ShieldExclamationIcon} title="Mark as Junk"/>
                <ActionButton onClick={() => deleteEmails([email.id])} icon={TrashIcon} title="Delete"/>
                {email.read ? (
                    <ActionButton onClick={() => setReadStatus([email.id], false)} icon={EnvelopeIcon} title="Mark as Unread" />
                ) : (
                    <ActionButton onClick={() => setReadStatus([email.id], true)} icon={EnvelopeOpenIcon} title="Mark as Read" />
                )}
                <div className="relative" ref={moveMenuRef}>
                    <ActionButton onClick={() => setIsMoveMenuOpen(p => !p)} icon={FolderArrowDownIcon} title="Move to folder"/>
                    {isMoveMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 z-10">
                            <ul>
                                {folders.map(folder => (
                                    <li key={folder.id}>
                                        <button 
                                            onClick={() => { moveToFolder([email.id], folder.name); setIsMoveMenuOpen(false); }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3"
                                        >
                                           <folder.icon className="w-4 h-4"/>
                                           <span>{folder.name}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
          <div>
            <span className="font-semibold">{senderInfo?.name}</span>
            {senderInfo?.name !== senderInfo?.email && <span className="ml-2 text-gray-400">&lt;{senderInfo?.email}&gt;</span>}
            {!senderInfo?.isContact && (
                <button onClick={handleAddSenderToContacts} title="Add to contacts" className="ml-2 inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    <UserPlusIcon className="w-4 h-4 mr-1"/>
                    Add
                </button>
            )}
            <span className="ml-2">to {email.recipient}</span>
          </div>
          <div className="ml-auto">
            {new Date(email.timestamp).toLocaleString()}
          </div>
        </div>
      </header>
      
      <div className="py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mr-2 flex items-center shrink-0">
                <TagIcon className="w-5 h-5 mr-1" />
                Labels:
            </h3>
            {userAndRuleLabels.length === 0 && !isAnalyzing && (
                <span className="text-xs text-gray-400">None</span>
            )}
            {userAndRuleLabels.map((label) => <AILabelPill key={label.id} label={label} onRemove={() => removeLabel(email.id, label.id)} />)}
            <button 
                onClick={handleAddNewLabel}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300"
            >
                + Add
            </button>
        </div>
      </div>
      
      {isAnalyzing && (
        <div className="flex items-center text-sm text-purple-500 mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <SparklesIcon className="w-5 h-5 mr-2 animate-pulse" />
            Analyzing email content...
        </div>
      )}

      <AIAnalysisView labels={email.labels} onConfirmLabel={(labelId) => confirmAiLabel(email.id, labelId)} onRejectLabel={(label) => rejectAiLabel(email.id, label)} />
      
      <main className="flex-grow pt-6 prose prose-sm dark:prose-invert max-w-none">
        <p>{email.body}</p>
      </main>
    </div>
  );
};

export default EmailView;
