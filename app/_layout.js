import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import {Slot, useRouter, useSegments} from "expo-router";
import "../global.css";
import { AuthContextProvider, useAuth } from '../context/authContext';
import { MenuProvider } from 'react-native-popup-menu';
import { useFonts } from 'expo-font';

const MainLayout = ()=>{
    const {isAuthenticated} = useAuth();
    const segments = useSegments();
    const router = useRouter();


    useEffect(()=>{
        // check if user is authenticated or not
        if(typeof isAuthenticated=='undefined') return;
        const inApp = segments[0]=='(app)';
        if(isAuthenticated && !inApp){
            // redirect to home
            router.replace('home');
        }
    }, [isAuthenticated])

    return <Slot />
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <MenuProvider>
        <AuthContextProvider>
            <MainLayout />
        </AuthContextProvider>
    </MenuProvider>
    
  )
}