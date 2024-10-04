/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import {View, Text} from 'react-native';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {isIphoneX} from 'react-native-iphone-x-helper';
import Icon from 'react-native-vector-icons/Feather';
import {theme, scale} from '../Utils';
import externalStyle from '../Css';
import {getLocalText} from '../Locales/I18n';
import {PopUpModel} from './index';
import FastImage from 'react-native-fast-image';

const HeaderView = (props) => {
  const {
    navigation,
    title,
    headerViewStyle,
    subHeader,
    option,
    optionHandler,
    color,
    titleStyle,
    backPress,
    backPressHandle,
    userImage,
    titleStyleMain,
    isHelpIcon,
    isCreateGroup,
    navigateScreen,
  } = props;
  const [popUpModel, setPopUpModel] = useState(false);

  const handlePopUpModel = () => {
    setPopUpModel(!popUpModel);
  };

  return (
    <View style={[styles.container, externalStyle.shadow, headerViewStyle]}>
      <View style={styles.subContainer}>
        <TouchableOpacity
          onPress={() => (backPress ? backPressHandle() : navigation.goBack())}
          style={{paddingLeft: scale(15)}}>
          <Icon name="arrow-left" size={scale(25)} color={theme.colors.blue} />
        </TouchableOpacity>
        <View style={[styles.row, titleStyleMain]}>
          <TouchableOpacity
            style={[styles.row, {alignItems: 'center'}]}
            onPress={() => {
              if (navigateScreen) {
                navigateScreen();
              }
            }}>
            {userImage && (
              <FastImage source={userImage} style={styles.userImg} />
            )}
            <Text style={[styles.title, titleStyle]}>{title}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.helpIcon}
            onPress={() => {
              handlePopUpModel();
            }}>
            {isHelpIcon ? (
              <Icon
                name={'help-circle'}
                color={theme.colors.blue}
                size={scale(18)}
                style={styles.icon}
              />
            ) : null}
          </TouchableOpacity>
          <PopUpModel
            isVisible={popUpModel}
            close={() => {
              handlePopUpModel();
            }}
            title={
              isCreateGroup
                ? getLocalText('Information.creatingGrouptitle')
                : getLocalText('Information.sponsoreContenttitle')
            }
            description={
              isCreateGroup
                ? getLocalText('Information.creatingGroupdisc')
                : getLocalText('Information.sponsoreContentdisc')
            }
          />
        </View>
        {option ? (
          <TouchableOpacity
            onPress={optionHandler}
            style={{paddingHorizontal: scale(10)}}>
            <Icon
              name="more-vertical"
              size={scale(23)}
              color={color === undefined ? theme.colors.blue : color}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {subHeader}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    paddingTop: isIphoneX() ? scale(40) : scale(19),
    paddingBottom: scale(15),
    elevation: 0.8,
  },
  title: {
    fontFamily: theme.fonts.muktaMedium,
    fontSize: scale(14),
    color: theme.colors.grey2,
    flex: 2,
    marginLeft: scale(5),
  },
  helpIcon: {
    right: 20,
    alignSelf: 'flex-end',
  },
  icon: {
    top: scale(-5),
  },
  subContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginLeft: 10,
    flex: 1,
  },
  userImg: {
    height: scale(35),
    width: scale(35),
    borderRadius: scale(15),
    paddingHorizontal: scale(7),
  },
});

export default HeaderView;
