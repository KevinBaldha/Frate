import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import {scale, theme, height} from '../../Utils';
import {Label, Button, GroupImages} from '../index';
import {getLocalText} from '../../Locales/I18n';
import {getJoinedGroups} from '../../Redux/Actions';
import FastImage from 'react-native-fast-image';
let loadMoreData = false;
const SharePostGroupModel = (props) => {
  const {show, closeModal} = props;
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [groupsList, setgroupsList] = useState('');
  const [loadmore, setLoadmore] = useState(false);
  const [sgroup, setSgroup] = useState([]);
  const totalPage = useSelector(
    (state) => state.groupsReducer.joinGroupTotalPage,
  );
  const getJoinedGroupsList = useSelector(
    (state) => state.groupsReducer.joinGroup_list,
  );
  let dispatch = useDispatch();

  useEffect(() => {
    setgroupsList(getJoinedGroupsList);
  }, [show]);

  const handlegroups = (id) => {
    let check = sgroup && sgroup.find((d) => d === id);

    if (check) {
      //remove user
      const arr = sgroup.filter((item) => item !== id);
      let tmpMembers = [];
      arr.forEach(myFunction);
      function myFunction(item, i) {
        tmpMembers.push(id);
      }
      setSgroup(tmpMembers);
    } else {
      //add imagee
      setSgroup([...sgroup, id]);
    }
  };

  const handleGroupList = ({item, index}) => {
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            borderColor: sgroup?.includes(item?.id)
              ? theme.colors.blue
              : theme.colors.transparent,
          },
        ]}
        key={index}
        onPress={() => {
          handlegroups(item?.id);
        }}>
        <FastImage
          source={{uri: item?.image?.optimize}}
          style={styles.groupImage}
        />
        <View style={styles.nameContainer}>
          <Label title={item?.name} style={styles.groupname} />
          <GroupImages groupImagesView={{left: scale(0)}} members={item} />
        </View>
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
        if (updatePage < totalPage) {
          setLoadmore(true);
          loadMoreData = true;
          await dispatch(getJoinedGroups(updatePage));
          setPage(updatePage);
          let data = [...groupsList, ...getJoinedGroupsList];
          setgroupsList(data);
          setLoadmore(false);
          loadMoreData = false;
        }
      } else {
        setLoadmore(false);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await setPage(1);
    await dispatch(getJoinedGroups(1));
    setgroupsList(getJoinedGroupsList);
    setRefreshing(false);
  };

  //search group from
  const searchGroupFunction = (text) => {
    // Check if searched text is not blank
    if (text) {
      const newData = groupsList?.filter(function (item) {
        const itemData = item?.name
          ? item?.name?.toUpperCase()
          : ''.toUpperCase();
        const textData = text?.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setgroupsList(newData);
      setSearch(text);
      // this.setState({fillterCountry: newData, searchText: text});
    } else {
      setgroupsList(getJoinedGroupsList);
      setSearch(text);
    }
  };

  const handleShare = () => {
    if (sgroup.length) {
      closeModal(sgroup);
      setTimeout(() => {
        setSgroup([]);
      });
    } else {
      Alert.alert(getLocalText('ErrorMsgs.Select_Group'));
    }
  };

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
              title={getLocalText('Post.yourGroup')}
              style={styles.title}
            />

            <TouchableOpacity onPress={() => closeModal()}>
              <Icon name="x" size={scale(20)} color={theme.colors.blue} />
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.searchView}>
            <TextInput
              value={search}
              onChangeText={(txt) => {
                searchGroupFunction(txt);
              }}
              style={styles.searchbar}
              placeholder={' Type here '}
            />
            <Icon name="search" size={scale(18)} color={theme.colors.grey1} />
          </View>
          <FlatList
            data={groupsList}
            extraData={[props, groupsList]}
            keyExtractor={(_, index) => index.toString()}
            renderItem={handleGroupList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.8}
            onEndReached={loadMore}
            style={{
              maxHeight: theme.SCREENHEIGHT * 0.8,
              marginTop: scale(15),
            }}
          />

          <Button
            title={getLocalText('Post.toshare')}
            style={styles.btnView}
            onPress={() => {
              handleShare();
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
    alignItems: 'center',
  },
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: scale(12),
    width: theme.SCREENWIDTH - scale(35),
    paddingHorizontal: scale(15),
    paddingVertical: scale(15),
    height: theme.SCREENHEIGHT * 0.75,
  },
  headerCon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 0,
    alignItems: 'center',
  },
  groupImage: {
    height: scale(55),
    width: scale(55),
    borderRadius: scale(27),
  },
  title: {
    fontFamily: theme.fonts.muktaRegular,
    color: theme.colors.blue,
    marginTop: scale(10),
    fontSize: scale(17),
    paddingBottom: scale(15),
  },
  divider: {
    height: scale(0.5),
    backgroundColor: theme.colors.divider1,
  },
  searchbar: {
    borderBottomColor: theme.colors.grey1,
    borderBottomWidth: scale(1),
    height: scale(40),
    width: '90%',
  },
  searchView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: scale(10),
  },
  card: {
    paddingVertical: scale(15),
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginHorizontal: scale(3),
    paddingHorizontal: scale(10),
    elevation: scale(5),
    marginVertical: scale(5),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: scale(15),
    borderWidth: 1,
  },
  nameContainer: {
    marginLeft: scale(5),
  },
  groupname: {
    marginLeft: scale(5),
    fontFamily: theme.fonts.muktaMedium,
    fontSize: scale(15),
  },
  btnView: {
    marginTop: scale(10),
  },
});

export default SharePostGroupModel;
