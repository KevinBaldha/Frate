import React from 'react';
import {StyleSheet, View, Modal, ActivityIndicator} from 'react-native';
import {getLocalText} from '../Locales/I18n';
import {scale, theme, height} from '../Utils';
import {Label} from './index';

const Loader = (props) => {
  const {loading} = props;
  return (
    <Modal
      transparent={true}
      animationType={'none'}
      visible={loading}
      statusBarTranslucent
      deviceHeight={height}
      onRequestClose={() => {}}>
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator
            size="large"
            animating={loading}
            color={theme.colors.blue}
          />
          <View>
            <Label style={styles.label} title={getLocalText('Settings.load')} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    paddingVertical: scale(20),
    backgroundColor: '#00000020',
    zIndex: 111,
  },
  label: {textAlign: 'center', color: theme.colors.blue},
  activityIndicatorWrapper: {
    backgroundColor: theme.colors.white,
    height: scale(100),
    width: scale(100),
    borderRadius: scale(10),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: scale(10),
    zIndex: 111,
  },
});

export default Loader;
