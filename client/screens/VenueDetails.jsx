import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, FlatList, TouchableOpacity } from 'react-native';

import { setSelectedVenue } from '../store/Venues';

import BackBtn from '../components/Elements/BackBtn';
import ShowCard from '../components/ShowCard/ShowCard';
import BandMemberCard from '../components/BandMemberCard/BandMemberCard';

import { utilities, colors } from '../styles/utilities';
import { profilePicturesUrl, showsPicturesUrl } from '../core/tools/apiRequest';
import { sendRequest, requestMethods } from '../core/tools/apiRequest';
import { formatDateString } from '../core/tools/formatDate';
import PrimaryBtn from '../components/Elements/PrimaryBtn';

const VenueDetails = ({ route, navigation }) => {
    const { venue } = route.params;

    const [switchHandler, setSwitchHandler] = useState(false);

    const [shows, setShows] = useState([]);
    const [selectedShow, setSelectedShow] = useState();

    console.log('selected show', selectedShow);

    useEffect(() => {
        const getVenueDetails = async () => {
            try {
                const response = await sendRequest(requestMethods.GET, `users/${venue.id}`, null);
                if (response.status !== 200) throw new Error('Failed to fetch venue details');
                console.log(response.data);
                dispatch(setSelectedVenue(response.data));
            } catch (error) {
                console.log('Error fetching venue details:', error);
            }
        };

        const getVenueShows = async () => {
            try {
                const response = await sendRequest(requestMethods.GET, `shows?venue_id=${venue.id}&status=set`, null);
                if (response.status !== 200) throw new Error('Failed to fetch venue shows');
                console.log(response.data);
                setShows(response.data);
            } catch (error) {
                console.log('Error fetching venue shows:', error);
            }
        };
        // getVenueDetails();
        getVenueShows();
    }, [venue]);

    return (
        <View style={[utilities.flexed, { backgroundColor: colors.bgDark }]}>
            {/* <BackBtn navigation={navigation} /> */}
            <View>
                <Image
                    source={{
                        uri: switchHandler
                            ? `${showsPicturesUrl + selectedShow.picture}`
                            : `${profilePicturesUrl + venue.picture}`,
                    }}
                    style={[styles.entityImage, styles.borderRadiusBottom]}
                />

                <View style={[utilities.overlay, styles.borderRadiusBottom, { height: 96, gap: 2 }]}>
                    <Text style={[utilities.textL, utilities.myFontBold, { color: 'white' }]}>
                        {!switchHandler ? venue.name : selectedShow.name}
                    </Text>
                    <Text style={[utilities.textS, utilities.myFontRegular, { color: colors.offWhite }]}>
                        {switchHandler ? formatDateString(selectedShow.date) : `${venue.location.name}, Lebanon`}
                    </Text>
                </View>
            </View>
            <View style={[utilities.container]}>
                <Text style={[utilities.textM, utilities.myFontBold, { marginVertical: 18 }]}>
                    {!switchHandler ? 'Upcoming Shows' : 'Band Members'}
                </Text>
                {shows.length > 0 ? (
                    <FlatList
                        data={!switchHandler ? shows : selectedShow.band.members}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) =>
                            switchHandler ? (
                                <BandMemberCard entity={item} navigation={navigation} />
                            ) : (
                                <ShowCard
                                    entity={item}
                                    navigation={navigation}
                                    handlePress={() => {
                                        setSelectedShow(item);
                                        setSwitchHandler(true);
                                    }}
                                />
                            )
                        }
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <Text style={[utilities.textM, utilities.myFontRegular, { color: colors.offWhite }]}>
                        No shows available, check back later!
                    </Text>
                )}
                <PrimaryBtn text={'Book your Show'} />
            </View>
        </View>
    );
};

export default VenueDetails;

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
    borderRadiusBottom: {
        // borderBottomLeftRadius: 20,
        // borderBottomRightRadius: 20,
    },
    entityImage: {
        width: '100%',
        height: height * 0.5,
        resizeMode: 'cover',
        position: 'relative',
    },
});
