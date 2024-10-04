import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import {ScrollView} from 'react-native-gesture-handler';
import externalStyle from '../../Css';
import {scale, theme, height} from '../../Utils';
import {Button} from '../index';
import {getLocalText} from '../../Locales/I18n';
import {groupOptionData, groupOptionData1} from '../../Utils/StaticData';

const GroupOptions = (props) => {
  const {isShow, handleClose, adminId, loginUserId} = props;
  const options = adminId === loginUserId ? groupOptionData : groupOptionData1;
  return (
    <Modal
      isVisible={isShow}
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
          <ScrollView>
            {options?.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.confirmButton]}
                  onPress={() => {
                    handleClose(item, index);
                  }}>
                  <Text
                    style={[
                      styles.confirmText,
                      {
                        color:
                          index === 2 &&
                          adminId === loginUserId &&
                          theme.colors.red,
                      },
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
            onPress={() => handleClose('')}
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
  container: {
    width: '100%',
    backgroundColor: theme.colors.white,
    paddingHorizontal: scale(35),
    paddingTop: scale(5),
    borderRadius: scale(20),
    marginBottom: scale(70),
  },
  btnCon: {
    position: 'absolute',
    bottom: scale(-10),
  },
  confirmButton: {
    paddingVertical: scale(13),
    alignItems: 'center',
  },
  confirmText: {
    color: theme.colors.black,
    fontSize: scale(15),
    fontFamily: theme.fonts.rubikNormal,
  },
  cancel: {
    backgroundColor: theme.colors.white,
    width: theme.SCREENWIDTH - scale(36),
    marginHorizontal: scale(18),
    height: scale(55),
  },
});

export default GroupOptions;
