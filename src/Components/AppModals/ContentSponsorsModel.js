import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import {scale, theme, height} from '../../Utils';
import {Label, PostCard} from '../index';
import {getLocalText} from '../../Locales/I18n';

const ContentSponsorModel = (props) => {
  const {show, closeModal, sponserData, submit} = props;

  return (
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
            <Label
              title={getLocalText('Post.sponsorTitle')}
              style={{
                fontSize: scale(15),
                left: scale(-1),
                fontFamily: theme.fonts.muktaBold,
                color: theme.colors.grey2,
              }}
            />

            <TouchableOpacity
              style={styles.close}
              onPress={() => {
                closeModal();
              }}>
              <Icon name="x" size={scale(20)} color={theme.colors.blue} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            {sponserData?.sponsor_user?.first_name +
              getLocalText('Sponsor.sponserRequestMsg')}
          </Text>
          <View style={styles.cardContain}>
            <PostCard
              item={sponserData?.post}
              hideFooter
              onPressGroup={() => {}}
              onPressProfile={() => {}}
              openImageView={() => {}}
            />
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.yesBtn}
              onPress={() => {
                submit(1);
              }}>
              <Label
                title={getLocalText('Post.accept')}
                style={{color: theme.colors.white}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.noBtn}
              onPress={() => {
                submit(2);
              }}>
              <Label
                title={getLocalText('Post.decline')}
                style={{color: theme.colors.white}}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
    fontFamily: theme.fonts.muktaVaaniLight,
    fontSize: scale(11),
    color: theme.colors.black,
    marginTop: scale(10),
  },
  close: {
    position: 'absolute',
    right: scale(0),
  },
  title: {
    fontFamily: theme.fonts.muktaRegular,
    color: theme.colors.black,
    marginTop: scale(10),
  },
  row: {
    flexDirection: 'row',
    marginTop: scale(5),
    // justifyContent: 'space-between',
  },
  yesBtn: {
    width: '45%',
    backgroundColor: theme.colors.blue,
    height: scale(45),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(2),
  },
  noBtn: {
    width: '45%',
    backgroundColor: theme.colors.red1,

    height: scale(45),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(20),
  },
  cardContain: {
    width: '115%',
    alignSelf: 'center',
    paddingVertical: scale(15),
  },
});

export default ContentSponsorModel;
