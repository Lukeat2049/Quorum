export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { weekLabel, dataBlock } = req.body;
  if (!dataBlock) return res.status(400).json({ error: "No data provided" });
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const systemPrompt = `You are an executive assistant helping a team lead prepare a concise weekly summary for senior management. Write in a professional, confident, third-person tone. Be specific, use the actual data provided. Do not pad or add filler. Structure: open with a 1-2 sentence overall team performance snapshot, then weave each team member's highlights into a flowing narrative. End with a brief 1-sentence outlook if the data supports it. No bullet points. Plain prose only.`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nWrite an executive summary for ${weekLabel}:\n\n${dataBlock}` }] }],
        generationConfig: { maxOutputTokens: 1000 },
      }),
    });
    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!summary) throw new Error("No response");
    res.status(200).json({ summary });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to generate summary" });
  }
}
