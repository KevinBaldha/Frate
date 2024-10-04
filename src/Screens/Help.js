import React, {Component} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import RenderHtml from 'react-native-render-html';
import {
  ScreenContainer,
  BackgroundChunk,
  HeaderView,
  OfflineModel,
  Loader,
} from '../Components';
import {scale, theme} from '../Utils';
import {getLocalText} from '../Locales/I18n';
import {API, getAPICall} from '../Utils/appApi';

class Help extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.getData();
  }
  getData = async () => {
    this.setState({loading: true});
    let page = 'settings.faq';
    try {
      let contents = await getAPICall(API.contentPage + page);
      if (contents.error) {
        this.setState({loading: false});
      } else {
        this.setState({data: contents?.data, loading: false});
      }
    } catch (error) {
      this.setState({loading: false});
    }
  };

  render() {
    const {loading, data} = this.state;
    const source = {
      html: data?.content ? data?.content : '',
    };
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView {...this.props} title={getLocalText('Settings.help')} />
        {loading ? (
          <Loader loading={loading} />
        ) : (
          <ScrollView
            style={styles.scrolling}
            showsVerticalScrollIndicator={false}>
            <View style={styles.contentView}>
              <RenderHtml contentWidth={theme.SCREENWIDTH} source={source} />
            </View>
          </ScrollView>
        )}

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
  scrolling: {
    padding: scale(15),
    marginBottom: scale(30),
  },
});

export default Help;
