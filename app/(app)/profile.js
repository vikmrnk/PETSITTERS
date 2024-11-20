import { View, Text, Image, TouchableOpacity, FlatList, ScrollView, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '../../context/authContext'
import { Ionicons } from '@expo/vector-icons'
import AddPetModal from '../../components/AddPetModal'
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore'
import { db } from '../../firebaseConfig'
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const Colors = {
  PRIMARY: '#9fc0af',
  LIGHT_PRIMARY: '#e8f1ec',
  GRAY: '#666',
  WHITE: '#fff'
}

const IMGBB_API_KEY = '8b58059a822c985794ac0ea34543d935';

// Компонент для відображення картки тварини
const PetCard = ({ pet, onEdit }) => (
  <View style={{
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }}>
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10
    }}>
      <Text style={{
        fontFamily: 'Poppins-Medium',
        fontSize: 18,
      }}>{pet.name}</Text>
      
      <TouchableOpacity 
        onPress={() => onEdit(pet)}
        style={{
          padding: 8,
          backgroundColor: Colors.LIGHT_PRIMARY,
          borderRadius: 20,
        }}
      >
        <Ionicons name="pencil" size={16} color={Colors.PRIMARY} />
      </TouchableOpacity>
    </View>

    <Image 
      source={{ uri: pet.imageUrl || 'https://via.placeholder.com/150' }}
      style={{
        width: '100%',
        height: 150,
        borderRadius: 10,
        marginBottom: 10
      }}
    />
    
    <Text style={{
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      color: Colors.GRAY
    }}>{pet.type} • {pet.breed}</Text>
    
    {pet.description && (
      <Text style={{
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        marginTop: 5,
        color: Colors.GRAY
      }}>{pet.description}</Text>
    )}
  </View>
);

export default function Profile() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [pets, setPets] = useState([]);
  const { user, logout, updateUserData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Завантаження списку тварин користувача
  useEffect(() => {
    if (user?.userId) {
      const q = query(
        collection(db, 'pets'),
        where('ownerId', '==', user.userId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const petsData = [];
        snapshot.forEach((doc) => {
          petsData.push({ id: doc.id, ...doc.data() });
        });
        setPets(petsData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const Menu = [
    {
      id: 1,
      name: 'Add New Pet',
      icon: 'add-circle',
      path: 'add-pet',
      color: Colors.PRIMARY
    },
    {
      id: 2,
      name: 'Logout',
      icon: 'exit', 
      path: 'logout',
      color: Colors.PRIMARY
    }
  ];
  
  const onPressMenu = async (menu) => {
    if (menu.path === 'logout') {
      const response = await logout();
      if(response.success) {
        router.replace('/(auth)/signIn');
      }
      return;
    }
    if (menu.path === 'add-pet') {
      setIsModalVisible(true);
      return;
    }
    router.push(menu.path);
  }

  const handleEditPet = (pet) => {
    setEditingPet(pet);
    setIsModalVisible(true);
  };

  const pickProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setLoading(true);
        const imageUri = result.assets[0].uri;

        const formData = new FormData();
        formData.append('image', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'profile.jpg'
        });

        try {
          const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
            {
              method: 'POST',
              body: formData,
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          const data = await response.json();
          
          if (data.success) {
            const imageUrl = data.data.url;
            
            // Оновлюємо фото в обох колекціях
            const userRef = doc(db, 'users', user.userId);
            const ownerRef = doc(db, 'owners', user.userId);
            
            const updatePromises = [
              updateDoc(userRef, { profileUrl: imageUrl }),
              updateDoc(ownerRef, { profileUrl: imageUrl })
            ];
            
            await Promise.all(updatePromises);

            // Оновлюємо локальний стан
            updateUserData({
              ...user,
              profileUrl: imageUrl
            });

            Alert.alert('Success', 'Profile photo updated successfully!');
          }
        } catch (error) {
          console.error('Upload error:', error);
          Alert.alert('Error', 'Failed to upload image');
        }
      }
    } catch (error) {
      console.error('ImagePicker Error:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <View style={{ padding: 20 }}>
        <View style={{
          marginTop: 50,
          marginBottom: 10
        }}>
          <Text style={{
            fontFamily: 'Poppins-Medium',
            fontSize: 30,
            color: '#333'
          }}>Profile</Text>
        </View>
        
        <View style={{
          alignItems: 'center',
          marginVertical: 25
        }}>
          <TouchableOpacity 
            onPress={pickProfileImage}
            disabled={loading}
            style={{
              position: 'relative',
              width: 80,
              height: 80,
            }}
          >
            <Image 
              source={{ uri: user?.profileUrl || 'https://via.placeholder.com/150' }} 
              style={{
                width: 80,
                height: 80,
                borderRadius: 99,
              }} 
            />
            {loading ? (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: 99,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <ActivityIndicator color={Colors.WHITE} />
              </View>
            ) : (
              <View style={{
                position: 'absolute',
                bottom: -5,
                right: -5,
                backgroundColor: Colors.LIGHT_PRIMARY,
                borderRadius: 99,
                padding: 8,
                borderWidth: 2,
                borderColor: Colors.WHITE
              }}>
                <Ionicons 
                  name="camera" 
                  size={14} 
                  color={Colors.PRIMARY} 
                />
              </View>
            )}
          </TouchableOpacity>

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

        {/* Оновлене меню */}
        {Menu.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onPressMenu(item)}
            style={{
              marginVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.LIGHT_PRIMARY,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: Colors.PRIMARY,
            }}>
            <View style={{
              backgroundColor: Colors.WHITE,
              padding: 10,
              borderRadius: 10,
              marginRight: 15
            }}>
              <Ionicons 
                name={item?.icon} 
                size={24}
                color={Colors.PRIMARY}
              />
            </View>
            <Text style={{
              fontFamily: 'Poppins-Medium',
              fontSize: 16,
              color: Colors.PRIMARY,
              flex: 1
            }}>{item.name}</Text>
            {item.path !== 'logout' && (
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={Colors.PRIMARY}
              />
            )}
          </TouchableOpacity>
        ))}

        {/* Список тварин */}
        <View style={{ marginTop: 20 }}>
          <Text style={{
            fontFamily: 'Poppins-Medium',
            fontSize: 20,
            marginBottom: 15
          }}>My Pets</Text>
          
          {pets.map((pet) => (
            <PetCard 
              key={pet.id} 
              pet={pet} 
              onEdit={handleEditPet}
            />
          ))}
        </View>

        {/* Модальне вікно */}
        <AddPetModal 
          visible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            setEditingPet(null);
          }}
          userId={user?.userId}
          pet={editingPet}
        />
      </View>
    </ScrollView>
  );
} 