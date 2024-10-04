import React, {Component} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {
  BackgroundChunk,
  Button,
  Error,
  ErrorBox,
  InputBox,
  Label,
  Loader,
  OfflineModel,
  ResetPasswordModel,
  ScreenContainer,
} from '../../Components';
import {Validation, scale, theme} from '../../Utils';
import {getLocalText} from '../../Locales/I18n';
import {API, postAPICall} from '../../Utils/appApi';

class ResetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enterToken: '',
      tokenErr: '',
      newPassword: '',
      newPwdErr: '',
      confirmPassword: '',
      confirmPwdErr: '',
      alertErr: '',
      errorAlert: false,
      confirmModal: false,
      loadding: false,
      responseMessage: '',
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
    if (this.state.enterToken.length !== 6) {
      this.setState({tokenErr: getLocalText('ErrorMsgs.token')});
      error = false;
    }
    if (!Validation.validateEmpty(this.state.newPassword)) {
      this.setState({newPwdErr: Validation.MSG_VALID.password});
      error = false;
    }
    if (!Validation.validateEmpty(this.state.confirmPassword)) {
      this.setState({
        confirmPwdErr: Validation.MSG_VALID.password,
      });
      error = false;
    } else if (this.state.newPassword !== this.state.confirmPassword) {
      this.setState({
        confirmPwdErr: Validation.MSG_VALID.passwordNotMatch,
      });
      error = false;
    }

    return error;
  };

  handleSubmit = async () => {
    try {
      if (this.validateForm()) {
        let resetFromData = new FormData();
        // this.setState({loadding: true});
        resetFromData.append('email', this.props.route.params.email);
        resetFromData.append('token', this.state.enterToken);
        resetFromData.append('password', this.state.newPassword);
        resetFromData.append(
          'password_confirmation',
          this.state.confirmPassword,
        );
        let success = await postAPICall(
          API.setRestPasswordToken,
          resetFromData,
        );
        this.setState({loadding: false});
        if (success.error) {
          this.handleAlert(success.errorMsg);
        } else {
          this.setState({
            responseMessage: success.message,
            confirmModal: true,
          });
        }
        this.setState({enterToken: '', newPassword: '', confirmPassword: ''});
      }
    } catch (error) {}
  };

  handleAlert = (msg) => {
    this.setState({errorAlert: !this.state.errorAlert, alertErr: msg});
  };

  onConfirmPress = () => {
    this.setState({confirmModal: false}, () => {
      this.props.navigation.navigate('Login');
    });
  };

  render() {
    const {
      enterToken,
      tokenErr,
      newPassword,
      newPwdErr,
      confirmPassword,
      confirmPwdErr,
      alertErr,
      confirmModal,
      loadding,
      errorAlert,
      responseMessage,
    } = this.state;
    return (
      <ScreenContainer style={styles.container}>
        <OfflineModel />
        <BackgroundChunk style={styles.topImage} />
        <View style={styles.elevationStyles}>
          <BackgroundChunk style={styles.bottomImage} />
        </View>
        <Text style={styles.titleTxt}>{'Fra·te'}</Text>
        <Label
          title={getLocalText('LoginSignup.Changeyourpassword')}
          style={styles.label}
        />
        <View style={styles.elevationStyles}>
          <InputBox
            placeholder={getLocalText('LoginSignup.enterToken')}
            value={enterToken}
            onChangeText={(text) =>
              this.handleInput(text, 'enterToken', 'tokenErr')
            }
          />
        </View>
        {tokenErr.length !== 0 ? (
          <Error error={tokenErr} style={{top: scale(-15)}} />
        ) : null}
        <InputBox
          placeholder={getLocalText('LoginSignup.password')}
          secureTextEntry={true}
          value={newPassword}
          onChangeText={(text) =>
            this.handleInput(text, 'newPassword', 'newPwdErr')
          }
        />
        {newPwdErr.length !== 0 ? (
          <Error error={newPwdErr} style={{top: scale(-15)}} />
        ) : null}
        <InputBox
          placeholder={getLocalText('LoginSignup.cpassword')}
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={(text) =>
            this.handleInput(text, 'confirmPassword', 'confirmPwdErr')
          }
        />
        {confirmPwdErr.length !== 0 ? (
          <Error error={confirmPwdErr} style={{top: scale(-15)}} />
        ) : null}
        <Button
          onPress={this.handleSubmit}
          title={getLocalText('LoginSignup.confirm')}
        />
        <Loader loading={loadding} />
        {errorAlert ? (
          <ErrorBox
            loadding={errorAlert}
            error={alertErr}
            close={this.handleAlert}
          />
        ) : null}
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
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.5),
    right: -(theme.SCREENHEIGHT * 0.4),
  },
  titleTxt: {
    color: theme.colors.blue,
    fontFamily: theme.fonts.rubicMedium,
    fontSize: scale(35),
    textAlign: 'center',
  },
  elevationStyles: {elevation: 0},
  label: {
    marginHorizontal: scale(30),
    marginTop: scale(15),
    textAlign: 'center',
    color: theme.colors.grey1,
    marginBottom: scale(40),
  },
});

export default ResetPassword;
