import React, {useState} from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import Svg, {Line} from 'react-native-svg';
import FastImage from 'react-native-fast-image';
import {images, scale, theme, height} from '../../Utils';
import {Label} from '../index';
import {getLocalText} from '../../Locales/I18n';
import externalStyle from '../../Css';

const Dash = () => {
  return (
    <Svg height={1} style={{marginVertical: scale(12)}}>
      <Line
        stroke={theme.colors.grey13}
        strokeDasharray="4, 3"
        x1="0"
        y1="0"
        x2={theme.SCREENWIDTH}
        y2={'0'}
      />
    </Svg>
  );
};
const ReportModel = (props) => {
  const {
    isVisible,
    toggleReportmodel,
    data,
    reportGroup,
    userdetails,
    reportPerson,
  } = props;
  const [selectIndex, setSelectIndex] = useState('');
  const hadndleReport = (selected_type) => {
    toggleReportmodel(selected_type);
    setTimeout(() => {
      setSelectIndex('');
    });
  };
  return (
    <Modal
      isVisible={isVisible}
      animationIn="zoomIn"
      animationOut="zoomOut"
      statusBarTranslucent
      deviceHeight={height}
      backdropColor={theme.colors.grey11}
      backdropOpacity={0.9}>
      <View style={styles.mainContainer}>
        <View style={styles.container}>
          <View style={styles.headerCon}>
            <Icon
              name="alert-triangle"
              size={scale(20)}
              color={theme.colors.blue}
            />
            <Label
              title={getLocalText('Report.title')}
              style={{marginLeft: scale(10)}}
            />

            <TouchableOpacity
              onPress={() => {
                toggleReportmodel(null);
              }}
              style={styles.close}>
              <Icon name="x" size={scale(20)} color={theme.colors.blue} />
            </TouchableOpacity>
          </View>
          <Label
            title={getLocalText('Report.postpone')}
            style={styles.subText}
          />
          {reportPerson && (
            <View
              style={[
                styles.card,
                externalStyle.shadow,
                {
                  shadowRadius: scale(9),
                  marginVertical: scale(7),
                  borderWidth: scale(1),
                  borderColor:
                    selectIndex === 0 ? theme.colors.blue : theme.colors.white,
                },
              ]}>
              {data && (
                <View style={styles.cardCon}>
                  <FastImage
                    source={
                      data?.user_pic === null || data?.user_pic === undefined
                        ? images.profilepick
                        : {
                            uri:
                              data?.user_pic?.small ||
                              data?.user_pic?.optimize ||
                              data?.member_image?.optimize,
                          }
                    }
                    style={styles.userImg}
                  />
                  <Label
                    title={data?.first_name || data?.name || data?.member_name}
                    style={{marginLeft: scale(10)}}
                  />
                </View>
              )}
              <Dash />
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setSelectIndex(0);
                  setTimeout(() => {
                    hadndleReport(0);
                  });
                }}>
                <Label
                  title={getLocalText('Report.reportadmin')}
                  style={{color: theme.colors.blue}}
                />
              </TouchableOpacity>
            </View>
          )}
          {data !== undefined && reportGroup === undefined && (
            <View
              style={[
                styles.card,
                externalStyle.shadow,
                {
                  shadowRadius: scale(9),
                  marginVertical: scale(7),
                  borderWidth: scale(1),
                  borderColor:
                    selectIndex === 0 ? theme.colors.blue : theme.colors.white,
                },
              ]}>
              {data && (
                <View style={styles.cardCon}>
                  <FastImage
                    source={
                      data?.user_pic?.small === null
                        ? images.defaultUser
                        : {uri: data?.user_pic?.small}
                    }
                    style={styles.userImg}
                  />
                  <Label
                    title={data?.first_name}
                    style={{marginLeft: scale(10)}}
                  />
                </View>
              )}
              <Dash />
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setSelectIndex(0);
                  setTimeout(() => {
                    hadndleReport(0);
                  });
                }}>
                <Label
                  title={getLocalText('Report.reportadmin')}
                  style={{color: theme.colors.blue}}
                />
              </TouchableOpacity>
            </View>
          )}
          {userdetails !== undefined && userdetails === undefined && (
            <View
              style={[
                styles.card,
                externalStyle.shadow,
                {
                  shadowRadius: scale(9),
                  marginVertical: scale(7),
                  borderWidth: scale(1),
                  borderColor:
                    selectIndex === 0 ? theme.colors.blue : theme.colors.white,
                },
              ]}>
              {userdetails && (
                <View style={styles.cardCon}>
                  <FastImage
                    source={
                      userdetails?.user_pic?.small === null
                        ? images.defaultUser
                        : {uri: userdetails?.user_pic?.small}
                    }
                    style={styles.userImg}
                  />
                  <Label
                    title={userdetails?.member_name}
                    style={{marginLeft: scale(10)}}
                  />
                </View>
              )}
              <Dash />
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setSelectIndex(0);
                  setTimeout(() => {
                    hadndleReport(0);
                  });
                }}>
                <Label
                  title={getLocalText('Report.reportadmin')}
                  style={{color: theme.colors.blue}}
                />
              </TouchableOpacity>
            </View>
          )}
          {!reportPerson && (
            <View
              style={[
                styles.card,
                externalStyle.shadow,
                {
                  borderWidth: scale(1),
                  shadowRadius: scale(9),
                  marginVertical: scale(7),
                  elevation: scale(2),
                  borderColor:
                    selectIndex === 1 ? theme.colors.blue : theme.colors.white,
                },
              ]}>
              <View style={[styles.cardCon, {marginVertical: scale(0)}]}>
                <FastImage
                  source={
                    data?.group?.image?.small === null
                      ? images.groupDefault
                      : {
                          uri:
                            data && reportGroup
                              ? data?.image?.small || data?.creator_image?.small
                              : data?.group?.image?.small,
                        }
                  }
                  style={styles.userImg}
                />
                <Label
                  title={
                    data && reportGroup
                      ? data.name || data?.room_title
                      : data?.group?.name
                  }
                  style={{lineHeight: scale(18), marginLeft: scale(3)}}
                />
              </View>
              <Dash />
              <TouchableOpacity
                onPress={() => {
                  setSelectIndex(1);
                  setTimeout(() => {
                    hadndleReport(1);
                  });
                }}
                style={styles.button}>
                <Label
                  title={getLocalText('Report.reportbtn')}
                  style={{color: theme.colors.blue}}
                />
              </TouchableOpacity>
            </View>
          )}
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
  subText: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(13),
    marginVertical: scale(10),
    color: theme.colors.black,
  },
  headerCon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: scale(12),
    padding: scale(15),
  },
  cardCon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: scale(13),
  },
  userImg: {
    height: scale(40),
    width: scale(40),
    borderRadius: scale(20),
    resizeMode: 'cover',
  },
  image: {
    height: scale(70),
    width: scale(70),
    borderRadius: scale(35),
    resizeMode: 'cover',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: scale(3),
  },
  close: {
    position: 'absolute',
    right: scale(0),
  },
});

export default ReportModel;
