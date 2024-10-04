import React, {useState} from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Modal from 'react-native-modal';
import {scale, theme, height} from '../../Utils';
import {Label} from '../index';
import {getLocalText} from '../../Locales/I18n';

const AudioModel = (props) => {
  const {show, closeModal, onPressMuteUser, onPressRemoveUser, data, index} =
    props;
  const [isMic, setIsMic] = useState(false);

  const onPressMic = () => {
    if (isMic) {
      onPressMuteUser(data?.id, index, '1');
      setIsMic(!isMic);
    } else {
      onPressMuteUser(data?.id, index, '2');
      setIsMic(!isMic);
    }
  };

  return (
    <Modal
      isVisible={show}
      animationIn="zoomIn"
      animationOut="zoomOut"
      statusBarTranslucent
      deviceHeight={height}
      backdropColor={theme.colors.grey11}
      onBackdropPress={() => {
        closeModal();
      }}
      backdropOpacity={0.9}>
      <View style={styles.mainContainer}>
        <TouchableOpacity
          style={styles.subContainer}
          onPress={() => {
            onPressMic();
          }}>
          <Icon
            name={isMic ? 'mic-off' : 'mic'}
            color={theme.colors.blue}
            size={scale(12)}
          />
          <Label
            title={
              isMic ? getLocalText('Group.unMute') : getLocalText('Group.mute')
            }
            style={styles.label}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.subContainer}
          onPress={() => {
            onPressRemoveUser(data?.id, index);
          }}>
          <Icon name={'user'} color={theme.colors.blue} size={scale(12)} />
          <Label title={getLocalText('Timeline.remove')} style={styles.label} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    padding: scale(10),
    backgroundColor: theme.colors.white,
    width: '100%',
    height: scale(70),
    borderRadius: scale(10),
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  subContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(14),
  },
});

export default AudioModel;
