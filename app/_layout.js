import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import {Slot, useRouter, useSegments} from "expo-router";
import "../global.css";
import { AuthContextProvider, useAuth } from '../context/authContext';
import { MenuProvider } from 'react-native-popup-menu';
import { useFonts } from 'expo-font';
import { SitterContextProvider } from '../context/sitterContext';

// Виносимо логіку маршрутизації в окремий компонент
function InitialLayout() {
    const {isAuthenticated, user} = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(()=>{
        // Перевіряємо автентифікацію
        if(typeof isAuthenticated=='undefined') return;

        const inApp = segments[0]=='(app)';
        const inSitter = segments[0]=='(sitter)';

        console.log('Current user:', user);
        console.log('Current role:', user?.role);
        console.log('Current segment:', segments[0]);

        if(isAuthenticated){
            // Якщо користувач автентифікований
            if(user?.role === 'sitter'){
                console.log('Redirecting to sitter interface');
                // Якщо це сіттер і він не в інтерфейсі сіттера
                if(!inSitter){
                    router.replace('/(sitter)/home');
                }
            } else {
                console.log('Redirecting to owner interface');
                // Якщо це власник і він не в інтерфейсі власника
                if(!inApp){
                    router.replace('/(app)/home');
                }
            }
        } else {
            // Якщо користувач не автентифікований
            if(inApp || inSitter){
                router.replace('/signIn');
            }
        }
    }, [isAuthenticated, user?.role])

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
            <SitterContextProvider>
                <InitialLayout />
            </SitterContextProvider>
        </AuthContextProvider>
    </MenuProvider>
    
  )
}