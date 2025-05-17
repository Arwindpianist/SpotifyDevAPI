import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './context/AuthContext';
import AuthScreen from './screens/AuthScreen';
import ArtistSearchScreen from './screens/ArtistSearchScreen';
import AlbumsScreen from './screens/AlbumsScreen';
import TracksScreen from './screens/TracksScreen';

const Stack = createStackNavigator();

export default function App(): React.ReactElement {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Auth"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="ArtistSearch" component={ArtistSearchScreen} />
          <Stack.Screen name="Albums" component={AlbumsScreen} />
          <Stack.Screen name="Tracks" component={TracksScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
