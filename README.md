# AI Email Assistant

This is an intelligent email client that uses the Google Gemini API to automatically categorize and label your emails. It simulates the functionality of a modern desktop email application, providing a familiar interface for managing your inbox while leveraging the power of AI for smart organization.

## Key Features

*   **AI-Powered Labeling**: Automatically suggests labels for incoming emails based on their content.
*   **User Feedback Loop**: Learns from your corrections. When you accept, reject, or manually add a label, this action is logged as training data to improve future suggestions.
*   **Automated Rules Engine**: Create custom rules to automatically label emails or move them to specific folders (e.g., "If sender contains 'billing', add 'Finance' label").
*   **Junk/Spam Filtering**: Uses AI with a configurable confidence threshold to identify and label junk mail.
*   **Contact Management**: Recognizes known contacts and allows for quickly adding new ones.
*   **Modern UI**: A responsive, dark-mode compatible interface built with React and Tailwind CSS.
*   **Advanced Filtering & Sorting**: Powerful tools to find the exact emails you're looking for.

## How to Run

This application is designed to be run locally from the source files using a simple web server.

### Prerequisites

*   **Python 3**: A local web server is started using Python's built-in `http.server` module. Most macOS and Linux systems have it pre-installed. You can download it from [python.org](https://www.python.org/downloads/).
*   **Gemini API Key**: The application requires a Google Gemini API key to function.

### 1. Set Environment Variable

You must set the `API_KEY` environment variable to your Google Gemini API key.

**On macOS / Linux:**
```bash
export API_KEY="YOUR_GEMINI_API_KEY"
```
*(You may want to add this line to your `.bashrc`, `.zshrc`, or shell profile file to make it permanent.)*

**On Windows (Command Prompt):**
```cmd
set API_KEY="YOUR_GEMINI_API_KEY"
```

**On Windows (PowerShell):**
```powershell
$env:API_KEY="YOUR_GEMINI_API_KEY"
```

### 2. Run the Start Script

After setting the API key, run the appropriate script for your operating system from the project's root directory.

**On macOS / Linux:**
```bash
# Make the script executable (only needed once)
chmod +x ./start.sh

# Run the script
./start.sh
```

**On Windows:**
```cmd
# Double-click start.bat or run it from the command line
.\start.bat
```

The script will start a local web server, and you can access the application by navigating to **`http://localhost:8000`** in your web browser.

## Project Structure

The project is organized to separate concerns, making it easier for both humans and AI assistants to navigate, understand, and extend the codebase.

*   `/` (root): Contains the main entry points (`index.html`, `index.tsx`) and project configuration.
*   `/components`: Contains all UI-related React components. See the `components/README.md` for a detailed breakdown.
*   `/services`: Contains modules for interacting with external APIs (like Gemini) and handling business logic separate from the UI. See the `services/README.md` for more details.
*   `/docs`: Contains high-level design and architecture documentation for the project.

This structured approach, combined with the detailed READMEs in each directory, provides a clear and unambiguous guide to the project's architecture and conventions.