import { View, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';

export default function MarkFav({sitter, color='black'}) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && sitter) {
      checkFavoriteStatus();
    }
  }, [user, sitter]);

  const checkFavoriteStatus = async () => {
    try {
      // Тимчасово просто повертаємо false
      // Пізніше тут буде логіка перевірки обраного
      setIsFavorite(false);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (loading || !user) return;

    try {
      setLoading(true);
      // Тимчасово просто перемикаємо ст
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable onPress={toggleFavorite}>
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={24}
        color={color}
      />
    </Pressable>
  );
}
