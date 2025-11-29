import * as Haptics from 'expo-haptics';

// Morse code patterns for the 6 basic emotions
const EMOTION_MORSE_CODE = {
  happiness: '.... .- .--. .--. -.--', // HAPPY
  sadness: '... .- -..', // SAD
  anger: '.- -. --. . .-.', // ANGER
  fear: '..-. . .- .-.', // FEAR
  surprise: '... ..- .-. .--. .-. .. ... .', // SURPRISE
  disgust: '-.. .. ... --. ..- ... -', // DISGUST
};

// Morse code timing (in milliseconds)
const DOT_DURATION = 100; // Short pulse
const DASH_DURATION = 300; // Long pulse
const SYMBOL_GAP = 100; // Gap between dots/dashes
const LETTER_GAP = 300; // Gap between letters
const WORD_GAP = 700; // Gap between words

/**
 * Converts text to morse code pattern
 */
function textToMorse(text) {
  const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
    'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
    'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
    'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
    'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
    'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.',
  };

  return text
    .toUpperCase()
    .split('')
    .map(char => morseCode[char] || '')
    .filter(code => code)
    .join(' ');
}

/**
 * Plays a morse code pattern through haptic feedback
 */
export async function playMorseCode(pattern) {
  const symbols = pattern.split('').filter(s => s !== ' ');
  
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    
    if (symbol === '.') {
      // Dot - short vibration
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await sleep(DOT_DURATION);
    } else if (symbol === '-') {
      // Dash - long vibration
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await sleep(DASH_DURATION);
    }
    
    // Gap between symbols (except after last symbol)
    if (i < symbols.length - 1) {
      await sleep(SYMBOL_GAP);
    }
  }
}

/**
 * Plays emotion detection through morse code
 */
export async function playEmotionMorse(emotion) {
  const emotionLower = emotion.toLowerCase();
  const morsePattern = EMOTION_MORSE_CODE[emotionLower];
  
  if (morsePattern) {
    // Play the emotion morse code
    await playMorseCode(morsePattern);
    
    // Add a longer gap after emotion
    await sleep(WORD_GAP);
  } else {
    // If emotion not found, convert emotion name to morse
    const textMorse = textToMorse(emotion);
    if (textMorse) {
      await playMorseCode(textMorse);
    }
  }
}

/**
 * Plays multiple emotions in sequence
 */
export async function playEmotionsSequence(emotions) {
  for (let i = 0; i < emotions.length; i++) {
    await playEmotionMorse(emotions[i]);
    if (i < emotions.length - 1) {
      await sleep(LETTER_GAP);
    }
  }
}

/**
 * Plays a simple notification pattern
 */
export async function playNotification() {
  // Short-short-short pattern
  for (let i = 0; i < 3; i++) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sleep(100);
  }
}

/**
 * Plays an alert pattern
 */
export async function playAlert() {
  // Long-long-long pattern
  for (let i = 0; i < 3; i++) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await sleep(200);
  }
}

/**
 * Helper function for delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

