import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import Modal from 'react-native-modal';
import externalStyle from '../Css';
import {scale, theme, height} from '../Utils';
import {getLocalText} from '../Locales/I18n';

const PopUpModel = (props) => {
  const {isVisible, close, mainContainer, title, description} = props;
  return (
    <Modal
      isVisible={isVisible}
      backdropColor={theme.colors.darkBlue}
      height="auto"
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      statusBarTranslucent
      deviceHeight={height}>
      <View
        style={[
          styles.mediapickerCon,
          externalStyle.shadow,
          mainContainer,
          {elevation: scale(2)},
        ]}>
        <Text style={styles.modalText}>{title}</Text>
        <View style={styles.divider} />
        <Text style={styles.modalDescription}>{description}</Text>

        <TouchableOpacity style={styles.modalBtn} onPress={close}>
          <Text style={styles.btnText}>{getLocalText('LoginSignup.okay')}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default PopUpModel;
const styles = StyleSheet.create({
  mediapickerCon: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: scale(15),
    alignSelf: 'center',
    paddingVertical: scale(25),
    borderRadius: scale(10),
    justifyContent: 'center',
  },
  modalText: {
    alignSelf: 'center',
    fontFamily: theme.fonts.muktaSemiBold,
    fontSize: 18,
  },
  modalDescription: {
    fontSize: 14,
    marginHorizontal: scale(7),
    fontFamily: theme.fonts.muktaVaaniLight,
    textAlign: 'center',
    lineHeight: scale(22),
  },
  modalBtn: {
    backgroundColor: theme.colors.blue,
    width: scale(110),
    padding: scale(12),
    alignItems: 'center',
    borderRadius: scale(35),
    marginTop: scale(16),
    alignSelf: 'center',
  },
  btnText: {
    color: theme.colors.white,
    fontSize: 14,
    fontFamily: theme.fonts.muktaRegular,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.grey9,
    marginVertical: scale(8),
  },
});
