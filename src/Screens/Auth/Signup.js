import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  StatusBar,
} from 'react-native';
import {connect} from 'react-redux';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  Button,
  InputBox,
  BackgroundChunk,
  HeaderView,
  Label,
  Title,
  Error,
  OfflineModel,
} from '../../Components';
import {getLocalText} from '../../Locales/I18n';
import {userData} from '../../Redux/Actions';
import {scale, theme, Validation} from '../../Utils';
import {API, getAPICall} from '../../Utils/appApi';

class Singup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
      checkErr: '',
      isEmpty: '',
      isInvalid: '',
      isFormProcess: false,
      selectedGender: '',
      genderError: '',
      country: [],
      fillterCountry: [],
      searchText: '',
      selectedCountry: '',
      countryError: '',
      signupData: [
        {
          title: 'LoginSignup.fname',
          value: '',
          valueErr: Validation.MSG_VALID.firstName,
          regex: /^(?!\s*$).+/,
          keyboardType: 'default',
          invalidErr: Validation.MSG_VALID.specialcharnotAllow,
        },
        {
          title: 'LoginSignup.lname',
          value: '',
          valueErr: Validation.MSG_VALID.lastName,
          regex: /^(?!\s*$).+/,
          keyboardType: 'default',
          invalidErr: Validation.MSG_VALID.specialcharnotAllow,
        },
        {
          title: 'LoginSignup.email',
          value: '',
          valueErr: Validation.MSG_VALID.email_valid,
          regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/,
          keyboardType: 'email-address',
          autoCapitalize: 'none',
        },
        {
          title: 'LoginSignup.password',
          value: '',
          valueErr: Validation.MSG_VALID.password,
          invalidErr: Validation.MSG_VALID.strongPassword,
          regex: '',
          secureTextEntry: true,
        },
        {
          title: 'LoginSignup.cpassword',
          value: '',
          valueErr: Validation.MSG_VALID.password,
          invalidErr: Validation.MSG_VALID.passwordNotMatch,
          secureTextEntry: true,
        },
      ],
      open: false,
    };
  }
  async componentDidMount() {
    this.getAllCountry();
  }
  getAllCountry = async () => {
    try {
      let countryRes = await getAPICall(API.getCountry);
      if (countryRes.success) {
        this.setState({
          country: countryRes.data,
          fillterCountry: countryRes.data,
        });
      } else {
      }
    } catch (error) {}
  };

  searchFilterFunction = text => {
    if (text) {
      const newData = this.state.fillterCountry.filter(function (item) {
        const itemData = item?.name
          ? item?.name.toUpperCase()
          : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      this.setState({fillterCountry: newData, searchText: text});
    } else {
      this.setState({
        fillterCountry: this.state.country,
        searchText: text,
      });
    }
  };

  dataChecker = (txt, item, index) => {
    const {isFormProcess} = this.state;
    if (isFormProcess) {
      if (!Validation.validateEmpty(item?.value)) {
        this.emptyError();
      }
    } else {
      if (!txt.match(item?.regex) && txt) {
        this.setState({
          isEmpty: '',
          isInvalid: index,
        });
      } else {
        this.emptyError();
      }
    }
  };

  emptyError = () => {
    this.setState({
      isEmpty: '',
      isInvalid: '',
    });
  };

  handleInput = (text, item, index) => {
    this.dataChecker(text, item, index);
    let updatedForm = this.state.signupData;
    updatedForm[index] = {...updatedForm[index], value: text};
    this.setState({
      signupData: updatedForm,
    });
  };

  handleSingup = () => {
    const {signupData, isFormProcess, isInvalid, isEmpty} = this.state;

    if (!isFormProcess) {
      this.setState({
        isFormProcess: true,
      });
    }
    if (isEmpty) {
      this.setState({
        isEmpty: '',
      });
    }

    if (isInvalid) {
      this.setState({
        isInvalid: '',
      });
    }

    let formData = {};
    let isFormDataValid = false;
    for (let index = 0; index < signupData.length; index++) {
      let item = signupData[index];
      let itemValues = signupData[index].value;
      let inputValue = itemValues.trim();
      if (item?.title === 'LoginSignup.email') {
        if (!Validation.validateEmpty(itemValues)) {
          this._handleformError('isEmpty', 'isInvalid', index);
          isFormDataValid = false;
          break;
        } else if (!Validation.validateEmail(itemValues)) {
          this._handleformError('isEmpty', 'isInvalid', index);
          isFormDataValid = false;
          break;
        }
      }
      if (inputValue) {
        if (item?.title !== 'LoginSignup.cpassword') {
          if (inputValue.match(item?.regex)) {
            formData = {...formData, ...{[item?.name]: inputValue}};
            isFormDataValid = true;
          } else {
            this._handleformError('isInvalid', 'isEmpty', index);
            isFormDataValid = false;
            break;
          }
        } else {
          if (inputValue !== signupData[index - 1].value) {
            this._handleformError('isInvalid', 'isEmpty', index);
            isFormDataValid = false;
            break;
          } else {
            isFormDataValid = true;
          }
        }
      } else {
        this._handleformError('isEmpty', 'isInvalid', index);
        isFormDataValid = false;
        break;
      }
    }
    let obj = {
      first_name: this.state.signupData[0].value,
      last_name: this.state.signupData[1].value,
      email: this.state.signupData[2].value,
      // phone_number: this.state.signupData[3].value,
      password: this.state.signupData[3].value,
      confirm_password: this.state.signupData[4].value,
      gender: this.state.selectedGender,
      // country: this.state.selectedCountry,
      type: 3,
    };

    if (isFormDataValid) {
      // if (this.state.selectedCountry === '') {
      //   this.setState({countryError: getLocalText('ErrorMsgs.selectCountry')});
      // } else
      if (this.state.checked && this.state.selectedGender !== '') {
        this.props.navigation.navigate('Signup1', {userDetail: obj});
      } else if (this.state.selectedGender === '') {
        this.setState({genderError: getLocalText('ErrorMsgs.gender')});
      } else {
        this.setState({checkErr: Validation.MSG_VALID.terms});
      }
      // if (this.state.checked && this.state.selectedGender !== '') {
      //   this.props.navigation.navigate('Signup1', {userDetail: obj});
      // } else if (this.state.selectedGender === '') {
      //   this.setState({genderError: getLocalText('ErrorMsgs.gender')});
      // } else {
      //   this.setState({checkErr: Validation.MSG_VALID.terms});
      // }
    }
  };

  renderError = (item, index) => {
    const {isEmpty, isInvalid, isFormProcess} = this.state;
    if (isInvalid === index) {
      return (
        <Error
          error={item?.invalidErr}
          style={{
            marginBottom: -scale(15),
            marginHorizontal: scale(30),
          }}
        />
      );
    }
    if (isFormProcess && isEmpty === index) {
      return (
        <Error
          error={item?.valueErr}
          style={{
            marginBottom: -scale(15),
            marginHorizontal: scale(30),
          }}
        />
      );
    }
    return null;
  };

  _handleformError(type, clearType, index) {
    this.setState({
      [type]: index,
      [clearType]: '',
    });
  }
  handleCountry = item => {
    this.setState({selectedCountry: item, open: false, countryError: ''});
  };
  handleDropdown = () => {
    this.setState({
      open: !this.state.open,
      searchText: '',
      fillterCountry: this.state.country,
      countryError: '',
    });
  };
  render() {
    const {checked, signupData, selectedGender, genderError} = this.state;
    return (
      <View
        style={styles.mainView}
        onStartShouldSetResponder={() => {
          this.setState({open: false});
        }}>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <StatusBar barStyle="dark-content" />

        <HeaderView
          {...this.props}
          title={getLocalText('LoginSignup.login')}
          //titleStyleMain={{width: '85%'}}
        />

        <KeyboardAwareScrollView
          enableAutomaticScroll={true}
          viewIsInsideTabBar={true}
          style={styles.keyboardavoid}
          enableOnAndroid={true}
          keyboardOpeningTime={false}
          contentInsetAdjustmentBehavior="scrollableAxes"
          enableResetScrollToCoords={true}
          horizontal={false}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps={'handled'}
          showsVerticalScrollIndicator={false}
          onStartShouldSetResponder={() => {
            this.setState({open: false});
          }}>
          <Title
            title={getLocalText('LoginSignup.create')}
            style={styles.title}
          />
          {signupData.map((item, index) => {
            return (
              <View
                key={index.toString()}
                onStartShouldSetResponder={() => {
                  this.setState({open: false});
                }}>
                <Label title={getLocalText(item?.title)} style={styles.label} />
                <InputBox
                  value={item?.value}
                  onChangeText={text => this.handleInput(text, item, index)}
                  style={styles.input}
                  // maxLength={item?.keyboardType === 'phone-pad' ? 10 : null}
                  keyboardType={item?.keyboardType}
                  secureTextEntry={item?.secureTextEntry ? true : false}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  autoCapitalize={
                    item?.autoCapitalize ? item?.autoCapitalize : true
                  }
                  inputStyle={{
                    color: theme.colors.grey2,
                    fontSize: scale(14),
                    fontFamily: theme.fonts.muktaMedium,
                  }}
                />
                {this.renderError(item, index)}
              </View>
            );
          })}
          <View style={styles.genderView}>
            <Label
              title={getLocalText('LoginSignup.gender')}
              style={{marginLeft: scale(5)}}
            />
            <View style={{flexDirection: 'row'}}>
              <View style={styles.row}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      selectedGender: 'Male',
                      genderError: '',
                    });
                  }}
                  style={[styles.checkBox]}>
                  <View
                    style={[
                      styles.checked,
                      {
                        backgroundColor:
                          selectedGender === 'Male'
                            ? theme.colors.blue
                            : theme.colors.while,
                      },
                    ]}
                  />
                </TouchableOpacity>
                <Label title={getLocalText('Post.male')} />
              </View>
              <View style={styles.row}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      selectedGender: 'Female',
                      genderError: '',
                    });
                  }}
                  style={[styles.checkBox]}>
                  <View
                    style={[
                      styles.checked,
                      {
                        backgroundColor:
                          selectedGender === 'Female'
                            ? theme.colors.blue
                            : theme.colors.while,
                      },
                    ]}
                  />
                </TouchableOpacity>
                <Label title={getLocalText('Post.female')} />
              </View>
              <View style={styles.row}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      selectedGender: 'Other',
                      genderError: '',
                    });
                  }}
                  style={[styles.checkBox]}>
                  <View
                    style={[
                      styles.checked,
                      {
                        backgroundColor:
                          selectedGender === 'Other'
                            ? theme.colors.blue
                            : theme.colors.while,
                      },
                    ]}
                  />
                </TouchableOpacity>
                <Label title={getLocalText('Post.othertxt')} />
              </View>
            </View>
            <Error error={genderError} style={{alignSelf: 'flex-start'}} />
          </View>
          <View style={styles.checkBoxCon}>
            <TouchableOpacity
              onPress={() => {
                this.setState({checked: true, checkErr: ''});
              }}
              style={[styles.checkBox]}>
              <View
                style={[
                  styles.checked,
                  {
                    backgroundColor: checked
                      ? theme.colors.blue
                      : theme.colors.while,
                  },
                ]}
              />
            </TouchableOpacity>
            <View style={{flexDirection: 'row'}}>
              <Text
                style={styles.terms}
                onPress={() => {
                  this.props.navigation.navigate('ContentPage', {
                    title: 'LoginSignup.privacy',
                    text: 'LoginSignup.terms1',
                  });
                }}>
                {getLocalText('LoginSignup.terms1')}
                <Text style={styles.terms1}>
                  {getLocalText('LoginSignup.terms2')}
                </Text>
              </Text>
              <Text
                style={styles.terms}
                onPress={() => {
                  this.props.navigation.navigate('ContentPage', {
                    title: 'LoginSignup.policy',
                    text: 'LoginSignup.terms3',
                  });
                }}>
                {getLocalText('LoginSignup.terms3')}
                <Text style={styles.terms1}>
                  {getLocalText('LoginSignup.terms4')}
                </Text>
              </Text>
            </View>
          </View>
          <Error error={this.state.checkErr} style={styles.error} />
          <Button
            onPress={() => {
              this.handleSingup();
            }}
            title={getLocalText('LoginSignup.confirm')}
            style={{marginTop: theme.SCREENHEIGHT * 0.055}}
          />

          <Label
            title={getLocalText('LoginSignup.signupInfo')}
            style={styles.notice}
          />
        </KeyboardAwareScrollView>
        <OfflineModel />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {flex: 1, justifyContent: 'flex-end'},
  input: {
    marginBottom: 0,
    borderColor: theme.colors.white2,
    overflow: 'hidden',
  },
  title: {
    marginLeft: scale(30),
    marginTop: theme.SCREENHEIGHT * 0.02,
    marginBottom: theme.SCREENHEIGHT * 0.01,
  },
  label: {marginLeft: scale(30), marginTop: scale(10), marginBottom: 2},
  terms: {
    fontSize: scale(11),
    fontFamily: theme.fonts.muktaMedium,
    color: theme.colors.grey2,
  },
  terms1: {
    color: theme.colors.blue,
  },
  checkBox: {
    backgroundColor: theme.colors.white,
    width: scale(25),
    height: scale(25),
    borderRadius: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(10),
  },
  error: {
    marginBottom: -scale(15),
    textAlign: 'left',
    marginHorizontal: scale(30),
  },
  checkBoxCon: {
    flexDirection: 'row',
    marginLeft: scale(30),
    alignItems: 'center',
    marginTop: theme.SCREENHEIGHT * 0.02,
  },
  genderView: {
    marginHorizontal: scale(23),
    marginTop: theme.SCREENHEIGHT * 0.02,
  },
  keyboardavoid: {flex: 1},
  checked: {
    backgroundColor: theme.colors.white,
    height: scale(15),
    width: scale(15),
    borderRadius: scale(10),
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
  notice: {
    marginLeft: scale(30),
    marginTop: scale(15),
    marginBottom: 2,
    fontSize: scale(11),
    width: '80%',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(6),
  },
});

const mapStateToProps = state => ({
  userInfo: state.UserInfo,
});

const mapDispatchToProps = dispatch => {
  return {
    userData: params => dispatch(userData(params)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Singup);
