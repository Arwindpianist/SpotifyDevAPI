import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ScrollView, ToastAndroid } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ArtistSearchScreen({ navigation }: any) {
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const BACKEND_URL = 'https://sdevapi.arwindpianist.store';

  useEffect(() => {
    if (error) {
      if (Platform.OS === 'android') {
        ToastAndroid.show(error, ToastAndroid.LONG);
      } else if (Platform.OS === 'web') {
        alert(error);
      }
    }
  }, [error]);

  const handleSearch = async () => {
    setError('');
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(BACKEND_URL + '/search/artist?q=' + encodeURIComponent(query), { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.artists) {
        setResults(data.artists);
      } else {
        setError('No artists found.');
      }
    } catch (err: any) {
      setError('Error: ' + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    navigation.replace('Auth');
    return null;
  }

  return (
    <KeyboardAvoidingView style={styles.safeArea} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Search for Artist</Text>
        <Text style={styles.instructions}>
          Enter an artist name and tap Search. Tap an artist card to view their albums. Use the navigation button below to go back or restart.
        </Text>
        <View style={styles.searchRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter artist name"
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={loading || !query}>
            <Text style={styles.searchButtonText}>{loading ? 'Searching...' : 'Search'}</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.artistCard} activeOpacity={0.85} onPress={() => navigation.navigate('Albums', { artist: item })}>
              {item.images && item.images[0] && (
                <View style={styles.artistImageWrapper}>
                  <img src={item.images[0].url} alt={item.name} style={{ width: 64, height: 64, borderRadius: 32 }} />
                </View>
              )}
              <Text style={styles.artistName}>{item.name}</Text>
              <Text style={styles.artistMeta}>Followers: {item.followers}</Text>
              <Text style={styles.artistMeta}>Genres: {item.genres.join(', ')}</Text>
              <Text style={styles.artistMeta}>Popularity: {item.popularity}</Text>
            </TouchableOpacity>
          )}
          style={styles.flatList}
        />
        <View style={styles.navButtons}>
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
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  instructions: {
    color: '#B0B3B8',
    fontSize: 15,
    marginBottom: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#23272F',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#1DB954',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  error: {
    color: '#e53935',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  flatList: {
    marginTop: 8,
    maxHeight: 420,
  },
  artistCard: {
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
  artistImageWrapper: {
    marginBottom: 10,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#222',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  artistMeta: {
    fontSize: 14,
    color: '#B0B3B8',
    marginBottom: 2,
    textAlign: 'center',
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
