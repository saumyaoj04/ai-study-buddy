const geminiRequest = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error("AI features need GEMINI_API_KEY in .env");
    error.status = 503;
    throw error;
  }
  const model = process.env.GEMINI_MODEL || "gemini-3.7-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4 } }),
  });
  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload.error?.message || "Gemini request failed");
    error.status = 502;
    throw error;
  }
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!text) { const error = new Error("Gemini returned no text"); error.status = 502; throw error; }
  return text;
};

const parseJson = (text) => JSON.parse(text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim());
module.exports = { geminiRequest, parseJson };
