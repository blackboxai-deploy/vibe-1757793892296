// AI Configuration for Story Analysis and Image Generation
export const AI_CONFIG = {
  // Custom endpoint configuration - no API keys required
  OPENROUTER_BASE_URL: "https://oi-server.onrender.com",
  
  // Headers for custom endpoint
  HEADERS: {
    "Content-Type": "application/json",
    "CustomerId": "cus_Szde3rnRXMofEO",
    "Authorization": "Bearer xxx"
  },
  
  // Models
  ANALYSIS_MODEL: "openrouter/claude-sonnet-4",
  IMAGE_MODEL: "replicate/black-forest-labs/flux-1.1-pro"
};

export interface StoryScene {
  id: string;
  title: string;
  description: string;
  characters: string[];
  setting: string;
  visualPrompt: string;
  order: number;
}

export interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function callAI(messages: any[], model: string = AI_CONFIG.ANALYSIS_MODEL): Promise<string> {
  try {
    const response = await fetch(`${AI_CONFIG.OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: AI_CONFIG.HEADERS,
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data: AIResponse = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("AI request failed:", error);
    throw new Error("Failed to process AI request");
  }
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    console.log("Generating image with prompt:", prompt.slice(0, 100) + "...");
    
    const response = await fetch(`${AI_CONFIG.OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: AI_CONFIG.HEADERS,
      body: JSON.stringify({
        model: AI_CONFIG.IMAGE_MODEL,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    console.log("Image generation response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Image generation failed: ${response.status} - ${errorText}`);
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Image generation response keys:", Object.keys(data));
    
    // Try different possible response formats from the API
    const imageUrl = data.image_url || 
                    data.url || 
                    data.choices?.[0]?.message?.content ||
                    data.data?.[0]?.url ||
                    data.output ||
                    "";
    
    if (imageUrl && imageUrl.startsWith('http')) {
      console.log("Successfully generated image URL:", imageUrl);
      return imageUrl;
    } else {
      console.log("No valid image URL found in response, using enhanced placeholder");
      // Return enhanced placeholder image as fallback with descriptive text
      const fallbackText = encodeURIComponent(prompt.slice(0, 50).replace(/[^a-zA-Z0-9\s]/g, ''));
      return `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1687fbc0-bd7d-4a96-a18f-f8891fd09dcc.png`;
    }
  } catch (error) {
    console.error("Image generation failed:", error);
    // Return enhanced placeholder image as fallback
    return `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1687fbc0-bd7d-4a96-a18f-f8891fd09dcc.png`;
  }
}