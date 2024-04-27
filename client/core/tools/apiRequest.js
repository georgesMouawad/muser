import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

axios.defaults.baseURL = 'http://10.0.2.2:8000/api/';

export const sendRequest = async (method, route, body) => {
    try {
        const token = await AsyncStorage.getItem('token');
        console.log('token in request', token);
        const response = await axios.request({
            method: method,
            url: route,
            data: body,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        });
        return response;
    } catch (error) {
        // if (error.response) {
        //     console.log(error.response.data);
        //     console.log(error.response.status);
        //     console.log(error.response.headers);
        // } else if (error.request) {
        //     console.log(error.request);
        // } else {
        //     console.log('Error', error.message);
        // }
        // console.log(error.config);

        console.log('error in request', error);
    }
};

export const requestMethods = {
    POST: 'POST',
    GET: 'GET',
    PUT: 'PUT',
    DELETE: 'DELETE',
};
