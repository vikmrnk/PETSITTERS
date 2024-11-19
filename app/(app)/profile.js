import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '../../context/authContext'
import { Ionicons } from '@expo/vector-icons'

const Colors = {
  PRIMARY: '#9fc0af',
  LIGHT_PRIMARY: '#e8f1ec',
  GRAY: '#666',
  WHITE: '#fff'
}

export default function Profile() {
  const Menu = [
    {
      id: 1,
      name: 'Add New Pet',
      icon: 'add-circle',
      path: '/add-new-pet'
    },
    {
      id: 5,
      name: 'My Post',
      icon: 'bookmark',
      path: '/../user-post'
    },
    {
      id: 2,
      name: 'Favorites',
      icon: 'heart',
      path: '/(tabs)/favorite'
    },
    {
      id: 3,
      name: 'Inbox',
      icon: 'chatbubble',
      path: '/(tabs)/inbox'
    },
    {
      id: 4,
      name: 'Logout',
      icon: 'exit', 
      path: 'logout'
    }
  ]
  
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const onPressMenu = async (menu) => {
    if (menu.path == 'logout') {
      const response = await logout();
      if(response.success) {
        router.replace('/(auth)/signIn');
      }
      return;
    }
    router.push(menu.path);
  }

  return (
    <View style={{
      padding: 20,
      marginTop: 20
    }}>
      <Text style={{
        fontFamily: 'Poppins-Medium',
        fontSize: 30
      }}>Profile</Text>

      <View style={{
        display: 'flex',
        alignItems: 'center',
        marginVertical: 25
      }}>
        <Image source={{ uri: user?.profileUrl || 'https://placeholder.com/user' }} style={{
          width: 80,
          height: 80,
          borderRadius: 99,
        }} />

        <Text style={{
          fontFamily: 'Poppins-Bold',
          fontSize: 20,
          marginTop: 6
        }}>{user?.username || 'User'}</Text>
        <Text style={{
          fontFamily: 'Poppins-Regular',
          fontSize: 16,
          color: Colors.GRAY
        }}>{user?.email}</Text>
      </View>

      <FlatList
        data={Menu}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onPressMenu(item)}
            key={item.id}
            style={{
              marginVertical: 10,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: Colors.WHITE,
              padding: 10,
              borderRadius: 10
            }}>
            <Ionicons name={item?.icon} size={30}
              color={Colors.PRIMARY}
              style={{
                padding: 10,
                backgroundColor: Colors.LIGHT_PRIMARY,
                borderRadius: 10
              }}
            />
            <Text style={{
              fontFamily: 'Poppins-Regular',
              fontSize: 20
            }}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
} 