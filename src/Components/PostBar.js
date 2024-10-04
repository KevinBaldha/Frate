import React, {Component} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Icon1 from 'react-native-vector-icons/Entypo';
import FastImage from 'react-native-fast-image';
import {scale, theme, images} from '../Utils';
import {getLocalText} from '../Locales/I18n';
import {DocumentsFile, Label} from './index';
import {checkValidUrl} from '../Utils/helper';

class PostBar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderIcons = () => {
    const {
      onPressEmoji,
      onPressKeyboard,
      onPressAttachment,
      onPressSend,
      emojiKeyboard,
      sendColor,
    } = this.props;
    return (
      <>
        {emojiKeyboard ? (
          <TouchableOpacity
            onPress={() => {
              onPressKeyboard();
              this.inputText.focus();
            }}>
            <Icon1
              name={'keyboard'}
              color={theme.colors.darkGrey}
              size={scale(20)}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onPressEmoji}>
            <Icon
              name={'smile'}
              color={theme.colors.darkGrey}
              size={scale(20)}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onPressAttachment}>
          <Icon
            name={'paperclip'}
            size={scale(20)}
            color={theme.colors.darkGrey}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressSend}>
          <Icon
            name={'send'}
            size={scale(20)}
            color={sendColor ? theme.colors.blue : theme.colors.darkGrey}
          />
        </TouchableOpacity>
      </>
    );
  };
  render() {
    const {
      style,
      value,
      removeImage,
      attachImages,
      onChangeText,
      profilePic,
      ShowGroup,
      group,
      hideGroup,
      onPressKeyboard,
    } = this.props;
    return (
      <View
        style={[
          styles.container,
          styles.shadow,
          style,
          {maxHeight: theme.SCREENHEIGHT * 0.4, elevation: 15},
        ]}>
        <View style={[styles.topView]}>
          <FastImage
            source={
              profilePic === '' ||
              profilePic === undefined ||
              !checkValidUrl(profilePic)
                ? images.profilepick
                : {uri: profilePic}
            }
            style={styles.userImage}
          />

          <TextInput
            ref={(ref) => (this.inputText = ref)}
            style={[
              styles.input,
              {
                width:
                  attachImages.length > 0 || value.length > 0 ? '85%' : '58%',
                maxHeight: theme.SCREENHEIGHT * 0.1,
              },
            ]}
            placeholder={getLocalText('Post.write')}
            placeholderTextColor={theme.colors.grey7}
            value={value}
            multiline={true}
            numberOfLines={3}
            onChangeText={onChangeText}
            textAlignVertical={'center'}
            onFocus={onPressKeyboard}
            showSoftInputOnFocus={this.props.emojiKeyboard ? false : true}
          />

          {attachImages?.length > 0 ? null : !value && this.renderIcons()}
        </View>
        <ScrollView>
          {attachImages && attachImages?.length > 0 ? (
            <View style={styles.imagesView}>
              {attachImages.map((d, i) => {
                if (d?.pdf) {
                  return (
                    <View key={i.toString()} style={styles.attechment}>
                      <DocumentsFile
                        item={d}
                        isAttach={true}
                        isVisible={true}
                      />
                      <TouchableOpacity
                        onPress={() => removeImage(d, i)}
                        style={[styles.crossView, styles.shadow]}>
                        <Icon
                          name="x"
                          size={scale(17)}
                          color={theme.colors.red1}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                } else if (d?.video) {
                  return (
                    <View
                      key={i.toString()}
                      style={[styles.imageView, styles.videoImageShow]}>
                      <Icon
                        name="video"
                        size={scale(35)}
                        color={theme.colors.blue0}
                      />
                      <TouchableOpacity
                        onPress={() => removeImage(d, i)}
                        style={[styles.crossView, styles.shadow]}>
                        <Icon
                          name="x"
                          size={scale(17)}
                          color={theme.colors.red1}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                } else {
                  return (
                    <View key={i.toString()} style={styles.imageView}>
                      <FastImage source={{uri: d.uri}} style={styles.image} />
                      <TouchableOpacity
                        onPress={() => removeImage(d, i)}
                        style={[styles.crossView, styles.shadow]}>
                        <Icon
                          name="x"
                          size={scale(17)}
                          color={theme.colors.red1}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                }
              })}
            </View>
          ) : null}
        </ScrollView>
        {}
        {value?.length > 0 || attachImages.length > 0 ? (
          <View style={{width: '100%', marginTop: scale(5)}}>
            {hideGroup ? null : (
              <TouchableOpacity style={styles.group} onPress={ShowGroup}>
                <Icon1
                  name={'link'}
                  color={theme.colors.grey6}
                  size={scale(20)}
                />
                <Label
                  title={
                    group === undefined || group.length === 0
                      ? getLocalText('UserData.group')
                      : group.name
                  }
                  style={{paddingHorizontal: scale(5)}}
                />
              </TouchableOpacity>
            )}
            <View style={[styles.topView, styles.bottomView]}>
              {this.renderIcons()}
            </View>
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: scale(30),
    backgroundColor: theme.colors.white,
    marginHorizontal: scale(18),
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
  },
  attechment: {width: '95%', elevation: scale(3), marginHorizontal: scale(6)},
  shadow: {
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 1.4,
    elevation: 1,
  },
  topView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userImage: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
  },
  input: {
    width: '58%',
    textAlignVertical: 'center',
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(14),
    color: theme.colors.black,
  },
  imagesView: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: scale(5),
  },
  bottomView: {
    width: '27%',
    alignSelf: 'flex-end',
    marginBottom: scale(8),
  },
  imageView: {
    width: '28.3%',
    height: theme.SCREENWIDTH * 0.23,
    marginHorizontal: '2.5%',
    marginVertical: '2.5%',
  },
  videoImageShow: {
    justifyContent: 'center',
    backgroundColor: theme.colors.grey14,
    borderRadius: 5,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  crossView: {
    backgroundColor: theme.colors.white,
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    position: 'absolute',
    right: -scale(10),
    top: -scale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  group: {
    flexDirection: 'row',
    position: 'absolute',
    left: scale(10),
  },
});
export default PostBar;
