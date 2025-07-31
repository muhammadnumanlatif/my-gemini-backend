require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generativeai');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// --- Security: Configure CORS ---
const corsOptions = {
    origin: 'https://seoustaad.com', // Replace with your actual store URL
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// --- Initialize Gemini API ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Define the API Endpoint ---
app.post('/analyze-eat', async (req, res) => {
    const { targetUrl } = req.body;

    if (!targetUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // --- Quantum Prompt Engineering ---
        const prompt = `
            Analyze the content of the website at the URL: ${targetUrl}.
            Evaluate it based on Google's E-E-A-T framework (Experience, Expertise, Authoritativeness, Trustworthiness).
            Provide a score from 1-100 for each of the four components.
            For each component, provide a brief, bulleted list of supporting evidence or reasons for the score.
            Also, provide an overall E-E-A-T score, which is the average of the four component scores.
            Finally, give three actionable, concrete recommendations for how the website could improve its E-E-A-T rating.
            Return the entire analysis in a structured JSON format with the following keys: "experience", "expertise", "authoritativeness", "trustworthiness", "overallScore", "recommendations".
            Each of the four component keys should contain "score" and "reasoning" keys.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean the response to be valid JSON
        const jsonResponse = JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));

        res.json(jsonResponse);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to analyze the URL.' });
    }
});

app.listen(port, () => {
    console.log(`E-A-T Analyzer backend listening at http://localhost:${port}`);
});