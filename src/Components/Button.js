import React, {useState} from 'react';
import {Text, TouchableOpacity, StyleSheet, Platform, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import ICON from 'react-native-vector-icons/Ionicons';
import Icon1 from 'react-native-vector-icons/Feather';
import {scale, theme} from '../Utils';
import {Label, PopUpModel} from './index';
import {getLocalText} from '../Locales/I18n';

const Button = props => {
  const {
    onPress,
    style,
    title,
    titleStyle,
    buttonImg,
    BtnImg,
    Icon,
    BtnSize,
    BtnIcon,
    isHelpIcon,
    helpColor,
    isGroupScreen,
    disabled,
  } = props;
  const [popUpModel, setPopUpModel] = useState(false);

  const handlePopUpModel = () => {
    setPopUpModel(!popUpModel);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.buttoncontainer, styles.shadow, style]}>
      {BtnImg ? (
        <View style={{alignSelf: 'center', left: scale(2)}}>
          <BtnImg
            height={BtnSize ? BtnSize : 55}
            width={scale(25)}
            source={BtnImg}
            style={{
              marginTop: Platform.OS === 'web' ? scale(8) : scale(0),
              alignItems: 'center',
            }}
            // style={[styles.buttonImage]}
          />
        </View>
      ) : null}
      {Icon && (
        <ICON
          name={Icon}
          size={scale(28)}
          color={theme.colors.black}
          style={{left: scale(2)}}
        />
      )}
      {BtnIcon && (
        <Icon1
          name={BtnIcon}
          size={scale(18)}
          color={theme.colors.white}
          style={{left: scale(-8)}}
        />
      )}
      {buttonImg ? (
        <FastImage source={buttonImg} style={[styles.buttonImage]} />
      ) : null}
      <Text style={[styles.buttontxt, titleStyle]}>{title}</Text>
      {isHelpIcon && (
        <TouchableOpacity onPress={handlePopUpModel} style={{marginLeft: 10}}>
          <Icon1
            name={'help-circle'}
            size={scale(18)}
            color={helpColor ? helpColor : theme.colors.white}
            // style={{left: 95, top: 2}} // Fix button icon
          />
        </TouchableOpacity>
      )}

      <PopUpModel
        isVisible={popUpModel}
        title={
          isGroupScreen
            ? getLocalText('Information.creatingGrouptitle')
            : getLocalText('Information.joiningGrouptitle')
        }
        description={
          isGroupScreen
            ? getLocalText('Information.creatingGroupdisc')
            : getLocalText('Information.joiningGroupsdisc')
        }
        close={handlePopUpModel}
      />
    </TouchableOpacity>
  );
};

const CustomButton = props => {
  const {title, style, onPress} = props;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.customButton,
        styles.shadow,
        style,
        {shadowRadius: scale(3)},
      ]}>
      <Label title={title} style={styles.title} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttoncontainer: {
    justifyContent: 'center',
    marginHorizontal: scale(35),
    backgroundColor: theme.colors.blue,
    width: theme.SCREENWIDTH - scale(70),
    alignSelf: 'center',
    borderRadius: scale(18),
    alignItems: 'center',
    marginBottom: scale(13),
    flexDirection: 'row',
    height: theme.SCREENHEIGHT * 0.068,
  },
  buttonImage: {
    width: scale(20),
    height: scale(20),
    resizeMode: 'contain',
    left: scale(-10),
    alignSelf: 'center',
  },
  buttontxt: {
    fontSize: scale(15),
    color: theme.colors.white,
    fontFamily: theme.fonts.muktaSemiBold,
  },
  title: {color: theme.colors.blue, textAlign: 'center'},
  shadow: {
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 1,
    elevation: 1,
  },
  customButton: {
    backgroundColor: theme.colors.grey14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(15),
    paddingVertical: scale(8),
  },
});

export {Button, CustomButton};
