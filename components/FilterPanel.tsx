import React from 'react';
import type { FilterCondition, FilterLogic } from '../App';
import { XMarkIcon, PlusIcon, TrashIcon } from './icons';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  conditions: FilterCondition[];
  logic: FilterLogic;
  onConditionsChange: (conditions: FilterCondition[]) => void;
  onLogicChange: (logic: FilterLogic) => void;
}

const fieldOptions: { value: FilterCondition['field']; label: string }[] = [
  { value: 'sender', label: 'Sender' },
  { value: 'subject', label: 'Subject' },
  { value: 'labelName', label: 'Label Name' },
  { value: 'labelConfidence', label: 'Label Confidence (%)' },
];

const operatorOptions: Record<FilterCondition['field'], { value: FilterCondition['operator']; label: string }[]> = {
  sender: [
    { value: 'contains', label: 'contains' },
    { value: 'not-contains', label: 'does not contain' },
    { value: 'equals', label: 'is' },
    { value: 'not-equals', label: 'is not' },
  ],
  subject: [
    { value: 'contains', label: 'contains' },
    { value: 'not-contains', label: 'does not contain' },
    { value: 'equals', label: 'is' },
    { value: 'not-equals', label: 'is not' },
  ],
  labelName: [
    { value: 'contains', label: 'contains' },
  ],
  labelConfidence: [
    { value: '>', label: '>' },
    { value: '<', label: '<' },
  ],
};


const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  conditions,
  logic,
  onConditionsChange,
  onLogicChange,
}) => {
  if (!isOpen) return null;

  const handleUpdateCondition = (index: number, field: keyof FilterCondition, value: any) => {
    const newConditions = [...conditions];
    const oldCondition = newConditions[index];
    newConditions[index] = { ...oldCondition, [field]: value };

    // If field changed, reset operator to the first valid one
    if (field === 'field') {
        newConditions[index].operator = operatorOptions[value as FilterCondition['field']][0].value;
    }
    
    onConditionsChange(newConditions);
  };

  const handleAddCondition = () => {
    onConditionsChange([
      ...conditions,
      {
        id: `filter-${Date.now()}`,
        field: 'sender',
        operator: 'contains',
        value: '',
      },
    ]);
  };

  const handleRemoveCondition = (index: number) => {
    onConditionsChange(conditions.filter((_, i) => i !== index));
  };
  
  const handleClear = () => {
      onConditionsChange([]);
      onLogicChange('AND');
  };

  return (
    <div className="absolute top-14 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border dark:border-gray-700 w-full max-w-lg z-20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Advanced Filters</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Logic Toggle */}
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Match:</span>
            <div className="flex rounded-md bg-gray-100 dark:bg-gray-700 p-0.5">
                <button onClick={() => onLogicChange('AND')} className={`px-3 py-1 text-sm rounded-md transition-all ${logic === 'AND' ? 'bg-white dark:bg-gray-900 shadow' : 'text-gray-600 dark:text-gray-300'}`}>All (AND)</button>
                <button onClick={() => onLogicChange('OR')} className={`px-3 py-1 text-sm rounded-md transition-all ${logic === 'OR' ? 'bg-white dark:bg-gray-900 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Any (OR)</button>
            </div>
        </div>

        {/* Conditions */}
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {conditions.map((cond, index) => (
                <div key={cond.id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                   <select value={cond.field} onChange={e => handleUpdateCondition(index, 'field', e.target.value)} className="p-1.5 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 w-1/3">
                       {fieldOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                   </select>
                   <select value={cond.operator} onChange={e => handleUpdateCondition(index, 'operator', e.target.value)} className="p-1.5 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 w-auto">
                       {operatorOptions[cond.field].map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                   </select>
                   <input 
                    type={cond.field === 'labelConfidence' ? 'number' : 'text'}
                    placeholder={cond.field === 'labelConfidence' ? 'e.g., 80' : 'Value...'}
                    value={cond.value}
                    onChange={e => handleUpdateCondition(index, 'value', e.target.value)} 
                    className="flex-grow p-1.5 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                   />
                   <button onClick={() => handleRemoveCondition(index)} className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                        <TrashIcon className="w-4 h-4 text-red-500" />
                   </button>
                </div>
            ))}
        </div>

        <button onClick={handleAddCondition} className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 text-sm border-2 border-dashed rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-600 text-gray-500 dark:text-gray-400">
            <PlusIcon className="w-4 h-4" />
            <span>Add Condition</span>
        </button>

        <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
            <button onClick={handleClear} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Clear All
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 text-sm">
                Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;