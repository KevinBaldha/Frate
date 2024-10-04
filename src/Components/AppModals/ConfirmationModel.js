import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import {scale, theme, height} from '../../Utils';
import {Label} from '../index';
import externalStyle from '../../Css';
import {getLocalText} from '../../Locales/I18n';

const ConfirmationModel = (props) => {
  const {isVisible, close, type} = props;
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
        <View style={[styles.container, externalStyle.shadow]}>
          <View style={styles.trashContainer}>
            <View style={styles.flexRow}>
              <Icon name="trash-2" size={scale(20)} color={theme.colors.blue} />
              <Label
                title={getLocalText(
                  type === 'post'
                    ? 'Post.deletepost'
                    : type === 'groupexit'
                    ? 'Post.leave'
                    : type === 'comment'
                    ? 'Post.deletecommnent'
                    : 'Post.deletegroup',
                )}
                style={{marginLeft: scale(5)}}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                close(null);
              }}>
              <Icon name="x" size={scale(20)} color={theme.colors.blue} />
            </TouchableOpacity>
          </View>

          <Text style={styles.txt1}>
            {getLocalText(
              type === 'post'
                ? 'Post.deletePostsub'
                : type === 'groupexit'
                ? 'Post.leavesub'
                : type === 'comment'
                ? 'Post.deletecommentsub'
                : 'Post.subtitle',
            )}
          </Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.yesBtn}
              onPress={() => {
                close(1);
              }}>
              <Label
                title={
                  type === 'post'
                    ? getLocalText('Post.yes')
                    : type === 'comment'
                    ? getLocalText('Post.yes')
                    : type === 'groupexit'
                    ? // ? 'Yes, leave group.'
                      'Yes, leave'
                    : 'Yes, delete'
                }
                style={styles.closeContainer}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.noBtn}
              onPress={() => {
                close(null);
              }}>
              <Label
                title={getLocalText('Post.no')}
                style={{color: theme.colors.blue}}
              />
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
    borderRadius: scale(13),
    padding: scale(22),
  },
  txt1: {
    fontFamily: theme.fonts.muktaRegular,
    color: theme.colors.black,
    fontSize: scale(13),
    textAlign: 'center',
    lineHeight: scale(20),
    paddingVertical: scale(15),
  },
  row: {
    flexDirection: 'row',
    marginTop: scale(5),
    // justifyContent: 'space-between',
  },
  yesBtn: {
    width: '45%',
    backgroundColor: theme.colors.blue,
    height: scale(50),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(2),
  },
  noBtn: {
    width: '40%',
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.blue,
    borderWidth: scale(1),
    height: scale(50),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(20),
  },
  flexRow: {flexDirection: 'row'},
  trashContainer: {flexDirection: 'row', justifyContent: 'space-between'},
  closeContainer: {color: theme.colors.white, alignItems: 'center'},
});

export default ConfirmationModel;
