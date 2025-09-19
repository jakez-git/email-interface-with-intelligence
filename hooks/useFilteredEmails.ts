import { useMemo } from 'react';
import type { Email, FilterCondition } from '../types';
import { useEmails } from './useEmails';
import { useUI } from './useUI';

export const useFilteredEmails = (): Email[] => {
  const { emails } = useEmails();
  const { activeFilter, sortConfig, filterConditions, filterLogic } = useUI();

  return useMemo(() => {
    let baseFiltered: Email[];

    if (activeFilter.type === 'folder') {
        baseFiltered = emails.filter(email => email.folder === activeFilter.name);
    } else { // 'label'
        baseFiltered = emails.filter(email => email.labels.some(l => l.name === activeFilter.name));
    }
    
    let advancedFiltered = baseFiltered;
    if (filterConditions.length > 0) {
        advancedFiltered = baseFiltered.filter(email => {
            const checkCondition = (condition: FilterCondition): boolean => {
                const { field, operator, value } = condition;
                const val = value.toLowerCase();
                switch (field) {
                    case 'sender':
                    case 'subject':
                        const emailVal = email[field].toLowerCase();
                        if (operator === 'contains') return emailVal.includes(val);
                        if (operator === 'not-contains') return !emailVal.includes(val);
                        if (operator === 'equals') return emailVal === val;
                        if (operator === 'not-equals') return emailVal !== val;
                        return false;
                    case 'labelName':
                        return email.labels.some(l => l.name.toLowerCase().includes(val));
                    case 'labelConfidence':
                        const numValue = parseFloat(value) / 100;
                        if (isNaN(numValue)) return false;
                        return email.labels.some(l => {
                            if (operator === '>') return l.confidence > numValue;
                            if (operator === '<') return l.confidence < numValue;
                            return false;
                        });
                    default: return false;
                }
            };
            if (filterLogic === 'AND') return filterConditions.every(checkCondition);
            else return filterConditions.some(checkCondition);
        });
    }

    return [...advancedFiltered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        if (typeof aVal === 'string' && typeof bVal === 'string') return aVal.localeCompare(bVal) * direction;
        if (typeof aVal === 'boolean' && typeof bVal === 'boolean') return (aVal === bVal ? 0 : aVal ? -1 : 1) * direction;
        if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * direction;
        return (new Date(bVal as string).getTime() - new Date(aVal as string).getTime()) * (sortConfig.key === 'timestamp' ? direction : 1);
    });
  }, [emails, activeFilter, sortConfig, filterConditions, filterLogic]);
};
