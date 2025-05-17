import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform, ScrollView, KeyboardAvoidingView, ToastAndroid } from 'react-native';

export default function AlbumsScreen({ route, navigation }: any) {
  const { artist } = route.params;
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const BACKEND_URL = 'https://sdevapi.arwindpianist.store';

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(BACKEND_URL + '/albums/' + artist.id, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.albums) setAlbums(data.albums);
        else setError('No albums found.');
      })
      .catch(err => setError('Error: ' + (err.message || String(err))))
      .finally(() => setLoading(false));
  }, [artist.id]);

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
        <Text style={styles.heading}>Albums by</Text>
        <Text style={styles.artistName}>{artist.name}</Text>
        <Text style={styles.instructions}>
          Tap an album to view its tracks. Use the navigation buttons below to go back or restart.
        </Text>
        {loading ? <Text style={styles.meta}>Loading albums...</Text> : null}
        <FlatList
          data={albums}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.albumCard} activeOpacity={0.85} onPress={() => navigation.navigate('Tracks', { album: item })}>
              {item.images && item.images[0] && (
                <View style={styles.albumImageWrapper}>
                  <img src={item.images[0].url} alt={item.title} style={{ width: 72, height: 72, borderRadius: 12 }} />
                </View>
              )}
              <Text style={styles.albumTitle}>{item.title}</Text>
              <Text style={styles.meta}>Release: {item.releaseDate}</Text>
              <Text style={styles.meta}>Tracks: {item.totalTracks}</Text>
            </TouchableOpacity>
          )}
          style={styles.flatList}
        />
        <View style={styles.navButtons}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
            <Text style={styles.navButtonText}>Back to Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.replace('Auth')}>
            <Text style={styles.navButtonText}>Back to Auth</Text>
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
  artistName: {
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
  albumCard: {
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
  albumImageWrapper: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#222',
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumTitle: {
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
  navButton: {
    backgroundColor: '#23272F',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  navButtonText: {
    color: '#1DB954',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
