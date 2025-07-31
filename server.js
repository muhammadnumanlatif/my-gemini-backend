// server.js

// Import necessary libraries
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generativeai');
require('dotenv').config(); // This loads environment variables from a .env file for local development

// --- Initialization ---

// Initialize the Express app
const app = express();

// Set the port for the server to listen on.
// Render provides the port number via the PORT environment variable.
// For local development, it falls back to 3000.
const PORT = process.env.PORT || 3000;

// Access your Gemini API key from environment variables
// This is the secure way to handle API keys.
const geminiApiKey = process.env.GEMINI_API_KEY;

// Check if the API key is available
if (!geminiApiKey) {
  console.error("Error: GEMINI_API_KEY is not set in environment variables.");
  process.exit(1); // Exit the process with an error code
}

// Initialize the GoogleGenerativeAI with the API key
const genAI = new GoogleGenerativeAI(geminiApiKey);

// --- Middleware ---

// Enable Cross-Origin Resource Sharing (CORS) for all routes
// This allows your frontend (on a different domain) to make requests to this backend.
app.use(cors());

// Enable the Express app to parse JSON formatted request bodies
app.use(express.json());


// --- API Routes ---

/**
 * A simple route to check if the server is running.
 */
app.get('/', (req, res) => {
  res.send('Welcome to the Gemini API Backend!');
});

/**
 * The main endpoint for interacting with the Gemini model.
 * It expects a POST request with a JSON body like: { "prompt": "Your text here" }
 */
app.post('/gemini', async (req, res) => {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Extract the prompt from the request body
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Send the prompt to the model and wait for the result
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Send the generated text back to the client
    res.json({ generatedText: text });

  } catch (error) {
    console.error("Error in /gemini endpoint:", error);
    res.status(500).json({ error: 'Failed to generate content from Gemini' });
  }
});


// --- Server Startup ---

// Start the server and listen for incoming connections
app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
});