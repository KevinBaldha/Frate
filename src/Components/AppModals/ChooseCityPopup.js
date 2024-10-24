import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/AntDesign';
import externalStyle from '../../Css';
import {scale, theme, height} from '../../Utils';
import {getLocalText} from '../../Locales/I18n';
import {Button} from '../index';

const ChooseCityPopup = props => {
  const {
    isVisible,
    mainContainer,
    title,
    description,
    onPressSubmit,
    onPressCancel,
    cityName,
  } = props;
  return (
    <Modal
      isVisible={isVisible}
      backdropColor={theme.colors.darkBlue}
      height="auto"
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      statusBarTranslucent
      deviceHeight={height}>
      <View
        style={[
          styles.mediaPickerCon,
          externalStyle.shadow,
          mainContainer,
          {elevation: scale(2)},
        ]}>
        <View style={styles.mainView}>
          <Icon name="warning" size={scale(20)} color={theme.colors.blue} />
          <Text style={styles.modalText}>{title}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.modalDescription}>
          {description + `"${cityName}" ?`}
        </Text>
        <View style={styles.buttonView}>
          <Button
            onPress={()=> onPressSubmit()}
            title={getLocalText('Information.imsurebtn')}
            style={styles.btn}
            titleStyle={[{color: theme.colors.blue}, styles.txt]}
          />
          <Button
            onPress={onPressCancel}
            title={getLocalText('Information.cancelbtn')}
            style={[styles.btn, {backgroundColor: theme.colors.red}]}
            titleStyle={[{color: theme.colors.blue}, styles.txt]}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ChooseCityPopup;
const styles = StyleSheet.create({
  mediaPickerCon: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: scale(15),
    alignSelf: 'center',
    paddingVertical: scale(25),
    borderRadius: scale(10),
    justifyContent: 'center',
    marginHorizontal: 10,
    width: '100%',
    overflow: 'hidden',
  },
  mainView: {
    flexDirection: 'row',
    marginHorizontal: 10,
  },
  modalText: {
    marginLeft: scale(12),
    marginTop: -scale(2),
    fontFamily: theme.fonts.muktaRegular,
    fontSize: 18,
  },
  modalDescription: {
    fontSize: 16,
    marginHorizontal: 10,
    fontFamily: theme.fonts.muktaVaaniLight,
    lineHeight: 25,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.grey9,
    marginVertical: 10,
  },
  btn: {
    borderRadius: scale(50),
    marginTop: scale(15),
    marginBottom: 0,
    width: '45%',
    marginHorizontal: 0,
  },
  txt: {color: theme.colors.white, textAlign: 'center'},
  buttonView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
