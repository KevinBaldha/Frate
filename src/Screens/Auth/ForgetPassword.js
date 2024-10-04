import React, {Component} from 'react';
import {Text, View, StyleSheet, TouchableOpacity, Keyboard} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {isIphoneX} from 'react-native-iphone-x-helper';
import {
  Button,
  InputBox,
  BackgroundChunk,
  ScreenContainer,
  Error,
  Label,
  Loader,
  OfflineModel,
  ResetPasswordModel,
  ErrorBox,
} from '../../Components';
import {getLocalText} from '../../Locales/I18n';
import {Api, scale, theme, Validation} from '../../Utils';
import {API, postAPICall} from '../../Utils/appApi';

class ForgetPassword extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      email: '',
      emailerr: '',
      msg: false,
      loadding: false,
      responseMessage: '',
      errorMessage: '',
      confirmModal: false,
      errorAlert: false,
    };
  }

  handleInput = (text, key, keyErr) => {
    this.setState({
      [key]: text,
      [keyErr]: '',
    });
  };

  validateForm = () => {
    let error = true;
    if (!Validation.validateEmpty(this.state.email)) {
      this.setState({emailerr: Validation.MSG_VALID.email});
      error = false;
    } else if (!Validation.validateEmail(this.state.email)) {
      this.setState({emailerr: Validation.MSG_VALID.email_valid});
      error = false;
    }

    return error;
  };

  handleRestPassword = async () => {
    if (this.validateForm()) {
      try {
        let forgetPassData = new FormData();
        this.setState({loadding: true});
        forgetPassData.append('email', this.state.email);

        let forgetPassword = await postAPICall(
          API.getRestPasswordToken,
          forgetPassData,
        );
        if (forgetPassword.success) {
          this.setState({loadding: false});
          this.setState({
            responseMessage: forgetPassword.message,
            confirmModal: true,
          });
        }
        if (forgetPassword.error) {
          this.setState({
            errorAlert: forgetPassword.error,
            errorMessage: forgetPassword.errorMsg,
          });
          this.setState({loadding: false});
        } else {
          this.setState({loadding: false});
        }
      } catch (error) {}
    }
  };

  onConfirmPress = () => {
    this.props.navigation.navigate('ResetPassword', {
      email: this.state.email,
    });
    this.setState({email: '', confirmModal: false});
  };

  handleAlert = () => {
    this.setState({
      errorAlert: false,
      errorMessage: '',
    });
  };

  render() {
    const {email, emailerr, responseMessage, confirmModal} = this.state;
    return (
      <ScreenContainer style={styles.container}>
        <OfflineModel />
        <BackgroundChunk style={styles.topImage} />
        <View style={styles.elevationStyle}>
          <BackgroundChunk style={styles.bottomImage} />
        </View>
        {this.state.msg ? (
          <View style={styles.msgCon}>
            <Icon
              name="checkmark-circle"
              size={scale(22)}
              color={theme.colors.white}
              style={{left: scale(15)}}
            />
            <Text style={styles.msgtxt}>
              {getLocalText('LoginSignup.chekemail')}
            </Text>
          </View>
        ) : null}
        <Text style={styles.titleTxt}>{'Fra·te'}</Text>
        <Label
          title={getLocalText('LoginSignup.forgetpasswordtxt')}
          style={styles.label}
        />
        <View style={styles.elevationStyle}>
          <InputBox
            placeholder={getLocalText('LoginSignup.email')}
            keyboardType="email-address"
            autoCapitalize={'none'}
            value={email}
            onChangeText={(text) => this.handleInput(text, 'email', 'emailerr')}
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>
        {emailerr.length !== 0 ? (
          <Error error={emailerr} style={{top: scale(-15)}} />
        ) : null}
        <View style={styles.elevationStyle}>
          <Button
            onPress={this.handleRestPassword}
            title={getLocalText('LoginSignup.forgetbtntxt')}
          />
        </View>
        <TouchableOpacity
          style={[styles.loginBtn]}
          onPress={() => {
            this.props.navigation.goBack();
          }}>
          <Text style={styles.loginText}>
            {getLocalText('LoginSignup.login')}
          </Text>
        </TouchableOpacity>
        {this.state.errorAlert ? (
          <ErrorBox
            loadding={this.state.errorAlert}
            error={this.state.errorMessage}
            close={this.handleAlert}
          />
        ) : null}
        <Loader loading={this.state.loadding} />
        {confirmModal && (
          <ResetPasswordModel
            title={responseMessage}
            close={this.onConfirmPress}
          />
        )}
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.35),
    left: -(theme.SCREENHEIGHT * 0.55),
  },
  titleTxt: {
    color: theme.colors.blue,
    fontFamily: theme.fonts.rubicMedium,
    fontSize: scale(35),
    textAlign: 'center',
  },
  loginBtn: {
    alignSelf: 'center',
  },
  elevationStyle: {elevation: scale(0)},
  loginText: {
    color: theme.colors.blue,
    fontSize: scale(14),
    fontFamily: theme.fonts.muktaSemiBold,
    textDecorationLine: 'underline',
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.5),
    right: -(theme.SCREENHEIGHT * 0.4),
  },
  label: {
    marginHorizontal: scale(30),
    marginTop: scale(15),
    textAlign: 'center',
    color: theme.colors.grey1,
    marginBottom: scale(40),
  },
  msgCon: {
    height: isIphoneX() ? scale(75) : scale(55),
    width: '100%',
    backgroundColor: theme.colors.green2,
    alignItems: 'center',
    position: 'absolute',
    flexDirection: 'row',
    top: 0,
    paddingTop: isIphoneX() ? scale(20) : 0,
  },
  msgtxt: {
    fontFamily: theme.fonts.rubikLight,
    fontWeight: '400',
    fontSize: scale(14),
    color: theme.colors.white,
    paddingLeft: scale(20),
    width: '100%',
    marginTop: scale(0),
  },
});

export default ForgetPassword;
