import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
import {scale, theme, images} from '../Utils';
import externalStyle from '../Css';
import {GroupImages, Label} from './index';

const GroupCard = (props) => {
  const {
    item,
    onPress,
    index,
    onPressNotification,
    onPressGroup,
    onPressImage,
    options,
    notificatoionIconShow,
  } = props;

  if(item?.name === 'LP'){
    console.log('GroupCard item ->', item);
  }
  return (
    <>
      <TouchableOpacity
        onPress={() => onPress(item, index)}
        style={[externalStyle.shadow, styles.container]}>
        <TouchableOpacity onPress={() => onPressGroup(item, index)}>
          <FastImage
            source={
              item?.image?.original === '' ||
              item?.image?.original === null ||
              !item?.image?.original
                ? images.groupDefault
                : {uri: item?.image?.original}
            }
            style={styles.profile}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
        <View style={styles.cardview}>
          <View style={styles.subView}>
            <Label title={item?.name} style={styles.label} />
            {notificatoionIconShow && (
              <TouchableOpacity
                onPress={() => onPressNotification({item, index})}
                style={options ? {marginLeft: -scale(20)} : {}}>
                <Icon
                  name="bell"
                  size={scale(17)}
                  color={
                    // theme.colors.grey10
                    item?.is_notification
                      ? theme.colors.blue
                      : theme.colors.darkGrey
                  }
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.bottomView}>
            <TouchableOpacity onPress={() => onPressImage(item, index)}>
              <GroupImages members={item} InteractionsDetails={false} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
      {/* {showOp && (
        <View style={styles.menusCon}>
          {optionsData.map((itm, idx) => {
            return (
              <View key={idx.toString()}>
                <Label title={itm.name} />
              </View>
            );
          })}
        </View>
      )} */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    marginVertical: scale(4),
    borderRadius: scale(18),
    flexDirection: 'row',
    padding: scale(13),
    alignItems: 'center',
  },
  cardview: {flex: 1},
  profile: {
    alignSelf: 'center',
    marginRight: scale(11),
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
  },
  label: {width: '90%'},
  subView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: scale(10),
  },
  menusCon: {
    backgroundColor: theme.colors.white,
    padding: scale(10),
    paddingHorizontal: scale(15),
    borderRadius: 10,
    width: '50%',
    alignSelf: 'flex-end',
  },
});

export default GroupCard;
