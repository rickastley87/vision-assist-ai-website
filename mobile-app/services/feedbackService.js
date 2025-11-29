import AsyncStorage from '@react-native-async-storage/async-storage';

const FEEDBACK_STORAGE_KEY = '@vision_assist_feedback';
const PREFERENCES_STORAGE_KEY = '@vision_assist_preferences';

/**
 * Stores user feedback for AI analysis
 * This data can later be used for fine-tuning or improving prompts
 */
export async function saveFeedback(analysis, userCorrection, rating) {
  try {
    const feedback = {
      timestamp: new Date().toISOString(),
      originalAnalysis: analysis,
      userCorrection: userCorrection,
      rating: rating, // 1-5 stars
    };

    const existingFeedback = await getStoredFeedback();
    existingFeedback.push(feedback);
    
    // Keep only last 100 feedback entries
    const recentFeedback = existingFeedback.slice(-100);
    
    await AsyncStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(recentFeedback));
    return { success: true };
  } catch (error) {
    console.error('Error saving feedback:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gets stored feedback data
 */
export async function getStoredFeedback() {
  try {
    const data = await AsyncStorage.getItem(FEEDBACK_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting feedback:', error);
    return [];
  }
}

/**
 * Saves user preferences for analysis style
 */
export async function savePreferences(preferences) {
  try {
    await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    return { success: true };
  } catch (error) {
    console.error('Error saving preferences:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gets user preferences
 */
export async function getPreferences() {
  try {
    const data = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
    return data ? JSON.parse(data) : {
      detailLevel: 'medium', // low, medium, high
      audioSpeed: 0.85,
      preferredLanguage: 'en',
    };
  } catch (error) {
    console.error('Error getting preferences:', error);
    return null;
  }
}

/**
 * Exports feedback data for fine-tuning
 * This could be sent to a backend for model improvement
 */
export async function exportFeedbackForTraining() {
  const feedback = await getStoredFeedback();
  const preferences = await getPreferences();
  
  return {
    feedback,
    preferences,
    exportDate: new Date().toISOString(),
    totalFeedbackEntries: feedback.length,
  };
}

