import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FeaturesScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Features</Text>
        <Text style={styles.headerDescription}>
          Discover all the features that make Vision Assist comprehensive.
        </Text>
      </View>
      <View style={styles.section}>
        <View style={styles.featureCard}>
          <Ionicons name="camera" size={32} color="#2563eb" />
          <Text style={styles.featureTitle}>Real-Time Vision Analysis</Text>
          <Text style={styles.featureDescription}>
            Advanced computer vision AI continuously analyzes your surroundings.
          </Text>
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
  },
  section: {
    padding: 20,
  },
  featureCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748b',
  },
});

