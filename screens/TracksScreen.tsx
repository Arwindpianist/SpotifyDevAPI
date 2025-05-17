import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform, ScrollView, KeyboardAvoidingView, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TracksScreen({ route, navigation }: any) {
  const { album } = route.params;
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const BACKEND_URL = 'https://sdevapi.arwindpianist.store';

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(BACKEND_URL + '/tracks/' + album.id, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.tracks) setTracks(data.tracks);
        else setError('No tracks found.');
      })
      .catch(err => setError('Error: ' + (err.message || String(err))))
      .finally(() => setLoading(false));
  }, [album.id]);

  useEffect(() => {
    if (error) {
      if (Platform.OS === 'android') {
        ToastAndroid.show(error, ToastAndroid.LONG);
      } else if (Platform.OS === 'web') {
        alert(error);
      }
    }
  }, [error]);

  return (
    <KeyboardAvoidingView style={styles.safeArea} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Tracks in</Text>
        <Text style={styles.albumName}>{album.title}</Text>
        <Text style={styles.instructions}>
          Tap a track to listen to a preview (if available). Use the navigation buttons below to go back or restart.
        </Text>
        {loading ? <Text style={styles.meta}>Loading tracks...</Text> : null}
        <FlatList
          data={tracks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.trackCard}>
              <Text style={styles.trackTitle}>{item.trackNumber}. {item.title}</Text>
              <Text style={styles.meta}>Duration: {Math.floor(item.durationMs / 60000)}:{((item.durationMs % 60000) / 1000).toFixed(0).padStart(2, '0')}</Text>
              {item.previewUrl && (
                <audio controls src={item.previewUrl} style={{ width: '100%', marginTop: 4 }}>
                  Your browser does not support the audio element.
                </audio>
              )}
              <Text style={[styles.meta, { color: '#1DB954', textDecorationLine: 'underline' }]} onPress={() => window.open(item.spotifyUrl, '_blank')}>
                Spotify Track
              </Text>
            </View>
          )}
          style={styles.flatList}
        />
        <View style={styles.navButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()} accessibilityLabel="Back to Albums">
            <Ionicons name="arrow-back" size={28} color="#1DB954" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.replace('ArtistSearch')} accessibilityLabel="Back to Search">
            <Ionicons name="search" size={28} color="#1DB954" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.replace('Auth')} accessibilityLabel="Back to Auth">
            <Ionicons name="log-out-outline" size={28} color="#1DB954" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#181A20',
    paddingTop: Platform.OS === 'android' ? 32 : 0,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 18,
    paddingBottom: 32,
    alignItems: 'stretch',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  albumName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1DB954',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  instructions: {
    color: '#B0B3B8',
    fontSize: 15,
    marginBottom: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  flatList: {
    marginTop: 8,
    maxHeight: 420,
  },
  trackCard: {
    backgroundColor: '#23272F',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  meta: {
    fontSize: 13,
    color: '#B0B3B8',
    marginBottom: 2,
    textAlign: 'center',
  },
  error: {
    color: '#e53935',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  navButtons: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  iconButton: {
    backgroundColor: '#23272F',
    borderRadius: 24,
    padding: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    width: 44,
    height: 44,
  },
});
