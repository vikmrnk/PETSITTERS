import { View, Text, Image, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const sliderImages = {
  'healthy-foods': require('../../assets/images/Slider1.png'),
  'parasite-protection': require('../../assets/images/Slider2.png'),
  'vet-visits': require('../../assets/images/Slider3.png')
};

export default function Slider() {
  const [sliders, setSliders] = useState([]);
  const [selectedSlider, setSelectedSlider] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadSliders();
  }, []);

  const loadSliders = async () => {
    try {
      const slidersRef = collection(db, 'sliders');
      const querySnapshot = await getDocs(slidersRef);
      const slidersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Loaded sliders:', slidersData);
      setSliders(slidersData);
    } catch (error) {
      console.error('Error loading sliders:', error);
    }
  };

  const handleSliderPress = (slider) => {
    setSelectedSlider(slider);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {sliders.map((slider) => (
          <TouchableOpacity
            key={slider.id}
            onPress={() => handleSliderPress(slider)}
            style={styles.sliderCard}
          >
            <Image 
              source={sliderImages[slider.id]}
              style={styles.sliderImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              {selectedSlider && (
                <>
                  <Text style={styles.modalTitle}>{selectedSlider.title}</Text>
                  <Text style={styles.modalText}>{selectedSlider.content}</Text>
                  {selectedSlider.items?.map((item, index) => (
                    <View key={index} style={styles.itemContainer}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemDescription}>{item.description}</Text>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  sliderCard: {
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
  },
  sliderImage: {
    width: 280,
    height: 185,
    borderRadius: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginBottom: 20,
  },
  itemContainer: {
    marginBottom: 15,
  },
  itemTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  closeButton: {
    backgroundColor: '#9fc0af',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
}); 