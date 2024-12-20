import { View, Text, StyleSheet, FlatList } from 'react-native'
import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import Header from '../../components/home/Header';
import Slider from '../../components/home/Slider';
import PetListByCategory from '../../components/home/PetListByCategory';
import { useAuth } from '../../context/authContext';
import { initSliders } from '../../utils/initSliders';

const Colors = {
  PRIMARY: '#9fc0af',
  LIGHT_PRIMARY: '#e8f1ec'
}

export default function Home() {
  const { user } = useAuth();
  const isSitter = user?.role === 'sitter';

  useEffect(() => {
    initSliders();
  }, []);

  const SitterHomeContent = () => (
    <View style={{ padding: 20 }}>
      <Text style={{
        fontFamily: 'Poppins-Medium',
        fontSize: 24,
        marginBottom: 20
      }}>My Requests</Text>
      
      {/* Тут буде список запитів від власників тварин */}
    </View>
  );

  const OwnerHomeContent = () => (
    <View style={{ flex: 1 }}>
      <Header />
      <Slider />
      <PetListByCategory />
    </View>
  );

  return (
    <View style={{
      flex: 1,
      backgroundColor: 'white',
    }}>
      <StatusBar style="dark" />
      <FlatList
        data={[1]}
        renderItem={() => isSitter ? <SitterHomeContent /> : <OwnerHomeContent />}
        contentContainerStyle={{
          padding: 20,
          paddingTop: 20
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  addNewPetContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: Colors.LIGHT_PRIMARY,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 15,
    borderStyle: 'dashed',
    justifyContent: 'center'
  }
})