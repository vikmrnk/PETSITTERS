import { View, FlatList, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import Category from './Category';
import SittersListItem from './SittersListItem';
import { collection, query, where, getDocs, deleteDoc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/authContext';
import { useRouter } from 'expo-router';

export default function SittersListByCategory() {
  const [sitters, setSitters] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('boarding');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadSitters = async () => {
      try {
        const sittersRef = collection(db, 'sitters');
        console.log('Searching for category:', selectedCategory);
        
        const q = query(
          sittersRef,
          where('services', 'array-contains', selectedCategory)
        );
        
        const querySnapshot = await getDocs(q);
        console.log('Found sitters:', querySnapshot.size);
        
        const sittersData = [];
        querySnapshot.forEach((doc) => {
          sittersData.push({ id: doc.id, ...doc.data() });
        });
        
        setSitters(sittersData);
      } catch (error) {
        console.error('Error loading sitters:', error);
      }
    };

    loadSitters();
  }, [selectedCategory]);

  const handleCategorySelect = (categoryValue) => {
    console.log('Selected category:', categoryValue);
    setSelectedCategory(categoryValue);
  };

  const handleAddToFavorites = async (sitter) => {
    if (!user?.userId) {
        Alert.alert(
            "Authentication Required",
            "Please sign in to add favorites",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Sign In", 
                    onPress: () => router.push('/(auth)/signIn')
                }
            ]
        );
        return;
    }

    try {
        const favoriteRef = doc(db, 'favorites', `${user.userId}_${sitter.userId}`);
        const favoriteDoc = await getDoc(favoriteRef);

        if (favoriteDoc.exists()) {
            // Якщо вже є в улюблених - видаляємо
            await deleteDoc(favoriteRef);
            // Оновлюємо локальний стан
            setSitters(prevSitters => 
                prevSitters.map(s => 
                    s.userId === sitter.userId 
                        ? {...s, isFavorite: false}
                        : s
                )
            );
        } else {
            // Якщо немає в улюблених - додаємо
            await setDoc(favoriteRef, {
                userId: user.userId,
                sitterId: sitter.userId,
                sitterData: sitter,
                createdAt: serverTimestamp()
            });
            // Оновлюємо локальний стан
            setSitters(prevSitters => 
                prevSitters.map(s => 
                    s.userId === sitter.userId 
                        ? {...s, isFavorite: true}
                        : s
                )
            );
        }
    } catch (error) {
        console.error('Error updating favorites:', error);
        Alert.alert('Error', 'Failed to update favorites. Please try again.');
    }
  };

  return (
    <View>
      <Category onSelectCategory={handleCategorySelect} />

      <FlatList
        data={sitters}
        style={{ marginTop: 10 }}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SittersListItem sitter={item} onAddToFavorites={handleAddToFavorites} />
        )}
      />
    </View>
  )
} 