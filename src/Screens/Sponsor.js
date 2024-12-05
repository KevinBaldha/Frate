import React, {Component} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {
  ScreenContainer,
  Label,
  BackgroundChunk,
  HeaderView,
  OfflineModel,
} from '../Components';
import {scale, theme, Api} from '../Utils';
import {getLocalText} from '../Locales/I18n';

class Sponsor extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      searchText: '',
      options: [
        {title: 'Settings.mySponsor', icon: 'user'},
        {title: 'Settings.iSpnsor', icon: 'dollar-sign'},
        // {title: 'Settings.paymentMethod', icon: 'credit-card'},
      ],
    };
  }

  handleOption = (item, index) => {
    if (index === 0) {
      this.props.navigation.navigate('ActiveSponsorPost', {
        title: getLocalText(item?.title),
      });
    } else if (index === 1) {
      this.props.navigation.navigate('ActiveSponsorPost', {
        title: getLocalText(item?.title),
      });
    }
    //  else {
    //   this.props.navigation.navigate('PaymentMethod');
    // }
  };

  render() {
    const {options} = this.state;
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView
          {...this.props}
          isHelpIcon={true}
          title={getLocalText('Settings.sponsoredcontent')}
        />
        {options.map((item, index) => {
          return (
            <TouchableOpacity
              key={index.toString()}
              onPress={() => {
                this.handleOption(item, index);
              }}
              style={styles.container}>
              <View style={styles.profile}>
                <Icon
                  name={item?.icon}
                  size={scale(17)}
                  color={theme.colors.blue}
                />
              </View>

              <Label
                title={getLocalText(item?.title)}
                style={{marginLeft: scale(15)}}
              />
            </TouchableOpacity>
          );
        })}

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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(18),
    marginTop: scale(20),
  },
});

export default Sponsor;
