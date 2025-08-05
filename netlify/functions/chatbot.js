exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { message } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

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
        
        if (!result.candidates || !result.candidates[0] || !result.candidates[0].content || !result.candidates[0].content.parts || !result.candidates[0].content.parts[0]) {
            throw new Error("Invalid response structure from API.");
        }
        
        let reply = result.candidates[0].content.parts[0].text;

        reply = reply.replace(/\*\*/g, '');

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