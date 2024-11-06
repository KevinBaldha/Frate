/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import {scale, theme, images} from '../../Utils';
import {Label, InputBox} from '../index';
import {getLocalText} from '../../Locales/I18n';
import externalStyle from '../../Css';
import {API, getAPICall} from '../../Utils/appApi';

var loadMoreD = false;
const AddConversionsMembersModel = props => {
  const {show, closeModal, groupMembers, userData, selectedClose, type} = props;
  const [members, setMembers] = useState([]);
  const [selectedMembers, addMembers] = useState([]);
  const [checked, setChecked] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  // const [groupMemberParPageData, setGroupTotalParPageData] = useState(1);
  const [loadMoreData, setLoadMoreData] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    // Cleanup listeners on unmount
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (show) {
      getGroupUserList();
      setPage(1);
      loadMoreD = false;
    }
  }, [show]);

  const getGroupUserList = async (isRefresh = false) => {
    let group_id = groupMembers?.id;
    let membersData = await getAPICall(
      API.groupMembers + group_id + `?page=${1}`,
    );
    if (membersData.success) {
      setMembers(membersData.data);
      setTotal(membersData.total_page);
    }
    return members;
  };

  const loadMore = async () => {
    // if (members) {
    if (page <= total && !loadMoreD) {
      let pages = page + 1;
      if (pages <= total) {
        setLoadMoreData(true);
        loadMoreD = true;
        let group_id = groupMembers?.id;
        let response = await getAPICall(
          API.groupMembers + group_id + `?page=${pages}`,
        );
        if (response.data) {
          let data = [...members, ...response.data];
          setMembers(data);
          setPage(pages);
          setLoadMoreData(false);
          loadMoreD = false;
        }
      }
    } else {
      setLoadMoreData(false);
    }
    // }
  };

  const renderFooter = () => {
    if (!loadMoreData) {
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

  //add member in list
  const addMemberFunction = async user => {
    let check =
      selectedMembers &&
      selectedMembers.find(d => d.member_id === user.member_id);
    if (check) {
      //remove user
      const arr = selectedMembers.filter(
        item => item?.member_id !== user.member_id,
      );
      let tmpMembers = [];
      arr.forEach(myFunction);
      function myFunction(item, i) {
        tmpMembers.push({
          member_id: item?.member_id,
          member_name: item?.member_name,
          member_image: item?.member_image,
          role: item?.role,
          total_members: item?.total_members,
        });
      }
      setChecked(tmpMembers.length === members.length);
      addMembers(tmpMembers);
    } else {
      //add imaged
      const addedMembers = [...selectedMembers, user];
      setChecked(addedMembers.length === members.length);
      addMembers(addedMembers);
    }
  };

  //handle all member add or remove
  const addAllMembers = () => {
    if (!checked) {
      addMembers(members);
    } else {
      addMembers([]);
    }
  };

  // render group member list
  const renderList = (item, index) => {
    return (
      userData?.id !== item?.member_id && (
        <TouchableOpacity
          style={styles.memberView}
          key={index}
          onPress={() => {
            addMemberFunction(item);
          }}>
          <FastImage
            source={
              item?.member_image?.small || item?.member_image?.optimize
                ? {
                    uri:
                      item?.member_image?.small || item?.member_image?.optimize,
                  }
                : images.defaultUser
            }
            style={styles.memberImage}
          />
          <Label
            title={item?.member_name}
            style={[
              styles.memberName,
              {
                color: selectedMembers.some(
                  d => d.member_id === item?.member_id,
                )
                  ? theme.colors.blue
                  : theme.colors.black,
              },
            ]}
          />
        </TouchableOpacity>
      )
    );
  };

  //next gone
  const handleNext = () => {
    if (roomName === '') {
      Alert.alert(getLocalText('ErrorMsgs.Room_Name_Require'));
    } else {
      selectedClose(selectedMembers, type, roomName);
      setChecked(false);
      setTimeout(() => {
        addMembers([]);
        setRoomName('');
      }, 500);
    }
  };
  return (
    <Modal
      isVisible={show}
      animationIn="zoomIn"
      animationOut="zoomOut"
      // statusBarTranslucent
      // deviceHeight={height}
      style={{margin: 0}}
      backdropColor={theme.colors.grey11}
      onBackButtonPress={() => {
        closeModal();
        addMembers([]);
        setChecked(false);
      }}
      onBackdropPress={() => {}}
      backdropOpacity={0.9}>
      <View style={styles.mainContainer}>
        <View style={styles.container}>
          <View
            style={[
              styles.headerCon,
              externalStyle.shadow,
              styles.headerShadow,
            ]}>
            <TouchableOpacity
              onPress={() => {
                addMembers([]);
                closeModal();
                setChecked(false);
              }}>
              <Icon
                name="arrow-left"
                size={scale(22)}
                color={theme.colors.blue}
              />
            </TouchableOpacity>
            <Label
              title={getLocalText('Groups.addMember')}
              style={{marginLeft: scale(10), fontSize: scale(22)}}
            />
          </View>
          <View style={styles.nameContainer}>
            <Label title={'Room Name'} style={styles.name} />
            <InputBox
              placeholder={'Room Name'}
              style={styles.inputBox}
              value={roomName}
              onChangeText={txt => {
                setRoomName(txt);
              }}
            />
          </View>

          {/* Member List */}
          <View>
            <ScrollView horizontal={true}>
              {selectedMembers &&
                selectedMembers.map((member, i) => {
                  return (
                    userData?.id !== member?.member_id && (
                      <View style={styles.iconView} key={i}>
                        <FastImage
                          source={
                            member?.member_image?.small ||
                            member?.member_image?.optimize
                              ? {
                                  uri:
                                    member?.member_image?.small ||
                                    member?.member_image?.optimize,
                                }
                              : images.defaultUser
                          }
                          style={styles.userIcon}
                        />
                        <Label title={member.member_name} />
                      </View>
                    )
                  );
                })}
            </ScrollView>
          </View>
          <View style={styles.checkBoxCon}>
            <Label title="Add all members " style={styles.memberName} />
            <TouchableOpacity
              onPress={() => {
                setChecked(!checked);
                addAllMembers();
              }}
              style={[styles.checkBox]}>
              <Icon2
                name={checked ? 'radiobox-marked' : 'radiobox-blank'}
                size={scale(28)}
                color={theme.colors.blue}
              />
            </TouchableOpacity>
          </View>
          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps={'always'}
            showsVerticalScrollIndicator={false}
            style={styles.addAllMembersScroll}>
            <FlatList
              scrollEnabled
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps={'always'}
              contentContainerStyle={styles.listContain}
              keyExtractor={(_, index) => index.toString()}
              data={members}
              extraData={[members, this.props]}
              renderItem={({item, index}) => renderList(item, index)}
              onEndReachedThreshold={0.2}
              onEndReached={loadMore}
              ListFooterComponent={renderFooter}
            />
          </ScrollView>
          {selectedMembers.length !== 0 && (
            <>
              <TouchableOpacity
                style={styles.next}
                onPress={() => {
                  handleNext();
                }}>
                <Icon
                  name={'check'}
                  size={scale(25)}
                  color={theme.colors.white}
                />
              </TouchableOpacity>
            </>
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
    flex: 1,
  },
  container: {
    backgroundColor: theme.colors.white,
    width: theme.SCREENWIDTH,
    flex: 1,
  },
  headerCon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? scale(32) : scale(5),
    paddingBottom: scale(5),
    paddingHorizontal: scale(10),
    backgroundColor: theme.colors.white,
  },
  headerShadow: {shadowRadius: 2, elevation: 3},
  inputBox: {left: scale(-10), width: '90%'},
  addAllMembersScroll: {flex: 1},
  listContain: {
    paddingHorizontal: scale(10),
    marginTop: scale(5),
    paddingBottom: scale(80),
  },
  memberView: {
    flexDirection: 'row',
    padding: scale(2),
    marginBottom: scale(5),
  },
  memberImage: {
    height: scale(35),
    width: scale(35),
    borderRadius: scale(17),
  },
  memberName: {
    fontSize: scale(18),
    marginLeft: scale(10),
  },
  userIcon: {
    height: scale(55),
    width: scale(55),
    borderRadius: scale(27),
  },
  iconView: {
    alignItems: 'center',
    margin: 5,
  },
  checkBox: {
    backgroundColor: theme.colors.white,
    marginRight: scale(10),
  },
  checkBoxCon: {
    flexDirection: 'row',
    paddingHorizontal: scale(10),
    // marginLeft: scale(30),
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.SCREENHEIGHT * 0.02,
    borderBottomColor: theme.colors.black,
  },
  checked: {
    backgroundColor: theme.colors.white,
    height: scale(15),
    width: scale(15),
    borderRadius: scale(10),
  },
  next: {
    position: 'absolute',
    height: scale(50),
    width: scale(50),
    borderRadius: scale(25),
    backgroundColor: theme.colors.blue,
    bottom: scale(20),
    right: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: scale(15),
  },
  name: {marginLeft: scale(20), fontSize: scale(18)},
});

export default AddConversionsMembersModel;
