// API Configuration Example
// Copy this file to api.js and add your actual API keys
// DO NOT commit api.js to git!

export const API_CONFIG = {
  // OpenAI API Key (for GPT-4 Vision)
  // Get it from: https://platform.openai.com/api-keys
  OPENAI_API_KEY: 'your_openai_api_key_here',
  
  // Google Cloud Vision API Key (alternative)
  // Get it from: https://console.cloud.google.com/apis/credentials
  GOOGLE_VISION_API_KEY: 'your_google_vision_api_key_here',
  
  // AWS Rekognition (alternative)
  // Get it from: https://aws.amazon.com/rekognition/
  AWS_ACCESS_KEY_ID: 'your_aws_access_key_here',
  AWS_SECRET_ACCESS_KEY: 'your_aws_secret_key_here',
  AWS_REGION: 'us-east-1',
  
  // API Endpoints
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  GOOGLE_VISION_API_URL: 'https://vision.googleapis.com/v1/images:annotate',
};

// Usage example:
// import { API_CONFIG } from './config/api';
// const apiKey = API_CONFIG.OPENAI_API_KEY;

