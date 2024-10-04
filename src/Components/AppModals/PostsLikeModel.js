import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import {isIphoneX} from 'react-native-iphone-x-helper';
import Icon from 'react-native-vector-icons/Feather';
import {Config, scale, theme, images, height} from '../../Utils';
import {Label} from '../index';
import externalStyle from '../../Css';
import {API, getAPICall} from '../../Utils/appApi';
import {checkValidUrl} from '../../Utils/helper';
let loadMoreData = false;

const PostsLikeModel = (props) => {
  const {isVisible, close, data} = props;

  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [loadmore, setLoadmore] = useState(false);
  const [loadding, setLoadding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [postLikesUserList, setPostLikesUserList] = useState('');
  useEffect(() => {
    isVisible ? getLikesUsers() : null;
  }, [isVisible, !postLikesUserList]);

  //get like users lists
  const getLikesUsers = async () => {
    setLoadding(true);
    let getLikesList = await getAPICall(API.getLikes + data.id + '?page=' + 1);
    if (getLikesList.success) {
      setPostLikesUserList(getLikesList.data);
      setTotalPage(getLikesList.total_page);
      setLoadding(false);
      setPage(1);
    } else {
      setLoadding(false);
    }
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    let response = await getAPICall(API.getLikes + data.id + '?page=' + 1);
    if (response.success) {
      setPostLikesUserList(response.data);
      setTotalPage(response.total_page);
      setRefreshing(false);
      setPage(1);
    } else {
      setRefreshing(false);
    }
  };
  const renderUserList = ({item, index}) => {
    return (
      <View style={styles.row} key={index}>
        <View style={styles.userImgCon}>
          <FastImage
            source={
              checkValidUrl(item?.user_pic?.optimize)
                ? {uri: item?.user_pic?.optimize}
                : images.defaultUser
            }
            style={styles.userImage}
          />
        </View>
        <Label
          title={item?.user_name}
          style={{
            marginLeft: scale(13),
          }}
        />
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadmore) {
      return null;
    } else {
      return (
        <ActivityIndicator
          size="large"
          color={theme.colors.blue}
          style={{marginTop: scale(-20)}}
        />
      );
    }
  };
  //load next  posts likes
  const loadMore = async () => {
    let postId = data.id;
    if (postLikesUserList) {
      if (page <= totalPage && !loadMoreData) {
        let pageNum = page + 1;
        if (pageNum < totalPage) {
          setLoadmore(true);
          loadMoreData = true;
          let likeResponse = await getAPICall(
            API.getLikes + postId + '?page=' + pageNum,
          );
          let likes = [...postLikesUserList, ...likeResponse.data];
          if (likeResponse.success) {
            setPostLikesUserList(likes);
            setLoadmore(false);
            loadMoreData = false;
            setPage(pageNum);
          }
        }
      } else {
        setLoadmore(false);
      }
    }
  };
  const renderSeparator = () => <View style={styles.devider} />;
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
          {
            paddingTop: Platform.OS === 'ios' ? scale(0) : scale(30),
          },
        ]}>
        <View style={[styles.headerCon, externalStyle.shadow]}>
          <TouchableOpacity style={styles.row}>
            <Icon
              name={'thumbs-up'}
              size={scale(20)}
              color={theme.colors.grey2}
              // onPress={() => onLikePress(item, index)}
            />
            <Icon
              name={'chevron-right'}
              size={scale(20)}
              color={theme.colors.grey2}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.icon} onPress={close}>
            <Icon name="x" color={theme.colors.blue} size={scale(25)} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={postLikesUserList}
          extraData={(postLikesUserList, props)}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderUserList}
          contentContainerStyle={styles.blockmain}
          style={{marginBottom: theme.SCREENHEIGHT * 0.1}}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter.bind(this)}
          onEndReachedThreshold={0.3}
          onEndReached={loadMore}
          ListEmptyComponent={() => (
            <View style={styles.loaddingCon}>
              {Config.NO_DATA_COMPO(loadding)}
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => handleRefresh()}
            />
          }
          ItemSeparatorComponent={() => renderSeparator()}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    width: '100%',
    height: theme.SCREENHEIGHT,
    marginTop: isIphoneX() ? scale(30) : scale(0),
    flex: 1,
  },
  icon: {
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
  },
  headerCon: {
    height: 50,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(5),
    backgroundColor: theme.colors.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    marginHorizontal: scale(10),
    marginVertical: scale(5),
  },
  userImgCon: {
    borderColor: theme.colors.grey10,
    borderWidth: 2,
    padding: scale(2),
    borderRadius: scale(28),
  },
  loaddingCon: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: theme.SCREENWIDTH,
    // flex: 1,
    height: theme.SCREENHEIGHT * 0.7,
  },
  userImage: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
  },
  shadow: {
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 1.4,
    elevation: 1,
  },
  devider: {
    backgroundColor: theme.colors.divider1,
    height: 0.5,
    width: '90%',
    alignSelf: 'center',
  },
});

export default PostsLikeModel;
