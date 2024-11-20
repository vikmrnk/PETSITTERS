import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useAuth } from '../../context/authContext'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';

export default function Header() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View>
        <Text style={styles.welcomeText}>Welcome,</Text>
        <Text style={styles.nameText}>
          {user?.name || user?.username || 'Guest'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
    marginTop: hp(4),
    paddingHorizontal: wp(2),
    paddingTop: hp(2),
  },
  welcomeText: {
    fontSize: hp(2),
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  nameText: {
    fontSize: hp(3),
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  }
});