# AI Integration with Google Gemini

This document explains how the application integrates with the Google Gemini API to provide its intelligent features.

## 1. AI-Powered Label Suggestion

The core AI feature is the ability to suggest relevant labels for an email's content.

*   **Service**: `services/geminiService.ts`
*   **Function**: `analyzeEmailForLabels(emailBody: string)`

### How It Works

1.  **Prompting**: When an email is selected, its body is sent to the Gemini API (`gemini-2.5-flash` model) with a carefully crafted prompt. The prompt instructs the model to act as an email classifier and return a list of up to 15 relevant labels with confidence scores.
2.  **Structured Output (JSON)**: To ensure a reliable response, the API call specifies a `responseMimeType` of `application/json` and provides a `responseSchema`. This forces the model to return its suggestions in a predictable JSON format:
    ```json
    {
      "labels": [
        { "name": "Finance", "confidence": 0.98 },
        { "name": "Invoice", "confidence": 0.95 },
        ...
      ]
    }
    ```
3.  **Display**: The returned labels are then displayed in the `AIAnalysisView` component within the `EmailView`. They are visually distinct (purple, with a sparkles icon) and show their confidence scores.

## 2. User Feedback & Training Data Loop

To enable the AI to improve over time, the application collects training data based on user interactions.

*   **State Management**: `trainingData` state in `App.tsx`.
*   **Triggering Actions**:
    *   **Confirming an AI Label**: When a user clicks the "+" button on a suggested label, it's converted to a 'user' label, and a `positive` feedback entry is created.
    *   **Rejecting an AI Label**: Clicking the "-" button removes the label and creates a `negative` feedback entry.
    *   **Manually Adding a Label**: A user adding a new label creates a `positive` feedback entry.
    *   **Removing a User Label**: A user removing a label they previously added or confirmed creates a `negative` feedback entry.
*   **Data Structure**: Each feedback item is stored in the `trainingData` array with the email body, the label name, and the feedback type (`positive` or `negative`).
*   **Purpose**: In a real-world application, this collected `TrainingData` would be periodically used to fine-tune the AI model, making its future suggestions more accurate and personalized to the user's habits. This demo application implements the collection part of the loop.

## 3. Automated Junk Mail Filtering

The AI is also used to proactively identify potential spam or junk mail.

*   **Configuration**: The `JunkMailManager` in the Settings modal allows the user to enable/disable this feature and set a **confidence threshold** (e.g., 90%).
*   **Logic**:
    1.  The `geminiService` prompt includes "Junk" and "Spam" as potential labels.
    2.  After the AI analyzes an email, the logic in `App.tsx` checks if the AI returned a "Junk" or "Spam" label.
    3.  If it did, and its confidence score is *above* the user-defined threshold, the application automatically adds a "Junk" label to that email.
    4.  Users can then create a simple rule (e.g., "If email has label 'Junk', move to 'Spam' folder") to complete the automated filtering process.
