# Voice-Enabled Task Tracker

A full-stack task management application with intelligent voice input capabilities. Create tasks by speaking naturally, and the system will automatically extract task details like title, description, due date, priority, and status.

## Overview

This application allows users to manage tasks through both manual input and voice commands. The voice input feature uses AI to parse natural language and extract structured task information, making task creation faster and more intuitive.

## Features

### Core Features

- **Task Management**: Create, read, update, and delete tasks
- **Dual View Modes**:
  - Kanban board view with drag-and-drop
  - List view with detailed table
- **Voice Input**: Create tasks by speaking naturally
- **Intelligent Parsing**: AI-powered extraction of task details from voice input
- **Filtering & Search**: Filter by status, priority, due date, and search by title/description

### Voice Input Features

- Speech-to-text using Web Speech API
- AI-powered parsing of natural language
- Review and edit parsed data before saving
- Support for relative dates ("tomorrow", "next Monday", "in 3 days")
- Priority detection from keywords

## Tech Stack

### Frontend

- **React** 18.2.0
- **Redux Toolkit** for state management
- **React Router** for navigation
- **React Beautiful DnD** for drag-and-drop
- **Axios** for API calls
- **date-fns** for date formatting
- **Web Speech API** for speech-to-text

### Backend

- **Node.js** with **Express**
- **MongoDB** with **Mongoose**
- **OpenAI API** (GPT-4o-mini) for intelligent parsing
- **express-validator** for input validation
- **CORS** for cross-origin requests

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- OpenAI API key
- Modern browser with Web Speech API support (Chrome, Edge, Safari)

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd voice-task-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/voice-task-tracker
OPENAI_API_KEY=your_openai_api_key_here
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Database Setup

Make sure MongoDB is running. If using MongoDB Atlas, update the `MONGODB_URI` in the backend `.env` file.

### 5. Running the Application

**Start the backend:**

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

**Start the frontend:**

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Endpoints

#### Tasks

**GET /tasks**

- Get all tasks with optional filters
- Query parameters:
  - `status`: Filter by status (To Do, In Progress, Done)
  - `priority`: Filter by priority (Low, Medium, High, Critical)
  - `search`: Search in title and description
  - `dueDate`: Filter by due date (ISO 8601 format)
- Response: Array of task objects

**GET /tasks/:id**

- Get a single task by ID
- Response: Task object

**POST /tasks**

- Create a new task
- Request body:

```json
{
  "title": "Task title",
  "description": "Task description",
  "status": "To Do",
  "priority": "Medium",
  "dueDate": "2024-01-15T18:00:00.000Z"
}
```

- Response: Created task object

**PUT /tasks/:id**

- Update a task
- Request body: Same as POST (all fields optional)
- Response: Updated task object

**DELETE /tasks/:id**

- Delete a task
- Response: Deleted task object

#### Voice

**POST /voice/parse**

- Parse voice transcript to extract task information
- Request body:

```json
{
  "transcript": "Create a high priority task to review the pull request by tomorrow evening"
}
```

- Response:

```json
{
  "transcript": "Create a high priority task to review the pull request by tomorrow evening",
  "parsed": {
    "title": "Review the pull request",
    "description": "",
    "priority": "High",
    "dueDate": "2024-01-16T18:00:00.000Z",
    "status": "To Do"
  }
}
```

**POST /voice/create**

- Create a task from parsed voice input
- Request body:

```json
{
  "transcript": "Original transcript",
  "parsed": {
    "title": "Task title",
    "description": "Description",
    "status": "To Do",
    "priority": "High",
    "dueDate": "2024-01-15T18:00:00.000Z"
  }
}
```

- Response: Created task object

### Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "errors": [] // For validation errors
}
```

Status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

## Decisions & Assumptions

### Design Decisions

1. **Database Choice**: MongoDB was chosen for its flexibility with document structure and ease of schema evolution.

2. **State Management**: Redux Toolkit was used for centralized state management, making it easier to handle async operations and maintain consistent state across components.

3. **Voice Recognition**: Web Speech API was chosen for client-side speech-to-text to avoid additional API costs and provide real-time transcription.

4. **AI Parsing**: OpenAI GPT-4o-mini was selected for intelligent parsing due to its cost-effectiveness and strong natural language understanding capabilities.

5. **Date Parsing**: A hybrid approach combining AI parsing with fallback date parsing logic ensures robust date extraction from various formats.

6. **UI Framework**: React with functional components and hooks for modern, maintainable code.

7. **Drag-and-Drop**: React Beautiful DnD provides smooth drag-and-drop functionality for the Kanban board.

### Assumptions

1. **Single User**: The application is designed for single-user use (no authentication required).

2. **Browser Support**: Users will use modern browsers with Web Speech API support (Chrome, Edge, Safari).

3. **Microphone Access**: Users will grant microphone permissions when prompted.

4. **Date Formats**: The system assumes users will use common date phrases (tomorrow, next Monday, etc.) or ISO date formats.

5. **Priority Keywords**: Priority is detected from keywords like "urgent", "high priority", "critical", "low priority".

6. **Default Values**:
   - Status defaults to "To Do" if not specified
   - Priority defaults to "Medium" if not specified
   - Description is optional and defaults to empty string

### Limitations

1. **Voice Recognition**: Web Speech API requires internet connection and may not work in all browsers.

2. **AI Parsing**: Requires OpenAI API key and internet connection. Parsing may not be 100% accurate for all voice inputs.

3. **Date Parsing**: Complex date expressions may not always be parsed correctly.

4. **No Real-time Updates**: Changes are not synchronized in real-time across multiple browser tabs.

5. **No Offline Support**: Application requires internet connection for AI parsing.

## AI Tools Usage

### Tools Used

- **Cursor AI**: Used extensively for code generation, debugging, and refactoring
- **ChatGPT/Claude**: Used for design decisions, API structure planning, and parsing logic

### What They Helped With

1. **Boilerplate Code**: Generated initial project structure, component templates, and Redux setup
2. **API Design**: Helped design RESTful endpoints and request/response structures
3. **Voice Parsing Logic**: Assisted in designing the prompt engineering for OpenAI API to extract structured data
4. **Date Parsing**: Helped implement fallback date parsing logic for relative dates
5. **Error Handling**: Generated comprehensive error handling patterns
6. **UI Components**: Assisted in creating responsive, accessible UI components

### Notable Prompts/Approaches

1. **Voice Parsing Prompt**: Designed a structured prompt that instructs GPT to return only JSON, ensuring consistent parsing results.

2. **Date Parsing Strategy**: Combined AI parsing with rule-based fallback logic to handle edge cases.

3. **Component Architecture**: Used AI to generate modular, reusable components following React best practices.

### Learnings & Changes

1. **Prompt Engineering**: Learned the importance of clear, structured prompts for consistent AI responses.

2. **Error Handling**: Improved error handling by implementing graceful fallbacks when AI parsing fails.

3. **User Experience**: Added review step before saving voice-created tasks to allow user correction.

4. **Performance**: Optimized Redux state updates to prevent unnecessary re-renders.

## Project Structure

```
voice-task-tracker/
├── backend/
│   ├── models/
│   │   └── Task.js
│   ├── routes/
│   │   ├── tasks.js
│   │   └── voice.js
│   ├── utils/
│   │   └── voiceParser.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── TaskBoard.js
│   │   │   ├── TaskList.js
│   │   │   ├── TaskCard.js
│   │   │   ├── TaskListItem.js
│   │   │   ├── TaskFormModal.js
│   │   │   ├── VoiceInputButton.js
│   │   │   ├── VoicePreviewModal.js
│   │   │   └── FilterBar.js
│   │   ├── store/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       └── tasksSlice.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env.example
└── README.md
```

## Known Limitations

1. Voice recognition requires browser support and microphone permissions
2. AI parsing requires internet connection and OpenAI API key
3. No user authentication (single-user application)
4. No real-time collaboration features
5. Limited offline functionality

## Future Enhancements

1. Add user authentication and multi-user support
2. Implement WebSocket for real-time updates
3. Add task categories/tags
4. Implement task dependencies
5. Add recurring tasks
6. Export/import functionality
7. Mobile app support
8. Offline mode with local storage

## License

ISC


