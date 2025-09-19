import { useCallback } from 'react';
import { useEmails } from './useEmails';
import { useUI } from './useUI';
import { useFilteredEmails } from './useFilteredEmails';
import { getNextSelectedIdInList } from '../utils/selection';
import type { Email, EmailFolderName, Label } from '../types';
import { FOLDER_NAMES } from '../constants';
import { useSettings } from './useSettings';

export const useEmailActions = () => {
    const { emails, dispatchEmails, trainingData, setTrainingData } = useEmails();
    const { accounts } = useSettings();
    const { selectedEmailIds, setSelectedEmailIds, setActiveFilter, setComposerState } = useUI();
    const filteredAndSortedEmails = useFilteredEmails();

    const handleSelectionAfterAction = useCallback((ids: string[]) => {
        if (selectedEmailIds.length > 0 && selectedEmailIds.every(id => ids.includes(id))) {
            const firstIdToMove = selectedEmailIds[0];
            const currentIndex = filteredAndSortedEmails.findIndex(e => e.id === firstIdToMove);
            if (currentIndex > -1) {
                const nextId = getNextSelectedIdInList(filteredAndSortedEmails, currentIndex, ids.length);
                setSelectedEmailIds(nextId ? [nextId] : []);
            } else {
                setSelectedEmailIds([]);
            }
        } else {
            setSelectedEmailIds(prev => prev.filter(id => !ids.includes(id)));
        }
    }, [selectedEmailIds, filteredAndSortedEmails, setSelectedEmailIds]);

    const setReadStatus = useCallback((ids: string[], read: boolean) => {
        dispatchEmails({ type: 'SET_READ_STATUS', payload: { ids, read } });
    }, [dispatchEmails]);

    const moveToFolder = useCallback((ids: string[], folder: EmailFolderName) => {
        handleSelectionAfterAction(ids);
        dispatchEmails({ type: 'MOVE_TO_FOLDER', payload: { ids, folder } });
    }, [dispatchEmails, handleSelectionAfterAction]);

    const deleteEmails = useCallback((ids: string[]) => {
        moveToFolder(ids, FOLDER_NAMES.TRASH);
    }, [moveToFolder]);

    const archiveEmails = useCallback((ids: string[]) => {
        setReadStatus(ids, true);
        moveToFolder(ids, FOLDER_NAMES.ARCHIVE);
    }, [setReadStatus, moveToFolder]);

    const junkEmails = useCallback((ids: string[]) => {
        handleSelectionAfterAction(ids);
        dispatchEmails({ type: 'ADD_JUNK_LABEL_AND_MOVE', payload: { ids } });
    }, [dispatchEmails, handleSelectionAfterAction]);
    
    const emptyTrash = useCallback(() => {
        dispatchEmails({ type: 'EMPTY_TRASH' });
        setSelectedEmailIds([]);
    }, [dispatchEmails, setSelectedEmailIds]);

    const sendEmail = useCallback((payload: { to: string; subject: string; body: string; }, originalEmailId?: string) => {
        const newEmail: Email = {
            id: `email-${Date.now()}`,
            sender: accounts[0]?.emailAddress || 'user@example.com',
            recipient: payload.to,
            subject: payload.subject,
            body: payload.body,
            timestamp: new Date().toISOString(),
            read: true,
            folder: FOLDER_NAMES.SENT,
            labels: [],
        };
        
        if (originalEmailId) {
            dispatchEmails({ type: 'SET_READ_STATUS', payload: { ids: [originalEmailId], read: true } });
        }
        dispatchEmails({ type: 'ADD_EMAIL', payload: newEmail });
    
        setComposerState({ isOpen: false, mode: 'new' });
        setActiveFilter({ type: 'folder', name: FOLDER_NAMES.SENT });
        setSelectedEmailIds([newEmail.id]);
    }, [accounts, dispatchEmails, setComposerState, setActiveFilter, setSelectedEmailIds]);

    const updateLabel = (emailId: string, labelId: string, newName: string) => {
        const emailToUpdate = emails.find(e => e.id === emailId);
        if (!emailToUpdate) return;
        
        const newLabelName = newName.trim();
        if (!newLabelName) return;
    
        const labelNameExists = emailToUpdate.labels.some(l => l.name.toLowerCase() === newLabelName.toLowerCase() && l.id !== labelId);
        if(labelNameExists) return;
    
        const existingLabelIndex = emailToUpdate.labels.findIndex(l => l.id === labelId);
        const updatedLabels = [...emailToUpdate.labels];
        
        if (existingLabelIndex > -1) {
            updatedLabels[existingLabelIndex] = { ...updatedLabels[existingLabelIndex], name: newLabelName, confidence: 1, source: 'user' };
        } else {
            updatedLabels.push({ id: labelId, name: newLabelName, confidence: 1, source: 'user' });
        }
        
        dispatchEmails({ type: 'UPDATE_LABELS', payload: { emailId, labels: updatedLabels } });
    
        setTrainingData(prev => [...prev, {
            id: `td-${Date.now()}`,
            emailBody: emailToUpdate.body,
            label: newLabelName,
            feedback: 'positive',
            timestamp: new Date().toISOString()
        }]);
    };
    
    const confirmAiLabel = (emailId: string, labelId: string) => {
        const emailToUpdate = emails.find(e => e.id === emailId);
        if (!emailToUpdate) return;
    
        const updatedLabels = emailToUpdate.labels.map(label => 
          label.id === labelId ? { ...label, source: 'user' as const, confidence: 1.0 } : label
        );
        dispatchEmails({ type: 'UPDATE_LABELS', payload: { emailId, labels: updatedLabels } });
        
        const confirmedLabel = updatedLabels.find(l => l.id === labelId);
        if(confirmedLabel) {
            setTrainingData(prev => [...prev, {
                id: `td-${Date.now()}`,
                emailBody: emailToUpdate.body,
                label: confirmedLabel.name,
                feedback: 'positive',
                timestamp: new Date().toISOString()
            }]);
        }
    };

    const removeLabel = (emailId: string, labelId: string) => {
        const emailToUpdate = emails.find(e => e.id === emailId);
        if (!emailToUpdate) return;
    
        const removedLabel = emailToUpdate.labels.find(l => l.id === labelId);
        if (removedLabel && (removedLabel.source === 'user' || removedLabel.source === 'ai')) {
             setTrainingData(prev => [...prev, {
                id: `td-neg-${Date.now()}`,
                emailBody: emailToUpdate.body,
                label: removedLabel.name,
                feedback: 'negative',
                timestamp: new Date().toISOString()
            }]);
        }
        const updatedLabels = emailToUpdate.labels.filter(l => l.id !== labelId);
        dispatchEmails({ type: 'UPDATE_LABELS', payload: { emailId, labels: updatedLabels } });
    };

    const rejectAiLabel = (emailId: string, label: Label) => {
        const emailToUpdate = emails.find(e => e.id === emailId);
        if (!emailToUpdate) return;
        
        const updatedLabels = emailToUpdate.labels.filter(l => l.id !== label.id);
        dispatchEmails({ type: 'UPDATE_LABELS', payload: { emailId, labels: updatedLabels } });
        
        setTrainingData(prev => [...prev, {
            id: `td-neg-${Date.now()}`,
            emailBody: emailToUpdate.body,
            label: label.name,
            feedback: 'negative',
            timestamp: new Date().toISOString()
        }]);
    };

    return {
        setReadStatus,
        moveToFolder,
        deleteEmails,
        archiveEmails,
        junkEmails,
        emptyTrash,
        sendEmail,
        updateLabel,
        confirmAiLabel,
        removeLabel,
        rejectAiLabel
    };
};
