import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import {scale, theme, height} from '../../Utils';
import {Right} from '../../Assets/SVGs';
import {Label} from '../index';
import externalStyle from '../../Css';
import {getLocalText} from '../../Locales/I18n';

const PostponedModel = (props) => {
  const {isVisible, close, id, postData, isBlock, isUserBlock} = props;

  return (
    <Modal
      isVisible={isVisible}
      animationIn="zoomIn"
      animationOut="zoomOut"
      statusBarTranslucent
      deviceHeight={height}
      backdropColor={theme.colors.grey23}
      backdropOpacity={0.9}
      onBackButtonPress={close}
      onBackdropPress={close}>
      <View style={styles.mainContainer}>
        <View
          style={[
            styles.container,
            styles.mainContainer,
            externalStyle.shadow,
          ]}>
          <Right height={scale(23)} width={scale(23)} />
          <Label
            title={
              id
                ? getLocalText('Report.postponetitle')
                : isBlock
                ? getLocalText('Report.postponeBlockTitle')
                : postData && isUserBlock
                ? getLocalText('Report.postponeUserTitle')
                : postData
                ? getLocalText('Report.postponetitle')
                : getLocalText('Report.postponegrp')
              }
          />
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={() => {
              close();
            }}>
            <Text style={styles.txt1}>
              {getLocalText('Report.postponesubtitle')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {justifyContent: 'center', alignItems: 'center'},
  container: {
    backgroundColor: theme.colors.white,
    width: theme.SCREENWIDTH - scale(90),
    borderRadius: scale(12),
    padding: scale(22),
  },
  txt1: {
    fontFamily: theme.fonts.muktaRegular,
    color: theme.colors.black,
    fontSize: scale(13),
    textAlign: 'center',
    lineHeight: scale(20),
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.grey9,
    width: '85%',
    marginTop: scale(18),
    marginBottom: scale(10),
  },
});

export default PostponedModel;
