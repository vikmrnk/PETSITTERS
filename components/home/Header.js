import { View, Text, Image } from 'react-native'
import React from 'react'
import { useAuth } from '../../context/authContext'

export default function Header() {
    const { user } = useAuth();
    
    return (
        <View style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <View>
                <Text style={{
                    fontFamily: 'Poppins',
                    fontSize: 18
                }}>Welcome,</Text>
                <Text style={{
                    fontFamily: 'Poppins-Medium',
                    fontSize: 25
                }}>{user?.username || 'Guest'}</Text>
            </View>
            <Image 
                source={user?.profileUrl ? {uri: user.profileUrl} : require('../../assets/images/placeholder.png')} 
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 99
                }}
            />
        </View>
    )
}