import React from 'react';

import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { UserProvider, useUser } from './contexts/UserContext';
import { RegisterProvider } from './contexts/RegisterContext';

import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import MainTabs from './screens/MainTabs';
import UserRole from './screens/UserRole';
import userInfo from './screens/UserInfo';

const Stack = createStackNavigator();

const AuthenticationStack = () => {
    return (
        <RegisterProvider>
            <Stack.Navigator>
                <Stack.Screen name="UserInfo" component={userInfo} options={{ headerShown: false }} />
                <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }} />
                <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
                <Stack.Screen name="UserRole" component={UserRole} options={{ headerShown: false }} />
            </Stack.Navigator>
        </RegisterProvider>
    );
};

// const ChatStack = () => {
//     return (
//         <Stack.Navigator>
//             <Stack.Screen name="Chat" component={Chat} />
//         </Stack.Navigator>
//     );
// };

// const RootNavigator = () => {
//     return (
//         <NavigationContainer>
//             <StatusBar translucent={true} backgroundColor="transparent" barStyle={'dark-content'} />

//             <Stack.Screen name="AuthenticationStack" component={AuthenticationStack} />

//             <MainTabs />
//         </NavigationContainer>
//     );
// };

const AppNavigator = () => {
    const { currentUser } = useUser();

    return currentUser ? <MainTabs /> : <AuthenticationStack />;
};

const App = () => {
    // const [user, setUser] = useState(null);

    // useEffect(() => {
    //     const unsubscribe = auth.onAuthStateChanged((user) => {
    //         setUser(user);
    //         if (user) {
    //             console.log('User:', user);
    //         }
    //     });

    //     return unsubscribe;
    // }, []);

    return (
        <UserProvider>
            <NavigationContainer>
                <StatusBar translucent={true} backgroundColor="transparent" barStyle={'dark-content'} />
                <AppNavigator />
            </NavigationContainer>
        </UserProvider>
    );
};

export default App;