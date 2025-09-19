import type { Email, Rule, EmailFolderName } from '../types';

export const applyRulesToEmails = (emails: Email[], rules: Rule[]): Email[] => {
  if (rules.length === 0) {
    return emails;
  }

  return emails.map(email => {
    let modifiedEmail = { ...email };
    let hasChanged = false;

    for (const rule of rules) {
      const { field, operator, value } = rule.condition;
      const emailFieldValue = modifiedEmail[field].toLowerCase();
      const ruleValue = value.toLowerCase();

      let match = false;
      if (operator === 'contains') {
        match = emailFieldValue.includes(ruleValue);
      } else if (operator === 'equals') {
        match = emailFieldValue === ruleValue;
      }

      if (match) {
        const { type, value: actionValue } = rule.action;
        if (type === 'addLabel') {
            const hasLabel = modifiedEmail.labels.some(l => l.name === actionValue);
            if (!hasLabel) {
                modifiedEmail.labels = [
                    ...modifiedEmail.labels,
                    {
                        id: `rule-${rule.id}-${modifiedEmail.id}-${actionValue}`,
                        name: actionValue,
                        confidence: 1.0,
                        source: 'rule'
                    }
                ];
                hasChanged = true;
            }
        } else if (type === 'moveToFolder') {
            if (modifiedEmail.folder !== actionValue) {
                modifiedEmail.folder = actionValue as EmailFolderName;
                hasChanged = true;
            }
        }
      }
    }
    return hasChanged ? modifiedEmail : email;
  });
};
