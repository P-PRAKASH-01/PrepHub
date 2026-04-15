const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;
const MODEL = "meta-llama/Llama-3.1-8B-Instruct";

export async function extractSkills(jdText) {
  if (!HF_TOKEN) {
    throw new Error("VITE_HF_TOKEN is missing or invalid in your .env file.");
  }

  try {
    // Note: Using the modern OpenAI-compatible Chat Completions API on the HF Router
    const response = await fetch(
      `https://router.huggingface.co/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: `You are an expert HR recruiter. Extract technical and soft skills from the job description.
            Categorize them into logical groups such as: 'Web', 'Backend', 'Mobile', 'AIML', 'Cloud/DevOps', 'Data Science', 'Soft Skills', 'Tools/Other'.
            Return ONLY a clean JSON object where keys are category names and values are arrays of skill strings.
            Example: { "Web": ["React", "HTML"], "Soft Skills": ["Leadership"] }`
            },
            {
              role: "user",
              content: jdText
            }
          ],
          max_tokens: 800,
          temperature: 0,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("HF Router Detailed Error:", response.status, errorData);
      throw new Error(errorData.error?.message || errorData.error || `Server Error ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    // Parse categorized skills from the response
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        // Filter out empty categories
        const filtered = {};
        Object.entries(parsed).forEach(([key, val]) => {
          if (Array.isArray(val) && val.length > 0) {
            filtered[key] = val.map(s => s.trim());
          }
        });
        return filtered;
      } catch {
        console.warn("Category parsing failed, falling back to flat list");
      }
    }
    
    // Fallback if no valid category object is found
    const fallbackList = text.split(/\n/g)
      .map(s => s.trim().replace(/^[-*\d.]+\s*/, ""))
      .filter(s => s.length > 3 && s.length < 50);
    
    return { "General Skills": fallbackList };
    
  } catch (error) {
    console.error("AI Extraction error:", error);
    throw error;
  }
}
