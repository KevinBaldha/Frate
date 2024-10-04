import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {scale, theme} from '../Utils';

const InputBox = (props) => {
  const {
    multiline,
    value,
    keyboardType,
    placeholder,
    secureTextEntry,
    onChangeText,
    numberOfLines,
    style,
    inputStyle,
    maxLength,
    onFocus,
    onBlur,
    // passwordType,
    // passwordRegex,
    onSubmitEditing,
    blurOnSubmit,
    returnKeyType,
    Img,
    passwordIcon,
    autoCapitalize,
  } = props;
  const [showpassword, setShowpassword] = React.useState(false);
  return (
    <View style={[styles.inputContainer, style]}>
      <TextInput
        multiline={multiline}
        value={value}
        placeholderTextColor={theme.colors.grey1}
        keyboardType={keyboardType ? keyboardType : 'default'}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={
          secureTextEntry ? (!showpassword ? secureTextEntry : false) : false
        }
        style={[styles.input, inputStyle, styles.input2]}
        maxLength={maxLength}
        editable={props.editable}
        numberOfLines={numberOfLines}
        blurOnSubmit={blurOnSubmit}
        textAlignVertical={props.textAlignVertical}
        onSubmitEditing={onSubmitEditing}
        autoCorrect={false}
        returnKeyType={returnKeyType}
        textContentType={'oneTimeCode'}
        onFocus={onFocus}
        onBlur={onBlur}
        autoCapitalize={autoCapitalize}
      />
      {Img ? (
        <Icon
          name="lock"
          size={scale(20)}
          color={theme.colors.grey22}
          style={{marginRight: scale(10), marginTop: scale(10)}}
        />
      ) : null}
      {passwordIcon && (
        <TouchableOpacity
          onPress={() => setShowpassword(!showpassword)}
          style={styles.icon}>
          <Icon
            name={!showpassword ? 'eye' : 'eye-off'}
            size={scale(20)}
            color={theme.colors.darkGrey}
          />
        </TouchableOpacity>
      )}
      {/* {passwordType ? <Text style={styles.regex}>{passwordRegex}</Text> : null} */}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginHorizontal: scale(30),
    marginBottom: scale(19),
    height: theme.SCREENHEIGHT * 0.068,
    backgroundColor: theme.colors.white,
    borderRadius: scale(15),
    flexDirection: 'row',
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 1,
    elevation: 1,
    width: '83%',
    justifyContent: 'center',
  },
  icon: {
    marginRight: scale(10),
    alignSelf: 'center',
    position: 'absolute',
    right: scale(5),
  },
  input: {
    flex: 1,
    // minWidth: '30%',
    height: null,
    textAlign: 'center',
    fontFamily: theme.fonts.muktaMedium,
    fontSize: scale(12),
    color: theme.colors.black,
  },
  regex: {
    top: scale(10),
    right: 10,
    fontSize: scale(12),
    fontFamily: theme.fonts.muktaRegular,
  },
  input2: {width: Platform.OS === 'android' ? null : '100%'},
});

export default InputBox;
