import React, {Component} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {isIphoneX} from 'react-native-iphone-x-helper';
import Icon from 'react-native-vector-icons/Feather';
import {getLocalText} from '../Locales/I18n';
import {scale, theme, images} from '../Utils';
import {Label, PopUpModel} from './index';
import externalStyle from '../Css';

const searchOptions = [
  {
    id: 1,
    title: getLocalText('GroupInfo.user'),
  },
  {
    id: 2,
    title: getLocalText('GroupInfo.post'),
  },
  {
    id: 3,
    title: getLocalText('UserData.group'),
  },
];

export default class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: false,
      searchText: '',
      category: '',
      popUpModel: false,
    };
  }
  handleCategory = (data) => {
    this.setState({category: data});
    this.props.category(data);
  };

  handlePopUpModel = () => {
    this.setState({popUpModel: !this.state.popUpModel});
  };

  render() {
    const {
      onNotificationPress,
      style,
      onSearchPress,
      image,
      options,
      onPressOptions,
      onSearchText,
      searchText,
      customSearch,
      hideSearch,
      groupDetails,
      isHelpIcon,
      bellColor,
      isTabshow,
      notificationBadge,
      onFocus,
    } = this.props;
    const {search, popUpModel} = this.state;

    return (
      <>
        <View style={[styles.searchView, style]}>
          <PopUpModel
            isVisible={popUpModel}
            title={getLocalText('Information.managingGrouptitle')}
            description={getLocalText('Information.managingGroupdisc')}
            close={this.handlePopUpModel}
          />
          <View style={[styles.row, styles.alignCenter]}>
            {image && (
              <TouchableOpacity
                onPress={() => {
                  image === undefined
                    ? this.props.navigation.navigate('Timeline')
                    : this.props.navigation.goBack();
                }}>
                <Icon
                  name="chevron-left"
                  size={scale(22)}
                  color={theme.colors.blue}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              disabled={this.props?.route?.name === 'Timeline' && true}
              onPress={() => {
                image === undefined
                  ? this.props.navigation.navigate('Timeline')
                  : this.props.navigation.goBack();
              }}>
              <FastImage
                source={image === undefined ? images.AppLogo : {uri: image}}
                style={[styles.logo, image && {left: scale(2)}]}
              />
            </TouchableOpacity>
          </View>
          {search ? (
            <TextInput
              ref={(ref) => (this.inputText = ref)}
              style={[
                styles.input,
                {
                  width: groupDetails
                    ? theme.SCREENWIDTH / 2
                    : theme.SCREENWIDTH / 1.75,
                },
              ]}
              onFocus={onFocus}
              value={searchText}
              onChangeText={onSearchText}
            />
          ) : null}

          <View style={styles.row}>
            {hideSearch ? null : (
              <TouchableOpacity
                onPress={() => {
                  customSearch === undefined
                    ? onSearchPress
                    : // this.inputText.focus();
                      this.setState({search: !this.state.search});
                  onSearchText('');
                }}
                style={styles.searchIcon}>
                <Icon
                  name={search ? 'x' : 'search'}
                  color={search ? theme.colors.blue : theme.colors.darkGrey}
                  size={scale(21)}
                />
              </TouchableOpacity>
            )}
            <View style={notificationBadge && styles.dotView}>
              <TouchableOpacity
                onPress={onNotificationPress}
                style={styles.searchIcon1}>
                <Icon name={'bell'} color={bellColor} size={scale(21)} />
              </TouchableOpacity>
              {notificationBadge && <View style={styles.dotStyle} />}
            </View>
            {isHelpIcon && (
              <TouchableOpacity onPress={this.handlePopUpModel}>
                <Icon
                  name={'help-circle'}
                  size={scale(20)}
                  color={theme.colors.blue}
                />
              </TouchableOpacity>
            )}
            {options && (
              <TouchableOpacity
                style={styles.alignEnd}
                onPress={() => {
                  onPressOptions();
                }}>
                <Icon
                  name="more-vertical"
                  color={theme.colors.darkGrey}
                  size={scale(19)}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {search && (
          <View style={styles.searchSubView}>
            {isTabshow && (
              <View style={styles.fillterCon}>
                <Label
                  title={getLocalText('Timeline.searchfor').toUpperCase()}
                  style={{fontSize: scale(10)}}
                />
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContain}>
                  {searchOptions.map((data, index) => {
                    return (
                      <TouchableOpacity
                        key={index.toString()}
                        onPress={() => this.handleCategory(data.id)}
                        style={[
                          styles.fillterbtn,
                          externalStyle.shadow,
                          {
                            backgroundColor:
                              data.id === this.state.category
                                ? theme.colors.blue
                                : theme.colors.white,
                          },
                        ]}>
                        <Label
                          title={data.title}
                          style={{
                            color:
                              data.id !== this.state.category
                                ? theme.colors.blue
                                : theme.colors.white,
                          }}
                        />
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({category: '', search: false});
                      onSearchText('');
                    }}>
                    <Icon
                      name="x"
                      size={scale(22)}
                      color={theme.colors.darkGrey}
                    />
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  searchView: {
    marginHorizontal: scale(18),
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: isIphoneX() ? scale(45) : scale(20),
  },
  searchSubView: {
    marginHorizontal: scale(18),
    justifyContent: 'space-between',
  },
  row: {flexDirection: 'row', alignItems: 'center'},
  input: {
    width: theme.SCREENWIDTH / 1.9,
    borderBottomColor: theme.colors.grey1,
    borderBottomWidth: 1,
    paddingBottom: 3,
    fontFamily: theme.fonts.muktaMedium,
    color: theme.colors.grey2,
  },
  searchIcon: {
    left: scale(-10),
  },
  searchIcon1: {
    left: scale(-5),
  },
  logo: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    resizeMode: 'cover',
  },
  fillterCon: {
    marginVertical: scale(10),
  },
  fillterbtn: {
    paddingHorizontal: scale(25),
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(11),
    borderRadius: scale(20),
  },
  dotView: {
    marginTop: scale(10),
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  dotStyle: {
    width: scale(3.5),
    height: scale(3.5),
    borderRadius: scale(50),
    backgroundColor: theme.colors.red,
    marginTop: scale(5),
    marginLeft: scale(4),
  },
  scrollContain: {
    paddingHorizontal: scale(0),
    alignItems: 'center',
  },
  alignEnd: {
    alignSelf: 'flex-end',
  },
  alignCenter: {
    alignItems: 'center',
  },
});
