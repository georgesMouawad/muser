import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Modal,
    Dimensions,
    TextInput,
    Pressable,
    FlatList,
    TouchableWithoutFeedback,
} from 'react-native';

import { colors, utilities } from '../../styles/utilities';

import PrimaryBtn from '../Elements/PrimaryBtn';

const ChatModal = ({ data, userInput, setUserInput, handlePress, modalVisible, setModalVisible }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
            }}
        >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <View style={styles.bottomStickView}>
                    <View
                        style={[
                            styles.modalView,
                            { justifyContent: data && data.length > 0 ? 'space-between' : 'center' },
                        ]}
                        onStartShouldSetResponder={() => true}
                    >
                        {data && data.length > 0 ? (
                            <>
                                <Text style={styles.modalTitle}>Your Connections</Text>
                                {/* <TextInput
                            style={[utilities.inputText]}
                            onChangeText={setUserInput}
                            placeholderTextColor={colors.gray}
                            value={userInput}
                            placeholder="Enter your thoughts here..."
                        /> */}
                                <FlatList
                                    data={data}
                                    renderItem={({ item }) => (
                                        <BandMemberCard entity={item} handlePress={handlePress} />
                                    )}
                                    keyExtractor={(item) => item.id}
                                    showsVerticalScrollIndicator={false}
                                />
                                <PrimaryBtn text={'Add'} marginBottom={64} handlePress={handlePress} />
                            </>
                        ) : (
                            <Text
                                style={[
                                    utilities.textCenter,
                                    utilities.myFontRegular,
                                    utilities.textM,
                                    { color: colors.white, marginBottom: 12 },
                                ]}
                            >
                                No Connections Yet!
                            </Text>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default ChatModal;

const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
    bottomStickView: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    modalView: {
        elevation: 2,
        paddingTop: 32,
        height: 0.5 * height,
        paddingHorizontal: 20,
        backgroundColor: colors.bgOffDark,
        borderTopLeftRadius: utilities.borderRadius.xl,
        borderTopRightRadius: utilities.borderRadius.xl,
    },

    modalTitle: {
        marginBottom: 16,
        textAlign: 'center',
        fontFamily: 'Montserrat-Bold',
        color: colors.white,
        fontSize: 20,
    },

    modalTextInput: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.white,
        borderRadius: utilities.borderRadius.s,
        width: '100%',
    },
});
