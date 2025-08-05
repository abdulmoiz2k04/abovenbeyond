// netlify/functions/chatbot.js

exports.handler = async function(event) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { message } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY; // Securely access API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    // This is the "prompt" for the AI. We give it a personality and instructions.
    const prompt = `You are a friendly and helpful AI assistant for a cleaning company called "Above & Beyond". Your goal is to answer customer questions and encourage them to get a quote. Be concise and professional. Here is the user's question: "${message}"`;

    const payload = {
        contents: [{
            parts: [{ text: prompt }]
        }]
    };

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error("API Error:", await response.text());
            throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        const reply = result.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: reply.trim() })
        };

    } catch (error) {
        console.error("Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch AI response." })
        };
    }
};