import { View, Text, TouchableOpacity, FlatList, Image, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Modal, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/authContext';
import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const IMGBB_API_KEY = '8b58059a822c985794ac0ea34543d935';

export default function Posts() {
    const { user } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [newPost, setNewPost] = useState({
        image: null,
        caption: ''
    });
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const flatListRef = useRef(null);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [favoriteSitters, setFavoriteSitters] = useState([]);

    useEffect(() => {
        if (user?.userId) {
            loadFavoriteSitters();
        }
    }, [user]);

    useEffect(() => {
        if (user?.userId) {
            const postsRef = collection(db, 'posts');
            let q;

            if (favoriteSitters.length > 0) {
                q = query(
                    postsRef,
                    where('userId', 'in', [...favoriteSitters, user.userId]),
                    orderBy('createdAt', 'desc')
                );
            } else {
                // If no favorite sitters, just show user's own posts
                q = query(
                    postsRef,
                    where('userId', '==', user.userId),
                    orderBy('createdAt', 'desc')
                );
            }

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const postsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPosts(postsData);
                setLoading(false);
            });

            return () => unsubscribe();
        }
    }, [favoriteSitters, user]);

    const loadFavoriteSitters = async () => {
        try {
            const favoritesRef = collection(db, 'favorites');
            const q = query(favoritesRef, where('userId', '==', user.userId));
            const querySnapshot = await getDocs(q);
            const sitters = querySnapshot.docs.map(doc => doc.data().sitterId);
            setFavoriteSitters(sitters);
        } catch (error) {
            console.error('Error loading favorite sitters:', error);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setNewPost(prev => ({ ...prev, image: result.assets[0].uri }));
        }
    };

    const uploadImageToImgBB = async (uri) => {
        const formData = new FormData();
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('image', {
            uri,
            name: filename,
            type
        });

        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            return data.data.url;
        } catch (error) {
            throw error;
        }
    };

    const createPost = async () => {
        if (!newPost.image || !newPost.caption.trim()) {
            Alert.alert('Error', 'Please select an image and add a caption');
            return;
        }

        setUploading(true);
        try {
            const imageUrl = await uploadImageToImgBB(newPost.image);
            
            const postData = {
                userId: user.userId,
                username: user.name || user.username,
                userImage: user.profileUrl || '',
                imageUrl,
                caption: newPost.caption,
                likes: [],
                comments: [],
                createdAt: serverTimestamp(),
                role: user.role
            };

            await addDoc(collection(db, 'posts'), postData);
            
            setModalVisible(false);
            setNewPost({ image: null, caption: '' });
            Alert.alert('Success', 'Post created successfully!');
        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert('Error', 'Failed to create post. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const toggleLike = async (postId) => {
        try {
            const postRef = doc(db, 'posts', postId);
            const post = posts.find(p => p.id === postId);
            
            if (post.likes.includes(user.userId)) {
                await updateDoc(postRef, {
                    likes: arrayRemove(user.userId)
                });
            } else {
                await updateDoc(postRef, {
                    likes: arrayUnion(user.userId)
                });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const addComment = async (postId) => {
        if (!newComment.trim()) return;

        try {
            const postRef = doc(db, 'posts', postId);
            const comment = {
                userId: user.userId,
                username: user.name,
                text: newComment,
                createdAt: new Date().toISOString()
            };

            await updateDoc(postRef, {
                comments: arrayUnion(comment)
            });

            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const toggleComments = (postId) => {
        setSelectedPostId(selectedPostId === postId ? null : postId);
        setShowComments(!showComments);
    };

    const formatDate = (timestamp) => {
        if (!timestamp || !timestamp.seconds) return '';
        
        const date = new Date(timestamp.seconds * 1000);
        const now = new Date();
        const diff = now - date;
        
        // Менше 24 годин
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            if (hours < 1) {
                const minutes = Math.floor(diff / 60000);
                return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
            }
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        }
        
        // Менше тижня
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        }
        
        // Більше тижня
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderPost = ({ item }) => (
        <View style={styles.postContainer}>
            <View style={styles.postHeader}>
                <View style={styles.userInfo}>
                    <Image
                        source={item.userImage ? { uri: item.userImage } : require('../../assets/images/default-avatar.png')}
                        style={styles.userImage}
                    />
                    <View>
                        <Text style={styles.username}>{item.username}</Text>
                        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                    </View>
                </View>
            </View>

            <Image 
                source={{ uri: item.imageUrl }}
                style={styles.postImage}
                resizeMode="cover"
            />

            <View style={styles.postActions}>
                <TouchableOpacity onPress={() => toggleLike(item.id)}>
                    <Ionicons 
                        name={item.likes?.includes(user.userId) ? "heart" : "heart-outline"}
                        size={24}
                        color={item.likes?.includes(user.userId) ? "red" : "black"}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleComments(item.id)} style={{marginLeft: 15}}>
                    <Ionicons name="chatbubble-outline" size={22} color="black" />
                </TouchableOpacity>
            </View>

            <View style={styles.postFooter}>
                <Text style={styles.likes}>{item.likes?.length || 0} likes</Text>
                <Text style={styles.caption}>
                    <Text style={styles.username}>{item.username}</Text> {item.caption}
                </Text>

                {item.comments?.length > 0 && (
                    <TouchableOpacity onPress={() => toggleComments(item.id)}>
                        <Text style={styles.viewComments}>
                            View all {item.comments.length} comments
                        </Text>
                    </TouchableOpacity>
                )}

                {selectedPostId === item.id && (
                    <View style={styles.commentsSection}>
                        {item.comments?.map((comment, index) => (
                            <View key={index} style={styles.commentItem}>
                                <Text style={styles.commentUsername}>{comment.username}</Text>
                                <Text style={styles.commentText}>{comment.text}</Text>
                            </View>
                        ))}
                        
                        <View style={styles.addCommentSection}>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Add a comment..."
                                value={newComment}
                                onChangeText={setNewComment}
                            />
                            <TouchableOpacity 
                                style={styles.sendButton}
                                onPress={() => addComment(item.id)}
                            >
                                <Ionicons name="send" size={24} color="#9fc0af" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <StatusBar style="dark" />
            
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Posts</Text>
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add-circle-outline" size={30} color="#666" />
                </TouchableOpacity>
            </View>

            <FlatList
                ref={flatListRef}
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.postsContainer}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => {
                                setModalVisible(false);
                                setNewPost({ image: null, caption: '' });
                            }}
                        >
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.imagePicker}
                            onPress={pickImage}
                        >
                            {newPost.image ? (
                                <Image 
                                    source={{ uri: newPost.image }} 
                                    style={styles.selectedImage} 
                                />
                            ) : (
                                <Ionicons name="camera" size={40} color="#666" />
                            )}
                        </TouchableOpacity>

                        <TextInput
                            style={styles.input}
                            placeholder="Write a caption..."
                            value={newPost.caption}
                            onChangeText={(text) => setNewPost(prev => ({ ...prev, caption: text }))}
                            multiline
                        />

                        <TouchableOpacity 
                            style={styles.createButton}
                            onPress={createPost}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.createButtonText}>Create Post</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'Poppins-Medium',
    },
    addButton: {
        padding: 5,
    },
    postsContainer: {
        padding: 10,
    },
    postContainer: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    username: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
    },
    postImage: {
        width: '100%',
        height: 300,
    },
    postActions: {
        flexDirection: 'row',
        padding: 10,
    },
    postFooter: {
        padding: 10,
    },
    likes: {
        fontFamily: 'Poppins-Medium',
        marginBottom: 5,
    },
    caption: {
        fontFamily: 'Poppins-Regular',
        marginBottom: 5,
    },
    viewComments: {
        color: '#666',
        marginTop: 5,
        fontFamily: 'Poppins-Regular',
    },
    commentsSection: {
        marginTop: 10,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    commentUsername: {
        fontFamily: 'Poppins-Medium',
        marginRight: 5,
    },
    commentText: {
        fontFamily: 'Poppins-Regular',
        flex: 1,
    },
    addCommentSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        fontFamily: 'Poppins-Regular',
    },
    sendButton: {
        padding: 5,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '80%',
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 5,
    },
    imagePicker: {
        height: 200,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        height: 100,
        textAlignVertical: 'top',
        fontFamily: 'Poppins-Regular',
    },
    createButton: {
        backgroundColor: '#9fc0af',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#fff',
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
    },
    dateText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Poppins-Regular'
    },
});
