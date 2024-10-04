import React, {Component} from 'react';
import {Platform, View, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import {isIphoneX} from 'react-native-iphone-x-helper';
import {connect, useSelector} from 'react-redux';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {firebase} from '@react-native-firebase/dynamic-links';
import {
  Login,
  Signup,
  Signup1,
  Signup4,
  Timeline,
  Groups,
  UserData,
  Settings,
  GroupDetails,
  Chat,
  AudioCall,
  GroupInformation,
  GroupMember,
  ForgetPassword,
  UpdateProfile,
  Notifications,
  Security,
  ContentPage,
  Help,
  Sponsor,
  ActiveSponsorPost,
  PaymentMethod,
  CardDetail,
  SavePost,
  CreateGroup,
  BlockedUsers,
  Interactions,
  BlockedContent,
  InteractionsDetails,
  RequrestJoinGroup,
  Statistics,
  UserSpecific,
  SignlePost,
  Notification,
  FriendRequestList,
  ChatList,
  ResetPassword,
  ReportedContent,
} from './Screens';
import {scale, theme} from './Utils';
import {appAPI} from './Utils/appApi';
import {firstTimeInstallApp} from './Redux/Actions';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const GroupScreenNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={({navigation}) => {
        return {
          gestureResponseDistance: {horizontal: theme.SCREENWIDTH * 0.5},
          detachPreviousScreen: !navigation.isFocused(),
          headerShown: false,
        };
      }}>
      <Stack.Screen name={'Groups'} component={Groups} />
      <Stack.Screen name={'GroupDetails'} component={GroupDetails} />
      <Stack.Screen name={'GroupMember'} component={GroupMember} />
    </Stack.Navigator>
  );
};

const handleUserNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={({navigation}) => {
        return {
          gestureResponseDistance: {horizontal: theme.SCREENWIDTH * 0.5},
          detachPreviousScreen: !navigation.isFocused(),
          headerShown: false,
        };
      }}>
      <Stack.Screen name={'UserData'} component={UserData} />
      <Stack.Screen name={'UserDataSpecific'} component={UserSpecific} />
      <Stack.Screen name={'GroupDetails'} component={GroupDetails} />
    </Stack.Navigator>
  );
};

const handleHomeNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={({navigation}) => {
        return {
          gestureResponseDistance: {horizontal: theme.SCREENWIDTH * 0.5},
          detachPreviousScreen: !navigation.isFocused(),
          headerShown: false,
        };
      }}>
      <Stack.Screen name={'Timeline'} component={Timeline} />
      <Stack.Screen name={'UserDataSpecific'} component={UserSpecific} />
    </Stack.Navigator>
  );
};

function TabNavigator() {
  const getNewPostBadge = useSelector((state) => state.UserInfo.newPostBadge);
  const getNewChatBadge = useSelector((state) => state.UserInfo.newChatBadge);
  const getNewChatInviteBadge = useSelector(
    (state) => state.UserInfo.newChatInviteBadge,
  );

  return (
    <Tab.Navigator
      initialRouteName={'Timeline'}
      tabBarOptions={{
        showLabel: false,
        tabStyle: {
          borderRadius: scale(70) / 2,
          marginTop: scale(10),
          height: isIphoneX() ? scale(65) : scale(62),
        },
        activeBackgroundColor: theme.colors.grey5,
        style: {
          height: isIphoneX() ? scale(90) : scale(80),
          paddingHorizontal: scale(10),
        },
      }}>
      <Tab.Screen
        options={({route, navigation}) => {
          return {
            tabBarIcon: ({color, focused}) => (
              <View style={styles.centerView}>
                <Icon name="list" size={26} color={color} />
                {getNewPostBadge === true && (
                  <View
                    style={{
                      width: scale(3.5),
                      height: scale(3.5),
                      borderRadius: scale(50),
                      backgroundColor: theme.colors.red,
                      marginTop: scale(5),
                    }}
                  />
                )}
              </View>
            ),
          };
        }}
        name="Timeline"
        component={handleHomeNavigation}
      />
      <Tab.Screen
        options={({route, navigation}) => {
          return {
            tabBarIcon: ({color, focused}) => (
              <Icon name="users" size={26} color={color} />
            ),
          };
        }}
        name="Groups"
        component={GroupScreenNavigation}
      />
      <Tab.Screen
        options={({route, navigation, props}) => {
          return {
            tabBarIcon: ({color, focused}) => (
              <Icon name="user" size={26} color={color} />
            ),
          };
        }}
        name="UserData"
        component={handleUserNavigation}
      />
      <Tab.Screen
        options={({route, navigation}) => {
          return {
            tabBarIcon: ({color, focused}) => (
              <View style={styles.centerView}>
                <Icon name="message-circle" size={26} color={color} />
                {(getNewChatBadge || getNewChatInviteBadge) && (
                  <View
                    style={{
                      width: scale(3.5),
                      height: scale(3.5),
                      borderRadius: scale(50),
                      backgroundColor: theme.colors.red,
                      marginTop: scale(5),
                    }}
                  />
                )}
              </View>
            ),
          };
        }}
        name="ChatUserList"
        component={ChatList}
      />
      <Tab.Screen
        options={({route, navigation}) => {
          return {
            tabBarIcon: ({color, focused}) => (
              <Icon name="settings" size={26} color={color} />
            ),
          };
        }}
        name="Settings"
        component={Settings}
      />
    </Tab.Navigator>
  );
}

