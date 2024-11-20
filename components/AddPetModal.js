import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';

const Colors = {
  PRIMARY: '#9fc0af',
  LIGHT_PRIMARY: '#e8f1ec',
  GRAY: '#666',
  WHITE: '#fff'
};

const IMGBB_API_KEY = '8b58059a822c985794ac0ea34543d935';

export default function AddPetModal({ visible, onClose, userId, pet }) {
  const [petData, setPetData] = useState({
    name: '',
    type: '',
    breed: '',
    age: '',
    weight: '',
    description: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pet) {
      setPetData({
        name: pet.name || '',
        type: pet.type || '',
        breed: pet.breed || '',
        age: pet.age?.toString() || '',
        weight: pet.weight?.toString() || '',
        description: pet.description || '',
        imageUrl: pet.imageUrl || ''
      });
    } else {
      setPetData({
        name: '',
        type: '',
        breed: '',
        age: '',
        weight: '',
        description: '',
        imageUrl: ''
      });
    }
  }, [pet]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        setLoading(true);
        const imageUri = result.assets[0].uri;

        // Створюємо FormData для завантаження
        const formData = new FormData();
        formData.append('image', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'photo.jpg'
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
            setPetData(prev => ({...prev, imageUrl}));
            Alert.alert('Success', 'Photo uploaded successfully!');
          } else {
            throw new Error('Failed to upload image');
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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (!petData.name || !petData.type) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // Додаємо або оновлюємо тварину
      let petId;
      if (pet) {
        // Оновлюємо існуючу тварину
        petId = pet.id;
        const petRef = doc(db, 'pets', pet.id);
        await updateDoc(petRef, {
          ...petData,
          age: Number(petData.age),
          weight: Number(petData.weight),
          updatedAt: serverTimestamp()
        });
      } else {
        // Створюємо нову тварину
        const petsRef = collection(db, 'pets');
        const newPetDoc = await addDoc(petsRef, {
          ...petData,
          ownerId: userId,
          createdAt: serverTimestamp(),
          age: Number(petData.age),
          weight: Number(petData.weight)
        });
        petId = newPetDoc.id;

        // Оновлюємо масив pets у документі власника
        const ownerRef = doc(db, 'owners', userId);
        await updateDoc(ownerRef, {
          pets: arrayUnion(petId)
        });
      }

      Alert.alert('Success', pet ? 'Pet updated successfully!' : 'Pet added successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving pet:', error);
      Alert.alert('Error', 'Failed to save pet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={Colors.GRAY} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>
              {pet ? 'Edit Pet' : 'Add New Pet'}
            </Text>

            <TouchableOpacity 
              style={styles.imageUpload}
              onPress={pickImage}
              disabled={loading}
            >
              {petData.imageUrl ? (
                <Image 
                  source={{ uri: petData.imageUrl }}
                  style={styles.previewImage}
                />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="camera" size={40} color={Colors.PRIMARY} />
                  <Text style={styles.placeholderText}>
                    {loading ? 'Uploading...' : 'Tap to add photo'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Pet Name"
              value={petData.name}
              onChangeText={(text) => setPetData(prev => ({...prev, name: text}))}
            />

            <TextInput
              style={styles.input}
              placeholder="Type (e.g., Dog, Cat)"
              value={petData.type}
              onChangeText={(text) => setPetData(prev => ({...prev, type: text}))}
            />

            <TextInput
              style={styles.input}
              placeholder="Breed"
              value={petData.breed}
              onChangeText={(text) => setPetData(prev => ({...prev, breed: text}))}
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Age"
                keyboardType="numeric"
                value={petData.age}
                onChangeText={(text) => setPetData(prev => ({...prev, age: text}))}
              />

              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Weight (kg)"
                keyboardType="numeric"
                value={petData.weight}
                onChangeText={(text) => setPetData(prev => ({...prev, weight: text}))}
              />
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              multiline
              numberOfLines={4}
              value={petData.description}
              onChangeText={(text) => setPetData(prev => ({...prev, description: text}))}
            />

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Saving...' : (pet ? 'Save Changes' : 'Add Pet')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  imageUpload: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.LIGHT_PRIMARY,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.GRAY,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontFamily: 'Poppins-Regular',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: Colors.WHITE,
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
});
