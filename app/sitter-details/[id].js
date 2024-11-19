import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import Colors from '../../constants/Colors'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebaseConfig'
import { useAuth } from '../../context/authContext'

export default function SitterDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const [sitter, setSitter] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        getSitterDetails();
        getReviews();
    }, []);

    const getSitterDetails = async () => {
        try {
            const docRef = doc(db, "sitters", id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                setSitter({id: docSnap.id, ...docSnap.data()});
            }
        } catch (error) {
            console.error("Error fetching sitter:", error);
        } finally {
            setLoading(false);
        }
    };

    const getReviews = async () => {
        try {
            const q = query(collection(db, "reviews"), where("sitterId", "==", id));
            const querySnapshot = await getDocs(q);
            let reviewsData = [];
            querySnapshot.forEach((doc) => {
                reviewsData.push({id: doc.id, ...doc.data()});
            });
            setReviews(reviewsData);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const startChat = () => {
        router.push({
            pathname: '/chatRoom',
            params: {
                userId: sitter.userId,
                username: sitter.name,
                profileUrl: sitter.imageUrl
            }
        });
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
        );
    }

    if (!sitter) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Sitter not found</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: "Sitter Details",
                    headerTitleStyle: {
                        fontFamily: 'Poppins-Medium'
                    },
                    headerShadowVisible: false,
                    headerBackTitle: "Back"
                }}
            />
            
            <ScrollView className="flex-1 bg-white">
                <Image 
                    source={{uri: sitter.imageUrl}}
                    style={{width: '100%', height: 300}}
                />
                
                <View className="p-4">
                    {/* Basic Info */}
                    <View className="flex-row justify-between items-center">
                        <Text className="text-2xl font-bold">{sitter.name}</Text>
                        <View className="flex-row items-center">
                            <MaterialIcons name="star" size={24} color={Colors.PRIMARY} />
                            <Text className="ml-1 text-lg">{sitter.rating}</Text>
                        </View>
                    </View>

                    <Text className="text-gray-600 mt-2">{sitter.category}</Text>
                    <Text className="text-lg mt-2">${sitter.price}/hour</Text>

                    {/* Availability */}
                    <View className="mt-4">
                        <Text className="text-lg font-semibold">Availability</Text>
                        <View className="flex-row flex-wrap mt-2">
                            {sitter.availability?.map((day, index) => (
                                <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                                    <Text>{day}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* About */}
                    <Text className="mt-4 text-lg font-semibold">About</Text>
                    <Text className="mt-2 text-gray-600">{sitter.description}</Text>

                    {/* Services */}
                    <Text className="mt-4 text-lg font-semibold">Services</Text>
                    {sitter.services?.map((service, index) => (
                        <Text key={index} className="mt-1 text-gray-600">• {service}</Text>
                    ))}

                    {/* Reviews */}
                    <Text className="mt-4 text-lg font-semibold">Reviews ({reviews.length})</Text>
                    {reviews.map((review, index) => (
                        <View key={index} className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <View className="flex-row justify-between">
                                <Text className="font-semibold">{review.userName}</Text>
                                <View className="flex-row items-center">
                                    <MaterialIcons name="star" size={16} color={Colors.PRIMARY} />
                                    <Text className="ml-1">{review.rating}</Text>
                                </View>
                            </View>
                            <Text className="mt-1 text-gray-600">{review.comment}</Text>
                        </View>
                    ))}

                    {/* Contact Button */}
                    <TouchableOpacity 
                        onPress={startChat}
                        className="mt-6 bg-[#9fc0af] p-4 rounded-full"
                    >
                        <Text className="text-white text-center text-lg font-semibold">
                            Contact Sitter
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    )
}
