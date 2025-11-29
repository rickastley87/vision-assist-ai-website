import { API_CONFIG } from '../config/api';

/**
 * Analyzes an image using OpenAI Vision API
 * @param {string} imageBase64 - Base64 encoded image
 * @returns {Promise<Object>} Analysis result with description and detected objects
 */
export async function analyzeImageWithAI(imageBase64) {
  try {
    const response = await fetch(API_CONFIG.OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using gpt-4o which supports vision
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image and describe what you see. Focus on objects, people, obstacles, and navigation-relevant information. Provide a clear, concise description suitable for someone with vision impairment. Also identify any potential obstacles or hazards. Format your response as: "Description: [detailed description]. Objects: [list of objects with approximate positions]. Hazards: [any obstacles or dangers]."'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const description = data.choices[0]?.message?.content || 'Unable to analyze image.';

    // Parse the response to extract structured information
    const parsed = parseAIResponse(description);
    
    return {
      success: true,
      description: parsed.description,
      objects: parsed.objects,
      hazards: parsed.hazards,
      rawResponse: description,
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return {
      success: false,
      error: error.message,
      description: 'Unable to analyze the image. Please try again.',
    };
  }
}

/**
 * Parses AI response to extract structured information
 */
function parseAIResponse(response) {
  const result = {
    description: response,
    objects: [],
    hazards: [],
  };

  // Try to extract structured information
  const descriptionMatch = response.match(/Description:\s*(.+?)(?:\.\s*Objects:|$)/i);
  const objectsMatch = response.match(/Objects:\s*(.+?)(?:\.\s*Hazards:|$)/i);
  const hazardsMatch = response.match(/Hazards:\s*(.+?)(?:\.|$)/i);

  if (descriptionMatch) {
    result.description = descriptionMatch[1].trim();
  }

  if (objectsMatch) {
    const objectsText = objectsMatch[1].trim();
    // Split by commas or other delimiters
    result.objects = objectsText.split(/[,;]/).map(obj => obj.trim()).filter(obj => obj);
  }

  if (hazardsMatch) {
    const hazardsText = hazardsMatch[1].trim();
    result.hazards = hazardsText.split(/[,;]/).map(h => h.trim()).filter(h => h);
  }

  return result;
}

/**
 * Creates a simplified description for audio output
 */
export function createAudioDescription(analysis) {
  if (!analysis.success) {
    return analysis.description;
  }

  let audioText = analysis.description;
  
  if (analysis.hazards && analysis.hazards.length > 0) {
    audioText += ` Warning: ${analysis.hazards.join(', ')}.`;
  }

  return audioText;
}

