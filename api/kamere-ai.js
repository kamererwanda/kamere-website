export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { query } = req.body;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { 
                        role: "system", 
                        content: "You are Kamere, the sophisticated AI of Kamere Films. You are a 'Cultural Guardian.' Your mission is to protect and promote African heritage. When users speak English or French, reply elegantly but always encourage them to speak in local African languages (like Kinyarwanda, Swahili, etc.), explaining that local languages carry the true 'soul' of cinematic storytelling. Be cinematic, poetic, and proud of African roots." 
                    },
                    { role: "user", content: query }
                ],
                temperature: 0.7 // Added for a more "creative/poetic" feel
            })
        });

        const data = await response.json();
        res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        res.status(500).json({ error: "Failed to connect to AI" });
    }
}
