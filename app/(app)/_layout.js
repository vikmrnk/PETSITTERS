import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { AuthContextProvider, useAuth } from '../../context/authContext'

function AppLayout() {
    const { user } = useAuth();
    const isSitter = user?.role === 'sitter';

    return (
        <Tabs screenOptions={{
            tabBarStyle: {
                backgroundColor: 'white',
                height: 60,
                paddingBottom: 8,
                paddingTop: 8
            },
            tabBarActiveTintColor: '#9fc0af',
            tabBarInactiveTintColor: 'gray'
        }}>
            <Tabs.Screen 
                name="home" 
                options={{
                    headerShown: false,
                    tabBarLabel: isSitter ? 'Requests' : 'Home',
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name={isSitter ? "list" : "home"} size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen 
                name="favorites" 
                options={{
                    headerShown: false,
                    tabBarLabel: isSitter ? 'Schedule' : 'Favorites',
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name={isSitter ? "calendar" : "heart"} size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen 
                name="messages" 
                options={{
                    headerShown: false,
                    tabBarLabel: 'Messages',
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="chatbubble-ellipses" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen 
                name="profile" 
                options={{
                    headerShown: false,
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="person" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen 
                name="posts" 
                options={{
                    headerShown: false,
                    tabBarLabel: 'Posts',
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="images" size={size} color={color} />
                    )
                }}
            />
        </Tabs>
    )
}

// Обгортаємо в провайдер
export default function WrappedAppLayout() {
    return (
        <AuthContextProvider>
            <AppLayout />
        </AuthContextProvider>
    )
}