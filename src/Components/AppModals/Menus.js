import React, {useState} from 'react';
import {View, TouchableOpacity, StyleSheet, Text} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import {isIphoneX} from 'react-native-iphone-x-helper';
import {getLocalText} from '../../Locales/I18n';
import {scale, theme, height} from '../../Utils';
import externalStyle from '../../Css';
import {PopUpModel} from '../index';

const Menus = (props) => {
  const {
    handleMenu,
    menuData,
    isMenu,
    menuMainContainer,
    isGroupDetails,
    isHelpIcon,
  } = props;
  const [popUpModel, setPopUpModel] = useState(false);

  const toggleModal = () => {
    setPopUpModel(!popUpModel);
  };
  return (
    <Modal
      isVisible={isMenu}
      animationIn={'slideInRight'}
      animationOut={'slideOutRight'}
      statusBarTranslucent
      deviceHeight={height}
      style={[styles.menuMainContainer, menuMainContainer]}
      backdropOpacity={0}
      onBackdropPress={handleMenu}>
      <View
        style={[
          styles.menuContainer,
          externalStyle.shadow,
          {shadowRadius: scale(3)},
        ]}>
        {isHelpIcon ? (
          <TouchableOpacity style={styles.helpIcon} onPress={toggleModal}>
            <Icon
              name={'help-circle'}
              color={theme.colors.blue}
              size={scale(16)}
            />
          </TouchableOpacity>
        ) : null}

        <PopUpModel
          isVisible={popUpModel}
          title={
            isGroupDetails
              ? getLocalText('Information.menutitle')
              : getLocalText('Information.yourProfiletitle')
          }
          description={
            isGroupDetails
              ? getLocalText('Information.menudisc')
              : getLocalText('Information.yourProfiledisc')
          }
          close={() => setPopUpModel(false)}
        />

        {menuData.map((d, i) => {
          return (
            <TouchableOpacity
              key={i.toString()}
              onPress={() => handleMenu(i)}
              style={styles.menuTextContainer}>
              {d.icon === 'block-helper' || d.icon === 'delete-outline' ? (
                <Icon1
                  name={d.icon}
                  size={d.icon === 'delete-outline' ? scale(18) : scale(18)}
                  color={theme.colors.blue}
                />
              ) : (
                <Icon
                  name={d.icon}
                  size={scale(18)}
                  color={theme.colors.blue}
                />
              )}
              <Text style={styles.menuTitle}>{d.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Modal>
  );
};

export default Menus;

const styles = StyleSheet.create({
  menuMainContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    marginRight: scale(18),
  },
  helpIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  menuContainer: {
    backgroundColor: theme.colors.white,
    paddingTop: scale(25),
    paddingHorizontal: scale(15),
    marginTop: isIphoneX() ? scale(60) : scale(35),
    borderRadius: 10,
  },
  menuTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(15),
  },
  menuTitle: {
    color: theme.colors.black,
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(13),
    marginLeft: 12,
  },
});
