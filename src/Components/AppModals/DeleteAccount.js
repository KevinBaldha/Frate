import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import {scale, theme, height} from '../../Utils';
import {Label} from '../index';
import externalStyle from '../../Css';
import {getLocalText} from '../../Locales/I18n';

const DeleteAccountModel = props => {
  const {isVisible, close} = props;
  return (
    <Modal
      isVisible={isVisible}
      animationIn="zoomIn"
      animationOut="zoomOut"
      statusBarTranslucent
      deviceHeight={height}
      backdropColor={theme.colors.grey11}
      backdropOpacity={0.8}
      onBackButtonPress={close}>
      <View style={styles.mainContainer}>
        <View style={[styles.container, externalStyle.shadow]}>
          <View style={styles.trashContainer}>
            <View style={styles.flexRow}>
              <Icon name="trash-2" size={scale(20)} color={theme.colors.blue} />
              <Label
                title={getLocalText('Settings.deleteAccount')}
                style={{marginLeft: scale(5)}}
              />
            </View>
          </View>
          <Text style={styles.txt1}>
            {getLocalText('Settings.deleteDescription')}
          </Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.yesBtn}
              onPress={() => {
                close(1);
              }}>
              <Label
                title={getLocalText('Settings.yesDeleteAccount')}
                style={styles.closeContainer}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.noBtn} onPress={close}>
              <Label
                title={getLocalText('Settings.noDeleteAccount')}
                style={{color: theme.colors.blue}}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {justifyContent: 'center', alignItems: 'center'},
  container: {
    backgroundColor: theme.colors.white,
    width: theme.SCREENWIDTH - scale(30),
    borderRadius: scale(13),
    padding: scale(22),
  },
  txt1: {
    fontFamily: theme.fonts.muktaRegular,
    color: theme.colors.black,
    fontSize: scale(13),
    textAlign: 'center',
    lineHeight: scale(20),
    paddingVertical: scale(15),
  },
  row: {
    marginTop: scale(5),
    justifyContent: 'center',
  },
  yesBtn: {
    backgroundColor: theme.colors.blue,
    height: scale(50),
    borderRadius: scale(20),
    marginBottom: scale(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  noBtn: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.blue,
    borderWidth: scale(1),
    height: scale(50),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRow: {flexDirection: 'row'},
  trashContainer: {flexDirection: 'row', justifyContent: 'space-between'},
  closeContainer: {color: theme.colors.white, alignItems: 'center'},
});

export default DeleteAccountModel;
