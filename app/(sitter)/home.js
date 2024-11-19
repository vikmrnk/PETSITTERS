import { View, Text, FlatList, StyleSheet, Image } from 'react-native'
import React from 'react'
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/authContext';

export default function SitterHome() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header з привітанням */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user?.username || 'Sitter'}</Text>
        </View>
        <Image 
          source={{ uri: user?.profileUrl || 'https://placeholder.com/user' }}
          style={styles.profileImage}
        />
      </View>

      {/* Статистика */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Active Requests</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Completed Jobs</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>5.0</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Список запитів */}
      <View style={styles.requestsContainer}>
        <Text style={styles.sectionTitle}>Recent Requests</Text>
        <Text style={styles.emptyText}>No requests yet</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
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
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
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
  },
  requestsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    marginBottom: 15,
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});