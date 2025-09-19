# Application Architecture

This document provides a high-level overview of the AI Email Assistant's architecture, data flow, and key design principles.

## Core Principles

*   **Centralized State Management**: Most application state is managed within the root `App.tsx` component. This creates a single source of truth and simplifies state tracking.
*   **Reducer for Complex State**: For complex state logic, such as managing the collection of emails, we use React's `useReducer` hook. This centralizes all the business logic for state transitions into a single, pure `reducer` function, making the `App` component cleaner and the state changes more predictable.
*   **Unidirectional Data Flow**: Data flows "down" from the main `App.tsx` component to child components via props.
*   **Component-Based UI**: The user interface is broken down into modular, reusable React components, each with a specific responsibility.
*   **Service Layer Abstraction**: External interactions, such as API calls or complex business logic, are handled in a separate `services` layer to keep UI components clean and focused.

## State Management

The primary state is held in `App.tsx` using React hooks (`useState`, `useReducer`, `useMemo`, `useCallback`).

*   `emails` (via `useReducer`): The master list of all emails, managed by `emailReducer.ts`. All modifications (deleting, labeling, moving) are handled by dispatching actions to this reducer.
*   `rules`, `contacts`, `accounts`: Simpler state for user-configured settings, managed with `useState`.
*   `activeFilter`, `selectedEmailIds`, `sortConfig`: UI state that determines which emails are displayed and how.

Child components receive slices of this state as props. They communicate user actions back up to `App.tsx` through callback functions, which then `dispatch` actions to the reducer or update state via `setState`.

## Data Flow Diagram

The following diagram illustrates the relationship between components and the flow of data and actions using the reducer pattern.

```mermaid
graph TD
    subgraph "State & Logic (in App.tsx)"
        A[React State (emails, rules, etc.)]
        R[Email Reducer]
        D[Dispatch Function]
    end

    subgraph "UI Components"
        C[Sidebar, EmailList, EmailView, etc.]
    end

    subgraph "Services & Utils"
        S[geminiService, ruleService]
        U[Utility Functions]
    end

    A -- "State passed as props" --> C
    C -- "User Action triggers callback" --> D
    D -- "Dispatches Action Object" --> R
    R -- "Returns New State" --> A

    A -- "Calls service for side-effects" --> S
    A -- "Uses utility for pure logic" --> U
```
