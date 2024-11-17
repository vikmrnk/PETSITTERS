import { View, FlatList, Image } from 'react-native'
import React, { useState, useEffect } from 'react'

export default function Slider() {
  const [sliderList, setSliderList] = useState([
    {
      id: 1,
      imageUrl: require('../../assets/images/Slider1.png')
    },
    {
      id: 2,
      imageUrl: require('../../assets/images/Slider2.png')
    },
    {
      id: 3,
      imageUrl: require('../../assets/images/Slider3.png')
    }
  ]);

  return (
    <View style={{ marginTop: 10 }}>
      <FlatList
        data={sliderList}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({item}) => (
          <View>
            <Image 
              source={item.imageUrl}
              style={{
                width: 300,
                height: 200,
                borderRadius: 20,
                marginRight: 15,
                resizeMode: 'cover'
              }}
            />
          </View>
        )}
        keyExtractor={item => item.id.toString()}
        nestedScrollEnabled={true}
      />
    </View>
  )
} 