import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MarkFav from '../MarkFav';

const Colors = {
  PRIMARY: '#9fc0af',
  WHITE: '#FFFFFF',
  GRAY: '#666666'
};

export default function SittersListItem({ sitter }) {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      onPress={() => router.push(`/sitter-details/${sitter.id}`)}
      style={{
        padding: 10,
        backgroundColor: Colors.WHITE,
        borderRadius: 15,
        marginRight: 15,
        elevation: 2
      }}>
      <View style={{ position: 'relative' }}>
        <Image source={
          typeof sitter.imageUrl === 'string' 
            ? { uri: sitter.imageUrl }
            : sitter.imageUrl
        } 
        style={{
          width: 160,
          height: 160,
          borderRadius: 15,
        }}/>
        
        <View style={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: 'rgba(255,255,255,0.8)',
          borderRadius: 15,
          padding: 5
        }}>
          <MarkFav sitter={sitter} color={Colors.PRIMARY} />
        </View>
      </View>
      
      <View style={{ padding: 10 }}>
        <Text style={{
          fontFamily: 'Poppins-Medium',
          fontSize: 16
        }}>{sitter.name}</Text>
        
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          marginTop: 3
        }}>
          <MaterialIcons name="star" size={20} color={Colors.PRIMARY} />
          <Text style={{
            fontFamily: 'Poppins-Medium',
            fontSize: 14,
            color: Colors.GRAY
          }}>{sitter.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
} 