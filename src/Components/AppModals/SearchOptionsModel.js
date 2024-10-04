import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import {scale, theme, height} from '../../Utils';
import {Title} from '../index';
import externalStyle from '../../Css';

const SearchOptionsModel = (props) => {
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
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Icon name="smile" size={scale(22)} color={theme.colors.blue} />
            <Title title={' Hi there!'} style={styles.title} />
          </View>
          <View style={styles.divider} />
          <Text style={styles.txt1}>{' Are you looking for:'}</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btn}>
              <Text style={styles.txtbtn}>{'Users'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn}>
              <Text style={styles.txtbtn}>{'Posts'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn}>
              <Text style={styles.txtbtn}>{'Groups'}</Text>
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
  txtbtn: {
    fontFamily: theme.fonts.muktaRegular,
    color: theme.colors.blue,
    fontSize: scale(14),
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.grey9,
    width: '85%',
    marginTop: scale(15),
    marginBottom: scale(10),
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(15),
  },
  btn: {
    padding: scale(7),
    backgroundColor: theme.colors.white,
    borderRadius: scale(8),
    shadowColor: theme.colors.black1,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: scale(3),
    paddingHorizontal: scale(20),
    elevation: scale(3),
    marginHorizontal: scale(5),
  },
});

export default SearchOptionsModel;
