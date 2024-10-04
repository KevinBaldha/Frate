import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import creditCardType from 'credit-card-type';
import FastImage from 'react-native-fast-image';
import {
  ScreenContainer,
  Label,
  BackgroundChunk,
  HeaderView,
  Button,
  InputBox,
  DatePickerModel,
  Loader,
  OfflineModel,
} from '../Components';
import {images, scale, theme, Api, Validation} from '../Utils';
import {getLocalText} from '../Locales/I18n';
import externalStyle from '../Css/index';
import {API, deleteAPICall, postAPICall} from '../Utils/appApi';

class CardDetail extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      name: '',
      number: '',
      cvv: '',
      date: '',
      type: '',
      nameErr: false,
      numberErr: false,
      cvvErr: false,
      dateErr: false,
      edit: false,
      open: false,
      loading: false,
      newCard: false,
    };
  }

  checkCard = (txt) => {
    const cardType = creditCardType(txt);
    cardType[0] !== undefined
      ? this.state.number < 16
        ? this.setState({type: cardType[0].niceType})
        : null
      : null;
  };

  handleOption = (item) => {
    this.setState({selectedCard: item});
  };
  handleInput = (text, key, keyErr) => {
    this.setState({
      [key]: text,
      [keyErr]: '',
    });
    if (key === 'number') {
      this.checkCard(text);
    }
  };
  dateHandle = (month, year) => {
    if (month && year) {
      this.setState({open: !this.state.open, date: `${month}/${year}`});
    } else {
      this.setState({open: !this.state.open});
    }
  };
  componentDidMount() {
    this.setCardDetails();
  }
  setCardDetails() {
    this.setState({
      name: this.props.route.params.cardData?.card_holder_name,
      number: this.props.route.params.cardData.card_last_four,
      type: this.props.route.params.cardData.card,
      edit: this.props.route.params.edit,
      date: this.props.route.params?.cardData?.card_expiry_date,
      newCard: this.props.route.params?.newCard,
    });
  }

  handleCardNumber = (text) => {
    let formattedText = text.split(' ').join('');
    if (formattedText.length > 0) {
      formattedText = formattedText.match(new RegExp('.{1,4}', 'g')).join(' ');
    }
    this.handleInput(formattedText, 'number', 'numbererr');

    return formattedText;
  };

  validateForm = () => {
    let {name, cvv, date, number} = this.state;
    let error = true;
    if (!Validation.validateEmpty(name)) {
      this.setState({nameErr: Validation.MSG_VALID.name});
      error = false;
    }
    if (!Validation.validateEmpty(number)) {
      this.setState({numberErr: Validation.MSG_VALID.cardnumber});
      error = false;
    }
    if (!date) {
      this.setState({dateErr: Validation.MSG_VALID.expdate});
      error = false;
    }
    if (!Validation.validateEmpty(cvv)) {
      this.setState({cvvErr: Validation.MSG_VALID.cvv});
      error = false;
    }
    return error;
  };

  //delete existing card.
  delateCard = async () => {
    let cardId = this.props.route.params.cardData?.id;
    this.setState({loading: true});
    let deleteCardResponse = await deleteAPICall(
      API.getAllCards + '/' + cardId,
    );
    if (deleteCardResponse.success) {
      this.setState({loading: false});
      Alert.alert(deleteCardResponse.message);
      this.props.navigation.navigate('PaymentMethod');
    } else {
      this.setState({loading: false});
    }
  };

  //add new card
  handleAddCardData = async () => {
    if (this.validateForm()) {
      try {
        this.setState({loading: true});
        let {name, number, cvv, date, type} = this.state;
        const numberTmp = number.replace(/ /g, '');
        //numberTmp= BJ721JL

        let addCardFormData = new FormData();
        addCardFormData.append('card_holder_name', name);
        addCardFormData.append('card_number', numberTmp);
        addCardFormData.append('cvv', cvv);
        addCardFormData.append('expiry_date', date);
        addCardFormData.append('card_brand', type);
        let AddCard = await postAPICall(API.addCardDetails, addCardFormData);
        if (AddCard.success) {
          this.setState({loading: false});
          Alert.alert(AddCard.message);
          this.props.navigation.navigate('PaymentMethod');
        } else {
          this.setState({loading: false});
        }
      } catch (error) {}
    } else {
      Alert.alert(getLocalText('ErrorMsgs.Not_allow_empty'));
    }
  };

  //add  card update
  handleEditCardData = async () => {
    let cardId = this.props.route.params.cardData?.id;
    if (this.validateForm()) {
      try {
        this.setState({loading: true});
        let {name, date} = this.state;
        let updateCardFormData = new FormData();
        updateCardFormData.append('card_holder_name', name);
        updateCardFormData.append('card_id', cardId);
        updateCardFormData.append('expiry_date', date);
        let AddCard = await postAPICall(
          API.updateCardDetails,
          updateCardFormData,
        );
        if (AddCard.success) {
          this.setState({loading: false});
          Alert.alert(AddCard.message);
          this.props.navigation.navigate('PaymentMethod');
        } else {
          this.setState({loading: false});
        }
      } catch (error) {}
    } else {
      Alert.alert(getLocalText('ErrorMsgs.Not_allow_empty'));
    }
  };

  render() {
    const {type, name, number, cvv, date, edit, open} = this.state;
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView
          {...this.props}
          title={
            this.state.name === undefined ? 'Card' : this.state.name + ' Card'
          }
        />
        <ScrollView style={styles.flex}>
          <Label
            title={getLocalText('Sponsor.cardName')}
            style={[styles.title, {marginTop: scale(25)}]}
          />
          <InputBox
            placeholder={getLocalText('Sponsor.cardName')}
            value={name}
            maxLength={20}
            onChangeText={(text) => this.handleInput(text, 'name', 'nameerr')}
            style={styles.input}
            Img={edit ? false : true}
            editable={edit ? true : false}
          />
          <Label
            title={getLocalText('Sponsor.cardNumber')}
            style={styles.title}
          />
          <InputBox
            placeholder={getLocalText('Sponsor.cardNumber')}
            maxLength={19}
            keyboardType="numeric"
            returnKeyType={'done'}
            value={number}
            onChangeText={(text) => this.handleCardNumber(text)}
            style={styles.input}
            Img={edit ? false : true}
            editable={edit ? true : false}
          />

          <View style={styles.cardSubView}>
            <View style={styles.expDate}>
              <Label
                title={getLocalText('Sponsor.expdate')}
                style={styles.title}
              />
              <TouchableOpacity
                disabled={edit ? false : true}
                onPress={() => this.setState({open: true})}
                style={[
                  styles.dateButton,
                  externalStyle.shadow,
                  {shadowRadius: scale(2), marginLeft: scale(20)},
                ]}>
                <Label title={date} style={styles.datetxt} />
                <Icon name="chevron-down" color="blue" size={scale(18)} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.expDate} onPress={this.dateHandle}>
              <Label
                title={'CVV'}
                style={[styles.title, {marginLeft: scale(35)}]}
              />
              <InputBox
                keyboardType="numeric"
                returnKeyType={'done'}
                maxLength={3}
                secureTextEntry={true}
                value={cvv}
                onChangeText={(text) => this.handleInput(text, 'cvv', 'cvverr')}
                style={{marginLeft: scale(20)}}
                inputStyle={{marginLeft: -scale(30)}}
                Img={edit ? false : true}
                editable={edit ? true : false}
                placeholder={'CVV'}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.cardView}>
            <View style={styles.yellow} />
            <View style={styles.purple} />
            <FastImage
              source={
                type == null
                  ? ''
                  : type === 'Visa'
                  ? images.visa
                  : images.master
              }
              style={{marginLeft: scale(25), marginTop: scale(25)}}
            />
            <Label
              title={getLocalText('Sponsor.cardName').toUpperCase()}
              style={[
                styles.title,
                {color: theme.colors.grey6, marginTop: scale(10)},
              ]}
            />
            <Label
              title={this.state.name === '' ? 'Raphael Sousa' : this.state.name}
              style={[styles.title, {fontSize: scale(14)}]}
            />
            <View style={styles.row}>
              <View>
                <Label
                  title={getLocalText('Sponsor.cardNumber').toUpperCase()}
                  style={[
                    styles.title,
                    {color: theme.colors.grey6, marginTop: scale(10)},
                  ]}
                />
                <Label
                  title={this.state.number}
                  style={[styles.title, {fontSize: scale(14)}]}
                />
              </View>
              <View style={{marginLeft: scale(10)}}>
                <Label
                  title={'EXP DATE'}
                  style={[
                    styles.title,
                    {color: theme.colors.grey6, marginTop: scale(10)},
                  ]}
                />
                <Label
                  title={date}
                  style={[styles.title, {fontSize: scale(14)}]}
                />
              </View>
            </View>
          </View>
          <View style={styles.btnCon}>
            {edit ? (
              <Button
                onPress={() => {
                  this.state.newCard
                    ? this.handleAddCardData()
                    : this.handleEditCardData(this.state.edit ? true : false);
                }}
                title={getLocalText('Sponsor.update')}
                style={{marginTop: theme.SCREENHEIGHT * 0.1}}
              />
            ) : (
              <>
                <Button
                  onPress={() => {
                    this.setState({edit: !this.state.edit});
                  }}
                  title={getLocalText('Sponsor.edit')}
                />
                <Button
                  onPress={() => {
                    this.delateCard();
                  }}
                  title={getLocalText('Sponsor.delete')}
                  style={{backgroundColor: theme.colors.red1}}
                />
              </>
            )}
          </View>
          <DatePickerModel
            isShow={open}
            dateHandle={this.dateHandle}
            mode={'month'}
          />
          <OfflineModel />
          <Loader loading={this.state.loading} />
        </ScrollView>
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
    marginLeft: scale(20),
    color: theme.colors.grey2,
    fontSize: scale(14),
  },
  input: {
    width: '90%',
    alignSelf: 'center',
  },
  btnCon: {
    marginHorizontal: scale(10),
  },
  cardView: {
    width: '90%',
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 1,
    elevation: 1,
    marginBottom: scale(20),
  },
  row: {flexDirection: 'row', marginBottom: scale(10)},
  cardSubView: {flexDirection: 'row', justifyContent: 'center'},
  expDate: {flex: 2},
  yellow: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    backgroundColor: theme.colors.yellow,
    position: 'absolute',
    right: scale(-30),
    top: scale(-30),
  },
  purple: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    backgroundColor: theme.colors.purple1,
    position: 'absolute',
    right: scale(25),
    top: scale(-75),
    opacity: 0.93,
  },
  dateButton: {
    width: '55%',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: theme.SCREENHEIGHT * 0.068,
    backgroundColor: theme.colors.white,
    borderRadius: scale(15),
    flexDirection: 'row',
  },
});

export default CardDetail;
