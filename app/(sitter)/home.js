import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/authContext';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function SitterHome() {
  const { user } = useAuth();
  const [sitterData, setSitterData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.userId) {
      setLoading(true);
      
      const sitterDoc = doc(db, 'sitters', user.userId);
      const unsubscribe = onSnapshot(sitterDoc, (doc) => {
        if (doc.exists()) {
          setSitterData(doc.data());
        }
        setLoading(false);
      }, (error) => {
        console.error("Error loading sitter data:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9fc0af" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header з привітанням та фото */}
      <View style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>
              {sitterData?.name || user?.name || user?.username || 'Sitter'}
            </Text>
            <Text style={styles.locationText}>{sitterData?.location || 'Location not set'}</Text>
          </View>
          <Image 
            source={{ 
              uri: sitterData?.imageUrl || user?.profileUrl || 'https://via.placeholder.com/60'
            }}
            style={styles.profileImage}
          />
        </View>
      </View>

      {/* Статистика */}
      <View style={styles.card}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Active Requests</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{sitterData?.price || '0'}</Text>
            <Text style={styles.statLabel}>UAH/hour</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{sitterData?.rating || '5.0'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>

      {/* Послуги */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>My Services</Text>
        <View style={styles.servicesList}>
          {sitterData?.services?.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Доступність */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Availability</Text>
        <View style={styles.daysList}>
          {sitterData?.availability?.map((day, index) => (
            <View key={index} style={styles.dayItem}>
              <Text style={styles.dayText}>{day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Опис */}
      {sitterData?.description && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.descriptionText}>{sitterData.description}</Text>
        </View>
      )}

      {/* Декоративне зображення */}
      <View style={styles.imageContainer}>
        <Image 
          source={require('../../assets/images/homesit.png')}
          style={styles.bottomImage}
          resizeMode="contain"
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  welcomeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#666',
  },
  nameText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 24,
    color: '#000',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#9fc0af',
  },
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#000',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: '#e8f1ec',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#9fc0af',
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  locationText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceItem: {
    backgroundColor: '#e8f1ec',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  serviceText: {
    color: '#9fc0af',
    fontFamily: 'Poppins-Medium',
  },
  daysList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dayItem: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dayText: {
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  descriptionText: {
    color: '#666',
    fontFamily: 'Poppins-Regular',
    lineHeight: 22,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  bottomImage: {
    width: '100%',
    height: 300,
    opacity: 0.9,
  }
});