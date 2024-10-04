import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Platform,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import Icon from 'react-native-vector-icons/Feather';
import {connect} from 'react-redux';
import FastImage from 'react-native-fast-image';
import {
  Button,
  InputBox,
  HeaderView,
  BackgroundChunk,
  Title,
  Label,
  Error,
  MediaOptions,
  Loader,
} from '../Components';
import {getLocalText} from '../Locales/I18n';
import {scale, theme, imagesOptions, Validation} from '../Utils';
import externalStyle from '../Css';
import {API, getAPICall, postAPICall} from '../Utils/appApi';
import {getJoinGroupCount, CreatedGroupCount} from '../Redux/Actions';

class CreateGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyboardStatus: false,
      groupname: '',
      groupnameErr: '',
      categoriesErr: '',
      imageErr: '',
      groupImage: '',
      mediaOption: false,
      categories: '',
      selectedCategorie: '',
      groupDetails: '',
      groupDetailsErr: '',
      groupRule: '',
      groupRuleErr: '',
      loadding: false,
      open: false,
      teamData: [],
      selectedTeam: '',
      groupInfo:
        this.props.route.params.data === undefined
          ? ''
          : this.props.route.params.data,
      cityErrorMsg: '',
    };
  }
  componentDidMount() {
    this.getCategories();
    this.setGroupDetails();
    this.getTeam();
  }
  setGroupDetails = () => {
    let {groupInfo} = this.state;
    if (this?.props?.route?.params?.data !== undefined) {
      this.setState({
        groupname: groupInfo?.name,
        groupDetails: groupInfo?.description,
        groupImage: {
          uri: groupInfo?.image?.small,
          type: 'image/jpeg',
          name: 'testing.png',
        },
        selectedCategorie: groupInfo?.category?.id,
        groupRule: groupInfo?.rules,
        selectedTeam: groupInfo?.team,
      });
    } else {
      null;
    }
  };
  handleInput = (text, key, keyErr) => {
    this.setState({
      [key]: text,
      [keyErr]: '',
    });
  };
  //category of groups
  getCategories = async () => {
    // if (
    //   this.props.route.params.data === '' ||
    //   this.props.route.params.data === undefined ||
    //   this.state.categories === null
    // ) {
    let success = await getAPICall(API.category);
    if (success.error) {
    } else {
      this.setState({
        categories: success.data,
        loadCategories: false,
      });
    }
    // }
  };
  handleMediaOptions = () => {
    this.setState({mediaOption: !this.state.mediaOption});
  };
  openImagePicker = () => {
    ImagePicker.openPicker({
      imagesOptions,
      mediaType: 'photo',
      compressImageQuality: 0.8,
    }).then((res) => {
      ImageResizer.createResizedImage(res.path, 600, 600, 'JPEG', 30, 0)
        .then((compressedImage) => {
          this.setState({
            groupImage: {
              uri:
                Platform.OS === 'ios'
                  ? compressedImage.path
                  : compressedImage.uri,
              type: 'image/jpeg',
              name: compressedImage.name,
            },
            mediaOption: false,
          });
        })
        .catch((err) => {
          this.showError(err);
        });
    });
  };
  openCamera = () => {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
    }).then((image) => {
      ImageResizer.createResizedImage(image.path, 600, 600, 'JPEG', 30, 0)
        .then((compressedImage) => {
          this.setState({
            groupImage: {
              uri:
                Platform.OS === 'ios'
                  ? compressedImage.path
                  : compressedImage.uri,
              type: 'image/jpeg',
              name: compressedImage.name,
            },
            mediaOption: false,
          });
        })
        .catch((err) => {
          this.showError(err);
        });
    });
  };
  validateForm = () => {
    let error = true;
    this.setState({
      imageErr: '',
      groupnameErr: '',
      cityErrorMsg: '',
    });

    if (this.state.groupImage.length === 0) {
      this.setState({imageErr: Validation.MSG_VALID.profile_pic});
      error = false;
    }

    if (!Validation.validateEmpty(this.state.groupname)) {
      this.setState({groupnameErr: Validation.MSG_VALID.groupname});
      error = false;
    }
    if (!Validation.validateEmpty(this.state.groupDetails)) {
      this.setState({groupDetailsErr: Validation.MSG_VALID.groupDetailsErr});
    }
    // if (!Validation.validateEmpty(this.state.selectedTeam.toString())) {
    //   this.setState({cityErrorMsg: Validation.MSG_VALID.chooseCity});
    // }
    return error;
  };
  //show categories
  renderCategories = ({item, index}) => {
    var ImageSet = item?.image.original;
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({selectedCategorie: item?.id});
        }}
        style={[
          styles.categoryView,
          externalStyle.shadow,
          {
            borderColor:
              item?.id === this.state.selectedCategorie
                ? theme.colors.blue
                : theme.colors.transparent,
            borderWidth: scale(1),
          },
        ]}>
        <View style={styles.circle}>
          <FastImage
            source={{uri: ImageSet}}
            resizeMode={FastImage.resizeMode.contain}
            style={styles.categoriesImg}
          />
        </View>
        <View style={styles.catView}>
          <Label
            numberOfLines={2}
            title={item?.name}
            style={[
              styles.categoriesText,
              {
                fontWeight:
                  item?.id === this.state.selectedCategorie ? '700' : '',
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  //create group
  createGroup = async () => {
    if (this.validateForm()) {
      if (this.state.selectedCategorie === '') {
        Alert.alert(getLocalText('ErrorMsgs.category'));
      } else {
        let groupData = new FormData();
        groupData.append('name', this.state.groupname);
        groupData.append('image', this.state.groupImage);
        groupData.append('category_id', this.state.selectedCategorie);
        groupData.append('description', this.state.groupDetails);
        groupData.append('rules', this.state.groupRule);
        // groupData.append('team_id', this.state.selectedTeam.id);
        this.setState({loadding: true});
        let createGroupResponse = await postAPICall(API.groupCreate, groupData);
        if (createGroupResponse.success) {
          this.props.getJoinGroupCount(createGroupResponse.data.join_count);
          this.props.CreatedGroupCount(this.props.created_g_count + 1);
          setTimeout(() => {
            this.setState({loadding: false});
            this.props.navigation.navigate('UserData');
          }, 300);
        } else {
          this.setState({loadding: false});
          Alert.alert(createGroupResponse.errorMsg);
        }
      }
    }
  };
  updateGroup = async () => {
    if (this.validateForm()) {
      if (this.state.selectedCategorie === '') {
        Alert.alert(getLocalText('ErrorMsgs.category'));
      } else {
        let GroupId = this.props.route.params?.data.id;
        let editGroupForm = new FormData();
        editGroupForm.append('name', this.state.groupname);
        editGroupForm.append('image', this.state.groupImage);
        editGroupForm.append('category_id', this.state.selectedCategorie);
        editGroupForm.append('description', this.state.groupDetails);
        editGroupForm.append('rules', this.state.groupRule);
        // editGroupForm.append('team_id', this.state.selectedTeam.id);
        editGroupForm.append('_method', 'PATCH');
        this.setState({loadding: true});
        let editGroup = await postAPICall(
          API.groupCreate + '/' + GroupId,
          editGroupForm,
        );
        if (editGroup.success) {
          this.props.getJoinGroupCount(editGroup.data.join_count);
          setTimeout(() => {
            this.setState({loadding: false});
            this.props.navigation.navigate('Groups');
          }, 300);
        } else {
          this.setState({loadding: false});
          Alert.alert(editGroup.errorMsg);
        }
      }
    }
  };

  getTeam = async () => {
    try {
      let response = await getAPICall(API.apiteam);
      this.setState({teamData: response.data});
    } catch (error) {}
  };

  handleTeam = (item) => {
    this.setState({selectedTeam: item, open: false});
  };

  handleDropdown = () => {
    this.setState({open: !this.state.open, cityErrorMsg: ''});
  };

  render() {
    let {categories, loadding} = this.state;
    return (
      <View
        style={externalStyle.container}
        onStartShouldSetResponder={(event) => {
          this.setState({open: false});
        }}>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView
          {...this.props}
          isHelpIcon={true}
          isCreateGroup
          title={getLocalText(
            this.props.route.params.data === undefined
              ? 'Groups.createGroup'
              : 'Group.editGroup',
          )}
        />
        <ScrollView
          nestedScrollEnabled={true}
          style={externalStyle.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollCon}>
          <View>
            <Title
              title={getLocalText(
                this.props.route.params.data === undefined
                  ? 'Groups.createGroup'
                  : 'Group.editGroup',
              )}
              style={styles.title}
            />
            <Label
              title={getLocalText('LoginSignup.setimage')}
              style={styles.label}
            />
            <View style={styles.imageContainer}>
              {this.state.groupImage !== '' ? (
                <FastImage
                  source={this.state.groupImage}
                  style={styles.image}
                />
              ) : (
                <View style={[styles.imageCon, externalStyle.shadow]}>
                  <Icon
                    name="plus"
                    color={theme.colors.grey3}
                    size={scale(24)}
                  />
                </View>
              )}

              <Button
                onPress={() => {
                  this.handleMediaOptions();
                }}
                style={[
                  styles.imageButton,
                  {
                    backgroundColor:
                      this.state.groupImage !== ''
                        ? theme.colors.grey2
                        : theme.colors.blue,
                  },
                ]}
                title={
                  this.state.groupImage !== ''
                    ? getLocalText('LoginSignup.editimage')
                    : getLocalText('LoginSignup.selectimage')
                }
              />
            </View>
            {this.state.groupImage === '' ? (
              <Error
                error={this.state.imageErr}
                style={{
                  top: scale(-25),
                  marginLeft: theme.SCREENWIDTH * 0.4,
                }}
              />
            ) : null}
          </View>
          <Label
            title={getLocalText('Groups.groupname')}
            style={{marginLeft: scale(30)}}
          />
          <InputBox
            style={{marginBottom: scale(0)}}
            inputStyle={styles.inputStyle}
            value={this.state.groupname}
            placeholder={getLocalText('Groups.groupname')}
            onChangeText={(text) =>
              this.handleInput(text, 'groupname', 'groupnameErr')
            }
            numberOfLines={3}
          />
          {this.state.groupnameErr.length !== 0 ? (
            <Error error={this.state.groupnameErr} style={[styles.errorSty]} />
          ) : null}
          <View style={[styles.row]}>
            <Label
              title={getLocalText('Group.groupinfo')}
              style={[styles.label]}
            />
          </View>
          <InputBox
            placeholder={getLocalText('Group.groupinfo')}
            value={this.state.groupDetails}
            onChangeText={(text) =>
              this.handleInput(text, 'groupDetails', 'groupDetailsErr')
            }
            multiline
            numberOfLines={2}
            style={styles.inputMainContain}
            textAlignVertical="top"
            inputStyle={styles.inputStyleMul}
          />
          {this.state.groupDetailsErr.length !== 0 ? (
            <Error error={this.state.groupDetailsErr} style={styles.errorSty} />
          ) : null}
          <View style={[styles.row]}>
            <Label
              title={getLocalText('Group.groupRules')}
              style={[styles.label]}
            />
          </View>
          <InputBox
            placeholder={getLocalText('Group.groupRules')}
            value={this.state.groupRule}
            onChangeText={(text) =>
              this.handleInput(text, 'groupRule', 'groupRuleErr')
            }
            multiline
            numberOfLines={2}
            style={styles.inputMainContain}
            textAlignVertical="top"
            inputStyle={styles.inputStyleMul}
          />

          <View style={styles.listCon}>
            <Label
              title={getLocalText('Groups.categorie')}
              style={[
                {
                  marginTop: scale(5),
                },
              ]}
            />
            <ScrollView
              showsHorizontalScrollIndicator={false}
              horizontal={true}
              nestedScrollEnabled={true}
              style={styles.flatListContainer}>
              <FlatList
                nestedScrollEnabled={true}
                data={categories}
                numColumns={2}
                extraData={this.state}
                keyExtractor={(_, index) => index.toString()}
                renderItem={this.renderCategories}
                showsHorizontalScrollIndicator={false}
                columnWrapperStyle={styles.flatListColumnWraper}
                style={styles.flatListDataContainer}
                scrollEnabled={false}
                contentContainerStyle={styles.flatListContentContainerStyle}
              />
            </ScrollView>
          </View>
          <Button
            style={{marginBottom: scale(60)}}
            onPress={() => {
              this.props.route.params.data === undefined
                ? this.createGroup()
                : this.updateGroup();
            }}
            title={getLocalText('LoginSignup.confirm')}
          />
        </ScrollView>

        <MediaOptions
          isVisible={this.state.mediaOption}
          onPressCamera={() => {
            this.openCamera();
          }}
          onPressGallery={() => {
            this.openImagePicker();
          }}
          signup={true}
          close={() => {
            this.handleMediaOptions();
          }}
        />

        <Loader loading={loadding} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    marginLeft: scale(30),
    marginTop: theme.SCREENHEIGHT * 0.01,
    marginBottom: theme.SCREENHEIGHT * 0.01,
  },
  scrollCon: {
    paddingBottom: scale(20),
  },
  imageContainer: {
    marginHorizontal: scale(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: scale(22),
  },
  label: {
    marginLeft: scale(30),
    marginTop: scale(20),
  },
  text: {
    fontSize: scale(13),
    marginLeft: scale(30),
    color: theme.colors.black,
    fontFamily: theme.fonts.muktaRegular,
  },
  imageCon: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
  },
  imageButton: {width: scale(160), marginHorizontal: 0, marginBottom: 0},
  image: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
  },
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.25),
    left: -(theme.SCREENHEIGHT * 0.55),
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.4),
    right: -(theme.SCREENHEIGHT * 0.42),
  },
  categoryView: {
    backgroundColor: theme.colors.white,
    width: theme.SCREENWIDTH / 2.5,
    height: theme.SCREENWIDTH / 3.3,
    marginRight: scale(10),
    borderRadius: scale(15),
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: scale(5),
    overflow: 'hidden',
    paddingTop: scale(8),
    paddingBottom: scale(6),
  },
  catView: {
    justifyContent: 'center',
    width: '95%',
    alignSelf: 'center',
    paddingBottom: 0,
  },
  circle: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(34),
    backgroundColor: theme.colors.grey9,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  categoriesText: {
    textAlign: 'center',
    fontSize: scale(12),
    marginTop: scale(2),
    width: '95%',
    fontFamily: theme.fonts.rubikNormal,
  },
  listCon: {
    height: '31.5%',
    overflow: 'scroll',
    marginLeft: scale(30),
    marginTop: scale(15),
    alignSelf: 'center',
  },
  flatListContainer: {
    height: theme.SCREENWIDTH / 1.5,
  },
  flatListDataContainer: {
    width: null,
    height: (theme.SCREENWIDTH / 3) * 2,
    marginTop: scale(5),
  },
  flatListContentContainerStyle: {
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  flatListColumnWraper: {
    flexDirection: 'column',
  },
  categoriesImg: {
    height: scale(40),
    width: scale(40),
  },
  inputStyle: {
    padding: scale(7),
  },
  inputMainContain: {
    marginBottom: scale(0),
    paddingVertical: scale(5),
    height: scale(75),
  },
  errorSty: {
    marginLeft: scale(30),
    alignSelf: 'flex-start',
  },
  inputStyleMul: {
    padding: scale(7),
    textAlign: 'left',
  },
});

const mapStateToProps = (state) => {
  const userData = state.UserInfo.data;
  const created_g_count = state.UserInfo.creaetedGroupCount;
  return {userData, created_g_count};
};
export default connect(mapStateToProps, {getJoinGroupCount, CreatedGroupCount})(
  CreateGroup,
);
