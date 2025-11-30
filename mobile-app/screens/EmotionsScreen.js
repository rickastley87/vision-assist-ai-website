import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { playEmotionMorse, playNotification } from '../services/morseCodeService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EMOTIONS = [
  {
    name: 'happiness',
    icon: 'happy',
    color: '#fbbf24',
    description: 'Joy, contentment, pleasure',
    morseCode: '.... .- .--. .--. -.--',
  },
  {
    name: 'sadness',
    icon: 'sad',
    color: '#3b82f6',
    description: 'Sorrow, melancholy, grief',
    morseCode: '... .- -..',
  },
  {
    name: 'anger',
    icon: 'flame',
    color: '#ef4444',
    description: 'Rage, fury, irritation',
    morseCode: '.- -. --. . .-.',
  },
  {
    name: 'fear',
    icon: 'warning',
    color: '#8b5cf6',
    description: 'Anxiety, terror, worry',
    morseCode: '..-. . .- .-.',
  },
  {
    name: 'surprise',
    icon: 'flash',
    color: '#f59e0b',
    description: 'Astonishment, shock, amazement',
    morseCode: '... ..- .-. .--. .-. .. ... .',
  },
  {
    name: 'disgust',
    icon: 'remove-circle',
    color: '#10b981',
    description: 'Revulsion, distaste, loathing',
    morseCode: '-.. .. ... --. ..- ... -',
  },
];

export default function EmotionsScreen() {
  const [emotionDetectionEnabled, setEmotionDetectionEnabled] = useState(true);
  const [morseCodeEnabled, setMorseCodeEnabled] = useState(true);
  const [autoPlayMorse, setAutoPlayMorse] = useState(true);
  const [playingEmotion, setPlayingEmotion] = useState(null);

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('@emotion_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setEmotionDetectionEnabled(parsed.emotionDetectionEnabled ?? true);
        setMorseCodeEnabled(parsed.morseCodeEnabled ?? true);
        setAutoPlayMorse(parsed.autoPlayMorse ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('@emotion_settings', JSON.stringify({
        emotionDetectionEnabled,
        morseCodeEnabled,
        autoPlayMorse,
      }));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleEmotionDetectionToggle = (value) => {
    setEmotionDetectionEnabled(value);
    saveSettings();
  };

  const handleMorseCodeToggle = (value) => {
    setMorseCodeEnabled(value);
    saveSettings();
  };

  const handleAutoPlayToggle = (value) => {
    setAutoPlayMorse(value);
    saveSettings();
  };

  const playEmotionMorseCode = async (emotionName) => {
    if (playingEmotion) return; // Prevent multiple plays
    
    setPlayingEmotion(emotionName);
    try {
      await playEmotionMorse(emotionName);
      await playNotification(); // Play notification after morse code
    } catch (error) {
      console.error('Error playing morse code:', error);
    } finally {
      setPlayingEmotion(null);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="happy" size={32} color="#2563eb" />
        </View>
        <Text style={styles.headerTitle}>Emotion Detection</Text>
        <Text style={styles.headerDescription}>
          AI-powered emotion recognition with Morse code vibration feedback
        </Text>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="eye" size={24} color="#2563eb" />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Emotion Detection</Text>
              <Text style={styles.settingDescription}>
                Enable AI to detect emotions in faces
              </Text>
            </View>
          </View>
          <Switch
            value={emotionDetectionEnabled}
            onValueChange={handleEmotionDetectionToggle}
            trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="pulse" size={24} color="#2563eb" />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Morse Code Vibration</Text>
              <Text style={styles.settingDescription}>
                Enable haptic feedback via Morse code
              </Text>
            </View>
          </View>
          <Switch
            value={morseCodeEnabled}
            onValueChange={handleMorseCodeToggle}
            trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="play-circle" size={24} color="#2563eb" />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Auto-Play Morse Code</Text>
              <Text style={styles.settingDescription}>
                Automatically play Morse code when emotions detected
              </Text>
            </View>
          </View>
          <Switch
            value={autoPlayMorse}
            onValueChange={handleAutoPlayToggle}
            trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Emotions List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>The 6 Basic Emotions</Text>
        <Text style={styles.sectionDescription}>
          Tap any emotion to feel its Morse code pattern through vibration
        </Text>

        {EMOTIONS.map((emotion, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.emotionCard,
              playingEmotion === emotion.name && styles.emotionCardPlaying,
            ]}
            onPress={() => playEmotionMorseCode(emotion.name)}
            disabled={playingEmotion !== null}
          >
            <View style={styles.emotionCardLeft}>
              <View style={[styles.emotionIcon, { backgroundColor: `${emotion.color}20` }]}>
                <Ionicons name={emotion.icon} size={28} color={emotion.color} />
              </View>
              <View style={styles.emotionContent}>
                <Text style={styles.emotionName}>
                  {emotion.name.charAt(0).toUpperCase() + emotion.name.slice(1)}
                </Text>
                <Text style={styles.emotionDescription}>{emotion.description}</Text>
                <View style={styles.morseCodeContainer}>
                  <Ionicons name="pulse" size={14} color="#64748b" />
                  <Text style={styles.morseCode}>{emotion.morseCode}</Text>
                </View>
              </View>
            </View>
            {playingEmotion === emotion.name ? (
              <View style={styles.playingIndicator}>
                <Text style={styles.playingText}>Playing...</Text>
              </View>
            ) : (
              <Ionicons name="play-circle" size={32} color={emotion.color} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* How It Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Ionicons name="camera" size={20} color="#2563eb" />
            <Text style={styles.infoText}>
              AI analyzes faces in camera view to detect emotions
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="pulse" size={20} color="#2563eb" />
            <Text style={styles.infoText}>
              Each emotion has a unique Morse code vibration pattern
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="volume-high" size={20} color="#2563eb" />
            <Text style={styles.infoText}>
              Emotions are also included in audio descriptions
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="eye" size={20} color="#2563eb" />
            <Text style={styles.infoText}>
              Visual badges show detected emotions in real-time
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#f8fafc',
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  emotionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emotionCardPlaying: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
  },
  emotionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  emotionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionContent: {
    flex: 1,
  },
  emotionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  emotionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  morseCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  morseCode: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  playingIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2563eb',
    borderRadius: 16,
  },
  playingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    flex: 1,
  },
});

