import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import externalStyle from '../../Css';
import {scale, theme, height} from '../../Utils';
import {Button, Label} from '../index';
import {getLocalText} from '../../Locales/I18n';
import {shareOptionsData} from '../../Utils/StaticData';

const ShareOptions = (props) => {
  const {showModel, handleClose} = props;
  return (
    <Modal
      isVisible={showModel}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      statusBarTranslucent
      deviceHeight={height}
      backdropColor={theme.colors.black1}
      backdropOpacity={0.8}>
      <View
        style={[
          styles.mainContainer,
          externalStyle.shadow,
          {
            elevation: scale(3),
            shadowColor: theme.colors.black,
            shadowRadius: scale(2),
          },
        ]}>
        <View style={styles.container}>
          <View style={styles.row}>
            <Icon
              name="corner-right-up"
              size={scale(20)}
              color={theme.colors.blue}
            />
            <Label title={getLocalText('Post.share')} style={styles.title} />
          </View>
          <View style={styles.divider} />
          <ScrollView>
            {shareOptionsData?.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.confirmButton]}
                  onPress={() => {
                    handleClose(item?.id);
                  }}>
                  <Icon
                    name={item?.icon}
                    size={scale(18)}
                    color={theme.colors.black}
                  />
                  <Text
                    style={[
                      styles.confirmText,
                      index === 2 && {color: theme.colors.red},
                    ]}>
                    {item?.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        <View style={styles.btnCon}>
          <Button
            onPress={() => handleClose('-1')}
            style={[styles.cancel, externalStyle.shadow, {elevation: scale(3)}]}
            title={getLocalText('Report.cancel')}
            titleStyle={{
              color: theme.colors.black,
              fontFamily: theme.fonts.rubikNormal,
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.transparent,
    width: theme.SCREENWIDTH - scale(25),
    position: 'absolute',
    bottom: scale(0),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: scale(10),
  },
  container: {
    width: '100%',
    backgroundColor: theme.colors.white,
    paddingHorizontal: scale(35),
    borderRadius: scale(20),
    marginBottom: scale(70),
    paddingVertical: scale(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: scale(0.5),
    width: '100%',
    backgroundColor: theme.colors.divider1,
  },
  btnCon: {
    position: 'absolute',
    bottom: scale(-10),
  },
  confirmButton: {
    paddingVertical: scale(13),
    alignItems: 'center',
    flexDirection: 'row',
  },
  confirmText: {
    color: theme.colors.black,
    fontSize: scale(15),
    fontFamily: theme.fonts.rubikNormal,
    marginLeft: scale(10),
  },
  cancel: {
    backgroundColor: theme.colors.white,
    width: theme.SCREENWIDTH - scale(36),
    marginHorizontal: scale(18),
    height: scale(55),
  },
  title: {
    marginLeft: scale(10),
  },
});

export default ShareOptions;
