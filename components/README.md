# /components

This directory contains all the React components that make up the user interface of the AI Email Assistant.

## Purpose

The primary purpose of this folder is to organize all UI-rendering logic into modular, reusable, and maintainable pieces.

## Design Principles

1.  **Component Modularity**: Each component has a single, well-defined responsibility. For example, `EmailList` is only responsible for displaying a list of emails, while `EmailView` is responsible for displaying the content of one email.
2.  **Stateless as Possible**: Components should be as "dumb" or presentational as possible. They receive data and configuration via `props` and render the UI accordingly. Complex application state is "lifted up" to the `App.tsx` component.
3.  **Unidirectional Data Flow**: Data flows down from `App.tsx` to child components. Components do not modify props directly.
4.  **Callbacks for Events**: When a user interacts with a component (e.g., clicks a button), the component invokes a callback function (like `onDelete`) passed down through its props to notify the parent component of the action.

## Component Inventory

*   `Sidebar.tsx`: The main navigation panel on the left, for selecting folders and labels.
*   `EmailList.tsx`: The middle panel that displays a list of emails for the currently active filter. Includes sorting and bulk action controls.
*   `EmailView.tsx`: The main content panel that shows the full body of a selected email and allows for actions like replying, forwarding, and labeling.
*   `SettingsModal.tsx`: A comprehensive modal with multiple tabs for managing application settings like rules, accounts, and contacts.
*   `ComposeModal.tsx`: A modal for composing new emails, replying, or forwarding.
*   `FilterPanel.tsx`: A pop-over panel for creating advanced, multi-condition filters.
*   `icons.tsx`: A utility file containing all SVG icons used throughout the application as React components.

## Where to Add New Files

*   **New UI Component**: If you are creating a new piece of UI (e.g., a `CalendarView`), create a new file `MyNewComponent.tsx` directly inside this `/components` folder.
*   **New Icon**: If you need a new SVG icon, add it as a new exported functional component in `icons.tsx`.
