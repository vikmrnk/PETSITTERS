import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/authContext';
import SittersListItem from '../../components/home/SittersListItem';

const Colors = {
  PRIMARY: '#9fc0af',
  WHITE: '#FFFFFF',
  GRAY: '#666666'
};

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (!user?.userId) return;

    try {
      // Отримуємо всі улюблені записи для поточного користувача
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('userId', '==', user.userId));
      const querySnapshot = await getDocs(q);

      // Отримуємо дані сіттерів
      const favoriteSitters = await Promise.all(
        querySnapshot.docs.map(async (favoriteDoc) => {
          const sitterData = favoriteDoc.data().sitterData;
          return {
            id: favoriteDoc.data().sitterId,
            ...sitterData,
            // Додаємо додаткові поля, якщо вони потрібні
            isFavorite: true
          };
        })
      );

      setFavorites(favoriteSitters);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{
        marginTop: 50,
        marginBottom: 10
      }}>
        <Text style={{
          fontFamily: 'Poppins-Medium',
          fontSize: 30,
          color: '#333'
        }}>Favorites</Text>
      </View>
      
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={({ item }) => (
            <View style={styles.sitterContainer}>
              <SittersListItem sitter={item} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No favorite sitters yet</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    padding: 20
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 24,
    marginBottom: 20
  },
  listContainer: {
    paddingBottom: 20
  },
  sitterContainer: {
    marginBottom: 15
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.GRAY
  }
});
