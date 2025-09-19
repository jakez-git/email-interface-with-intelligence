# /reducers

This directory contains reducer functions for managing complex state logic within the application, following the `useReducer` pattern.

## Purpose

The purpose of this folder is to co-locate state transition logic. Reducers take the current state and an action, and return the new state. This pattern helps to:

1.  **Centralize Logic**: Instead of scattering state updates across many different handler functions in a component, the logic for each type of update is managed in one place.
2.  **Improve Predictability**: State transitions become more explicit and easier to trace, which simplifies debugging.
3.  **Decouple State from UI**: It separates the "what happened" (the action) from the "how it changes" (the reducer logic), cleaning up the main component files.
4.  **Enhance Testability**: Reducers are pure functions, making them straightforward to unit test without needing to render components.

## Reducer Inventory

*   `emailReducer.ts`: Manages the entire lifecycle of the `emails` state array, including setting, updating, moving, and labeling emails.

## Where to Add New Files

If another piece of state in the application becomes sufficiently complex (e.g., managing editor state for the composer), a new reducer file like `composerReducer.ts` could be added here.
