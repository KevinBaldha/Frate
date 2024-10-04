import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Modal from 'react-native-modal';
import {useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import {isIphoneX} from 'react-native-iphone-x-helper';
import FastImage from 'react-native-fast-image';
import {scale, theme, height} from '../../Utils';
import externalStyle from '../../Css/index';
import {Label, BackgroundChunk} from '../index';
import {getLocalText} from '../../Locales/I18n';
import {API, postAPICall} from '../../Utils/appApi';

const SearchModel = (props) => {
  const {isVisible, closeSearch} = props;
  const [searchTxt, setSearchText] = useState('');
  const [searchData, setSearchData] = useState('');
  const [resultMsg, SetresultMsg] = useState('');
  const [colors, setColor] = useState(theme.defaultGradient);
  const userData = useSelector((state) => state.UserInfo);
  useEffect(() => {
    setColor(userData?.data?.color);
  }, [userData]);
  // searching
  const searching = async (text) => {
    setSearchText(text);
    let serchform = new FormData();
    serchform.append('search', text);
    let search = await postAPICall(API.search, serchform);
    if (search.success) {
      setSearchData(search.data.users);
      // SetresultMsg(search?.message);
    } else {
      SetresultMsg(
        search?.message === undefined ? ' No data Found' : search?.message,
      );
    }
  };
  return (
    <Modal
      isVisible={isVisible}
      backdropColor={theme.colors.darkBlue}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      statusBarTranslucent
      deviceHeight={height}
      style={{margin: scale(0)}}
      backdropOpacity={0}>
      <View
        style={[
          styles.container,
          externalStyle.shadow,
          {shadowRadius: scale(2)},
        ]}>
        <LinearGradient colors={colors} style={{flex: 1}}>
          <BackgroundChunk style={styles.topImage} />
          <View style={[styles.header]}>
            {/* <LinearGradient colors={colors}> */}
            <View style={styles.searchView}>
              <TouchableOpacity
                onPress={() => {
                  closeSearch(null);
                  setSearchData('');
                  setSearchText('');
                }}>
                <Icon
                  name={'arrow-left'}
                  color={theme.colors.blue}
                  size={scale(22)}
                />
              </TouchableOpacity>
              <View style={[styles.inputContainer]}>
                <TextInput
                  // ref={(ref) => (this.inputText = ref)}
                  placeholder={getLocalText('Timeline.search')}
                  style={[styles.input]}
                  value={searchTxt}
                  onChangeText={(text) => {
                    searching(text);
                  }}
                />
                {searchTxt.length !== 0 && (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        setSearchText('');
                        setSearchData('');
                      }}
                      style={styles.closeIcon}>
                      <Icon
                        name={'x'}
                        color={theme.colors.blue}
                        size={scale(22)}
                      />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
            {/* </LinearGradient> */}
          </View>

          <ScrollView style={{marginTop: scale(10)}}>
            {searchData === null || searchData === '' ? (
              <View style={styles.msgContainer}>
                <Label
                  title={
                    searchTxt !== ''
                      ? getLocalText('Timeline.searchResult') + resultMsg
                      : ''
                  }
                  style={styles.content}
                />
              </View>
            ) : (
              searchData !== '' &&
              searchData?.map((item, index) => {
                return (
                  <TouchableOpacity
                    style={styles.userView}
                    key={index}
                    onPress={() => {
                      closeSearch(item);
                    }}>
                    <FastImage
                      source={{uri: item?.user_pic?.optimize}}
                      style={styles.userPic}
                    />
                    <Label
                      title={item?.first_name + ' ' + item?.last_name}
                      style={{
                        marginLeft: scale(13),
                      }}
                    />
                    <View style={styles.subView}>
                      <Icon
                        name={'arrow-right'}
                        color={theme.colors.blue}
                        size={scale(20)}
                        // onPress={() => closeSearch(item)}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    width: theme.SCREENWIDTH,
    height: theme.SCREENHEIGHT,
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.white,
    paddingTop: isIphoneX() ? scale(40) : scale(15),
    paddingBottom: scale(15),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.25),
    right: -(theme.SCREENHEIGHT * 0.4),
    transform: [{rotate: '75deg'}],
    zIndex: -1,
  },
  searchView: {
    marginHorizontal: scale(18),
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    width: theme.SCREENWIDTH / 1.35,
    fontFamily: theme.fonts.muktaMedium,
    color: theme.colors.grey2,
    fontSize: scale(12),
    alignSelf: 'flex-start',
    height: scale(35),
  },
  inputContainer: {
    backgroundColor: theme.colors.white,
    width: theme.SCREENWIDTH / 1.25,
    height: scale(45),
    paddingHorizontal: scale(20),
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderRadius: scale(25),
  },
  userView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(10),
    marginHorizontal: scale(15),
  },
  userPic: {
    height: scale(30),
    width: scale(30),
    resizeMode: 'cover',
    borderRadius: scale(25),
  },
  subView: {
    position: 'absolute',
    right: scale(10),
  },
  closeIcon: {
    position: 'absolute',
    right: scale(10),
  },
  msgContainer: {
    flex: 1,
    height: theme.SCREENHEIGHT * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchModel;
