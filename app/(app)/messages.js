import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Keyboard, ActivityIndicator, FlatList, Platform, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Entypo, Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/authContext';
import { Image } from 'expo-image';
import { blurhash, formatDate, getRoomId } from '../../utils/common';
import { Timestamp, addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, setDoc, where } from 'firebase/firestore';
import { db, usersRef } from '../../firebaseConfig';
import { MenuOption } from 'react-native-popup-menu';
import LottieView from 'lottie-react-native';

// ChatItem Component
function ChatItem({item, router, noBorder, currentUser}) {
    const [lastMessage, setLastMessage] = useState(undefined);
    useEffect(()=>{
        let roomId = getRoomId(currentUser?.userId, item?.userId);
        const docRef = doc(db, "rooms", roomId);
        const messagesRef = collection(docRef, "messages");
        const q = query(messagesRef, orderBy('createdAt', 'desc'));

        let unsub = onSnapshot(q, (snapshot)=>{
            let allMessages = snapshot.docs.map(doc=>{
                return doc.data();
            });
            setLastMessage(allMessages[0]? allMessages[0]: null);
        });

        return unsub;
    },[]);

    const openChatRoom = ()=>{
        router.push({pathname: '/chatRoom', params: item});
    }

    const renderTime = ()=>{
        if(lastMessage){
            let date = lastMessage?.createdAt;
            return formatDate(new Date(date?.seconds * 1000));
        }
    }

    const renderLastMessage = ()=>{
        if(typeof lastMessage == 'undefined') return 'Loading...';
        if(lastMessage){
            if(currentUser?.userId == lastMessage?.userId) return "You: "+lastMessage?.text;
            return lastMessage?.text;
        }else{
            return 'Say Hi 👋';
        }
    }

    return (
        <TouchableOpacity onPress={openChatRoom} className={`flex-row justify-between mx-4 items-center gap-3 mb-4 pb-2 ${noBorder? '': 'border-b border-b-neutral-200'}`}>
            <Image
                style={{height: hp(6), width: hp(6), borderRadius: 100}}
                source={item?.profileUrl}
                placeholder={blurhash}
                transition={500}
            />
            <View className="flex-1 gap-1">
                <View className="flex-row justify-between">
                    <Text style={{fontSize: hp(1.8)}} className="font-semibold text-neutral-800">{item?.username}</Text>
                    <Text style={{fontSize: hp(1.6)}} className="font-medium text-neutral-500">
                        {renderTime()}
                    </Text>
                </View>
                <Text style={{fontSize: hp(1.6)}} className="font-medium text-neutral-500">
                    {renderLastMessage()}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

// ChatList Component
function ChatList({users, currentUser}) {
    const router = useRouter();
    return (
        <View className="flex-1">
            <FlatList
                data={users}
                contentContainerStyle={{flex: 1, paddingVertical: 25}}
                keyExtractor={item=> Math.random()}
                showsVerticalScrollIndicator={false}
                renderItem={({item, index})=> <ChatItem 
                    noBorder={index+1 == users.length} 
                    router={router} 
                    currentUser={currentUser}
                    item={item} 
                    index={index} 
                />}
            />
        </View>
    )
}

// MessageItem Component
function MessageItem({message, currentUser}) {
    if(currentUser?.userId==message?.userId){
        return (
            <View className="flex-row justify-end mb-3 mr-3">
                <View style={{width: wp(80)}}>
                    <View className="flex self-end p-3 rounded-2xl px-4 bg-white border border-neutral-200">
                        <Text style={{fontSize: hp(1.9)}}>
                            {message?.text}
                        </Text>
                    </View>
                </View>
            </View>
        )
    }else{
        return (
            <View style={{width: wp(80)}} className="ml-3 mb-3">
                <View className="flex self-start p-3 px-4 rounded-2xl bg-indigo-100 border border-indigo-200">
                    <Text style={{fontSize: hp(1.9)}}>
                        {message?.text}
                    </Text>
                </View>
            </View>
        )
    }
}

// MessageList Component
function MessageList({messages, scrollViewRef, currentUser}) {
    return (
        <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingTop: 10}}>
            {messages.map((message, index)=>{
                return (
                    <MessageItem message={message} key={index} currentUser={currentUser} />
                )
            })}
        </ScrollView>
    )
}

// CustomKeyboardView Component
const ios = Platform.OS == 'ios';
function CustomKeyboardView({children, inChat}) {
    let kavConfig = {};
    let scrollViewConfig = {};
    if(inChat){
        kavConfig = {keyboardVerticalOffset: 90};
        scrollViewConfig = {contentContainerStyle: {flex: 1}};
    }
    return (
        <KeyboardAvoidingView
            behavior={ios? 'padding': 'height'}
            style={{flex: 1}}
            {...kavConfig}
        >
            <ScrollView
                style={{flex: 1}}
                bounces={false}
                showsVerticalScrollIndicator={false}
                {...scrollViewConfig}
            >
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

// Loading Component
function Loading({size}) {
    return (
        <View style={{height: size, aspectRatio: 1}}>
            <LottieView 
                style={{flex: 1}} 
                source={require('../../assets/images/loading.json')} 
                autoPlay 
                loop 
            />
        </View>
    )
}

// Main Chat Component
export default function Chat() {
    const {user} = useAuth();
    const [users, setUsers] = useState([]);

    useEffect(()=>{
        if(user?.userId)
            getUsers();
    },[])

    const getUsers = async ()=>{
        try {
            // Спочатку отримуємо всі кімнати, де є поточний користувач
            const roomsQuery = query(
                collection(db, "rooms"),
                where('participants', 'array-contains', user.userId)
            );
            
            const roomsSnapshot = await getDocs(roomsQuery);
            const userIds = new Set();

            // Збираємо унікальні ID користувачів з кімнат
            roomsSnapshot.docs.forEach(doc => {
                const participants = doc.data().participants || [];
                participants.forEach(participantId => {
                    if(participantId !== user.userId) {
                        userIds.add(participantId);
                    }
                });
            });

            // Отримуємо інформацію про користувачів
            const usersData = [];
            for(const userId of userIds) {
                const userDoc = await getDocs(query(usersRef, where('userId', '==', userId)));
                if(!userDoc.empty) {
                    usersData.push(userDoc.docs[0].data());
                }
            }

            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="light" />
            <View style={{
                marginTop: 50,
                paddingHorizontal: 20,
                marginBottom: 10
            }}>
                <Text style={{
                    fontFamily: 'Poppins-Medium',
                    fontSize: 30,
                    color: '#333'
                }}>Your Chats</Text>
            </View>
            
            {users.length>0? (
                <ChatList currentUser={user} users={users} />
            ):(
                <View className="flex items-center" style={{top: hp(20)}}>
                    <Text style={{fontSize: hp(2), color: '#666'}}>No messages yet</Text>
                </View>
            )}
        </View>
    )
}