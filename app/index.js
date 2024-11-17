import { View, Text, Image, Pressable } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Welcome() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('signIn');
  };

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'flex-start', 
      alignItems: 'center', 
      backgroundColor: '#fbcbc9' 
    }}>
      <StatusBar style="light" />
      
      <Text style={{
        fontFamily: 'Poppins-Bold',
        fontSize: 40,
        textAlign: 'center',
        marginTop: 100,
        color: 'white',
        paddingRight: 20,
      }}>
        Best Place For{'\n'}Your Little Pet
      </Text>
 
      <Image
        source={require('../assets/images/login.png')}
        style={{
          width: '100%',
          height: 400, 
          marginTop: 35,
        }}
        resizeMode="contain"
      />

      <View style={{
        padding: 20,
        display: 'flex',
        alignItems: 'center',
      }}>
        <Pressable 
          onPress={handleGetStarted}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={{
              fontFamily: 'Poppins-Bold',
              fontSize: 40,
              textAlign: 'center',
              color: 'white',
              marginTop: 40,
              paddingRight: 120,
            }}>
              Let's get{'\n'}started!
            </Text>
            <Text style={{
              fontSize: 70,
              color: '#9fc0af',
              marginTop: -100,
              paddingLeft: 200,
            }}>
              ➔
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}