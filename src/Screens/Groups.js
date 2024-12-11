import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
import {connect} from 'react-redux';
import {
  ScreenContainer,
  SearchBar,
  Label,
  BackgroundChunk,
  GroupCard,
  FilterGroups,
  Button,
  SearchModel,
  PopUpModel,
  OfflineModel,
} from '../Components';
import {Api, Config, scale, theme, images} from '../Utils';
import {getLocalText} from '../Locales/I18n';
import {SVGRecent} from '../Assets/SVGs';
import extenalStyle from '../Css';
import {API, getAPICall, postAPICall} from '../Utils/appApi';
import {
  getGroups,
  categoryFilterGroups,
  manageNotification,
} from '../Redux/Actions';
import {AllCategory} from '../Utils/StaticData';
import {ScrollView} from 'react-native-gesture-handler';
import GroupCardLoader from '../Components/GroupCardLoader';

var loadMoreData = false;
class Groups extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      searchText: '',
      isFilterModal: false,
      categories: [],
      loadCategories: true,
      groupsData: [],
      groupdataloading: true,
      searchData: [],
      groupFiltter: '',
      categoryId: '',
      totalPage: 1,
      page: 1,
      loadmore: false,
      refreshing: false,
      searchModel: false,
      tutorialModel: false,
      selectCategory: 0,
      popUpModel: false,
      searchDataLoading: false,
      selectedCategoryId: null,
    };
  }

  componentDidMount() {
    const {navigation} = this.props;
    this.setState({
      groupdataloading: this.props.groupList?.data ? false : true,
    });
    this.focusListener = navigation.addListener('focus', () => {
      this.getGroupsList();
      this.getCategories();
      this.setState({tutorialModel: true});
    });
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }
  onButtonPress = () => {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButton.bind(this),
    );
    this.focusListener();
  };
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }
  handleBackButton = () => {
    if (this.props.navigation.isFocused()) {
      if (this.state.canBeClosed) {
        return (this.state.canBeClosed = false);
      } else {
        BackHandler.exitApp();
        return (this.state.canBeClosed = true);
      }
    }
  };
  handlePopUpModel = () => {
    this.setState({popUpModel: !this.state.popUpModel});
  };

  getCategories = async () => {
    this.setState({loadCategories: true});
    let success = await getAPICall(API.category);
    if (success.error) {
      this.setState({loadCategories: false});
    } else {
      let data = [AllCategory, ...success.data];
      this.setState({categories: data, loadCategories: false});
    }
  };
  getGroupsList = async () => {
    await this.props.getGroups('new', null, 1, false);
    this.setState({
      groupsData: this.props.groupList.data,
      totalPage: this.props.groupList.total_page,
      page: 1,
      groupdataloading: false,
    });
  };
  //filter group by older& new
  toggleFilterModal = async item => {
    this.setState({
      isFilterModal: !this.state.isFilterModal,
      refreshing: true,
    });

    // if (item?.selectedRadioKey !== '') {
    let grouping = item?.selectedRadioKey
      ? item?.selectedRadioKey === 0
        ? 'new'
        : 'old'
      : 'new';
    await this.props.getGroups(
      grouping,
      item?.category?.id,
      this.state.page,
      item?.showOnlyFriendGroups,
    );

    this.setState({
      groupsData: this.props.groupList.data,
      groupdataloading: false,
      selectCategory: item?.category?.id,
      refreshing: false,
    });
  };

  handleCategory = async id => {
    this.setState({
      groupdataloading: true,
    });
    if (id === 0) {
      this.getGroupsList();
    } else {
      await this.props.categoryFilterGroups(id);
      this.setState({
        groupsData: this.props.groupList,
        groupdataloading: false,
      });
    }
  };

  onCategorySelect = (id, index) => {
    this.setState({selectCategory: index, selectedCategoryId: id}, () =>
      this.handleCategory(id),
    );
  };

  //display categories
  renderCategories = ({item, index}) => {
    var ImageSet = item?.image.original;
    const selectIndex = this.state.selectCategory === index;
    return (
      <>
        <TouchableOpacity
          onPress={() => {
            this.onCategorySelect(item?.id, index);
          }}
          style={[
            selectIndex ? styles.selectCategoryView : styles.categoryView,
            extenalStyle.shadow,
          ]}
          key={index}>
          <View>
            <FastImage
              source={
                item?.id === 0
                  ? images?.allCategory
                  : {
                      uri: ImageSet,
                    }
              }
              style={{
                width: scale(55),
                height: scale(55),
              }}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
          <Label title={item?.name} style={styles.categoriesText} />
        </TouchableOpacity>
      </>
    );
  };
  //display groups
  renderGroups = ({item, index}) => {
    return (
      <GroupCard
        item={item}
        index={index}
        onPress={(d, i) =>
          this.props.navigation.navigate('GroupDetails', {
            item: {groupData: item, joined: item?.joined},
          })
        }
        onPressNotification={this.handleNotification}
        onPressGroup={this.onPressGroup}
        onPressImage={this.onPressImage}
        notificatoionIconShow={item?.joined}
      />
    );
  };
  onPressGroup = (item, index) => {
    this.props.navigation.navigate('GroupInformation', {
      groupData: item,
      mediaPost: item?.joined && '2',
    });
  };
  onPressImage = (item, index) => {
    console.log('item ->', item);
    
    this.props.navigation.navigate('GroupMember', {groupData: item});
  };
  handleNotification = async ({item, index}) => {
    await this.props.manageNotification(item?.id);
    if (this.props.notification) {
      this.state.groupsData[index].is_notification =
        !this.state.groupsData[index].is_notification;
      this.setState({groupsData: this.state.groupsData});
    } else {
      // Alert.alert(getLocalText('ErrorMsgs.Unable_to_Reach'));
    }
  };
  //refresh groups
  handleRefresh = async () => {
    this.setState({
      refreshing: true,
      page: 1,
      selectCategory: this.state.selectCategory ? this.state.selectCategory : 0,
    });
    await this.props.getGroups('new', this.state.selectedCategoryId, 1);
    this.setState({
      groupsData: this.props.groupList.data,
      refreshing: false,
      // selectCategory: this.state.selectCategory ? this.state.selectCategory : 0,
    });
  };
  renderFooter = item => {
    if (!this.state.loadmore) {
      return null;
    } else {
      return (
        <ScrollView>
          {[1].map((_, i) => (
            <View
              key={i.toString()}
              style={[styles.postCard, {marginHorizontal: scale(0)}]}>
              <GroupCardLoader />
            </View>
          ))}
        </ScrollView>
      );
    }
  };
  loadMore = async () => {
    if (this.props.groupList) {
      if (this.state.page <= this.props.groupList.total_page && !loadMoreData) {
        let page = this.state.page + 1;
        if (page < this.props.groupList.total_page) {
          this.setState({loadmore: true});
          loadMoreData = true;
          await this.props.getGroups('new', null, page, false);
          let data = [...this.state.groupsData, ...this.props.groupList.data];
          this.setState(
            {
              groupsData: data,
              loadmore: false,
              page: page,
            },
            () => {
              loadMoreData = false;
            },
          );
        }
      } else {
        this.setState({loadmore: false});
      }
    }
  };

  loadData = () => (
    <ActivityIndicator
      size="large"
      color={theme.colors.blue}
      style={styles.center}
    />
  );

  handleSearch = async txt => {
    let searchtxt = txt;
    let searchType = 'group';

    if (searchtxt) {
      this.setState({searchDataLoading: true});
      try {
        let frmdata = new FormData();
        frmdata.append('search', searchtxt);
        frmdata.append('type', searchType);
        let searchRes = await postAPICall(API.search, frmdata);
        if (searchRes.success) {
          this.setState({
            searchData: searchRes?.data?.groups,
            searchDataLoading: false,
          });
        }
      } catch (error) {
        this.setState({
          searchData: [],
          searchDataLoading: false,
        });
      }
    } else {
      this.setState({
        searchData: this.state.groupsData,
        searchDataLoading: false,
      });
    }
  };

  //close search model
  searchClose = () => {
    this.setState({searchModel: !this.state.searchModel});
  };
  notificationPress = async () => {
    this.props.navigation.navigate('Notification');
  };
  render() {
    const {
      categories,
      loadCategories,
      groupsData,
      groupdataloading,
      searchModel,
      popUpModel,
      searchData,
      searchText,
    } = this.state;

    const {notificationBell} = this.props;
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <SearchBar
          {...this.props}
          onNotificationPress={() => {
            this.notificationPress();
          }}
          bellColor={
            notificationBell ? theme.colors.blue : theme.colors.darkGrey
          }
          customSearch
          notificationBadge={notificationBell}
          onSearchPress={() =>
            this.setState({searchModel: !this.state.searchModel})
          }
          onSearchText={txt => {
            this.setState({searchText: txt});
            this.handleSearch(txt);
          }}
        />
        <Label title={getLocalText('Groups.categories')} style={styles.label} />
        <View>
          <FlatList
            data={categories}
            horizontal
            extraData={this.state}
            keyExtractor={(_, index) => index.toString()}
            renderItem={this.renderCategories}
            contentContainerStyle={styles.categoriesList}
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.loaddingCon}>
                {loadCategories
                  ? this.loadData()
                  : Config.NO_DATA_COMPO(loadCategories)}
              </View>
            )}
          />
        </View>
        <View style={styles.recentView}>
          <Label title={getLocalText('Groups.recentGroups')} />
          <View style={styles.rowDirectionStyle}>
            <TouchableOpacity onPress={this.handlePopUpModel}>
              <Icon
                name={'help-circle'}
                color={theme.colors.blue}
                size={scale(20)}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{marginLeft: scale(10)}}
              onPress={this.toggleFilterModal}>
              <SVGRecent />
            </TouchableOpacity>
          </View>
        </View>
        <PopUpModel
          isVisible={popUpModel}
          title={getLocalText('Information.searchingFieldtitle')}
          description={getLocalText('Information.searchingFielddisc')}
          close={this.handlePopUpModel}
        />
        <View
          style={{
            height:
              this.props.createGroupCount === 0
                ? theme.SCREENHEIGHT * 0.4
                : theme.SCREENHEIGHT * 0.47,
          }}>
          {groupdataloading ? (
            <ScrollView>
              {[1, 2, 3, 4].map((_, i) => (
                <View key={i.toString()} style={[styles.postCard]}>
                  <GroupCardLoader />
                </View>
              ))}
            </ScrollView>
          ) : (
            <FlatList
              data={searchText.length ? searchData : groupsData}
              extraData={(this.state, this.props)}
              keyExtractor={(_, index) => index.toString()}
              renderItem={this.renderGroups}
              contentContainerStyle={styles.groupsData}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.loaddingCon1}>
                  {groupdataloading
                    ? this.loadData()
                    : Config.NO_DATA_COMPO(
                        groupdataloading,
                        getLocalText('Groups.noGroup'),
                      )}
                </View>
              )}
              ListFooterComponent={this.renderFooter.bind(this)}
              onEndReachedThreshold={0.2}
              onEndReached={this.loadMore}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this.handleRefresh}
                />
              }
            />
          )}
        </View>
        {this.props.createGroupCount === 0 ? (
          <Button
            helpColor={theme.colors.white}
            onPress={() =>
              this.props.navigation.navigate('CreateGroup', {
                categories: categories,
              })
            }
            title={getLocalText('Groups.group')}
            style={[
              styles.btn1,
              {
                borderColor: theme.colors.blue,
              },
            ]}
            titleStyle={{color: theme.colors.white}}
          />
        ) : null}

        <FilterGroups
          isVisible={this.state.isFilterModal}
          toggleFilterModal={this.toggleFilterModal}
          All={() => {
            this.getGroupsList();
            this.setState({isFilterModal: false});
          }}
          {...this.state}
        />
        <SearchModel isVisible={searchModel} closeSearch={this.searchClose} />
        <OfflineModel />
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.31),
    right: -(theme.SCREENHEIGHT * 0.39),
    transform: [{rotate: '75deg'}],
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.47),
    left: -(theme.SCREENHEIGHT * 0.36),
    transform: [{rotate: '75deg'}],
  },
  center: {alignSelf: 'center'},
  label: {
    marginLeft: scale(18),
    marginTop: scale(27),
    marginBottom: scale(10),
  },
  categoryView: {
    backgroundColor: theme.colors.white,
    width: theme.SCREENWIDTH / 2.4,
    height: theme.SCREENWIDTH / 3.5,
    marginHorizontal: scale(5),
    borderRadius: scale(17),
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  selectCategoryView: {
    backgroundColor: theme.colors.white,
    width: theme.SCREENWIDTH / 2.4,
    height: theme.SCREENWIDTH / 3.5,
    marginHorizontal: scale(5),
    borderRadius: scale(17),
    alignItems: 'center',
    justifyContent: 'space-evenly',
    borderWidth: 1,
    borderColor: theme.colors.blue,
  },
  groupsData: {
    paddingHorizontal: scale(13),
    paddingBottom: scale(30),
  },
  circle: {
    width: scale(68),
    height: scale(68),
    borderRadius: scale(34),
    backgroundColor: theme.colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesList: {
    paddingHorizontal: scale(13),
    paddingVertical: scale(5),
    height: theme.SCREENWIDTH / 2.7,
  },
  categoriesText: {
    textAlign: 'center',
    fontSize: scale(12),
    justifyContent: 'center',
    fontFamily: theme.fonts.rubikNormal,
  },
  pleaseWaitText: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scale(100),
  },
  recentView: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: scale(18),
    marginBottom: scale(20),
  },
  loaddingCon: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: theme.SCREENWIDTH,
  },
  loaddingCon1: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: theme.SCREENWIDTH,
    height: theme.SCREENHEIGHT / 3,
  },
  btn1: {
    position: 'absolute',
    bottom: 14,
    marginHorizontal: scale(10),
    paddingVertical: scale(5),
    width: theme.SCREENWIDTH * 0.9,
    borderRadius: scale(40),
    marginRight: 10,
    backgroundColor: theme.colors.blue,
  },
  rowDirectionStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postCard: {
    marginHorizontal: scale(18),
    borderRadius: scale(9),
    padding: scale(11),
    marginBottom: scale(11),
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.16,
    shadowRadius: 1.2,
    elevation: 1,
    backgroundColor: theme.colors.white,
  },
});

const mapStateToProps = state => {
  const groupList = state.groupsReducer.group_list;
  const createGroupCount = state.UserInfo.creaetedGroupCount;
  const notification = state.groupsReducer.groupNotication;
  const islogin = state.AppReducer.loginstatus;
  const notificationBell = state.UserInfo.notificationBellIcon;
  return {groupList, notification, createGroupCount, islogin, notificationBell};
};
export default connect(mapStateToProps, {
  getGroups,
  categoryFilterGroups,
  manageNotification,
})(Groups);
