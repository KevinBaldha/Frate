import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import {scale, theme, height} from '../../Utils';
import {Title} from '../index';
import externalStyle from '../../Css';
import {getLocalText} from '../../Locales/I18n';

const NodataFoundModel = (props) => {
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
        <View
          style={[
            styles.container,
            styles.mainContainer,
            externalStyle.shadow,
          ]}>
          <View style={styles.subContain}>
            <Icon name="smile" size={scale(22)} color={theme.colors.blue} />
            <Title title={' Hi there!'} style={styles.title} />
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={() => {
              close();
            }}>
            <Text style={styles.txt1}>
              {getLocalText('Post.noDataAvailable')}
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
  title: {
    fontSize: scale(14),
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
  subContain: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NodataFoundModel;
