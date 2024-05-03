import React, { useEffect, useState } from 'react';

import { setShows } from '../store/Shows';
import { useDispatch, useSelector } from 'react-redux';
import { useUser } from '../contexts/UserContext';

import { sendRequest, requestMethods } from '../core/tools/apiRequest';

import ModalHigh from '../components/Modals/ModalHigh';
import ShowVenueCard from '../components/ShowVenueCards/ShowVenueCard';

const Streams = ({ navigation }) => {
    const dispatch = useDispatch();
    const [userIsVenue, setUserIsVenue] = useState(false);

    const { currentUser } = useUser();

    const shows = useSelector((global) => global.showsSlice.shows);

    useEffect(() => {
        currentUser.role.id === 2 ? setUserIsVenue(true) : setUserIsVenue(false);

        const getShows = async () => {
            try {
                const response = await sendRequest(
                    requestMethods.GET,
                    `shows?status=set${userIsVenue ? `&venue_id=${currentUser.id}` : ''}`,
                    null
                );
                if (response.status !== 200) throw new Error('Failed to fetch shows');

                dispatch(setShows(response.data));
            } catch (error) {
                console.log('Error fetching shows:', error);
            }
        };

        getShows();
    }, [userIsVenue]);

    const handleCardPress = (show) => {
        userIsVenue
            ? navigation.navigate('StreamBroadcast', { showId: show.id })
            : navigation.navigate('StreamView', { show });
    };

    return (
        <ModalHigh
            title="Upcoming Shows"
            navigation={navigation}
            items={shows}
            renderItem={({ item }) => (
                <ShowVenueCard key={item.id} entity={item} handlePress={() => handleCardPress(item)} />
            )}
        />
    );
};

export default Streams;
