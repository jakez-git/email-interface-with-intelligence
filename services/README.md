# /services

This directory contains modules responsible for handling side effects and business logic that is independent of the UI.

## Purpose

The service layer acts as an abstraction between the application's UI (the React components) and external systems or complex internal logic. This separation of concerns makes the application easier to test, maintain, and reason about.

**You should place code here if it:**
*   Interacts with an external API (e.g., fetching data, calling the Gemini AI).
*   Implements complex, pure business logic that can be decoupled from the UI (e.g., applying a set of rules to data).
*   Handles data transformations or processing.

**Code in this directory should NOT:**
*   Import React or any UI components.
*   Directly manipulate the DOM.
*   Contain any JSX.

## Service Inventory

*   `geminiService.ts`: Contains all logic for interacting with the Google Gemini API. This includes formatting prompts, sending requests for email analysis, and parsing the JSON response.
*   `ruleService.ts`: A pure function module that takes a list of emails and a list of rules, and returns the modified list of emails. It contains no external dependencies or side effects.
*   `emailService.ts`: A **mock** service that simulates fetching emails from a server. In a real-world application, this file would contain the logic to connect to an email backend via IMAP/POP3 or a REST API.

## Where to Add New Files

*   **New API Integration**: If you need to integrate with a new external service (e.g., a calendar API), create a new file named `calendarService.ts` in this directory.
*   **New Business Logic**: If you have a new set of complex, reusable functions (e.g., for parsing ICS calendar files), you could create a `parsingService.ts` or a more specifically named file here.
