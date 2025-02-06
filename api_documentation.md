# API Documentation

This page provides detailed documentation for the APIs used in the **ComplyZense** project. Each endpoint is described with its purpose, request methods, required parameters, and responses.

---

## Base URL

The application runs on the following URL:

- **Local**: `http://127.0.0.1:5000`
- **With ngrok**: `<Your ngrok URL>`

---

## Endpoints

### 1. User Authentication

#### `POST /login`

**Description:** Logs in a user and starts a session.  

**Request Parameters:**
```
Example
{
  "username": "your_username",
  "password": "your_password"
}
```
**Response:**

Success (200):
```
Example
{
  "isLoggedIn": true,
  "username": "your_username"
}
```
Error (401):

```
Example
{
  "error": "Invalid credentials"
}
```

### `POST /register`

**Description:** Registers a new user

**Request Parameters:**
```
Example
{
  "name": "your_full_name",
  "username": "your_username",
  "password": "your_password"
}
```
**Response:**

Success (200): Redirects to the login page.

Error (400):
```
Example
{
  "error": "Username already exists"
}
```
### 2. Chat and Session Management

#### `GET /`

**Description:** Main user interface for the chatbot



#### `GET /check_login`

**Description:** Checks if a user is logged in and retrieves their session information.

**Response:**

Success (200):
```
Example
{
  "isLoggedIn": true,
  "username": "your_username",
  "sessionname": "1"
}
```

#### `POST /process`

**Description:** Processes user input (message or file) and returns a response.

**Request Parameters:**

message (string, optional): A text query from the user.

file (file, optional): A document to be analyzed.
```
Example
{
  "message": "Your question here"
}
OR
{
  "file":
}
OR
{
  "message": "Your question here"
  "file":
}
```
**Response:**

Success (200):
```
Example
{
  "response": "Generated response from the AI assistant."
}
```
Error (400):

```
Example
{
  "error": "Invalid file type"
}
```

#### `GET /get_chat_history`

**Description:** Retrieves the chat history for the user. 

**Response:**

Success (200):
```
Example
{
  "success": true,
  "chat_history": [
    {
      "session_id": "abcd1234",
      "session_name": "1",
      "message": "What are the ISO 27001 controls?",
      "response": "ISO 27001 has 114 controls categorized into 14 domains...",
      "timestamp": "2025-02-06 10:30:00"
    }
  ]
}
```
Error (400):

```
Example
{
  "success": false,
  "message": "User not logged in"
}
```

#### `DELETE /clear_chat_history`

**Description:** Deletes user account and associated data

**Response:**

Success (200):
```
Example
{
  "success": true,
  "chat_history": "Session 2 has been deleted"
}
```
Error (400):
```
Example
{
  "success": False
  "message: "Error deleting session: 2"
}
```

#### `GET /export_chat_history`

**Description:** Exports chat history of all sessions, unless specified

**Response:**

Success (200):
```
Example
{
  "SELECT * FROM chat_sessions WHERE user_id = ? AND session_name = ?", 
                (user_id, session_name_filter)
}
```
Error (400):
```
Example
{
  "error": "Error generating the chat history file: 2"
}
```

### 3. Report Generation

#### `POST /report`

**Description:** Generates a compliance report based on an uploaded document.

**Request Parameters:**
```
Example
{
  "file":
}
```
**Response:**
Success (200):

Returns the generated report as a downloadable .txt file.

Error (400):
```
Example
{
  "error": "Invalid file type"
}
```

### 4. Account Management

#### `GET /logout`

**Description:** Logs user out

**Response:**

Success (200):
```
Example
{
  "message": "You have successfully logged out."
}
```

#### `DELETE /delete_account`

**Description:** Deletes user account and associated data

**Response:**

Success (200):
```
Example
{
  "success": true,
  "message": "Account and all associated data deleted successfully"
}
```
Error (400):
```
Example
{
  "error": "User not logged in"
}
```
