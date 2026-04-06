import axios from "axios";

export const askAi = async (messages) => {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages array is empty");
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let content = response?.data?.choices?.[0]?.message?.content;

    if (!content || !content.trim()) {
      throw new Error("Invalid response from AI");
    }

    // 🔥 CLEAN RESPONSE (important)
    content = content.trim();

    // 🔥 FIX JSON RESPONSE (auto extract)
    if (content.includes("{") && content.includes("}")) {
      const start = content.indexOf("{");
      const end = content.lastIndexOf("}") + 1;
      content = content.substring(start, end);
    }

    return content;

  } catch (error) {
    console.error("❌ AI Error:", error.response?.data || error.message);

    return JSON.stringify({
      confidence: 0,
      communication: 0,
      correctness: 0,
      finalScore: 0,
      feedback: "AI failed to evaluate answer",
      mistakes: ["AI error"]
    });
  }
};