export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { weekLabel, dataBlock } = req.body;
  if (!dataBlock) return res.status(400).json({ error: "No data provided" });
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing GROQ_API_KEY" });
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages: [
          { role: "system", content: "You are an executive assistant helping a team lead prepare a concise weekly summary for senior management. Write in a professional, confident, third-person tone. Be specific, use the actual data provided. Do not pad or add filler. Structure: open with a 1-2 sentence overall team performance snapshot, then weave each team member's highlights into a flowing narrative. End with a brief 1-sentence outlook if the data supports it. No bullet points. Plain prose only." },
          { role: "user", content: `Write an executive summary for ${weekLabel}:\n\n${dataBlock}` }
        ],
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
