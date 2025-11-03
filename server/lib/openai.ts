// AI services using the provider factory
import { getAIProvider } from './ai-providers/factory';

export function isOpenAIConfigured(): boolean {
  // This function name is kept for backward compatibility
  // TODO: Update this to use the new AI provider system
  // For now, we'll return true to allow the provider system to handle configuration checks
  return true;
}

export async function generateInsight(
  customerId: string,
  dataContext: string, 
  question?: string
): Promise<string> {
  try {
    const provider = await getAIProvider(customerId);
    
    if (!provider) {
      return "AI insights are not available. Please configure your AI provider in Settings to enable AI-powered analytics.";
    }

    const prompt = question
      ? `Based on the following data context, answer this question: ${question}\n\nData Context:\n${dataContext}`
      : `Analyze the following data and provide key insights, trends, and actionable recommendations:\n\n${dataContext}`;

    const response = await provider.chat([
      {
        role: "system",
        content: "You are an expert data analyst. Provide clear, actionable insights based on the data provided. Focus on trends, anomalies, and business recommendations.",
      },
      {
        role: "user",
        content: prompt,
      },
    ], { maxTokens: 1024 });

    return response || "Unable to generate insights.";
  } catch (error) {
    console.error("AI provider error:", error);
    return "Error generating AI insights. Please check your API key configuration.";
  }
}

export async function chatWithAI(
  customerId: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  dataContext?: string
): Promise<string> {
  try {
    const provider = await getAIProvider(customerId);
    
    if (!provider) {
      return "AI chat is not available. Please configure your AI provider in Settings to enable the AI assistant.";
    }

    const systemMessage = dataContext
      ? `You are a helpful data analytics assistant. You have access to the user's data. Here's the context:\n${dataContext}\n\nAnswer questions about the data and help with analysis.`
      : "You are a helpful data analytics assistant. Help users understand their data and create visualizations.";

    const messagesWithSystem = [
      { role: "system" as const, content: systemMessage },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const response = await provider.chat(messagesWithSystem, { maxTokens: 1024 });
    return response || "I'm having trouble responding right now.";
  } catch (error) {
    console.error("AI provider error:", error);
    return "Error communicating with AI. Please check your API key configuration.";
  }
}

export async function detectAnomalies(
  customerId: string,
  data: Array<{ date: string; value: number }>
): Promise<{ summary: string; anomalies: Array<{ date: string; reason: string }> }> {
  try {
    const provider = await getAIProvider(customerId);
    
    if (!provider) {
      return {
        summary: "Anomaly detection requires AI provider configuration.",
        anomalies: [],
      };
    }

    const dataStr = JSON.stringify(data.slice(0, 50)); // Limit data size

    const response = await provider.chat([
      {
        role: "system",
        content: "You are an expert at detecting anomalies in time series data. Analyze the data and identify unusual patterns, spikes, or drops. Respond in JSON format with: { summary: string, anomalies: [{date: string, reason: string}] }",
      },
      {
        role: "user",
        content: `Analyze this data for anomalies:\n${dataStr}`,
      },
    ], { 
      maxTokens: 1024 
    });

    const result = JSON.parse(response || "{}");
    return {
      summary: result.summary || "No anomalies detected",
      anomalies: result.anomalies || [],
    };
  } catch (error) {
    console.error("AI provider error:", error);
    return {
      summary: "Error analyzing data for anomalies",
      anomalies: [],
    };
  }
}
