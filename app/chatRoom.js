import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../context/authContext';
import ChatRoomHeader from '../components/ChatRoomHeader';
import MessageList from '../components/MessageList';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, doc, orderBy, query, onSnapshot, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getRoomId } from '../utils/common';
import CustomKeyboardView from '../components/CustomKeyboardView';

export default function ChatRoom() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const scrollViewRef = useRef();

  useEffect(() => {
    if (!user?.userId || !params?.userId) return;

    let roomId = getRoomId(user.userId, params.userId);
    const docRef = doc(db, "rooms", roomId);
    const messagesRef = collection(docRef, "messages");
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => doc.data());
      setMessages(allMessages);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    });

    return unsubscribe;
  }, [user, params]);

  const sendMessage = async () => {
    if (!messageText.trim() || !user?.userId || !params?.userId) return;

    try {
      const roomId = getRoomId(user.userId, params.userId);
      const docRef = doc(db, "rooms", roomId);
      
      await setDoc(docRef, {
        participants: [user.userId, params.userId],
        lastMessage: messageText.trim(),
        lastMessageTime: Timestamp.now()
      }, { merge: true });

      const messagesRef = collection(docRef, "messages");
      const messageData = {
        userId: user.userId,
        text: messageText.trim(),
        createdAt: Timestamp.now(),
        user: {
          username: user.displayName || user.email || 'User',
          profileUrl: user.photoURL || null
        }
      };

      await addDoc(messagesRef, messageData);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ChatRoomHeader user={params} router={router} />
      
      <CustomKeyboardView inChat>
        <View style={{ flex: 1 }}>
          <MessageList 
            messages={messages} 
            scrollViewRef={scrollViewRef}
            currentUser={user}
          />
          
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={90}
          >
            <View style={{ 
              flexDirection: 'row', 
              padding: 10, 
              borderTopWidth: 1,
              borderTopColor: '#e5e5e5',
              alignItems: 'center'
            }}>
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: 10,
                  backgroundColor: '#f0f0f0',
                  borderRadius: 20,
                  marginRight: 10
                }}
                multiline
              />
              <TouchableOpacity 
                onPress={sendMessage}
                disabled={!messageText.trim()}
                style={{
                  backgroundColor: messageText.trim() ? '#9fc0af' : '#e5e5e5',
                  padding: 10,
                  borderRadius: 20
                }}
              >
                <Ionicons name="send" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </CustomKeyboardView>
    </View>
  );
} 