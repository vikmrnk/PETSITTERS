import { View, Text, TouchableOpacity, FlatList, Image, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Modal, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/authContext';
import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, getDoc } from 'firebase/firestore';
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
    const [sitterData, setSitterData] = useState(null);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const flatListRef = useRef(null);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [activeCommentId, setActiveCommentId] = useState(null);

    // Ефект для завантаження даних сіттера
    useEffect(() => {
        if (user?.userId) {
            const sitterDoc = doc(db, 'sitters', user.userId);
            const unsubscribe = onSnapshot(sitterDoc, (doc) => {
                if (doc.exists()) {
                    setSitterData(doc.data());
                }
            });

            return () => unsubscribe();
        }
    }, [user]);

    // Ефект для завантаження постів
    useEffect(() => {
        if (user?.userId) {
            loadPosts();
        }
    }, [user]);

    // Якщо немає користувача, показуємо заглушку
    if (!user?.userId) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Please log in to view posts</Text>
            </View>
        );
    }

    // Всі інші функції (loadPosts, pickImage, createPost, toggleLike, і т.д.)
    const loadPosts = async () => {
        if (!user?.userId) return;
        
        try {
            const postsRef = collection(db, 'posts');
            const q = query(
                postsRef,
                where('userId', '==', user.userId),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const postsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setPosts(postsData);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
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

    const createPost = async () => {
        if (!newPost.image || !newPost.caption) {
            alert('Please select an image and add a caption');
            return;
        }

        setUploading(true);
        try {
            // Завантаження зображення на ImgBB
            const formData = new FormData();
            formData.append('image', {
                uri: newPost.image,
                type: 'image/jpeg',
                name: 'photo.jpg'
            });

            const response = await fetch(
                `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            const data = await response.json();
            
            if (data.success) {
                // Збереження поста в Firestore
                await addDoc(collection(db, 'posts'), {
                    userId: user.userId,
                    username: sitterData?.name || user?.name || user?.username,
                    userImage: sitterData?.imageUrl || user?.profileUrl,
                    imageUrl: data.data.url,
                    caption: newPost.caption,
                    createdAt: new Date(),
                    likes: [],
                    comments: []
                });

                setModalVisible(false);
                setNewPost({ image: null, caption: '' });
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Error creating post');
        } finally {
            setUploading(false);
        }
    };

    const toggleLike = async (postId) => {
        try {
            const postRef = doc(db, 'posts', postId);
            const postDoc = await getDoc(postRef);
            const currentLikes = postDoc.data().likes || [];
            
            if (currentLikes.includes(user.userId)) {
                // Прибрати лайк
                await updateDoc(postRef, {
                    likes: arrayRemove(user.userId)
                });
            } else {
                // Додати лайк
                await updateDoc(postRef, {
                    likes: arrayUnion(user.userId)
                });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const toggleComments = (postId) => {
        setActiveCommentId(activeCommentId === postId ? null : postId);
    };

    const addComment = async (postId) => {
        if (!newComment.trim()) return;
        
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                comments: arrayUnion({
                    userId: user.userId,
                    username: sitterData?.name || user?.username,
                    text: newComment.trim(),
                    createdAt: new Date()
                })
            });
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const scrollToComments = (postId) => {
        setSelectedPostId(postId);
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const renderPost = ({ item }) => (
        <View style={styles.postCard}>
            <View style={styles.postHeader}>
                <Image 
                    source={{ uri: item.userImage || 'https://via.placeholder.com/30' }}
                    style={styles.authorImage}
                />
                <Text style={styles.authorName}>{item.username}</Text>
            </View>
            
            <Image 
                source={{ uri: item.imageUrl }}
                style={styles.postImage}
            />
            
            <View style={styles.postActions}>
                <View style={styles.leftActions}>
                    <TouchableOpacity 
                        onPress={() => toggleLike(item.id)}
                        style={styles.actionButton}
                    >
                        <Ionicons 
                            name={Array.isArray(item.likes) && item.likes.includes(user.userId) ? "heart" : "heart-outline"} 
                            size={24} 
                            color={Array.isArray(item.likes) && item.likes.includes(user.userId) ? "#ff4b4b" : "#666"}
                        />
                        <Text style={styles.actionText}>
                            {Array.isArray(item.likes) ? item.likes.length : 0}
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={() => toggleComments(item.id)}
                        style={[styles.actionButton, { marginLeft: 15 }]}
                    >
                        <Ionicons name="chatbubble-outline" size={22} color="#666" />
                        <Text style={styles.actionText}>
                            {Array.isArray(item.comments) ? item.comments.length : 0}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.captionContainer}>
                <Text style={styles.caption}>
                    <Text style={styles.authorNameCaption}>{item.username}</Text>
                    {" "}{item.caption}
                </Text>
            </View>

            {activeCommentId === item.id && (
                <View style={styles.commentsSection}>
                    <View style={styles.commentsList}>
                        {Array.isArray(item.comments) && item.comments.map((comment, index) => (
                            <View key={index} style={styles.commentItem}>
                                <Text style={styles.commentUsername}>{comment.username}</Text>
                                <Text style={styles.commentText}>{comment.text}</Text>
                            </View>
                        ))}
                    </View>
                    
                    <View style={styles.addCommentSection}>
                        <TextInput
                            style={styles.commentInput}
                            value={newComment}
                            onChangeText={setNewComment}
                            placeholder="Add a comment..."
                            placeholderTextColor="#999"
                            multiline={false}
                        />
                        <TouchableOpacity 
                            onPress={() => addComment(item.id)}
                            style={styles.sendButton}
                            disabled={!newComment.trim()}
                        >
                            <Ionicons 
                                name="send" 
                                size={24} 
                                color={newComment.trim() ? "#9fc0af" : "#ccc"} 
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <FlatList
                ref={flatListRef}
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={renderPost}
                contentContainerStyle={styles.postsContainer}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
    },
    postCard: {
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    authorImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    authorName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    postImage: {
        width: '100%',
        height: 400,
        resizeMode: 'cover',
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    leftActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    captionContainer: {
        padding: 12,
    },
    caption: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    authorNameCaption: {
        fontWeight: '600',
        color: '#000',
    },
    commentsSection: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    commentsList: {
        maxHeight: 200,
        padding: 12,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    commentUsername: {
        fontWeight: '600',
        marginRight: 8,
        fontSize: 14,
        color: '#000',
    },
    commentText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    addCommentSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        fontSize: 14,
        maxHeight: 40,
        backgroundColor: '#f8f8f8',
    },
    sendButton: {
        padding: 5,
    },
    postsContainer: {
        padding: 15,
    },
}); 