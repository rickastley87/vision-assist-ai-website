import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { analyzeImageWithAI, createAudioDescription } from '../services/aiService';
import { playEmotionMorse, playEmotionsSequence, playNotification } from '../services/morseCodeService';

const { width, height } = Dimensions.get('window');
const ANALYSIS_INTERVAL = 3000; // Analyze every 3 seconds when active

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isActive, setIsActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detections, setDetections] = useState([]);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [detectedEmotions, setDetectedEmotions] = useState([]);
  const [error, setError] = useState(null);
  const cameraRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  const morsePlayingRef = useRef(false);

  useEffect(() => {
    if (isActive && permission?.granted) {
      startAnalysis();
    } else {
      stopAnalysis();
    }

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [isActive, permission]);

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setError(null);
    // Start periodic analysis
    captureAndAnalyze();
    analysisIntervalRef.current = setInterval(() => {
      if (isActive) {
        captureAndAnalyze();
      }
    }, ANALYSIS_INTERVAL);
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    Speech.stop();
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    setDetections([]);
    setLastAnalysis(null);
    setDetectedEmotions([]);
    morsePlayingRef.current = false;
  };

  const captureAndAnalyze = async () => {
    if (!cameraRef.current || !isActive) return;

    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Take a photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        skipProcessing: false,
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture image. Please try again.');
      }

      // Analyze with AI
      const analysis = await analyzeImageWithAI(photo.base64);

      if (analysis.success) {
        setLastAnalysis(analysis);
        setError(null);

        // Update detected emotions
        if (analysis.emotions && analysis.emotions.length > 0) {
          setDetectedEmotions(analysis.emotions);
          
          // Play morse code for detected emotions (if not already playing)
          if (!morsePlayingRef.current) {
            morsePlayingRef.current = true;
            playEmotionsSequence(analysis.emotions).then(() => {
              morsePlayingRef.current = false;
            }).catch(() => {
              morsePlayingRef.current = false;
            });
          }
        } else {
          setDetectedEmotions([]);
        }

        // Create visual detections from objects
        const newDetections = analysis.objects.map((obj, index) => ({
          id: index + 1,
          label: obj,
          x: Math.random() * (width - 100) + 50, // Random position for demo
          y: Math.random() * (height - 200) + 100,
          width: 80,
          height: 60,
        }));
        setDetections(newDetections);

        // Speak the description
        const audioText = createAudioDescription(analysis);
        speak(audioText);

        // Haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        const errorMsg = analysis.error || 'Analysis failed';
        setError(errorMsg);
        
        // Handle quota exceeded error specifically
        if (errorMsg.includes('quota') || errorMsg.includes('billing')) {
          Alert.alert(
            'API Quota Exceeded',
            'Your OpenAI API quota has been exceeded. Please check your billing and add credits to continue using Vision Assist.',
            [{ text: 'OK' }]
          );
          // Stop analysis to prevent repeated errors
          setIsActive(false);
        } else {
          Alert.alert('Analysis Error', analysis.description);
        }
      }
    } catch (err) {
      console.error('Capture/Analysis Error:', err);
      const errorMsg = err.message || 'Unknown error occurred';
      setError(errorMsg);
      
      // Handle specific error types
      if (errorMsg.includes('Image could not be captured')) {
        Alert.alert(
          'Camera Error',
          'Unable to capture image. Please ensure the camera is not being used by another app and try again.',
          [{ text: 'OK' }]
        );
      } else if (errorMsg.includes('quota') || errorMsg.includes('billing')) {
        Alert.alert(
          'API Quota Exceeded',
          'Your OpenAI API quota has been exceeded. Please check your billing.',
          [{ text: 'OK' }]
        );
        setIsActive(false);
      } else {
        Alert.alert('Error', `Failed to analyze image: ${errorMsg}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const speak = (text) => {
    Speech.stop(); // Stop any previous speech
    Speech.speak(text, {
      language: 'en',
      pitch: 1.0,
      rate: 0.85, // Slightly slower for clarity
    });
  };

  const toggleCamera = () => {
    if (!permission?.granted) {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to use Vision Assist.',
        [{ text: 'OK', onPress: requestPermission }]
      );
      return;
    }
    setIsActive(!isActive);
  };

  const requestDescription = () => {
    if (!isActive) {
      Alert.alert('Camera Not Active', 'Please start the camera first.');
      return;
    }
    if (lastAnalysis) {
      const audioText = createAudioDescription(lastAnalysis);
      speak(audioText);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      captureAndAnalyze();
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-off" size={64} color="#64748b" />
        <Text style={styles.errorTitle}>Camera Access Denied</Text>
        <Text style={styles.errorText}>
          Vision Assist needs camera access to analyze your environment.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      />
      
      {/* Overlay - positioned absolutely outside CameraView */}
      {isActive && (
        <View style={styles.overlay} pointerEvents="box-none">
          {detections.map((detection) => (
            <View
              key={detection.id}
              style={[
                styles.detectionBox,
                {
                  left: detection.x,
                  top: detection.y,
                  width: detection.width,
                  height: detection.height,
                },
              ]}
            >
              <Text style={styles.detectionLabel}>{detection.label}</Text>
            </View>
          ))}
          {isAnalyzing && (
            <View style={styles.analyzingIndicator}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.analyzingText}>AI Analyzing...</Text>
            </View>
          )}
          {error && (
            <View style={styles.errorIndicator}>
              <Ionicons name="warning" size={16} color="#ef4444" />
              <Text style={styles.errorTextSmall}>
                {error.includes('quota') || error.includes('billing') 
                  ? 'API quota exceeded. Please check your OpenAI billing.'
                  : error.length > 50 
                  ? error.substring(0, 50) + '...'
                  : error}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls} pointerEvents="box-none">
        <TouchableOpacity
          style={[styles.controlButton, isActive && styles.controlButtonActive]}
          onPress={toggleCamera}
        >
          <Ionicons
            name={isActive ? 'stop-circle' : 'play-circle'}
            size={32}
            color="#fff"
          />
          <Text style={styles.controlButtonText}>
            {isActive ? 'Stop' : 'Start'}
          </Text>
        </TouchableOpacity>

          {isActive && (
            <>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={requestDescription}
              >
                <Ionicons name="mic" size={24} color="#fff" />
                <Text style={styles.controlButtonText}>Describe</Text>
              </TouchableOpacity>
              {detectedEmotions.length > 0 && (
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={async () => {
                    if (!morsePlayingRef.current) {
                      morsePlayingRef.current = true;
                      await playEmotionsSequence(detectedEmotions);
                      morsePlayingRef.current = false;
                    }
                  }}
                >
                  <Ionicons name="pulse" size={24} color="#fff" />
                  <Text style={styles.controlButtonText}>Morse</Text>
                </TouchableOpacity>
              )}
            </>
          )}
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar} pointerEvents="box-none">
        <View style={styles.statusItem}>
          <Ionicons
            name={isActive ? 'radio-button-on' : 'radio-button-off'}
            size={16}
            color={isActive ? '#10b981' : '#ef4444'}
          />
          <Text style={styles.statusText}>
            {isActive ? 'AI Active' : 'Inactive'}
          </Text>
        </View>
        {isActive && lastAnalysis && (
          <>
            <View style={styles.statusItem}>
              <Ionicons name="eye" size={16} color="#fff" />
              <Text style={styles.statusText}>
                {detections.length} objects
              </Text>
            </View>
            {detectedEmotions.length > 0 && (
              <View style={styles.statusItem}>
                <Ionicons name="happy" size={16} color="#fbbf24" />
                <Text style={styles.statusText}>
                  {detectedEmotions.length} emotion{detectedEmotions.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Emotion Display */}
      {isActive && detectedEmotions.length > 0 && (
        <View style={styles.emotionDisplay} pointerEvents="box-none">
          <Text style={styles.emotionLabel}>Detected Emotions:</Text>
          <View style={styles.emotionList}>
            {detectedEmotions.map((emotion, index) => (
              <View key={index} style={styles.emotionBadge}>
                <Ionicons 
                  name={
                    emotion === 'happiness' ? 'happy' :
                    emotion === 'sadness' ? 'sad' :
                    emotion === 'anger' ? 'flame' :
                    emotion === 'fear' ? 'warning' :
                    emotion === 'surprise' ? 'flash' :
                    'remove-circle'
                  }
                  size={14}
                  color="#fff"
                />
                <Text style={styles.emotionText}>{emotion}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  detectionBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderRadius: 4,
    padding: 4,
  },
  detectionLabel: {
    color: '#fff',
    backgroundColor: '#2563eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  analyzingIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  analyzingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  errorIndicator: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.8)',
    borderColor: '#2563eb',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBar: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    zIndex: 2,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  errorTextSmall: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emotionDisplay: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 8,
    zIndex: 2,
  },
  emotionLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  emotionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  emotionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
