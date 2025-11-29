# API Key Setup Guide

## How to Get AI API Keys

### Option 1: OpenAI (Recommended for Vision Analysis)
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (you'll only see it once!)
6. Add it to `api.js`

**Pricing:** Pay-as-you-go, ~$0.01-0.03 per image analysis

### Option 2: Google Cloud Vision API
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable the Vision API
4. Go to APIs & Services > Credentials
5. Create API Key
6. Add it to `api.js`

**Pricing:** First 1,000 requests/month free, then $1.50 per 1,000 requests

### Option 3: AWS Rekognition
1. Go to https://aws.amazon.com/rekognition/
2. Sign up for AWS account
3. Go to IAM to create access keys
4. Add credentials to `api.js`

**Pricing:** First 5,000 images/month free, then $1.00 per 1,000 images

## Setup Instructions

1. Copy `api.example.js` to `api.js`:
   ```bash
   cp config/api.example.js config/api.js
   ```

2. Edit `config/api.js` and add your actual API key:
   ```javascript
   export const API_CONFIG = {
     OPENAI_API_KEY: 'sk-your-actual-key-here',
   };
   ```

3. **IMPORTANT:** Never commit `api.js` to git! It's already in `.gitignore`

4. Use the API key in your code:
   ```javascript
   import { API_CONFIG } from './config/api';
   const apiKey = API_CONFIG.OPENAI_API_KEY;
   ```

## Security Best Practices

- ✅ Keep API keys in `api.js` (not committed to git)
- ✅ Use environment variables for production
- ✅ Never share your API keys publicly
- ✅ Rotate keys if they're exposed
- ✅ Set usage limits in your API provider dashboard

