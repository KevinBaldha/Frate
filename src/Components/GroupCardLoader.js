import React from 'react';
import {View, StyleSheet} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {scale} from '../Utils';

const GroupCardLoader = () => {
  return (
    <SkeletonPlaceholder speed={1000}>
      <View style={styles.imageCon}>
        <View style={styles.image} />
        <View style={styles.subView}>
          <View style={styles.name} />
          <View style={styles.time} />
        </View>
      </View>

      {/* <View style={styles.bottomView}>
        <View style={styles.postTxt} />
        <View style={styles.postTxt} />
        <View style={styles.postTxt} />
        <View style={styles.postImage} />
      </View> */}
    </SkeletonPlaceholder>
  );
};

const styles = StyleSheet.create({
  imageCon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subView: {marginLeft: 20},
  image: {
    alignSelf: 'center',
    marginRight: scale(11),
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
  },
  name: {
    width: scale(150),
    height: scale(20),
    borderRadius: scale(4),
  },
  time: {
    marginTop: scale(5),
    width: scale(100),
    height: scale(20),
    borderRadius: scale(4),
  },
  bottomView: {marginTop: 10, marginBottom: 20},
  postTxt: {
    width: '90%',
    height: scale(20),
    borderRadius: scale(4),
    marginTop: scale(5),
  },
  postImage: {
    width: '100%',
    height: scale(200),
    borderRadius: scale(4),
    marginTop: scale(15),
  },
});

export default GroupCardLoader;
