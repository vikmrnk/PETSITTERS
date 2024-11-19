import { View, Text, Image, TextInput, TouchableOpacity, Pressable, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import { Feather, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Loading from '../components/Loading';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useAuth } from '../context/authContext';

export default function SignUp() {
    const router = useRouter();
    const {register} = useAuth();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState(null);

    const emailRef = useRef("");
    const passwordRef = useRef("");
    const usernameRef = useRef("");

    const handleRegister = async ()=>{
        if(!emailRef.current || !passwordRef.current || !usernameRef.current || !role){
            Alert.alert('Sign Up', "Please fill all the fields and select your role!");
            return;
        }
        setLoading(true);

        let response = await register(emailRef.current, passwordRef.current, usernameRef.current, role);
        setLoading(false);

        console.log('got result: ', response);
        if(!response.success){
            Alert.alert('Sign Up', response.msg);
        }
    }
  return (
    <CustomKeyboardView>
      <StatusBar style="dark" />
      <View style={{
        flex: 1,
        backgroundColor: '#9fc0af'
      }}>
        <Text style={{
          fontSize: hp(4),
          textAlign: 'center',
          color: 'white',
          marginTop: hp(10),
          fontFamily: 'Poppins-SemiBold'
        }}>
          Create an account
        </Text>

        <View style={{
          backgroundColor: 'white',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          paddingTop: hp(5),
          paddingHorizontal: wp(5),
          flex: 1,
          marginTop: hp(5)
        }}>
          <View className="gap-10">
            
            {/* inputs */}
            <View className="gap-4">
                <View className="flex-row justify-between mb-4">
                    <TouchableOpacity 
                        onPress={() => setRole('owner')}
                        className={`p-4 rounded-xl flex-1 mr-2 ${role === 'owner' ? 'bg-[#9fc0af]' : 'bg-neutral-100'}`}
                    >
                        <Text className={`text-center font-semibold ${role === 'owner' ? 'text-white' : 'text-[#9fc0af]'}`}>
                            Pet Owner
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={() => setRole('sitter')}
                        className={`p-4 rounded-xl flex-1 ml-2 ${role === 'sitter' ? 'bg-[#9fc0af]' : 'bg-neutral-100'}`}
                    >
                        <Text className={`text-center font-semibold ${role === 'sitter' ? 'text-white' : 'text-[#9fc0af]'}`}>
                            Pet Sitter
                        </Text>
                    </TouchableOpacity>
                </View>
                
                <View style={{height: hp(7)}} className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl">
                    <Feather name="user" size={hp(2.7)} color="#9fc0af" />
                    <TextInput
                        onChangeText={value=> usernameRef.current=value}
                        style={{fontSize: hp(2)}}
                        className="flex-1 font-semibold text-neutral-700"
                        placeholder='Username'
                        placeholderTextColor={'#9fc0af'}
                    />
                </View>
                
                <View style={{height: hp(7)}} className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl">
                    <Octicons name="mail" size={hp(2.7)} color="#9fc0af" />
                    <TextInput
                        onChangeText={value=> emailRef.current=value}
                        style={{fontSize: hp(2)}}
                        className="flex-1 font-semibold text-neutral-700"
                        placeholder='Email address'
                        placeholderTextColor={'#9fc0af'}
                    />
                </View>
                <View style={{height: hp(7)}} className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl">
                    <Octicons name="lock" size={hp(2.7)} color="#9fc0af" />
                    <TextInput
                        onChangeText={value=> passwordRef.current=value}
                        style={{fontSize: hp(2)}}
                        className="flex-1 font-semibold text-neutral-700"
                        placeholder='Password'
                        secureTextEntry
                        placeholderTextColor={'#9fc0af'}
                    />
                </View>
                    

                {/* submit button */}

                <View>
                    {
                        loading? (
                            <View className="flex-row justify-center">
                                <Loading size={hp(6.5)} />
                            </View>
                        ):(
                            <TouchableOpacity 
                                onPress={handleRegister} 
                                style={{
                                    height: hp(6.5),
                                    backgroundColor: '#9fc0af'
                                }} 
                                className="rounded-xl justify-center items-center"
                            >
                                <Text style={{fontSize: hp(2.7)}} className="text-white font-bold tracking-wider">
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                        )
                    }
                </View>

                

                {/* sign up text */}

                <View className="flex-row justify-center">
                    <Text style={{fontSize: hp(1.8)}} className="font-semibold text-neutral-500">Already have an account? </Text>
                    <Pressable onPress={()=> router.push('signIn')}>
                        <Text style={{
                            fontSize: hp(1.8),
                            color: '#9fc0af'
                        }} 
                        className="font-bold">
                            Sign In
                        </Text>
                    </Pressable>
                    
                </View>
                
            </View>
          </View>

          {/* Зображення */}
          <View className="flex-1 justify-end items-center">
            <Image 
              style={{
                height: hp(45),
                marginTop: hp(7)
              }} 
              resizeMode='contain' 
              source={require('../assets/images/signuppic.png')} 
            />
          </View>
        </View>
      </View>
    </CustomKeyboardView>
  )
}