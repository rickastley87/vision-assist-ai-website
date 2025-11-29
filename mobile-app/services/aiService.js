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
                text: 'Analyze this image and describe what you see. Focus on objects, people, obstacles, and navigation-relevant information. Also detect emotions in any visible faces (happiness, sadness, anger, fear, surprise, disgust - the 6 basic emotions). Provide a clear, concise description suitable for someone with vision impairment. Format your response as: "Description: [detailed description]. Objects: [list of objects with approximate positions]. Hazards: [any obstacles or dangers]. Emotions: [list detected emotions from faces, if any]."'
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
      const errorMessage = errorData.error?.message || `API error: ${response.status}`;
      
      // Provide user-friendly error messages
      if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
        throw new Error('You exceeded your current quota, please check your plan and billing details.');
      } else if (response.status === 401) {
        throw new Error('Invalid API key. Please check your API configuration.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        throw new Error(errorMessage);
      }
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
      emotions: parsed.emotions,
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
    emotions: [],
  };

  // Try to extract structured information
  const descriptionMatch = response.match(/Description:\s*(.+?)(?:\.\s*Objects:|$)/i);
  const objectsMatch = response.match(/Objects:\s*(.+?)(?:\.\s*Hazards:|$)/i);
  const hazardsMatch = response.match(/Hazards:\s*(.+?)(?:\.\s*Emotions:|$)/i);
  const emotionsMatch = response.match(/Emotions:\s*(.+?)(?:\.|$)/i);

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

  if (emotionsMatch) {
    const emotionsText = emotionsMatch[1].trim();
    // Extract emotions and normalize to basic 6 emotions
    const detectedEmotions = emotionsText.split(/[,;]/).map(e => e.trim().toLowerCase()).filter(e => e);
    
    // Map to the 6 basic emotions
    const basicEmotions = ['happiness', 'sadness', 'anger', 'fear', 'surprise', 'disgust'];
    result.emotions = detectedEmotions
      .map(emotion => {
        // Check if emotion matches any basic emotion (including variations)
        const matched = basicEmotions.find(basic => 
          emotion.includes(basic) || basic.includes(emotion) ||
          emotion === 'happy' || emotion === 'joy' || emotion === 'joyful' ||
          emotion === 'angry' || emotion === 'mad' ||
          emotion === 'scared' || emotion === 'afraid' ||
          emotion === 'surprised' || emotion === 'shocked' ||
          emotion === 'disgusted'
        );
        return matched || null;
      })
      .filter(e => e !== null)
      .map(e => {
        // Normalize variations
        if (e === 'happy' || e === 'joy' || e === 'joyful') return 'happiness';
        if (e === 'angry' || e === 'mad') return 'anger';
        if (e === 'scared' || e === 'afraid') return 'fear';
        if (e === 'surprised' || e === 'shocked') return 'surprise';
        if (e === 'disgusted') return 'disgust';
        return e;
      });
    
    // Remove duplicates
    result.emotions = [...new Set(result.emotions)];
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

  if (analysis.emotions && analysis.emotions.length > 0) {
    audioText += ` Detected emotions: ${analysis.emotions.join(', ')}.`;
  }

  return audioText;
}

