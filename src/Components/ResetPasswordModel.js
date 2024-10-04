import React from 'react';
import {StyleSheet, View, Modal, TouchableOpacity} from 'react-native';
import {getLocalText} from '../Locales/I18n';
import {scale, theme, height} from '../Utils';
import {Label} from './index';

const ResetPasswordModel = (props) => {
  const {loading, title, close} = props;

  return (
    <Modal
      transparent={true}
      animationType={'none'}
      visible={loading}
      statusBarTranslucent
      deviceHeight={height}
      onRequestClose={() => {
        close;
      }}>
      <View style={styles.modalBackground}>
        <View style={[styles.activityIndicatorWrapper]}>
          <Label style={styles.label} title={title} />
          <TouchableOpacity style={styles.btn} onPress={close}>
            <Label
              style={{color: theme.colors.blue}}
              title={getLocalText('LoginSignup.okay')}
            />
          </TouchableOpacity>
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
    justifyContent: 'center',
    backgroundColor: theme.colors.blackTransparentBlack20,
  },
  activityIndicatorWrapper: {
    backgroundColor: theme.colors.white,
    borderRadius: scale(10),
    width: theme.SCREENWIDTH * 0.85,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: scale(10),
  },
  btn: {
    alignItems: 'center',
    paddingHorizontal: scale(10),
    borderRadius: scale(5),
    borderWidth: 1,
    borderColor: theme.colors.blue,
    marginTop: scale(7),
  },
  label: {color: theme.colors.blue, textAlign: 'justify'},
});

export default ResetPasswordModel;
