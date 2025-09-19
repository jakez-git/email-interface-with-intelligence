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

This application is a frontend demo and runs directly in your browser. To start it locally, you will need to use a simple web server. We provide scripts to make this easy.

### Prerequisites

1.  **A Google Gemini API Key**: The app's AI features will not work without it.
2.  **Python 3**: The start-up scripts use Python to create a simple web server. Most systems have it pre-installed. If not, download it from [python.org](https://www.python.org/downloads/).

### Step 1: Set Your API Key

The application reads your Gemini API key from an environment variable named `API_KEY`. You must set this variable in your terminal session *before* running the start script.

**For Windows (in Command Prompt):**

This command sets the key for your **current command prompt session only**.

```cmd
set API_KEY="YOUR_GEMINI_API_KEY"
```
*(Replace `YOUR_GEMINI_API_KEY` with your actual key.)*

**Important:** You must run `start.bat` from the **same command prompt window** where you ran the `set` command. Double-clicking the file will not work unless you have set `API_KEY` as a permanent system-wide environment variable.

**For macOS or Linux (in Terminal):**
```bash
export API_KEY="YOUR_GEMINI_API_KEY"
```
*(Replace `YOUR_GEMINI_API_KEY` with your actual key.)*

### Step 2: Run the Correct Start Script

We have provided scripts for different operating systems. **Please use the one that matches your system.**

**On Windows:**
From the same command prompt you used in Step 1, run the script:
```cmd
.\\start.bat
```
The script will check your setup, start the server, and automatically open the application in your browser.

**On macOS / Linux:**
First, make the script executable (you only need to do this once):
```bash
chmod +x ./start.sh
```
Then, run the script:
```bash
./start.sh
```

### Step 3: View the Application
Once the script is running, it will print a message like `Serving HTTP on ... port 8000`. You can now open your web browser and go to:

**http://localhost:8000**


## Project Structure

The project is organized to separate concerns, making it easier for both humans and AI assistants to navigate, understand, and extend the codebase.

*   `/` (root): Contains the main entry points (`index.html`, `index.tsx`) and project configuration.
*   `/components`: Contains all UI-related React components. See the `components/README.md` for a detailed breakdown.
*   `/services`: Contains modules for interacting with external APIs (like Gemini) and handling business logic separate from the UI. See the `services/README.md` for more details.
*   `/docs`: Contains high-level design and architecture documentation for the project.

This structured approach, combined with the detailed READMEs in each directory, provides a clear and unambiguous guide to the project's architecture and conventions.