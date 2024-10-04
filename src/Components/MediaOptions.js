import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import Icon1 from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import externalStyle from '../Css';
import {getLocalText} from '../Locales/I18n';
import {scale, theme, height} from '../Utils';
import {Label} from './index';

const MediaOptions = (props) => {
  const {
    isVisible,
    onPressCamera,
    onPressGallery,
    onPressVideo,
    onPressFile,
    mainContainer,
    close,
    signup,
    onPressRemove,
    edit,
  } = props;
  return (
    <Modal
      isVisible={isVisible}
      backdropColor={theme.colors.darkBlue}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      statusBarTranslucent
      deviceHeight={height}
      backdropOpacity={0.6}
      onBackdropPress={close}>
      <View
        style={[
          styles.mediapickerCon,
          externalStyle.shadow,
          mainContainer,
          {elevation: scale(2)},
        ]}>
        <View style={styles.firstCon}>
          {edit ? (
            <TouchableOpacity style={styles.iconCon} onPress={onPressRemove}>
              <Icon2
                name={'delete'}
                size={scale(25)}
                color={theme.colors.blue}
              />
              <Label
                title={getLocalText('Timeline.remove')}
                style={styles.label}
              />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.iconCon} onPress={onPressCamera}>
            <Icon1
              name={'camera-outline'}
              size={scale(25)}
              color={theme.colors.blue}
            />
            <Label
              title={getLocalText('Timeline.camera')}
              style={styles.label}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onPressGallery} style={styles.iconCon}>
            <Icon1
              name={'image-outline'}
              size={scale(25)}
              color={theme.colors.blue}
            />
            <Label
              title={getLocalText('Timeline.gallery')}
              style={styles.label}
            />
          </TouchableOpacity>
          {signup ? null : (
            <>
              <TouchableOpacity onPress={onPressVideo} style={styles.iconCon}>
                <Icon1
                  name={'videocam-outline'}
                  size={scale(25)}
                  color={theme.colors.blue}
                />
                <Label
                  title={getLocalText('Timeline.video')}
                  style={styles.label}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconCon} onPress={onPressFile}>
                <Icon1
                  name={'document-outline'}
                  size={scale(25)}
                  color={theme.colors.blue}
                />
                <Label
                  title={getLocalText('Timeline.file')}
                  style={styles.label}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  iconCon: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  mediapickerCon: {
    backgroundColor: theme.colors.white1,
    paddingHorizontal: scale(15),
    width: '100%',
    paddingVertical: scale(25),
    position: 'absolute',
    bottom: theme.SCREENHEIGHT * 0.01,
    borderRadius: scale(10),
  },
  firstCon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {textAlign: 'center'},
});

export default MediaOptions;
