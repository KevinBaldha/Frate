import React from 'react';
import {
  StyleSheet,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  Text,
  TouchableOpacity,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import {getLocalText} from '../../Locales/I18n';
import {scale, theme, height} from '../../Utils';
import {Label} from '../index';

const BlockMsgModal = (props) => {
  const {show, closeModal, data, navigation} = props;

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <Modal
        isVisible={show}
        animationIn="zoomIn"
        animationOut="zoomOut"
        statusBarTranslucent
        deviceHeight={height}
        backdropColor={theme.colors.grey11}>
        <View style={styles.mainContainer}>
          <View style={styles.container}>
            <View style={styles.headerCon}>
              <Label title={''} style={{marginLeft: scale(10)}} />

              <TouchableOpacity
                onPress={closeModal}
                style={[styles.close, {paddingLeft: scale(15)}]}>
                <Icon name="x" size={scale(20)} color={theme.colors.blue} />
              </TouchableOpacity>
            </View>
            <Label title={data?.title} style={styles.title} />

            <Text style={styles.subtitle}>
              {data?.description}
              <Text
                style={
                  (styles.subtitle,
                  {
                    textDecorationLine: 'underline',
                  })
                }
                onPress={() => {
                  closeModal();
                  navigation.navigate('ContentPage', {
                    title: 'LoginSignup.privacy',
                    text: 'LoginSignup.terms1',
                  });
                }}>
                {getLocalText('UserData.here')}
              </Text>
            </Text>
            {/* <Label
              title={data?.description}
              style={styles.subtitle}
            /> */}
          </View>
        </View>
      </Modal>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: theme.colors.white,
    padding: scale(25),
    borderRadius: scale(12),
    width: theme.SCREENWIDTH - scale(35),
  },
  headerCon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(13),
    color: theme.colors.black,
  },
  close: {
    position: 'absolute',
    right: scale(0),
  },
  title: {
    fontFamily: theme.fonts.muktaSemiBold,
    color: theme.colors.black,
    marginTop: scale(10),
    fontSize: scale(16),
  },
});

export default BlockMsgModal;
