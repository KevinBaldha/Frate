import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
} from 'react-native';
import {
  ScreenContainer,
  Label,
  BackgroundChunk,
  HeaderView,
  Button,
  OfflineModel,
  Loader,
} from '../Components';
import {images, scale, theme, Api} from '../Utils';
import {getLocalText} from '../Locales/I18n';
import {API, getAPICall, postAPICall} from '../Utils/appApi';
import FastImage from 'react-native-fast-image';

class PaymentMethod extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      selectedCard: [],
      isSwitchOn: false,
      cards: [],
      loading: false,
      page: 1,
      totalPage: 1,
    };
  }

  handleOption = (item) => {
    this.setState({selectedCard: item});
    this.props.navigation.navigate('CardDetail', {cardData: item, edit: false});
  };
  componentDidMount() {
    this.getAllCards();
    this.focusListener = this.props.navigation.addListener(
      'focus',
      async () => {
        this.getAllCards();
      },
    );
  }
  componentWillUnmount() {
    this.focusListener();
  }
  //get Cards of users
  getAllCards = async (pages, onupdate) => {
    try {
      this.setState({loading: false, page: pages});
      let cards = await getAPICall(API.getAllCards);
      if (cards.success) {
        if (onupdate === 1) {
          var inactive = await cards.data?.filter((item) => !item?.status);
          this.setState({
            cards: [...this.state.cards, ...inactive],
            loading: false,
          });
        } else {
          this.setState({totalPage: cards?.total_page});
          var inactive = await cards.data?.filter((item) => !item?.status);
          this.setState({cards: inactive});
          var tempList = await cards.data?.filter((item) => item?.status);
          this.setState({selectedCard: tempList});
        }
        // this.setState({cards: cards?.data, loading: false});
      } else {
        this.setState({loading: false});
      }
    } catch (error) {
      this.setState({loading: false});
    }
  };

  // change card status
  updateCardStatus = async (id) => {
    try {
      this.setState({loading: true});
      let formData = new FormData();
      formData.append('id', id);
      let response = await postAPICall(API.updateCardStatus, formData);
      if (response.error) {
        this.setState({loading: false});
      } else {
        this.getAllCards(1);
      }
      this.setState({loading: false});
    } catch (error) {}
    this.setState({loading: false});
  };

  render() {
    const {cards, selectedCard, loading: loading} = this.state;

    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView
          {...this.props}
          title={getLocalText('Settings.paymentMethod')}
        />
        <ScrollView
          style={{
            marginBottom: theme.SCREENHEIGHT * 0.12,
          }}>
          {selectedCard.length > 0 && selectedCard ? (
            <>
              <Label title={'Selected Card'} style={styles.title} />

              {selectedCard?.map((card, i) => {
                return (
                  <TouchableOpacity style={styles.container} key={i}>
                    <View style={[styles.row, styles.editView]}>
                      <Label title={card.card_holder_name} />
                      <Text onPress={() => this.handleOption(card)}>Edit</Text>
                    </View>
                    <View style={styles.row}>
                      <FastImage
                        source={
                          card?.card_brand === 'Visa'
                            ? images.visa
                            : images.master
                        }
                        style={styles.cardImg}
                      />
                      <Label title={'**** **** ****' + card?.card_last_four} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          ) : null}

          {cards?.length > 0 && cards && (
            <>
              <Label title={'Others Card'} style={styles.title} />

              {cards?.map((item, index) => {
                return (
                  <View
                    key={index}
                    style={[styles.container, styles.cardContainer]}>
                    <View>
                      <Label title={item?.card_holder_name} />
                      <View style={styles.row}>
                        <FastImage
                          source={
                            item?.card_brand === 'Visa'
                              ? images.visa
                              : images.master
                          }
                          style={styles.cardImg}
                        />
                        <Label
                          title={'**** **** **** ' + item?.card_last_four}
                        />
                      </View>
                    </View>

                    <View style={styles.topView}>
                      <Text onPress={() => this.handleOption(item)}>Edit</Text>
                      <Text
                        style={styles.text}
                        onPress={() => {
                          this.updateCardStatus(item?.id);
                        }}>
                        Set Active
                      </Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
        <View style={styles.btnCon}>
          <Button
            titleStyle={styles.cardButton}
            onPress={() => {
              this.props.navigation.navigate('CardDetail', {
                cardData: '',
                edit: true,
                newCard: true,
              });
            }}
            title={getLocalText('Settings.addNewCard')}
          />
        </View>
        <OfflineModel />
        <Loader loading={loading} />
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  cardButton: {textAlign: 'center', fontSize: scale(13.5)},
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
  title: {marginLeft: scale(10), marginTop: scale(10)},
  container: {
    width: '95%',
    backgroundColor: theme.colors.white,
    marginVertical: scale(5),
    alignSelf: 'center',
    padding: scale(15),
    borderRadius: scale(10),
  },
  row: {flexDirection: 'row'},
  cardImg: {
    width: scale(22),
    height: scale(22),
    resizeMode: 'contain',
    marginRight: scale(10),
  },
  btnCon: {
    position: 'absolute',
    bottom: scale(20),
  },
  topView: {top: 0},
  text: {
    fontFamily: theme.fonts.muktaMedium,
    fontSize: scale(14),
    color: theme.colors.blue,
  },
  cardContainer: {flexDirection: 'row', justifyContent: 'space-between'},
  editView: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default PaymentMethod;
