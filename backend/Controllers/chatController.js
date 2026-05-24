const { GoogleGenerativeAI } = require("@google/generative-ai");

const getModel = (apiKey, systemInstruction) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    systemInstruction,
  });
};

const getSystemPrompt = (context = {}) => {
  const username = context.username || "friend";

  if (context.mode === "support" && context.postText) {
    return `You are a warm, empathetic mental-health support assistant on FriendZone, a social app.
The user "${username}" just posted something that may reflect sadness or distress:
"${context.postText}"

Your role:
- Acknowledge their feelings without being preachy
- Listen and validate
- Offer gentle coping suggestions when appropriate
- Encourage reaching out to trusted people or professional help for serious distress
- Keep responses concise (2-4 sentences unless they ask for more)
- Never claim to be a therapist or replace professional care
- If they seem in crisis, gently mention crisis helplines (988 in the US, or local resources)`;
  }

  return `You are a friendly, upbeat chat companion on FriendZone, a social networking app.
The user's name is ${username}.

Your role:
- Have casual, warm conversations about life, hobbies, friendships, and positivity
- Be helpful, fun, and supportive in a light social way
- Keep responses concise (2-4 sentences unless they ask for more)
- Do not bring up mental health unless the user does`;
};

const analyzePost = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "Gemini API key not configured. Add GEMINI_API_KEY to backend/.env",
    });
  }

  const { text } = req.body;
  if (!text?.trim()) {
    return res.status(200).json({ needsSupport: false });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `Analyze this social media post for emotional distress signals.
Post: "${text.trim()}"

Decide if the author may benefit from a supportive mental-health chatbot conversation.
Return ONLY valid JSON in this exact shape:
{"needsSupport": boolean, "reason": "one short sentence explaining why or why not"}

Guidelines:
- needsSupport=true for sadness, loneliness, hopelessness, anxiety, grief, stress overwhelm, self-harm hints, or clear emotional struggle
- needsSupport=false for neutral, happy, informational, or casual posts
- Be thoughtful but not overly sensitive — everyday frustration is not always needsSupport`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const parsed = JSON.parse(raw);

    return res.status(200).json({
      needsSupport: Boolean(parsed.needsSupport),
      reason: parsed.reason || "",
    });
  } catch (error) {
    console.error("Gemini analyze error:", error.message);
    return res.status(200).json({ needsSupport: false });
  }
};

const chat = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "Gemini API key not configured. Add GEMINI_API_KEY to backend/.env",
    });
  }

  const { messages = [], context = {} } = req.body;
  if (!messages.length) {
    return res.status(400).json({ error: "No messages provided" });
  }

  try {
    const model = getModel(
      apiKey,
      getSystemPrompt({
        ...context,
        username: context.username || req.user?.username,
      })
    );

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;
    const chatSession = model.startChat({ history });
    const result = await chatSession.sendMessage(lastMessage);
    const reply = result.response.text();

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Gemini chat error:", error.message);
    return res.status(500).json({
      error: "Failed to get a response from the assistant. Check your API key and try again.",
    });
  }
};

module.exports = { chat, analyzePost };
