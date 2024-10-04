import React, {Component} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {isIphoneX} from 'react-native-iphone-x-helper';
import Icon from 'react-native-vector-icons/Feather';
import {scale, theme} from '../Utils';

export default class SearchBar1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: false,
      searchText: '',
    };
  }
  render() {
    const {
      onSearchText,
      searchText,
      onNotificationPress,
      style,
      title,
      navigation,
    } = this.props;
    const {search} = this.state;
    return (
      <View style={[styles.searchView, style]}>
        {title === undefined ? null : (
          <TouchableOpacity
            onPress={() =>
              search ? this.setState({search: false}) : navigation.goBack()
            }>
            <Icon
              name={search ? 'arrow-left' : 'chevron-left'}
              color={theme.colors.blue}
              size={scale(22)}
            />
          </TouchableOpacity>
        )}

        <Text
          style={[
            styles.titleTxt,
            !title || search
              ? {}
              : {
                  width: theme.SCREENWIDTH / 1.8,
                },
          ]}>
          {search ? '' : title}
        </Text>
        {search ? (
          <TextInput
            ref={(ref) => (this.inputText = ref)}
            style={[
              styles.input,
              {
                width: search
                  ? theme.SCREENWIDTH / 1.44
                  : theme.SCREENWIDTH / 1.9,
              },
            ]}
            value={searchText}
            onChangeText={onSearchText}
          />
        ) : null}

        <TouchableOpacity
          onPress={() => {
            title === undefined
              ? this.inputText.focus()
              : this.setState({search: true});
          }}>
          {/* <Icon name={'search'} color={theme.colors.grey1} size={scale(21)} /> */}
        </TouchableOpacity>
        {search ? null : (
          <TouchableOpacity
            onPress={search ? this.inputText.focus() : onNotificationPress}>
            <Icon
              name={search ? 'search' : 'bell'}
              color={theme.colors.grey1}
              size={scale(21)}
            />
          </TouchableOpacity>
        )}
      </View>
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
  titleTxt: {
    fontFamily: theme.fonts.muktaMedium,
    fontSize: scale(14),
    color: theme.colors.grey2,
    maxWidth: theme.SCREENWIDTH / 1.2,
  },
  input: {
    width: theme.SCREENWIDTH / 1.9,
    borderBottomColor: theme.colors.grey1,
    borderBottomWidth: 1,
    paddingBottom: 3,
    fontFamily: theme.fonts.muktaMedium,
    color: theme.colors.grey2,
  },
});
