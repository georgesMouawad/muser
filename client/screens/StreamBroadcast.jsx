import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Button, Dimensions } from 'react-native';
import {
    useCall,
    useCallStateHooks,
    useIncallManager,
    useStreamVideoClient,
    VideoRenderer,
} from '@stream-io/video-react-native-sdk';

import InCallManager from 'react-native-incall-manager';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Play, SwitchCamera, VideoOff, Video, Radio, Mic, MicOff, CirclePlay, Users } from 'lucide-react-native';

import {
    HostLivestream,
    CallContent,
    StreamCall,
    StreamVideo,
    StreamVideoClient,
    ViewerLivestream,
} from '@stream-io/video-react-native-sdk';

import { useUser } from '../contexts/UserContext';
import { profilePicturesUrl } from '../core/tools/apiRequest';
import inCallManager from 'react-native-incall-manager';

const StreamBroadcast = () => {
    const streamId = 'hgjbkdafdf';
    const [call, setCall] = useState(null);
    const [watchMode, setWatchMode] = useState(false);

    const client = useStreamVideoClient();

    client && console.log('Client Found!');

    const createCall = async () => {
        if (!client) {
            console.log('No client found');
            return;
        }
        console.log('client:', client);
        try {
            const call = client.call('livestream', streamId);
            await call.join({ create: true });
            setCall(call);
        } catch (error) {
            console.error('Error joining call:', error);
        }
    };

    const joinCall = async () => {
        console.log('Joining call');

        if (!client) {
            console.log('No client found');
            return;
        }

        setWatchMode(true);

        try {
            const call = client.call('livestream', streamId);
            await call.join();
            setCall(call);
        } catch (error) {
            console.error('Error joining call:', error);
        }
    };

    const leaveCall = async () => {
        console.log('leaving call');

        if (call) {
            await call.leave().catch(console.error);
            inCallManager.stop();
            // setCall(null);
        }
    };

    const stopLiveStream = async () => {
        if (call) {
            // await call.stopLive().catch(console.error);
            await call.endCall().catch(console.error);
            inCallManager.stop();
            setCall(null);
        }
    };

    const LiveStreamViewerLayout = () => {
        const call = useCall();
        const { useCameraState, useMicrophoneState } = useCallStateHooks();
        const { status: microphoneStatus } = useMicrophoneState();
        const { status: cameraStatus } = useCameraState();

        const { useParticipantCount, useLocalParticipant, useIsCallLive } = useCallStateHooks();

        const totalParticipants = useParticipantCount();
        const localParticipant = useLocalParticipant();
        const isCallLive = useIsCallLive();

        console.log('localParticipant:', localParticipant);

        useEffect(() => {
            InCallManager.start({ media: 'video' });
            return () => InCallManager.stop();
        }, []);

        const toggleVideoMuted = async () => {
            await call?.camera.toggle();
        };

        const toggleCameraFacingMode = async () => {
            await call?.camera.flip();
        };

        const toggleAudioMuted = async () => {
            await call?.microphone.toggle();
        };

        const handleExit = async () => {
            await call?.stopLive();
            await call?.leave();
            inCallManager.stop();
            setCall(null);
        };

        return (
            <View style={styles.flexed}>
                <View style={styles.topLiveStreamBar}>
                    <TouchableOpacity style={{ flexDirection: 'row' }}>
                        <Users size={24} color={'white'} />
                        <Text>{totalParticipants}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Radio size={24} color={isCallLive ? 'red' : 'white'} />
                    </TouchableOpacity>
                </View>
                {/* <Text style={styles.text}>Live: {totalParticipants}</Text> */}
                <View style={styles.flexed}>
                    {localParticipant && <VideoRenderer participant={localParticipant} trackType="videoTrack" />}
                </View>
                {/* <View style={styles.bottomBar}>
                    {isCallLive ? (
                        <Button onPress={() => call?.stopLive()} title="Stop Livestream" />
                    ) : (
                        <Button
                            onPress={() => {
                                call?.goLive();
                            }}
                            title="Start Livestream"
                        />
                    )}
                </View> */}
                <View style={styles.bottomLiveStreamBar}>
                    <TouchableOpacity onPress={toggleVideoMuted}>
                        {cameraStatus === 'disabled' ? (
                            <VideoOff size={24} color={'white'} />
                        ) : (
                            <Video size={24} color={'white'} />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleCameraFacingMode}>
                        <SwitchCamera size={24} color={'white'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleAudioMuted}>
                        {microphoneStatus === 'disabled' ? (
                            <MicOff size={24} color={'white'} />
                        ) : (
                            <Mic size={24} color={'white'} />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleExit}>
                        <Play size={24} color={'white'} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (call === null)
        return (
            <View style={styles.liveStreamBroadcasttartContainer}>
                <TouchableOpacity onPress={createCall} style={styles.callStartBtn}>
                    <Text style={{ color: 'white' }}>Start Stream</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={joinCall} style={styles.callJoinBtn}>
                    <Text style={{ color: 'white' }}>Watch Stream</Text>
                </TouchableOpacity>
            </View>
        );

    return (
        <StreamCall call={call}>
            <SafeAreaView style={{ flex: 1, marginTop: 64 }}>
                <LiveStreamViewerLayout />
            </SafeAreaView>
        </StreamCall>
    );
};

export default StreamBroadcast;

const styles = StyleSheet.create({
    liveStreamBroadcasttartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    callStartBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'blue',
        padding: 10,
    },
    callJoinBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'green',
        padding: 10,
    },
    flexed: {
        flex: 1,
    },
    text: {
        alignSelf: 'center',
        color: 'white',
        backgroundColor: 'blue',
        padding: 6,
        margin: 4,
    },
    bottomBar: {
        alignSelf: 'center',
        margin: 4,
    },

    bottomLiveStreamBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 8,
    },

    topLiveStreamBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 8,
    },
});
