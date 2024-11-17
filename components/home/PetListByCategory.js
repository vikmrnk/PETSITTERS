import { View, FlatList } from 'react-native';
import React, { useState } from 'react';
import Category from './Category';
import SittersListItem from './SittersListItem';

export default function SittersListByCategory() {
  const [sitters, setSitters] = useState([
    {
      id: 1,
      name: 'Anna',
      imageUrl: require('../../assets/images/Anna.jpg'),
      category: 'Boarding',
      rating: 4.8,
      price: '25',
      description: 'Professional pet sitter'
    },
    {
      id: 2,
      name: 'Maria',
      imageUrl: require('../../assets/images/Maria.webp'),
      category: 'Sitting',
      rating: 4.9,
      price: '30',
      description: 'Experienced dog sitter' 
    },
    {
        id: 3,
        name: 'Den',
        imageUrl: require('../../assets/images/Den.jpg'),
        category: 'Vet',
        rating: 4.7,
        price: '40',
        description: 'Certified veterinarian'
      },
      {
        id: 4,
        name: 'Max',
        imageUrl: require('../../assets/images/Max.jpeg'),
        category: 'Training',
        rating: 4.6,
        price: '35',
        description: 'Professional dog trainer'
      },
      {
        id: 5,
        name: 'Dayna',
        imageUrl: require('../../assets/images/Dayna.jpg'),
        category: 'Walking',
        rating: 4.5,
        price: '20',
        description: 'Experienced dog walker'
      },
      {
        id: 6,
        name: 'Viktoriia',
        imageUrl: require('../../assets/images/Viktoriia.jpeg'),
        category: 'Vet',
        rating: 4.4,
        price: '45',
        description: 'Certified veterinarian'
      },
      {
        id: 7,
        name: 'Lily',
        imageUrl: require('../../assets/images/Lily.jpg'),
        category: 'Grooming',
        rating: 4.3,
        price: '30',
        description: 'Professional dog groomer'
      }
    // ... інші сіттери
  ]);
  
  const [selectedCategory, setSelectedCategory] = useState('Boarding');

  const filteredSitters = sitters.filter(sitter => 
    sitter.category === selectedCategory
  );

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <View>
      <Category category={handleCategorySelect} />

      <FlatList
        data={filteredSitters}
        style={{ marginTop: 10 }}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SittersListItem sitter={item} />
        )}
      />
    </View>
  )
} 