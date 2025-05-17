import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ToastAndroid } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Use environment variables for sensitive config
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://sdevapi.arwindpianist.store';

export default function AuthScreen({ navigation }: any) {
  const { clientId, setClientId, clientSecret, setClientSecret, setIsAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper to get redirect URI
  // Now set for production deployment at spotifydevapi.arwindpianist.store
  const getRedirectUri = () =>
    Platform.select({
      web: process.env.EXPO_PUBLIC_SPOTIFY_REDIRECT_URI || 'https://spotifydevapi.arwindpianist.store/auth/callback',
      default: 'exp://192.168.1.6:8081/--/auth/callback',
    });

  // Handle OAuth callback (web)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code && clientId && clientSecret) {
        setLoading(true);
        fetch(BACKEND_URL + '/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            code,
            redirectUri: getRedirectUri(),
            clientId,
            clientSecret,
          }),
        })
          .then(async (res) => {
            const data = await res.json();
            if (res.ok) {
              setIsAuthenticated(true);
              window.history.replaceState({}, document.title, window.location.pathname);
              navigation.replace('ArtistSearch');
            } else {
              setError('Token exchange failed: ' + (data.error || 'Unknown error'));
            }
          })
          .catch((err) => {
            setError('Token exchange error: ' + (err.message || String(err)));
          })
          .finally(() => setLoading(false));
      }
    }
  }, [clientId, clientSecret, setIsAuthenticated, navigation]);

  useEffect(() => {
    if (error) {
      if (Platform.OS === 'android') {
        ToastAndroid.show(error, ToastAndroid.LONG);
      } else if (Platform.OS === 'web') {
        alert(error);
      }
    }
  }, [error]);

  const handleAuthenticate = () => {
    setError('');
    if (!clientId || !clientSecret) {
      setError('Please enter both Client ID and Client Secret');
      return;
    }
    // Store credentials for OAuth callback
    if (Platform.OS === 'web') {
      window.localStorage.setItem('spotify_client_id', clientId);
      window.localStorage.setItem('spotify_client_secret', clientSecret);
      const redirectUri = getRedirectUri();
      const authUrl =
        `https://accounts.spotify.com/authorize?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(redirectUri as string)}` +
        `&scope=user-read-private user-read-email`;
      window.location.href = authUrl;
    } else {
      setError('Native OAuth not implemented. Use web for now.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.safeArea} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Spotify API Explorer</Text>
        <Text style={styles.instructions}>
          Enter your Spotify Client ID and Secret. Tap Authenticate to start. You will be redirected to Spotify to log in and authorize the app.
        </Text>
        <Text style={styles.label}>Client ID</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Client ID"
          placeholderTextColor="#888"
          value={clientId}
          onChangeText={setClientId}
          autoCapitalize="none"
        />
        <Text style={styles.label}>Client Secret</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Client Secret"
          placeholderTextColor="#888"
          value={clientSecret}
          onChangeText={setClientSecret}
          secureTextEntry
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.authButton} onPress={handleAuthenticate} disabled={loading}>
          <Text style={styles.authButtonText}>{loading ? 'Authenticating...' : 'Authenticate'}</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
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
  label: {
    fontSize: 16,
    color: '#B0B3B8',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#23272F',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  error: {
    color: '#e53935',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  authButton: {
    backgroundColor: '#1DB954',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  authButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
