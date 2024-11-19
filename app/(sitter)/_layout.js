import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { AuthContextProvider, useAuth } from '../../context/authContext'

function SitterLayout() {
    const { user } = useAuth();
    
    return (
        <Tabs 
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: 'white',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: '#e5e5e5'
                },
                tabBarActiveTintColor: '#9fc0af',
                tabBarInactiveTintColor: 'gray',
                tabBarLabelStyle: {
                    fontFamily: 'Poppins-Regular',
                    fontSize: 12
                }
            }}
            initialRouteName="home"
        >
            <Tabs.Screen 
                name="home" 
                options={{
                    headerShown: false,
                    title: 'Requests',
                    tabBarLabel: 'Requests',
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="list-outline" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen 
                name="messages" 
                options={{
                    headerShown: false,
                    title: 'Messages',
                    tabBarLabel: 'Messages',
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="chatbubble-outline" size={size} color={color} />
                    ),
                    tabBarBadge: null
                }}
            />
            <Tabs.Screen 
                name="profile" 
                options={{
                    headerShown: false,
                    title: 'Profile',
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    )
                }}
            />
        </Tabs>
    )
}

export default function WrappedSitterLayout() {
    return (
        <AuthContextProvider>
            <SitterLayout />
        </AuthContextProvider>
    )
}
