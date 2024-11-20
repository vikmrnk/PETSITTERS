import { View, Pressable, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function MarkFav({ sitter, color = 'black' }) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && sitter?.id) {
      checkFavoriteStatus();
    }
  }, [user, sitter]);

  const checkFavoriteStatus = async () => {
    if (!user) return;
    
    try {
      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef, 
        where('userId', '==', user.userId),
        where('sitterId', '==', sitter.id)
      );
      
      const querySnapshot = await getDocs(q);
      setIsFavorite(!querySnapshot.empty);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to add favorites');
      return;
    }
    if (!sitter?.id) {
      console.error('No sitter ID provided');
      return;
    }

    setLoading(true);
    try {
      const favoriteId = `${user.userId}_${sitter.id}`;
      const favoriteRef = doc(db, 'favorites', favoriteId);

      if (isFavorite) {
        await deleteDoc(favoriteRef);
      } else {
        await setDoc(favoriteRef, {
          userId: user.userId,
          sitterId: sitter.id,
          createdAt: new Date(),
          sitterData: {
            name: sitter.name,
            imageUrl: sitter.imageUrl,
            location: sitter.location,
            price: sitter.price,
            rating: sitter.rating
          }
        });
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable 
      onPress={toggleFavorite}
      disabled={loading}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1
      })}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={24}
        color={isFavorite ? '#ff4444' : color}
      />
    </Pressable>
  );
}
