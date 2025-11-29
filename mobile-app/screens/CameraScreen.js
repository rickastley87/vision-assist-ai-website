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

const { width, height } = Dimensions.get('window');
const ANALYSIS_INTERVAL = 3000; // Analyze every 3 seconds when active

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isActive, setIsActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detections, setDetections] = useState([]);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const cameraRef = useRef(null);
  const analysisIntervalRef = useRef(null);

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
  };

  const captureAndAnalyze = async () => {
    if (!cameraRef.current || !isActive) return;

    try {
      setIsAnalyzing(true);
      
      // Take a photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        skipProcessing: false,
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture image');
      }

      // Analyze with AI
      const analysis = await analyzeImageWithAI(photo.base64);

      if (analysis.success) {
        setLastAnalysis(analysis);
        setError(null);

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
        setError(analysis.error || 'Analysis failed');
        Alert.alert('Analysis Error', analysis.description);
      }
    } catch (err) {
      console.error('Capture/Analysis Error:', err);
      setError(err.message);
      Alert.alert('Error', `Failed to analyze image: ${err.message}`);
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
      >
        {isActive && (
          <View style={styles.overlay}>
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
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.controls}>
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
            <TouchableOpacity
              style={styles.controlButton}
              onPress={requestDescription}
            >
              <Ionicons name="mic" size={24} color="#fff" />
              <Text style={styles.controlButtonText}>Describe</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Status Bar */}
        <View style={styles.statusBar}>
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
            <View style={styles.statusItem}>
              <Ionicons name="eye" size={16} color="#fff" />
              <Text style={styles.statusText}>
                {detections.length} objects
              </Text>
            </View>
          )}
        </View>
      </CameraView>
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
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
});
