import React, { useState, useLayoutEffect, useCallback, useEffect } from 'react';
import { TouchableOpacity, Image, View, StyleSheet, Dimensions, Text, Pressable } from 'react-native';

import { fireStoreDb } from '../config/firebase';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    getDoc,
    setDoc,
    getDocs,
    updateDoc,
} from 'firebase/firestore';

import { PlusIcon, ArrowLeft, Send as SendIcon, ChevronLeft, X, Check } from 'lucide-react-native';
import { GiftedChat, Bubble, Send, InputToolbar, Composer } from 'react-native-gifted-chat';
import { renderBubble, renderSend, renderInputToolbar } from '../core/tools/chatConfigurations';

import { addConnectedUser, setConnectedUsers } from '../store/Users';
import { useDispatch, useSelector } from 'react-redux';
import { useUser } from '../contexts/UserContext';

import { profilePicturesUrl } from '../core/tools/apiRequest';
import { sendRequest, requestMethods } from '../core/tools/apiRequest';

import PictureHeader from '../components/PictureHeader/PictureHeader';
import { colors, utilities } from '../styles/utilities';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import BandMemberCard from '../components/BandMemberCard/BandMemberCard';

const Chat = ({ navigation, route }) => {
    const { currentUser } = useUser();
    const { chatId, receiver, chatTitle } = route.params;

    const [connectionModalVisible, setConnectionModalVisible] = useState(false);
    const [bandModalVisible, setBandModalVisible] = useState(false);

    const [chatParticipants, setChatParticipants] = useState([
        { id: currentUser.id, name: currentUser.name, picture: currentUser.picture },
    ]);
    const [messages, setMessages] = useState([]);
    const [chatRef, setChatRef] = useState(null);

    const [bandName, setBandName] = useState('');

    const dispatch = useDispatch();
    const userConnections = useSelector((global) => global.usersSlice.connectedUsers);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => {
                if (chatTitle) return <Text style={[utilities.textL, utilities.myFontMedium]}>{chatTitle}</Text>;
                else {
                    return <PictureHeader picture={receiver.picture} name={receiver.name} />;
                }
            },
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 20 }}>
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <View style={{ flexDirection: 'row', marginRight: 20, alignItems: 'center', gap: 8 }}>
                    <Pressable style={styles.bandBtn} onPress={() => setBandModalVisible(true)}>
                        <Text style={styles.bandBtnText}>Band</Text>
                    </Pressable>
                    <Pressable onPress={() => setConnectionModalVisible(true)}>
                        <PlusIcon size={24} color="white" />
                    </Pressable>
                </View>
            ),
        });
    }, [navigation, addParticipant, receiver]);

    useEffect(() => {
        let unsubscribe;

        getChatParticipants();
        setupMessagesListener().then((unsub) => {
            unsubscribe = unsub;
        });

        console.log('Chat ID:', chatId);
        console.log('Chat Ref:', chatRef);
        console.log('Receiver:', receiver);
        console.log('Chat Title:', chatTitle);
        console.log('Chat Participants:', chatParticipants);

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [chatId, receiver]);

    const createChatId = () => [currentUser.id, receiver.id].sort().join('-');
    
    const getChatRef = async () => {
        const currentChatId = chatId || createChatId();
        const chatRef = doc(fireStoreDb, 'chats', currentChatId);

        try {
            const docSnap = await getDoc(chatRef);
            if (docSnap.exists()) {
                console.log('Document exists, setting chatRef');
                setChatRef(chatRef);
                return chatRef;
            } else {
                console.log('No such document, not setting chatRef');
                return null;
            }
        } catch (error) {
            console.error('Error checking document existence:', error);
            return null;
        }
    };

    const getChatParticipantsFromFirestore = async () => {
        if (!chatRef) return console.log('Chat reference is not available');
        try {
            const chatSnapshot = await getDoc(chatRef);
            if (!chatSnapshot.exists()) {
                throw new Error('Chat document does not exist');
            }

            const chatData = chatSnapshot.data();
            return chatData.participantsIds.map((id) => ({
                id,
                name: '',
                picture: '',
            }));
        } catch (error) {
            console.error('Error fetching participants:', error);
            return [];
        }
    };

    const getChatParticipants = async () => {
        if (!chatRef) {
            console.log('Chat reference is not available, getting Ids locally');
            const participants = [currentUser, receiver].map((user) => ({
                id: user.id,
                name: user.name,
                picture: user.picture,
            }));
            console.log('Participants:', participants)
            setChatParticipants(participants);
        } else {
            console.log('Chat reference is available, fetching participants from Firestore');
            const participants = await getChatParticipantsFromFirestore();
            setChatParticipants(participants);
        }
    };

    const getChatParticipantsPictures = async () => {
        if (chatParticipants.length < 3) return console.log('No or less than 3 participants to fetch pictures for');
        const query = chatParticipants.map((participant) => `ids[]=${participant.id}`).join('&');
        try {
            const response = await sendRequest(requestMethods.GET, `users/details?${query}`, null);
            if (response.status !== 200) throw new Error('Failed to fetch users');
            setChatParticipants(response.data);
            console.log('Users fetched:', response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const getCurrentUserConnections = async () => {
        try {
            const response = await sendRequest(requestMethods.GET, 'users/type/musician?connected=true', null);
            if (response.status !== 200) throw new Error('Failed to fetch connections');
            console.log('Connections fetched:', response.data);
            dispatch(setConnectedUsers(response.data));
        } catch (error) {
            console.log('Error fetching connections:', error);
        }
    };

    const addToCurrentUserConnections = async (userId) => {
        try {
            const response = await sendRequest(requestMethods.POST, `connections/${userId}`, null);
            if (response.status !== 200) throw new Error('Failed to add connection');
            dispatch(addConnectedUser(userId));
            addChatParticipantToState(response.data);
            console.log('Connection added:', response.data);
        } catch (error) {
            console.error('Error adding connection:', error);
        }
    };

    const checkIfParticipantExistsinState = (userId) => {
        if (!userId) return false;
        return chatParticipants.some((user) => user.id === userId);
    };

    const getChatParticipantPictureFromState = (userId) => {
        if (!userId || userId === currentUser.id) {
            console.log('No picture needed for current user.');
            return null;
        }

        const participant = chatParticipants.find((user) => user.id === userId);
        if (!participant || !participant.picture) {
            console.log('Participant not found or no picture available.');
            return null;
        }

        return `${profilePicturesUrl}${participant.picture}`;
    };

    const addChatParticipantToState = (user) => {
        if (!user) {
            console.log('No user provided');
            return;
        }

        if (checkIfParticipantExistsinState(user.id)) {
            console.log('Participant already in chat');
            return;
        }

        setChatParticipants((currentParticipants) => [
            ...currentParticipants,
            { id: user.id, name: user.name, picture: user.picture },
        ]);
    };

    const setupMessagesListener = async () => {
        const chatRef = await getChatRef(chatId);

        if (!chatRef) return;

        const messagesRef = collection(chatRef, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map((doc) => ({
                _id: doc.id,
                text: doc.data().text,
                createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
                user: {
                    _id: doc.data().userId,
                    avatar:
                        chatParticipants.length === 2 ? null : getChatParticipantPictureFromState(doc.data().userId),
                },
            }));
            setMessages(fetchedMessages);
        });

        return unsubscribe;
    };

    const updateChatParticipantsInFirestore = async (newParticipantIdsList) => {
        if (!chatRef) {
            console.error('No chat reference available.');
            return;
        }

        try {
            await updateDoc(chatRef, {
                participantsIds: newParticipantIdsList,
            });
            setConnectionModalVisible(false);
        } catch (error) {
            console.error('Error updating participants:', error);
        }
    };

    const addParticipant = async (newParticipantId) => {
        if (checkIfParticipantExistsinState(newParticipantId)) {
            console.log('Participant already in chat');
            return;
        }
        const newParticipantIdsList = [...chatParticipants.map((participant) => participant.id), newParticipantId];

        await updateChatParticipantsInFirestore(newParticipantIdsList);
        await addToCurrentUserConnections(newParticipantId); //and add it to the state
    };

    const sendAndLogMessage = async (message, messagesRef, chatTitle = null) => {
        const { _id, text, createdAt, user } = message;
        try {
            const messageDocRef = await addDoc(messagesRef, {
                _id,
                text,
                createdAt,
                userId: user._id,
            });
            await updateLastMessageInFirestore({
                messageId: messageDocRef.id,
                text,
                createdAt,
                userId: user._id,
                chatTitle,
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const updateLastMessageInFirestore = async (messageData) => {
        const { messageId, text, createdAt, userId, chatTitle } = messageData;
        if (!chatRef) {
            console.error('No chat reference available.');
            return;
        }
        try {
            await updateDoc(chatRef, {
                lastMessage: {
                    messageId,
                    text,
                    createdAt,
                    userId,
                },
                ...(chatTitle && { chatTitle }),
            });
        } catch (error) {
            console.error('Error updating last message:', error);
        }
    };

    const createNewChat = async (initialMessage) => {
        const chatId = createChatId();
        const newChatRef = doc(fireStoreDb, 'chats', chatId);
        const messageRef = collection(newChatRef, 'messages');

        try {
            await sendAndLogMessage(initialMessage, messageRef);
            await getChatParticipants();
            const participantIds = chatParticipants.map((participant) => participant.id);
            await updateChatParticipantsInFirestore(participantIds);
            return newChatRef;
        } catch (error) {
            console.error('Error creating new chat:', error);
            return null;
        }
    };

    const onSend = useCallback(async (messages = []) => {
        let chatRef = await getChatRef();
        if (!chatRef && messages.length > 0) {
            chatRef = await createNewChat(messages[0]);
            setChatRef(chatRef);
            await addToCurrentUserConnections();
        }

        if (chatRef) {
            const messagesRef = collection(chatRef, 'messages');
            const promises = messages.map((message) => sendAndLogMessage(message, messagesRef));
            await Promise.all(promises);
        }

        setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));
    }, []);

    const handleFormBand = async () => {
        if (!bandName) {
            console.log('No band name provided');
            return;
        }

        if (!chatRef) {
            console.log('No chat reference available');
            setBandModalVisible(false);
            return;
        }

        try {
            const chatParticipants = await getChatParticipantsFromFirestore();
            const chatParticipantsIds = chatParticipants.map((participant) => participant.id);

            console.log('Creating band with these participants:', chatParticipantsIds);

            const response = await sendRequest(requestMethods.POST, 'bands', {
                name: bandName,
                members: chatParticipantsIds,
            });

            if (response.status !== 201) throw new Error('Failed to create band');

            console.log('Band created:', response.data);

            const messageData = {
                _id: `${currentUser.id}-${Date.now()}-${bandName}`,
                text: `${currentUser.name} has formed the band ${bandName}!`,
                createdAt: serverTimestamp(),
                userId: currentUser.id,
            };
            const messageRef = collection(chatRef, 'messages');
            await sendAndLogMessage(messageData, messageRef, bandName);
        } catch (error) {
            console.error('Error processing band formation:', error);
        } finally {
            setBandModalVisible(false);
        }
    };

    function renderComposer(props) {
        return (
            <Composer
                {...props}
                textInputStyle={{
                    color: '#fff',
                    marginEnd: 8,
                    borderTopWidth: 0,
                    borderBottomWidth: 0,
                    backgroundColor: 'transparent',
                }}
            />
        );
    }

    function renderInputToolbar(props) {
        if (connectionModalVisible || bandModalVisible) return null;

        return (
            <InputToolbar
                {...props}
                containerStyle={{
                    backgroundColor: '#1E1E1E',
                    padding: 6,
                    borderTopColor: '#fff',
                    borderTopWidth: 0.5,
                    borderBottomColor: '#fff',
                    borderBottomWidth: 0.5,
                }}
                renderComposer={renderComposer}
                primaryStyle={{ alignItems: 'center', justifyContent: 'center' }}
            />
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.bgDark }}>
            <GiftedChat
                messages={messages}
                onSend={(messages) => onSend(messages)}
                user={{
                    _id: currentUser.id,
                    // avatar: null,
                }}
                renderBubble={renderBubble}
                inverted={true}
                renderSend={renderSend}
                renderInputToolbar={renderInputToolbar}
                messagesContainerStyle={{ backgroundColor: colors.bgDark, paddingVertical: 8 }}
                alignTop={true}
                renderActions={() => null}
            />

            {connectionModalVisible && (
                <View style={styles.chatModal}>
                    <Text style={[utilities.textL, utilities.textCenter, { marginBottom: 16 }]}>Your Connections</Text>
                    <FlatList
                        data={userConnections}
                        renderItem={({ item }) => (
                            <BandMemberCard entity={item} handlePress={() => addParticipant(item.id)} />
                        )}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}
            {bandModalVisible && (
                <View style={styles.chatModal}>
                    <Text style={[utilities.textL, utilities.myFontMedium, utilities.textCenter]}>Form Your Band</Text>
                    <View style={styles.bandInputContainer}>
                        <TextInput
                            style={[styles.formBandInput]}
                            placeholder="Your band name"
                            placeholderTextColor={colors.lightGray}
                            value={bandName}
                            onChangeText={(text) => setBandName(text)}
                        />
                        <Pressable onPress={handleFormBand} style={{ marginBottom: -8 }}>
                            {bandName?.length > 0 ? (
                                <Check size={32} color={colors.white} />
                            ) : (
                                <X size={24} color={colors.white} />
                            )}
                        </Pressable>
                    </View>
                </View>
            )}
        </View>
    );
};
export default Chat;

const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
    chatModal: {
        height: height * 0.2,
        paddingHorizontal: 20,
        paddingVertical: 24,
        justifyContent: 'space-between',
        borderTopLeftRadius: utilities.borderRadius.xl,
        borderTopEndRadius: utilities.borderRadius.xl,
        backgroundColor: colors.bglight,
    },

    bandBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 4,

        borderRadius: utilities.borderRadius.m,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    bandBtnText: {
        fontSize: 16,
        fontFamily: 'Montserrat-Bold',
        marginBottom: 1,
        color: colors.black,
    },

    bandInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        borderBottomColor: colors.lightGray,
        borderBottomWidth: 0.5,

        marginBottom: 10,
    },

    formBandInput: {
        fontSize: 18,
        color: colors.white,
        height: 48,
        textAlign: 'left',
        width: '80%',
        marginBottom: -8,
    },

    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 8,

        borderColor: 'white',
        borderWidth: 0.5,
    },
});
