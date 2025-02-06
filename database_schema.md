# Database Schema Documentation

## ER Diagram
Refer to SQL Databse Table

## Tables
1. Users Table (users) 

This table stores user information, ensuring that each user has a unique identity. 

id: A unique identifier for each user (Primary Key). 

name: The full name of the user. 

username: A unique username to identify the user. 

password: A hashed password for authentication and security. 

This table is essential for managing user authentication and keeping track of which user owns a particular chat session. 

 

2. Chat Sessions Table (chat_sessions) 

This table keeps track of individual chat sessions for users. Each session represents a separate instance of a conversation. 

session_id: A unique identifier for each chat session (Primary Key). 

user_id: A reference to the id in the users table (Foreign Key), indicating which user owns the session. 

session_name: A numeric identifier for differentiating sessions (default is 1). 

timestamp: The date and time when the session was created (default is the current timestamp). 

The chat_sessions table exists to group messages under specific chat sessions, ensuring that conversations are logically separated for each user. 

 

3. Messages Table (messages) 

This table stores individual messages exchanged within a chat session. 

id: A unique identifier for each message (Primary Key, auto-incremented). 

session_id: A reference to the session_id in chat_sessions (Foreign Key), linking the message to a specific session. 

message: The text of the user's input. 

response: The text of the system's response to the user's message. 

timestamp: The date and time when the message was sent (default is the current timestamp). 

This table ensures that each message is associated with a session, allowing conversations to be retrieved in chronological order for a given chat session. 

## Relationships
1. users → chat_sessions (One-to-Many) 

A single user (id) can have multiple chat sessions (user_id). 

2. chat_sessions → messages (One-to-Many) 

A single chat session (session_id) can contain multiple messages (session_id). 

These relationships help structure the data efficiently, ensuring that user conversations are well-organized and easily retrievable. 
