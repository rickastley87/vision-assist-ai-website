import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="eye" size={48} color="#2563eb" />
            <Text style={styles.heroTitle}>
              <Text style={styles.highlight}>Vision Assist</Text>
              {'\n'}Your AI-Powered Navigation Companion
            </Text>
          </View>
          <Text style={styles.heroDescription}>
            Experience the world around you with confidence. Vision Assist uses cutting-edge AI technology
            to describe your environment, identify obstacles, and provide real-time audio directions.
          </Text>
          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Camera')}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Start Vision Assist</Text>
            </TouchableOpacity>
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
  hero: {
    backgroundColor: '#f8fafc',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  heroContent: {
    maxWidth: width,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e293b',
    marginTop: 10,
    lineHeight: 36,
  },
  highlight: {
    color: '#2563eb',
  },
  heroDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

