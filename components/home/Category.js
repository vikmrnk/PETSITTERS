import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import Colors from '../../constants/Colors';

export default function Category({ onSelectCategory }) {
    const [categories, setCategories] = useState([
        {
            id: 1,
            name: 'Boarding',
            value: 'boarding',
            imageUrl: require('../../assets/images/Boarding.png')
        },
        {
            id: 2,
            name: 'Sitting',
            value: 'sitting',
            imageUrl: require('../../assets/images/Sitting.png')
        },
        {
            id: 3,
            name: 'Walking',
            value: 'walking',
            imageUrl: require('../../assets/images/Walking.png')
        },
        {
            id: 4,
            name: 'Grooming',
            value: 'grooming',
            imageUrl: require('../../assets/images/Grooming.png')
        },
        {
            id: 5,
            name: 'Training',
            value: 'training',
            imageUrl: require('../../assets/images/Training.png')
        },
        {
            id: 6,
            name: 'Vet',
            value: 'vet',
            imageUrl: require('../../assets/images/Vet.png')
        }
    ]);
    const [selectedCategory, setSelectedCategory] = useState('boarding');

    return (
        <View style={{ marginTop: 20 }}>
            <Text style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 20
            }}>Choose an activity</Text>

            <FlatList
                data={categories}
                numColumns={3}
                keyExtractor={(item) => item.id.toString()}
                columnWrapperStyle={{
                    justifyContent: 'space-between',
                    paddingHorizontal: 10,
                    marginBottom: 20
                }}
                renderItem={({item}) => (
                    <TouchableOpacity 
                        onPress={() => {
                            setSelectedCategory(item.value);
                            onSelectCategory(item.value);
                        }}
                        style={{ width: '30%' }}
                    > 
                        <View style={[
                            styles.container,
                            selectedCategory === item.value && styles.selectedCategoryContainer
                        ]}>
                            <Image 
                                source={item.imageUrl}
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 40
                                }}
                                defaultSource={require('../../assets/images/placeholder.png')}
                            />
                        </View>
                        <Text style={{
                            textAlign: 'center',
                            fontFamily: 'Poppins',
                            marginTop: 5
                        }}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        margin: 0,
        minHeight: 70,
        overflow: 'hidden'
    },
    selectedCategoryContainer: {
        backgroundColor: '#9fc0af',
    }
}) 