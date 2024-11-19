import { View, Text } from 'react-native'
import React from 'react'
import { StatusBar } from 'expo-status-bar'

export default function Favorites() {
  return (
    <View style={{
      flex: 1,
      backgroundColor: 'white',
      padding: 20
    }}>
      <StatusBar style="dark" />
      <Text style={{
        fontFamily: 'Poppins-Medium',
        fontSize: 20
      }}>Favorites Page</Text>
    </View>
  )
}
