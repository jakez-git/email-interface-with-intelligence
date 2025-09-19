import React, { useState } from 'react';
import type { Email, EmailFolderName } from '../types';
import { useFilteredEmails } from '../hooks/useFilteredEmails';
import { useUI } from '../hooks/useUI';
import { useEmailActions } from '../hooks/useEmailActions';
import { useSettings } from '../hooks/useSettings';
import { FunnelIcon, ArrowUpIcon, ArrowDownIcon, TrashIcon, ArchiveBoxIcon, EnvelopeIcon, EnvelopeOpenIcon, FolderArrowDownIcon, ShieldExclamationIcon } from './icons';

interface EmailListItemProps {
    email: Email, 
    isSelected: boolean, 
    onSelect: (id: string, isCheckbox: boolean, shiftKey: boolean) => void
}

const EmailListItem: React.FC<EmailListItemProps> = ({ email, isSelected, onSelect }) => {
    const date = new Date(email.timestamp);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isToday = date.toDateString() === new Date().toDateString();
    const formattedDate = isToday ? time : date.toLocaleDateString([], { month: 'short', day: 'numeric' });

    return (
        <li
            onClick={() => onSelect(email.id, false, false)}
            className={`flex items-center cursor-pointer p-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-150 ${
                isSelected ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            } ${!email.read ? 'bg-white dark:bg-gray-800/80' : ''}`}
        >
            <input 
                type="checkbox" 
                checked={isSelected}
                onClick={(e) => { e.stopPropagation(); onSelect(email.id, true, e.nativeEvent.shiftKey); }}
                onChange={() => {}} // Suppress warning, logic is in onClick
                className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="min-w-0 flex-grow">
                <div className="flex justify-between items-start">
                    <div className="flex items-center min-w-0">
                        {!email.read && <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>}
                        <h3 className={`text-sm font-semibold truncate ${!email.read ? 'text-gray-900 dark:text-gray-50' : 'text-gray-600 dark:text-gray-300'}`}>
                            {email.sender}
                        </h3>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">{formattedDate}</p>
                </div>
                <p className={`text-sm truncate mt-1 ${!email.read ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                    {email.subject}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                    {email.body}
                </p>
            </div>
        </li>
    );
};

const EmailList: React.FC = () => {
  const emails = useFilteredEmails();
  const { selectedEmailIds, setSelectedEmailIds, sortConfig, setSortConfig, activeFilter, setIsFilterPanelOpen } = useUI();
  const { setReadStatus, archiveEmails, deleteEmails, junkEmails, moveToFolder, emptyTrash } = useEmailActions();
  const { folders } = useSettings();
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string, isCheckbox: boolean, shiftKey: boolean) => {
    const currentIndex = emails.findIndex(e => e.id === id);
    if (shiftKey && lastSelectedId) {
        const lastIndex = emails.findIndex(e => e.id === lastSelectedId);
        const start = Math.min(currentIndex, lastIndex);
        const end = Math.max(currentIndex, lastIndex);
        const rangeIds = emails.slice(start, end + 1).map(e => e.id);
        const newSelectedIds = new Set([...selectedEmailIds, ...rangeIds]);
        setSelectedEmailIds(Array.from(newSelectedIds));
    } else if (isCheckbox) {
        const newSelected = new Set(selectedEmailIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedEmailIds(Array.from(newSelected));
    } else {
        setSelectedEmailIds([id]);
    }
    setLastSelectedId(id);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedEmailIds(emails.map(email => email.id));
    } else {
        setSelectedEmailIds([]);
    }
  };
  
  const handleSortChange = (key: string) => {
    setSortConfig(prev => ({ 
        key: key as typeof prev.key, 
        direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' 
    }));
  };

  const isAllSelected = emails.length > 0 && selectedEmailIds.length === emails.length;
  
  const BulkActionToolbar = () => (
    <div className="p-2 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
      <div className="flex items-center">
        <input 
          type="checkbox" 
          checked={isAllSelected}
          onChange={handleSelectAll}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="ml-3 text-sm font-medium">{selectedEmailIds.length} selected</span>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={() => setReadStatus(selectedEmailIds, true)} title="Mark as Read" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><EnvelopeOpenIcon className="w-5 h-5"/></button>
        <button onClick={() => setReadStatus(selectedEmailIds, false)} title="Mark as Unread" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><EnvelopeIcon className="w-5 h-5"/></button>
        <button onClick={() => archiveEmails(selectedEmailIds)} title="Archive" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ArchiveBoxIcon className="w-5 h-5"/></button>
        <button onClick={() => junkEmails(selectedEmailIds)} title="Mark as Junk" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ShieldExclamationIcon className="w-5 h-5"/></button>
        <button onClick={() => deleteEmails(selectedEmailIds)} title="Delete" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><TrashIcon className="w-5 h-5"/></button>
        <select onChange={(e) => moveToFolder(selectedEmailIds, e.target.value as EmailFolderName)} className="text-xs p-1 rounded bg-gray-200 dark:bg-gray-700 border-none focus:ring-0">
            <option>Move to...</option>
            {folders.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
        </select>
      </div>
    </div>
  );

  const DefaultToolbar = () => {
    const sortOptions = [
        { key: 'timestamp', label: 'Date' },
        { key: 'read', label: 'Read Status' },
        { key: 'sender', label: 'Sender' }
    ];
    return (
      <div className="p-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
             <select 
                value={sortConfig.key} 
                onChange={e => handleSortChange(e.target.value)}
                className="text-sm font-medium text-gray-700 dark:text-gray-200 bg-transparent dark:bg-gray-800 focus:outline-none focus:ring-0 border-none"
             >
                 {sortOptions.map(opt => <option key={opt.key} value={opt.key} className="dark:bg-gray-700 font-medium">{opt.label}</option>)}
             </select>
            <button onClick={() => handleSortChange(sortConfig.key)} className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                {sortConfig.direction === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
            </button>
        </div>
        <button onClick={() => setIsFilterPanelOpen(p => !p)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    );
  };
  
  const TrashToolbar = () => (
      <div className="p-2 flex-shrink-0">
          <button
            onClick={emptyTrash}
            className="w-full text-sm text-red-600 dark:text-red-400 font-semibold p-2 rounded-md bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center justify-center space-x-2">
            <TrashIcon className="w-4 h-4" />
            <span>Empty Trash Now</span>
          </button>
      </div>
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <div className="border-b border-gray-200 dark:border-gray-700">
        {activeFilter.type === 'folder' && activeFilter.name === 'Trash' && emails.length > 0 && <TrashToolbar />}
        {selectedEmailIds.length > 0 ? <BulkActionToolbar /> : <DefaultToolbar />}
      </div>
      {emails.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4 text-center">
            <p>No emails found.</p>
        </div>
      ) : (
        <div className="h-full overflow-y-auto">
          <ul>
            {emails.map((email) => (
                <EmailListItem 
                    key={email.id} 
                    email={email}
                    isSelected={selectedEmailIds.includes(email.id)}
                    onSelect={handleSelect}
                />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EmailList;
