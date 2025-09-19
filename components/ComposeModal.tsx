import React, { useState, useEffect, useRef } from 'react';
import type { Email } from '../types';
import { XMarkIcon, PaperAirplaneIcon } from './icons';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (payload: { to: string; subject: string; body: string }, originalEmailId?: string) => void;
  mode: 'new' | 'reply' | 'forward';
  email?: Email;
}

const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose, onSend, mode, email }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      let initialBody = '';
      if (mode === 'reply' && email) {
        setTo(email.sender);
        setSubject(`Re: ${email.subject}`);
        initialBody = `\n\n--- Original Message ---\nFrom: ${email.sender}\nDate: ${new Date(email.timestamp).toLocaleString()}\nSubject: ${email.subject}\n\n${email.body}`;
      } else if (mode === 'forward' && email) {
        setTo('');
        setSubject(`Fwd: ${email.subject}`);
        initialBody = `\n\n--- Forwarded Message ---\nFrom: ${email.sender}\nDate: ${new Date(email.timestamp).toLocaleString()}\nSubject: ${email.subject}\n\n${email.body}`;
      } else { // new
        setTo('');
        setSubject('');
        initialBody = '';
      }
      setBody(initialBody);

      // For reply and forward, auto-focus the textarea and place the cursor at the top.
      if (mode === 'reply' || mode === 'forward') {
        setTimeout(() => {
          if (bodyTextareaRef.current) {
            bodyTextareaRef.current.focus();
            bodyTextareaRef.current.setSelectionRange(0, 0);
          }
        }, 100); // A small delay ensures the element is ready.
      }
    }
  }, [isOpen, mode, email]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (to.trim() && subject.trim()) {
      onSend({ to, subject, body }, (mode === 'reply' || mode === 'forward') ? email?.id : undefined);
    } else {
      alert("Please fill in the 'To' and 'Subject' fields.");
    }
  };

  const getTitle = () => {
      switch(mode) {
          case 'reply': return 'Reply to Email';
          case 'forward': return 'Forward Email';
          default: return 'New Email';
      }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl mx-4 transform transition-all flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{getTitle()}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </header>
        
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
            <input type="email" id="to" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 block w-full p-2 border rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
            <input type="text" id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 block w-full p-2 border rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Body</label>
            <textarea 
              id="body" 
              ref={bodyTextareaRef}
              value={body} 
              onChange={(e) => setBody(e.target.value)} 
              rows={10} 
              className="mt-1 block w-full p-2 border rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 font-sans"
            ></textarea>
          </div>
        </div>

        <footer className="flex justify-end items-center p-4 border-t dark:border-gray-700 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 text-sm font-medium flex items-center space-x-2"
          >
            <PaperAirplaneIcon className="w-5 h-5"/>
            <span>Send</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ComposeModal;