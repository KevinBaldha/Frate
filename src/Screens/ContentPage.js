import React, {Component} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {
  ScreenContainer,
  BackgroundChunk,
  HeaderView,
  Loader,
  OfflineModel,
} from '../Components';
import {scale, theme, Api} from '../Utils';
import {getLocalText} from '../Locales/I18n';
import {API, getAPICall} from '../Utils/appApi';
import RenderHtml from 'react-native-render-html';

class ContentPage extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      headerTitle: '',
      loading: true,
      data: [],
    };
  }
  componentDidMount() {
    this.getData();
  }
  getData = async () => {
    this.setState({headerTitle: this.props.route.params.title});
    let page =
      this.props.route.params.text === 'LoginSignup.terms1' ||
      this.props.route.params?.title === 'Settings.termsAndCon'
        ? 'settings.terms-and-conditions'
        : 'settings.privacy';
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
    const {headerTitle, data, loading} = this.state;
    const source = {
      html: data?.content,
    };
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView
          {...this.props}
          title={headerTitle === undefined ? '' : getLocalText(headerTitle)}
        />
        {loading ? (
          <Loader loading={loading} />
        ) : (
          <ScrollView style={styles.scrolling}>
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
  contentView: {
    marginVertical: scale(15),
  },
});

export default ContentPage;
