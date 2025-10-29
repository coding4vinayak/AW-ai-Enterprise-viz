// OpenAI client setup following javascript_openai blueprint
import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

let openaiClient: OpenAI | null = null;

// Initialize OpenAI client only if API key is available
if (process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
  });
}

export function isOpenAIConfigured(): boolean {
  return openaiClient !== null;
}

export async function generateInsight(
  dataContext: string, 
  question?: string
): Promise<string> {
  if (!openaiClient) {
    return "AI insights are not available. Please configure your OpenAI API key in Settings to enable AI-powered analytics.";
  }

  try {
    const prompt = question
      ? `Based on the following data context, answer this question: ${question}\n\nData Context:\n${dataContext}`
      : `Analyze the following data and provide key insights, trends, and actionable recommendations:\n\n${dataContext}`;

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert data analyst. Provide clear, actionable insights based on the data provided. Focus on trends, anomalies, and business recommendations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1024,
    });

    return response.choices[0].message.content || "Unable to generate insights.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Error generating AI insights. Please check your API key configuration.";
  }
}

export async function chatWithAI(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  dataContext?: string
): Promise<string> {
  if (!openaiClient) {
    return "AI chat is not available. Please configure your OpenAI API key in Settings to enable the AI assistant.";
  }

  try {
    const systemMessage = dataContext
      ? `You are a helpful data analytics assistant. You have access to the user's data. Here's the context:\n${dataContext}\n\nAnswer questions about the data and help with analysis.`
      : "You are a helpful data analytics assistant. Help users understand their data and create visualizations.";

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      max_tokens: 1024,
    });

    return response.choices[0].message.content || "I'm having trouble responding right now.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Error communicating with AI. Please check your API key configuration.";
  }
}

export async function detectAnomalies(
  data: Array<{ date: string; value: number }>
): Promise<{ summary: string; anomalies: Array<{ date: string; reason: string }> }> {
  if (!openaiClient) {
    return {
      summary: "Anomaly detection requires OpenAI API key configuration.",
      anomalies: [],
    };
  }

  try {
    const dataStr = JSON.stringify(data.slice(0, 50)); // Limit data size

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at detecting anomalies in time series data. Analyze the data and identify unusual patterns, spikes, or drops. Respond in JSON format with: { summary: string, anomalies: [{date: string, reason: string}] }",
        },
        {
          role: "user",
          content: `Analyze this data for anomalies:\n${dataStr}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1024,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      summary: result.summary || "No anomalies detected",
      anomalies: result.anomalies || [],
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      summary: "Error analyzing data for anomalies",
      anomalies: [],
    };
  }
}
