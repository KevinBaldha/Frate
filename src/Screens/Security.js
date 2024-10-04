import React, {Component} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {Switch} from 'react-native-switch';
import {
  ScreenContainer,
  Label,
  BackgroundChunk,
  HeaderView,
  OfflineModel,
} from '../Components';
import {scale, theme, Api} from '../Utils';
import {getLocalText} from '../Locales/I18n';

class Security extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      options: [
        // {title: 'Settings.profileVisible', page: false, toggle: false},
        // {title: 'Settings.findByEmail', page: false, toggle: false},
        {title: 'Settings.privacy', page: true},
        {title: 'Settings.termsAndCon', page: true},
      ],
    };
  }

  handleOption = (index) => {
    if (index === 0) {
      this.props.navigation.navigate('ContentPage', {
        title: 'Settings.privacy',
      });
    } else if (index === 1) {
      this.props.navigation.navigate('ContentPage', {
        title: 'Settings.termsAndCon',
      });
    }
  };

  renderOptionsList() {
    const wordList = this.state.options.map((word, i, wordArray) => (
      <View key={i.toString()}>
        {i === 2 ? <View height={scale(2)} style={styles.divider} /> : null}
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => {
              this.handleOption(i);
            }}>
            <Label title={getLocalText(word.title)} />
          </TouchableOpacity>
          {word.page ? (
            <View style={styles.switchContainer}>
              <TouchableOpacity
                onPress={() => {
                  this.handleOption(i);
                }}>
                <Icon name="chevron-right" size={scale(22)} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.switchContainer}>
              <Switch
                value={word.toggle}
                onValueChange={(toggleValue) => {
                  wordArray[i].toggle = toggleValue;
                  this.setState({options: wordArray});
                  this.handleOption(i);
                }}
                useNativeDriver={true}
                circleBorderWidth={2}
                renderActiveText={false}
                renderInActiveText={false}
                circleSize={scale(10)}
                barHeight={scale(21)}
                innerCircleStyle={{
                  borderColor: word.toggle
                    ? theme.colors.blue
                    : theme.colors.grey10,
                  backgroundColor: word.toggle
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
          )}
        </View>
      </View>
    ));
    return wordList;
  }

  render() {
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView
          {...this.props}
          title={getLocalText('Settings.privacytxt')}
        />

        {this.renderOptionsList()}

        <OfflineModel />
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.55),
    right: -(theme.SCREENHEIGHT * 0.4),
    transform: [{rotate: '80deg'}],
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.6),
    left: -(theme.SCREENHEIGHT * 0.5),
    transform: [{rotate: '80deg'}],
  },
  title: {
    marginLeft: scale(18),
    marginTop: scale(20),
    marginBottom: scale(10),
    color: theme.colors.black,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: scale(18),
    marginTop: scale(20),
  },
  divider: {
    top: scale(10),
    backgroundColor: theme.colors.grey13,
    marginVertical: scale(5),
    width: '90%',
    alignSelf: 'center',
    height: scale(1),
  },
  switchView: {
    backgroundColor: 'red',
    width: scale(105),
    height: scale(105),
    borderColor: theme.colors.grey10,
    borderWidth: 2,
  },
  switchContainer: {position: 'absolute', right: scale(15)},
});

export default Security;
