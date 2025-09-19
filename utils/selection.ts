import type { Email } from '../types';

/**
 * Calculates the ID of the next email to select after items are moved or deleted.
 * It intelligently selects the next available item in the list, or the previous one if the deleted item was the last.
 * @param emailList The list of emails currently being displayed.
 * @param startIndex The index of the first item in the selection that is being moved/deleted.
 * @param movedCount The number of items being moved/deleted.
 * @returns The ID of the next email to select, or null if the list becomes empty.
 */
export const getNextSelectedIdInList = (
  emailList: Email[],
  startIndex: number,
  movedCount: number,
): string | null => {
  if (emailList.length === movedCount) {
    // The entire list is being cleared.
    return null;
  }

  // Determine the next index to select.
  // We try to select the item at the same index where the moved block started.
  // If the moved block was at the end of the list, we select the new last item.
  const nextIndex = Math.min(startIndex, emailList.length - 1 - movedCount);
  
  return emailList[nextIndex]?.id || null;
};
