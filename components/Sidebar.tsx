import React, { useMemo } from 'react';
import { useEmails } from '../hooks/useEmails';
import { useUI } from '../hooks/useUI';
import { useSettings } from '../hooks/useSettings';
import { TagIcon, PencilSquareIcon } from './icons';

const Sidebar: React.FC = () => {
  const { emails } = useEmails();
  const { folders } = useSettings();
  const { activeFilter, setActiveFilter, setSelectedEmailIds, setComposerState } = useUI();

  const uniqueLabels = useMemo(() => {
    const labelCounts: Record<string, number> = {};
    emails.forEach(email => {
        const seenLabels = new Set<string>();
        email.labels.forEach(label => {
            if (!seenLabels.has(label.name)) {
                labelCounts[label.name] = (labelCounts[label.name] || 0) + 1;
                seenLabels.add(label.name);
            }
        });
    });
    return Object.entries(labelCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));
  }, [emails]);

  const unreadFolderCounts = useMemo(() => {
    return folders.reduce((acc, folder) => {
        acc[folder.name] = emails.filter(e => e.folder === folder.name && !e.read).length;
        return acc;
    }, {} as Record<string, number>);
  }, [emails, folders]);
  
  const unreadLabelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const unreadEmails = emails.filter(e => !e.read);
    unreadEmails.forEach(email => {
      const seenLabels = new Set<string>();
      email.labels.forEach(label => {
        if (!seenLabels.has(label.name)) {
          counts[label.name] = (counts[label.name] || 0) + 1;
          seenLabels.add(label.name);
        }
      });
    });
    return counts;
  }, [emails]);

  const handleFilterChange = (filter: { type: 'folder' | 'label', name: string }) => {
    setActiveFilter(filter);
    setSelectedEmailIds([]);
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-800/50 p-2 flex flex-col overflow-y-auto">
      <div className="p-2">
        <button 
          onClick={() => setComposerState({ isOpen: true, mode: 'new' })}
          className="w-full flex items-center justify-center p-2.5 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors duration-150 shadow-sm"
        >
          <PencilSquareIcon className="w-5 h-5 mr-2" />
          Compose
        </button>
      </div>
      <nav className="mt-2">
        <ul>
          {folders.map((folder) => {
            const isSelected = activeFilter.type === 'folder' && activeFilter.name === folder.name;
            const unreadCount = unreadFolderCounts[folder.name] || 0;
            return (
              <li key={folder.id}>
                <button
                  onClick={() => handleFilterChange({ type: 'folder', name: folder.name })}
                  className={`w-full flex items-center justify-between p-2 my-1 rounded-md text-left text-sm font-medium transition-colors duration-150 ${
                    isSelected
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <folder.icon className="w-5 h-5 mr-3" />
                    <span>{folder.name}</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      isSelected 
                      ? 'bg-white text-blue-500' 
                      : 'bg-blue-500 text-white'
                    }`}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
            <TagIcon className="w-4 h-4 mr-2"/>
            Labels
        </h3>
        <nav className="mt-2">
            <ul>
                {uniqueLabels.map(label => {
                    const isSelected = activeFilter.type === 'label' && activeFilter.name === label.name;
                    const unreadCount = unreadLabelCounts[label.name] || 0;
                    return (
                        <li key={label.name}>
                             <button
                                onClick={() => handleFilterChange({ type: 'label', name: label.name })}
                                className={`w-full flex items-center justify-between p-2 my-1 rounded-md text-left text-sm font-medium transition-colors duration-150 ${
                                    isSelected
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                <span className="truncate">{label.name}</span>
                                <div className="flex items-center space-x-2">
                                    {unreadCount > 0 && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                                            isSelected 
                                            ? 'bg-white text-blue-500' 
                                            : 'bg-blue-500 text-white'
                                        }`}>
                                            {unreadCount}
                                        </span>
                                    )}
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                                        isSelected
                                        ? 'bg-white text-blue-500'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                    }`}>
                                        {label.count}
                                    </span>
                                </div>
                            </button>
                        </li>
                    )
                })}
            </ul>
        </nav>
      </div>

    </div>
  );
};

export default Sidebar;
