import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import {scale, theme, height} from '../../Utils';
import {Right} from '../../Assets/SVGs';
import {Label} from '../index';
import externalStyle from '../../Css';
import {getLocalText} from '../../Locales/I18n';

const PerfectModel = (props) => {
  const {isVisible, close, isOwnPost, onRedirect, isSponsoredByLoggedInUser} = props;

  return (
    <Modal
      isVisible={isVisible}
      animationIn="zoomIn"
      animationOut="zoomOut"
      statusBarTranslucent
      deviceHeight={height}
      backdropColor={theme.colors.grey11}
      backdropOpacity={0.7}
      onBackButtonPress={close}>
      <View style={styles.mainContainer}>
        <View
          style={[
            styles.container,
            styles.mainContainer,
            externalStyle.shadow,
          ]}>
          <Right height={scale(23)} width={scale(23)} />
          <Label title={getLocalText('Sponsor.perfet')} />
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={() => {
              onRedirect();
            }}>
             {isOwnPost && (
              <Text style={styles.txt1}>
                {isOwnPost
                  ? getLocalText('Sponsor.sponserOwnSend')
                  : getLocalText('Sponsor.sponserSend')}
              </Text>
            )}
            {isSponsoredByLoggedInUser !== '' && (
              <Text style={styles.txt1}>
                {isSponsoredByLoggedInUser === 0
                  ? getLocalText('Timeline.requestAlreadySent')
                  : isSponsoredByLoggedInUser === 1
                  ? getLocalText('Timeline.alreadySponsoredPost')
                  : getLocalText('Sponsor.sponserSend')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.yesButton}
            onPress={() => {
              close();
            }}>
            <Label
              title={getLocalText('Sponsor.ok')}
              style={{color: theme.colors.white}}
            />
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
    width: '75%',
    marginTop: scale(18),
    marginBottom: scale(10),
  },
  yesButton: {
    width: '30%',
    backgroundColor: theme.colors.blue,
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scale(10),
  },
});

export default PerfectModel;
