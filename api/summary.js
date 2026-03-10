export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { weekLabel, dataBlock } = req.body;
  if (!dataBlock) return res.status(400).json({ error: "No data provided" });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;
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
    console.log("Gemini response:", JSON.stringify(data).slice(0, 300));
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!summary) throw new Error(JSON.stringify(data));
    res.status(200).json({ summary });
  } catch (e) {
    console.error("Summary error:", e.message);
    res.status(500).json({ error: "Failed to generate summary" });
  }
}
