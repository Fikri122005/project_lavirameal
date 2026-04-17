import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Screens
import LoginScreen from './src/screen/auth/LoginScreen';
import Login1 from './src/screen/auth/login1';
import HomeScreen from './src/screen/main/sppg/HomeScreenSppg';
import HomeSekolahScreen from './src/screen/main/admin_sekolah/HomeScreenSekolah';
import SekolahScreen from './src/screen/main/sppg/SekolahScreen';
import TambahSekolahScreen from './src/screen/main/sppg/TambahSekolahScreen';
import DetailSekolahScreen from './src/screen/main/sppg/DetailSekolahScreen';
import LaporanScreen from './src/screen/main/sppg/LaporanScreen';
import ProfilScreen from './src/screen/main/sppg/ProfilScreen';
import KantinScreen from './src/screen/main/sppg/KantinScreen';
import VerifikasiKantinScreen from './src/screen/main/sppg/VerifikasiKantinScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" translucent={true} />
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login1"
          component={Login1}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeSekolah"
          component={HomeSekolahScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Sekolah"
          component={SekolahScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TambahSekolah"
          component={TambahSekolahScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DetailSekolah"
          component={DetailSekolahScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Laporan"
          component={LaporanScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profil"
          component={ProfilScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Kantin"
          component={KantinScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VerifikasiKantin"
          component={VerifikasiKantinScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
