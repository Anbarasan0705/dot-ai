# dot-ai
AI-powered chatbot clone inspired by ChatGPT, Claude, and Meta AI. Built using React, Node.js, Express, OpenRouter API, Firebase Authentication, and MongoDB. Features include multiple chats, typing animation, AI responses, responsive UI, Google login, local storage, and modern full-stack deployment support.
Backend server for an AI Chatbot application using Node.js, Express, and OpenRouter API integration.

Features
AI chatbot API integration
REST API using Express.js
Environment variable security
CORS enabled
JSON request handling
Technologies Used
Node.js
Express.js
OpenRouter API
dotenv
cors
Installation

Clone the repository:

git clone https://github.com/your-username/your-repository-name.git

Navigate to project folder:

cd your-repository-name

Install dependencies:

npm install
Environment Variables

Create a .env file in the root directory and add:

OPENROUTER_API_KEY=your_api_key
Run Locally

Start the server:

node index.js

Server runs on:

http://localhost:5001
Deployment
Deploy on Render
Push project to GitHub
Login to Render
Create a new Web Service
Connect GitHub repository
Add environment variable:
OPENROUTER_API_KEY=your_api_key
Deploy the project
API Endpoint
Chat Request
POST /chat
Request Body
{
  "message": "Hello"
}
Response
{
  "reply": "Hello! How can I help you?"
}
License

This project is licensed under the MIT License.