class Navigation extends Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    firebase.app();
    this.checkPermission();
    try {
      let toekn = await AsyncStorage.getItem('@loginToken');

      if (toekn !== null) {
        appAPI.defaults.headers.common['Content-Type'] = 'application/json';
        appAPI.defaults.headers.common.Accept = 'application/json';
        appAPI.defaults.headers.common.Authorization = toekn;
      } else {
      }
    } catch (error) {}
  }

  /// fcm configuration
  checkPermission = async () => {
    const enabled = await messaging().hasPermission();
    if (Platform.OS === 'ios') {
      await PushNotificationIOS.requestPermissions();
    }
    if (enabled === 1 || enabled === 2) {
      await this.getFcmToken();
    } else {
      await this.requestUserPermission();
    }
  };

  requestUserPermission = async () => {
    const authStatus = await firebase.messaging().requestPermission();
    const enableds = await firebase.messaging().hasPermission();
    await firebase.messaging().registerDeviceForRemoteMessages();

    const enabled =
      enableds === messaging.AuthorizationStatus.AUTHORIZED ||
      enableds === messaging.AuthorizationStatus.PROVISIONAL ||
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      this.getFcmToken();
    }
  };

  getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      AsyncStorage.setItem('fcmToken', fcmToken);
      if (!this.props.firstTimeInstall) {
        this.props.installApp(1);
      }
    }
  };

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          headerMode="none"
          initialRouteName={this.props.loginStatus ? 'Tabs' : 'Login'}
          screenOptions={{
            gestureResponseDistance: {horizontal: theme.scree},
          }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="Signup1" component={Signup1} />
          <Stack.Screen name="Signup4" component={Signup4} />
          <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
          <Stack.Screen name="Chat" component={Chat} />
          <Stack.Screen name="AudioCall" component={AudioCall} />
          <Stack.Screen name="GroupInformation" component={GroupInformation} />
          <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
          <Stack.Screen name="Notifications" component={Notifications} />
          <Stack.Screen name="Security" component={Security} />
          <Stack.Screen name="ContentPage" component={ContentPage} />
          <Stack.Screen name="Help" component={Help} />
          <Stack.Screen name="Sponsor" component={Sponsor} />
          <Stack.Screen name="CreateGroup" component={CreateGroup} />
          <Stack.Screen name="BlockedUsers" component={BlockedUsers} />
          <Stack.Screen name="Interactions" component={Interactions} />
          <Stack.Screen name="BlockedContent" component={BlockedContent} />
          <Stack.Screen name="ReportedContent" component={ReportedContent} />
          <Stack.Screen name="UserSpecific" component={UserSpecific} />
          <Stack.Screen name="Statistics" component={Statistics} />
          <Stack.Screen
            name="RequrestJoinGroup"
            component={RequrestJoinGroup}
          />
          <Stack.Screen
            name={'InteractionsDetails'}
            component={InteractionsDetails}
          />
          <Stack.Screen
            name="ActiveSponsorPost"
            component={ActiveSponsorPost}
          />
          <Stack.Screen name="PaymentMethod" component={PaymentMethod} />
          <Stack.Screen name="CardDetail" component={CardDetail} />
          <Stack.Screen name="SavePost" component={SavePost} />
          <Stack.Screen name="SignlePost" component={SignlePost} />
          <Stack.Screen name="Notification" component={Notification} />
          <Stack.Screen
            name="FriendRequestList"
            component={FriendRequestList}
          />
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name={'GroupDetails'} component={GroupDetails} />
          <Stack.Screen name={'GroupMember'} component={GroupMember} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  loginStatus: state.AppReducer.login,
  groupCount: state.UserInfo.joinGroupCount,
  firstTimeInstall: state.AppReducer.firstTimeInstall,
  getNewChatBadge: state.UserInfo.newChatBadge,
  getNewChatInviteBadge: state.UserInfo.newChatInviteBadge,
});
const mapDispatchToProps = (dispatch) => {
  return {
    installApp: () => dispatch(firstTimeInstallApp()),
  };
};

const styles = StyleSheet.create({
  centerView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
