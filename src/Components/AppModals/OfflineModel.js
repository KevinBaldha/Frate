import React, {useState, useEffect} from 'react';
import {View, StyleSheet, AppState} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/Feather';
import Modal from 'react-native-modal';
import {useDispatch, useSelector} from 'react-redux';
import {getLocalText} from '../../Locales/I18n';
import {scale, theme, height} from '../../Utils';
import {Title} from '../index';
import {useFocusEffect} from '@react-navigation/core';
import {changeNetStatus} from '../../Redux/Actions';

// create a component
const OfflineModel = () => {
  const dispatch = useDispatch();
  const netStatus = useSelector((state) => state.NetinfoReducer);
  const [netInfo, setNetInfo] = useState(netStatus?.isNetConnected || false);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    // Add event listener and cleanup function
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // Device screen turned on
        const unsubscribe1 = NetInfo.addEventListener((state) => {
          if (state.isConnected !== netInfo) {
            dispatch(changeNetStatus(state.isConnected || state.isWifiEnabled));
            setNetInfo(state.isConnected || state.isWifiEnabled);
          }
        });
        return unsubscribe1();
      }
      setAppState(nextAppState);
    };
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, [appState]);

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = NetInfo.addEventListener((state) => {
        if (state.isConnected !== netInfo) {
          dispatch(changeNetStatus(state.isConnected || state.isWifiEnabled));
          setNetInfo(state.isConnected || state.isWifiEnabled);
        }
      });

      return () => unsubscribe();
    }, [netInfo]),
  );

  // useFocusEffect(
  //   React.useCallback(() => {
  //     const unsubscribe = async () => {
  //       NetworkInfo.getSubnet().then((frequency) => {
  //       });
  //     };
  //     return () => unsubscribe();
  //   }, []),
  // );

  return (
    <Modal
      isVisible={!netInfo}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      statusBarTranslucent
      deviceHeight={height}
      style={styles.modelView}
      backdropOpacity={0}>
      <View style={styles.container}>
        <Icon name="wifi-off" size={scale(35)} color={theme.colors.blue} />
        <Title
          style={{marginTop: scale(10)}}
          title={getLocalText('ErrorMsgs.noData')}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modelView: {margin: 0},
  container: {
    backgroundColor: theme.colors.white,
    width: theme.SCREENWIDTH,
    height: theme.SCREENHEIGHT,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});

export default OfflineModel;
