import React, {useEffect, useState} from 'react';
import FastImage from 'react-native-fast-image';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import Modal from 'react-native-modal';
import {useDispatch, useSelector} from 'react-redux';
import externalStyle from '../../Css';
import {scale, theme, images, height} from '../../Utils';
import {getLocalText} from '../../Locales/I18n';
import {Label} from '../index';
import {checkValidUrl} from '../../Utils/helper';
import {getJoinedGroups} from '../../Redux/Actions';

let loadMoreData = false;

const GroupsJoinedModel = (props) => {
  const {isShow, handleGroup, groups, attachLength, groupStyle} = props;
  const [groupsList, setgroupsList] = useState(groups);
  const [group, setGroup] = useState('');
  const [loadmore, setLoadmore] = useState(false);
  const [page, setPage] = useState(1);
  const [activeItem, setactiveItem] = useState(null);
  const [refreshing, setrefreshing] = useState(false);
  const totalPage = useSelector(
    (state) => state.groupsReducer.joinGroupTotalPage,
  );
  const getJoinedGroupsList = useSelector(
    (state) => state.groupsReducer.joinGroup_list,
  );

  useEffect(() => {
    setPage(1);
  }, [isShow]);

  let dispatch = useDispatch();
  let animateValue = new Animated.Value(0);

  const animate = (index) => {
    setactiveItem(index);
    Animated.sequence([
      Animated.spring(animateValue, {
        toValue: 1,
        fontSize: 12,
      }),
      Animated.spring(animateValue, {
        toValue: 0,
      }),
    ]).start();
  };
  const animationMap = animateValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  //render groups
  const renderGroups = ({item, index}) => {
    return (
      <TouchableOpacity
        key={index.toString()}
        onPress={() => {
          animate(index);
          setGroup(item);
          setTimeout(() => {
            handleGroup(item);
            setGroup('');
          });
        }}
        style={styles.row}>
        <FastImage
          source={
            checkValidUrl(item?.image?.original)
              ? {uri: item?.image?.original}
              : images.groupDefault
          }
          style={styles.groupImage}
          resizeMode={FastImage.resizeMode.stretch}
        />
        {activeItem === index && (
          <Animated.View style={[{transform: [{scale: animationMap}]}]}>
            <Text
              style={{
                ...styles.txt,
                color:
                  item?.id === group.id
                    ? theme.colors.blue
                    : theme.colors.black,
                fontFamily:
                  item?.id === group.id
                    ? theme.fonts.muktaBold
                    : theme.fonts.muktaRegular,
              }}>
              {item?.name}
            </Text>
          </Animated.View>
        )}
        {activeItem !== index && (
          <View>
            <Text key={index} style={[styles.txt]}>
              {item?.name}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  //load more loaderView
  const renderFooter = () => {
    if (!loadmore) {
      return null;
    } else {
      return (
        <ActivityIndicator
          size="large"
          color={theme.colors.blue}
          style={{marginBottom: scale(5)}}
        />
      );
    }
  };
  const loadMore = async () => {
    if (groupsList) {
      if (page <= totalPage && !loadMoreData) {
        let updatePage = page + 1;
        if (updatePage <= totalPage) {
          setLoadmore(true);
          loadMoreData = true;
          const joinGroupData = await dispatch(getJoinedGroups(updatePage));
          setPage(updatePage);
          let data = [...groupsList, ...joinGroupData.data];
          setgroupsList(data);
          setLoadmore(false);
          loadMoreData = false;
        }
      } else {
        setLoadmore(false);
      }
    }
  };

  //refresh
  const handleRefresh = async () => {
    setrefreshing(true);
    setPage(1);
    const joinGroupData = await dispatch(getJoinedGroups(1));
    setgroupsList(
      joinGroupData?.success ? joinGroupData.data : getJoinedGroupsList,
    );
    setrefreshing(false);
  };
  return (
    <Modal
      // backdropTransitionInTiming={5000}
      isVisible={isShow}
      animationIn="slideInLeft"
      animationOut="slideOutLeft"
      statusBarTranslucent
      deviceHeight={height}
      backdropColor={theme.colors.grey11}
      onBackdropPress={() => {
        handleGroup();
      }}
      backdropOpacity={0}>
      <View
        style={
          ([
            styles.mainContainer,
            externalStyle.shadow,
            {
              elevation: scale(2),
              shadowColor: theme.colors.black,
              shadowRadius: scale(1),
            },
          ],
          groupStyle)
        }>
        <View
          style={[
            styles.container,
            externalStyle.shadow,
            {
              elevation: scale(4),
              shadowColor: theme.colors.black,
              shadowRadius: scale(2),
              marginVertical: scale(0),
              marginTop:
                attachLength > 3
                  ? theme.SCREENHEIGHT * 0.4
                  : attachLength !== 0
                  ? theme.SCREENHEIGHT * 0.12
                  : -scale(30),
            },
          ]}>
          <Label
            title={getLocalText('ErrorMsgs.groupSelect')}
            style={styles.lbl}
          />
          <FlatList
            keyboardShouldPersistTaps={'handled'}
            data={groupsList?.length > 0 ? groupsList : groups}
            extraData={[props, groupsList]}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderGroups}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            showsVerticalScrollIndicator={false}
            ListFooterComponent={renderFooter}
            onEndReachedThreshold={0.8}
            onEndReached={loadMore}
            ListEmptyComponent={() => (
              <View style={styles.nodata}>
                {groupsList?.length === 0 ||
                groupsList?.length === undefined ? (
                  <Text style={styles.groupjoinError}>No group joined</Text>
                ) : null}
              </View>
            )}
            style={{
              maxHeight: theme.SCREENHEIGHT * 0.3,
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: 'center',
    backgroundColor: theme.colors.transparent,
    position: 'absolute',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: scale(8),
  },
  lbl: {
    marginLeft: scale(10),
  },
  groupImage: {
    height: scale(30),
    width: scale(30),
    borderRadius: scale(10),
    marginHorizontal: scale(5),
  },
  txt: {
    fontSize: scale(16),
    textAlign: 'center',
    paddingVertical: scale(12),
  },
  container: {
    width: theme.SCREENWIDTH / 1.5,
    backgroundColor: theme.colors.white,
    padding: scale(10),
    borderRadius: scale(20),
    marginTop: scale(-25),
  },
  groupjoinError: {
    color: theme.colors.black,
    fontSize: scale(11),
    fontFamily: theme.fonts.rubikNormal,
    textAlign: 'center',
  },
});

export default GroupsJoinedModel;
