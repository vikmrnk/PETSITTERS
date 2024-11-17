import { View, Text, Image, TextInput, TouchableOpacity, Pressable, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import { Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Loading from '../components/Loading';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useAuth } from '../context/authContext';

export default function SignIn() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const {login} = useAuth();

    const emailRef = useRef("");
    const passwordRef = useRef("");

    const handleLogin = async ()=>{
        if(!emailRef.current || !passwordRef.current){
            Alert.alert('Sign In', "Please fill all the fields!");
            return;
        }

        setLoading(true);
        const response = await login(emailRef.current, passwordRef.current);
        setLoading(false);
        if(!response.success){
            Alert.alert('Sign In', response.msg);
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
                    Hi, Welcome back!
                </Text>

                <View className="items-center" style={{marginBottom: -hp(15)}}>
                    <Image 
                        style={{
                            height: hp(31),
                            zIndex: 1
                        }} 
                        resizeMode='contain' 
                        source={require('../assets/images/signinpic.png')} 
                    />
                </View>

                <View style={{
                    backgroundColor: 'white',
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    paddingTop: hp(20),
                    paddingHorizontal: wp(5),
                    flex: 1,
                }}>
                    <View className="gap-10">
                        {/* inputs */}
                        <View className="gap-4">
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
                            <View className="gap-3">
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
                                <Text style={{
                                    fontSize: hp(1.8),
                                    color: '#9fc0af'
                                }} className="font-semibold text-right">
                                    Forgot password?
                                </Text>
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
                                            onPress={handleLogin} 
                                            style={{
                                                height: hp(6.5),
                                                backgroundColor: '#9fc0af'
                                            }} 
                                            className="rounded-xl justify-center items-center"
                                        >
                                            <Text style={{fontSize: hp(2.7)}} className="text-white font-bold tracking-wider">
                                                Sign In
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                }
                            </View>

                            {/* sign up text */}
                            <View className="flex-row justify-center">
                                <Text style={{fontSize: hp(1.8)}} className="font-semibold text-neutral-500">
                                    Don't have an account?{' '}
                                </Text>
                                <Pressable onPress={()=> router.push('signUp')}>
                                    <Text style={{
                                        fontSize: hp(1.8),
                                        color: '#9fc0af'
                                    }} 
                                    className="font-bold">
                                        Sign Up
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </CustomKeyboardView>
    )
}