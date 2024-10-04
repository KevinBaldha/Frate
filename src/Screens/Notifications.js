import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import {Switch} from 'react-native-switch';
import {API, postAPICall} from '../Utils/appApi';
import {connect} from 'react-redux';
import {userPreferences} from '../Redux/Actions';
import {scale, theme} from '../Utils';
import {getLocalText} from '../Locales/I18n';
import {HeaderView, Label, ScreenContainer} from '../Components';
import * as RNLocalize from 'react-native-localize';
const locales = RNLocalize.getLocales();

class Notifications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      optionList: this.props?.getUserPreferences,
    };
  }

  getUserPreference = async (value, type) => {
    try {
      let formData = new FormData();
      formData.append('value', value);
      formData.append('type', type);
      let userResponse = await postAPICall(API.userPreference, formData);
      if (userResponse.success) {
        this.props.userPreferences(userResponse.data);
      } else {
        this.props.userPreferences(this.state.optionList);
      }
    } catch (error) {
      this.props.userPreferences(this.state.optionList);
    }
  };

  render() {
    return (
      <ScreenContainer>
        <HeaderView
          {...this.props}
          title={getLocalText('Settings.notifications')}
        />
        {this.state?.optionList?.map(
          (item, i) =>
            item?.is_show && (
              <View key={i.toString()} style={styles.container}>
                <Label
                  style={styles.labelStyle}
                  title={
                    locales[0].languageCode === 'en'
                      ? item?.en_title
                      : item?.fr_title
                  }
                />
                <Switch
                  value={item?.value !== 0 ? true : false}
                  onValueChange={(toggleValue) => {
                    this.state.optionList[i].value = toggleValue ? 1 : 0;
                    this.setState({optionList: this.state.optionList});
                    this.getUserPreference(toggleValue ? 1 : 0, item?.key);
                  }}
                  useNativeDriver={true}
                  circleBorderWidth={2}
                  renderActiveText={false}
                  renderInActiveText={false}
                  circleSize={scale(10)}
                  barHeight={scale(21)}
                  innerCircleStyle={{
                    borderColor:
                      item?.value !== 0
                        ? theme.colors.blue
                        : theme.colors.grey10,
                    backgroundColor:
                      item?.value !== 0
                        ? theme.colors.blue
                        : theme.colors.transparent,
                  }}
                  containerStyle={styles.switchView}
                  outerCircleStyle={{
                    marginLeft: scale(-1),
                  }}
                  backgroundActive={theme.colors.white2}
                  backgroundInactive={theme.colors.white2}
                  switchBorderRadius={scale(10)}
                  switchWidthMultiplier={3}
                />
              </View>
            ),
        )}
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(15),
    marginTop: scale(20),
  },
  labelStyle: {flex: 1},
  switchView: {
    width: scale(105),
    height: scale(105),
    borderColor: theme.colors.grey10,
    borderWidth: 2,
  },
});

const mapStateToProps = (state) => {
  const userData = state.UserInfo.data;
  const getUserPreferences = state.UserInfo.userPreferences;
  return {
    userData,
    getUserPreferences,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    userPreferences: (params) => dispatch(userPreferences(params)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
