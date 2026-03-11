export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { weekLabel, dataBlock, messages = [] } = req.body;
  if (!dataBlock) return res.status(400).json({ error: "No data provided" });
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing GROQ_API_KEY" });

  const systemPrompt = `You are an executive assistant helping a team lead prepare a weekly summary for senior management. You have access to this week's team data:\n\n${dataBlock}\n\nWrite in a professional, confident, third-person tone. Be specific and use actual data. No bullet points. Plain prose only. When asked to refine, update the summary based on the feedback while keeping it polished and professional.`;

  // Build conversation: if no prior messages, generate first draft. Otherwise continue the chat.
  const chatMessages = messages.length === 0
    ? [{ role: "user", content: `Write an executive summary for ${weekLabel} based on the team data provided.` }]
    : messages.map(m => ({ role: m.role, content: m.content }));

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages: [{ role: "system", content: systemPrompt }, ...chatMessages],
      }),
    });
    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "";
    if (!summary) throw new Error(JSON.stringify(data));
    res.status(200).json({ summary });
  } catch (e) {
    console.error("Summary error:", e.message);
    res.status(500).json({ error: "Failed to generate summary" });
  }
}
