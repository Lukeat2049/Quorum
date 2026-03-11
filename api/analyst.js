export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { messages = [], allData } = req.body;
  if (!allData) return res.status(400).json({ error: "No data provided" });
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing GROQ_API_KEY" });

  const systemPrompt = `You are a sharp, insightful data analyst for a team standup tool. You have access to the following historical team data (up to 52 weeks per member):\n\n${allData}\n\nAnswer the admin's questions with specific insights, patterns, and observations drawn directly from the data. Be concise but thorough. Use numbers and specifics when available. If you notice something interesting or concerning in the data, mention it. Format responses clearly — use line breaks between points but avoid excessive bullet lists. Speak like a smart colleague, not a formal report.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
      }),
    });
    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "";
    if (!answer) throw new Error(JSON.stringify(data));
    res.status(200).json({ answer });
  } catch (e) {
    console.error("Analyst error:", e.message);
    res.status(500).json({ error: "Failed to get answer" });
  }
}
