import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isActive, setIsActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detections, setDetections] = useState([]);

  useEffect(() => {
    if (isActive && permission?.granted) {
      startAnalysis();
    } else {
      stopAnalysis();
    }
  }, [isActive, permission]);

  const startAnalysis = () => {
    setIsAnalyzing(true);
    simulateDetection();
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    Speech.stop();
  };

  const simulateDetection = () => {
    const mockDetections = [
      { id: 1, label: 'Door', x: 100, y: 200, width: 80, height: 120 },
      { id: 2, label: 'Chair', x: 250, y: 400, width: 60, height: 80 },
    ];
    setDetections(mockDetections);
    const description = "I can see a door ahead and a chair to your right.";
    speak(description);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const speak = (text) => {
    Speech.speak(text, {
      language: 'en',
      pitch: 1.0,
      rate: 0.9,
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
                <Text style={styles.analyzingText}>Analyzing...</Text>
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
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
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

