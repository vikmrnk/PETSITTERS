import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/authContext'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { doc, getDoc, updateDoc, setDoc, writeBatch } from 'firebase/firestore'
import { db } from '../../firebaseConfig'

const Colors = {
  PRIMARY: '#9fc0af',
  LIGHT_PRIMARY: '#e8f1ec',
  GRAY: '#666',
  WHITE: '#fff'
}

const IMGBB_API_KEY = '8b58059a822c985794ac0ea34543d935';

export default function SitterProfile() {
    const { user, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
      description: '',
      location: '',
      experience: '',
      price: '',
      services: [],
      availability: [],
      name: user?.username || '',
      imageUrl: ''
    });

    const services = [
      {
        name: 'Boarding',
        value: 'boarding'
      },
      {
        name: 'Sitting',
        value: 'sitting'
      },
      {
        name: 'Walking',
        value: 'walking'
      },
      {
        name: 'Grooming',
        value: 'grooming'
      },
      {
        name: 'Training',
        value: 'training'
      },
      {
        name: 'Vet',
        value: 'vet'
      }
    ];

    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];

    useEffect(() => {
      loadProfileData();
    }, [user]);

    const loadProfileData = async () => {
      try {
        if (user?.userId) {
          const sitterDoc = doc(db, 'sitters', user.userId);
          const docSnap = await getDoc(sitterDoc);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileData({
              description: data.description || '',
              location: data.location || '',
              experience: data.experience || '',
              price: data.price || '',
              services: data.services || [],
              availability: data.availability || [],
              name: data.name || user?.username || '',
              imageUrl: data.imageUrl || ''
            });
          }
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    const handleSave = async () => {
      try {
        setLoading(true);
        if (!user?.userId) {
          throw new Error('User not found');
        }

        const sitterDoc = doc(db, 'sitters', user.userId);
        
        const servicesArray = Array.isArray(profileData.services) 
          ? profileData.services 
          : [profileData.services].filter(Boolean);

        await setDoc(sitterDoc, {
          ...profileData,
          services: servicesArray,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log('Saved services:', servicesArray);

        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } catch (error) {
        console.error("Error updating profile:", error);
        Alert.alert('Error', 'Failed to update profile');
      } finally {
        setLoading(false);
      }
    };

    const toggleService = (serviceValue) => {
      setProfileData(prev => {
        const currentServices = [...(prev.services || [])];
        
        const serviceIndex = currentServices.indexOf(serviceValue);
        
        if (serviceIndex !== -1) {
          currentServices.splice(serviceIndex, 1);
        } else {
          currentServices.push(serviceValue);
        }
        
        return {
          ...prev,
          services: currentServices
        };
      });
    };

    const toggleDay = (day) => {
      setProfileData(prev => ({
        ...prev,
        availability: prev.availability.includes(day)
          ? prev.availability.filter(d => d !== day)
          : [...prev.availability, day]
      }));
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Sorry, we need camera roll permissions to make this work!');
                return;
            }

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
                        
                        const batch = writeBatch(db);
                        const userRef = doc(db, 'users', user.userId);
                        const sitterRef = doc(db, 'sitters', user.userId);
                        
                        batch.update(userRef, { profileUrl: imageUrl });
                        batch.update(sitterRef, { imageUrl: imageUrl });
                        
                        await batch.commit();

                        setProfileData(prev => ({...prev, imageUrl}));
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

    const onPressMenu = async (menu) => {
        if (menu.path === 'logout') {
            try {
                const response = await logout();
                if(response.success) {
                    router.replace('/(auth)/signIn');
                }
            } catch (error) {
                console.error('Logout error:', error);
                Alert.alert('Error', 'Failed to logout. Please try again.');
            }
            return;
        }
        // ... інший код ...
    };

    return (
        <ScrollView style={styles.container}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={Colors.PRIMARY} />
                </View>
            )}

            <View style={styles.profileSection}>
                <View style={styles.imageContainer}>
                    {profileData.imageUrl ? (
                        <Image 
                            source={{ uri: profileData.imageUrl }}
                            style={styles.profileImage}
                        />
                    ) : (
                        <View style={[styles.profileImage, styles.defaultImage]}>
                            <Ionicons 
                                name="person-outline" 
                                size={40} 
                                color={Colors.GRAY} 
                            />
                        </View>
                    )}
                    {isEditing && (
                        <TouchableOpacity 
                            style={styles.editImageButton}
                            onPress={pickImage}
                        >
                            <Ionicons 
                                name="camera-outline" 
                                size={24} 
                                color={Colors.WHITE} 
                            />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.name}>{profileData.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    value={profileData.description}
                    onChangeText={(text) => setProfileData(prev => ({...prev, description: text}))}
                    placeholder="Tell pet owners about yourself"
                    multiline
                    numberOfLines={4}
                    style={[styles.input, styles.bioInput]}
                    editable={isEditing}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                    value={profileData.location}
                    onChangeText={(text) => setProfileData(prev => ({...prev, location: text}))}
                    placeholder="Your location"
                    style={styles.input}
                    editable={isEditing}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Experience (years)</Text>
                <TextInput
                    value={profileData.experience}
                    onChangeText={(text) => setProfileData(prev => ({...prev, experience: text}))}
                    placeholder="Years of experience"
                    keyboardType="numeric"
                    style={styles.input}
                    editable={isEditing}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Price per hour (UAH)</Text>
                <TextInput
                    value={profileData.price}
                    onChangeText={(text) => setProfileData(prev => ({...prev, price: text}))}
                    placeholder="Your hourly rate"
                    keyboardType="numeric"
                    style={styles.input}
                    editable={isEditing}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Services</Text>
                <View style={styles.optionsContainer}>
                    {services.map((service, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.optionButton,
                                profileData.services?.includes(service.value) && styles.selectedOption
                            ]}
                            onPress={() => toggleService(service.value)}
                        >
                            <Text style={[
                                styles.optionText,
                                profileData.services?.includes(service.value) && styles.selectedOptionText
                            ]}>{service.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Availability</Text>
                <View style={styles.optionsContainer}>
                    {days.map((day) => (
                        <TouchableOpacity
                            key={day}
                            style={[
                                styles.optionButton,
                                profileData.availability.includes(day) && styles.selectedOption
                            ]}
                            onPress={() => isEditing && toggleDay(day)}
                            disabled={!isEditing}
                        >
                            <Text style={[
                                styles.optionText,
                                profileData.availability.includes(day) && styles.selectedOptionText
                            ]}>{day}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {isEditing ? (
                <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <Text style={styles.saveButtonText}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                >
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity 
                style={styles.logoutButton}
                onPress={logout}
                disabled={loading}
            >
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
    },
    header: {
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    profileSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    imageContainer: {
        position: 'relative',
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10,
    },
    defaultImage: {
        backgroundColor: Colors.LIGHT_PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editImageButton: {
        position: 'absolute',
        bottom: 10,
        right: '30%',
        backgroundColor: Colors.PRIMARY,
        padding: 8,
        borderRadius: 20,
        elevation: 2,
    },
    name: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 24,
        marginBottom: 5,
    },
    email: {
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        color: Colors.GRAY,
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        marginBottom: 8,
        color: Colors.GRAY,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 12,
        padding: 12,
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
    },
    bioInput: {
        height: 120,
        textAlignVertical: 'top',
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 10
    },
    optionButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.PRIMARY,
        backgroundColor: Colors.WHITE
    },
    selectedOption: {
        backgroundColor: Colors.PRIMARY
    },
    optionText: {
        color: Colors.PRIMARY,
        fontFamily: 'Poppins-Regular',
        fontSize: 14
    },
    selectedOptionText: {
        color: Colors.WHITE
    },
    editButton: {
        backgroundColor: Colors.LIGHT_PRIMARY,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 10,
    },
    editButtonText: {
        color: Colors.PRIMARY,
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: Colors.PRIMARY,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 10,
    },
    saveButtonText: {
        color: Colors.WHITE,
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
    },
    logoutButton: {
        backgroundColor: Colors.LIGHT_PRIMARY,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 10,
        marginBottom: 30,
    },
    logoutButtonText: {
        color: '#fbcbc9',
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
    },
});
