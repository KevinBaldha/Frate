/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import {getLocalText} from '../Locales/I18n';
import {scale, theme, images} from '../Utils';

const GroupImages = (props) => {
  const {members, groupImagesView, InteractionsDetails} = props;
  const [userImages, setUserImages] = React.useState([]);
  useEffect(() => {
    setUserImages(
      InteractionsDetails ? members : members?.member_images || members?.users,
    );
  }, [userImages]);

  return (
    <View style={[styles.subView, groupImagesView]}>
      <View style={styles.subView}>
        {userImages !== undefined &&
          userImages?.slice(0, 3).map((d, i) => {
            // console.log('d?.user_pic?.original ->',d?.user_pic?.original);
  console.log('d?.image?.optimize ->',d?.image?.optimize );
  // console.log('d?.user_pic?.optimize ->',d?.user_pic?.optimize);
            return (
              <FastImage
                key={i.toString()}
                source={
                  d?.original
                    ? {uri: d?.optimize}
                    : d?.image?.length !== 0
                    ? {
                        uri: InteractionsDetails
                          ? d?.user_pic?.original
                          : d?.image?.optimize || d?.user_pic?.optimize,
                      }
                    : images.AppLogo
                }
                style={[
                  styles.memberImage,
                  {
                    marginLeft: i !== 0 ? scale(-5) : scale(0),
                  },
                ]}
              />
            );
          })}
        {InteractionsDetails
          ? null
          : members &&
            members?.total_members && (
              <Text style={[styles.text, {marginLeft: scale(6)}]}>
                {`${members?.total_members} ${
                  members?.total_members > 1
                    ? getLocalText('GroupInfo.member')
                    : getLocalText('GroupInfo.singleMember')
                }`}
              </Text>
            )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  subView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(11),
    color: theme.colors.grey10,
  },
  memberImage: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
  },
});
export default GroupImages;
