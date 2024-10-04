/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import {useFocusEffect} from '@react-navigation/core';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import * as RNLocalize from 'react-native-localize';
import {scale, theme, height} from '../../Utils';
import {getLocalText} from '../../Locales/I18n';
import {Label, Button} from '../index';
import externalStyle from '../../Css';
import {API, postAPICall} from '../../Utils/appApi';

const Sponsor = (props) => {
  const {isVisible, togglePaymentModal} = props;
  const [info, setInfo] = React.useState(false);
  const [sliderOneValue, setSliderOneValue] = React.useState([2]);
  const [days, setDays] = React.useState(2);
  const [people, setPeople] = React.useState(sliderOneValue * 100);
  const [totalAmount, setTotalAmount] = React.useState(0);
  const [usDollarRate, setUSDollarRate] = React.useState(0);

  useFocusEffect(
    React.useCallback(() => {
      async function checkDefaultRate() {
        sliderOneValuesChange([2]);
        const dollarRate = await calculateSponsorPostAPI(2);
        setUSDollarRate(dollarRate);
        await sliderOneValuesChangeCall();
      }
      checkDefaultRate();
    }, [isVisible]),
  );

  const sliderOneValuesChange = async (values) => {
    await setSliderOneValue(values);
    await setPeople(values * 100);
  };

  const sliderOneValuesChangeCall = async () => {
    await calculateSponsorPostAPI(parseInt(days, 0));
  };

  const setDay = async (i) => {
    if (i > 365) {
      await setDays(2);
      await calculateSponsorPostAPI(2);
    } else {
      await setDays(i);
      await calculateSponsorPostAPI(parseInt(i, 0));
    }
  };

  const calculateSponsorPostAPI = async (day) => {
    let formdata = new FormData();
    formdata.append('days', day ? day : 1);
    formdata.append('people', people);
    try {
      const sponsorPostCalculationReqRes = await postAPICall(
        API.getSponsorCalculation,
        formdata,
      );
      const total =
        sponsorPostCalculationReqRes?.data?.amount !== undefined
          ? sponsorPostCalculationReqRes?.data?.amount
          : '0';
      setTotalAmount(total);
      return total;
    } catch (error) {}
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn="zoomIn"
      animationOut="zoomOut"
      statusBarTranslucent
      deviceHeight={height}
      backdropColor={theme.colors.grey11}
      backdropOpacity={0.9}
      onBackdropPress={() => {
        setDays(1);
        setSliderOneValue([]);
        togglePaymentModal('close');
      }}>
      <View style={styles.mainContainer}>
        <View style={styles.container}>
          <View style={styles.headerCon}>
            <View style={{flexDirection: 'row'}}>
              <Icon
                name="trending-up"
                size={scale(18)}
                color={theme.colors.blue}
              />
              <Label
                title={getLocalText('Sponsor.title')}
                style={{marginLeft: scale(10)}}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                togglePaymentModal('close');
              }}>
              <Icon name="x" size={scale(22)} color={theme.colors.blue} />
            </TouchableOpacity>
          </View>
          <View style={[styles.card, externalStyle.shadow]}>
            <View style={styles.cardCon}>
              <Label title={'1.'} style={styles.numbrtTxt} />
              <Text style={styles.subtxt}>
                {getLocalText('Sponsor.subtext')}
              </Text>
            </View>
            <View style={styles.sliderView}>
              <MultiSlider
                values={sliderOneValue}
                sliderLength={theme.SCREENWIDTH * 0.7}
                onValuesChange={sliderOneValuesChange}
                onValuesChangeFinish={sliderOneValuesChangeCall}
                markerStyle={{
                  width: scale(11),
                  height: scale(11),
                  backgroundColor: theme.colors.white,
                }}
                markerContainerStyle={styles.picker}
                max={50}
                min={1}
                selectedStyle={{
                  backgroundColor: theme.colors.grey10,
                }}
                unselectedStyle={{
                  backgroundColor: theme.colors.grey10,
                }}
                trackStyle={{
                  backgroundColor: theme.colors.grey10,
                  height: scale(0.8),
                }}
              />

              <View style={styles.range}>
                <Label title={'100'} style={styles.limitTxt} />
                <Label title={'5000'} style={styles.limitTxt} />
              </View>
              <Label
                title={people + ' ' + getLocalText('Sponsor.people')}
                style={[styles.peopleTxt]}
              />
            </View>
          </View>
          <View
            style={[
              styles.card,
              externalStyle.shadow,
              {shadowRadius: scale(9), marginTop: scale(25)},
            ]}>
            <View style={styles.cardCon}>
              <Label title={'2.'} style={styles.numbrtTxt} />
              <Text style={styles.subtxt}>
                {getLocalText('Sponsor.secondtxt')}
              </Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                value={days.toString()}
                maxLength={3}
                onChangeText={(txt) => setDay(txt)}
                placeholderTextColor={theme.colors.grey10}
                style={styles.textinput}
                onSubmitEditing={() => {
                  if (!days) {
                    setDay('2');
                  }
                }}
                keyboardType="number-pad"
                returnKeyType={'done'}
              />
              <Label
                title={
                  days <= 1
                    ? getLocalText('Sponsor.day')
                    : getLocalText('Sponsor.days')
                }
                style={{color: theme.colors.blue, fontSize: scale(15)}}
              />
            </View>
            <Label
              title={`${getLocalText('Sponsor.minmum')} & ${getLocalText(
                'Sponsor.maximum',
              )} ${getLocalText('Sponsor.days')}`}
              style={styles.mintxt}
            />
          </View>

          <Text style={styles.pricetxt}>
            {`Est. en ${RNLocalize.getCountry() === 'CA' ? 'CA' : 'USD'}$`}
            <Text
              style={{
                fontSize: scale(32),
                color: theme.colors.blue,
                fontFamily: theme.fonts.muktaVaaniExtraBold,
              }}>
              {usDollarRate}
              <Text
                style={{
                  fontSize: scale(16),
                  fontFamily: theme.fonts.muktaBold,
                }}>
                {`/${getLocalText('Sponsor.day')}`}
              </Text>
            </Text>
          </Text>

          <View style={styles.infoView}>
            <Label
              title={`Total en ${
                RNLocalize.getCountry() === 'CA' ? 'CA' : 'USD'
              }$ ${totalAmount}`}
              style={[
                styles.pricetxt,
                {
                  color: theme.colors.grey10,
                  marginTop: scale(0),
                  marginRight: scale(3),
                },
              ]}
            />

            <TouchableOpacity onPress={() => setInfo(!info)}>
              <Icon
                name="info"
                color={info ? theme.colors.blue : theme.colors.grey10}
                size={scale(17)}
              />
            </TouchableOpacity>
          </View>

          <Button
            title={getLocalText('Sponsor.paybtntxt')}
            style={{marginTop: scale(30)}}
            onPress={() => togglePaymentModal(true, days, people, totalAmount)}
          />
        </View>
        {info ? (
          <View style={styles.popupCon}>
            <Label
              style={styles.popuptxt}
              title={getLocalText('Sponsor.info')}
            />
            <View style={styles.divider} />

            <TouchableOpacity onPress={() => setInfo(!info)}>
              <Icon name="x" size={scale(20)} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: theme.colors.white,
    padding: scale(15),
    borderRadius: scale(12),
    width: theme.SCREENWIDTH - scale(35),
  },
  sliderView: {alignSelf: 'center', marginTop: scale(5)},
  headerCon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: scale(15),
    padding: scale(15),
    shadowRadius: scale(9),
    marginTop: scale(25),
  },
  numbrtTxt: {
    fontSize: scale(35),
    color: theme.colors.blue,
    fontFamily: theme.fonts.muktaMedium,
  },
  subtxt: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(14),
    color: theme.colors.black,
    marginLeft: scale(15),
  },
  limitTxt: {
    fontSize: scale(12),
    color: theme.colors.grey10,
  },
  cardCon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peopleTxt: {
    fontSize: scale(16),
    textAlign: 'center',
    color: theme.colors.blue,
    fontFamily: theme.fonts.muktaMedium,
  },
  picker: {
    backgroundColor: theme.colors.green1,
    borderRadius: scale(11),
    height: scale(21),
    width: scale(21),
    marginTop: scale(10.5),
    marginLeft: scale(15),
  },
  range: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(-13),
  },
  textinput: {
    width: scale(52),
    textAlign: 'center',
    color: theme.colors.black,
    fontFamily: theme.fonts.muktaRegular,
    borderColor: theme.colors.grey10,
    borderBottomWidth: 1,
    paddingVertical: 0,
    fontSize: scale(15),
    marginRight: scale(5),
  },
  mintxt: {
    color: theme.colors.grey10,
    fontSize: scale(11),
    marginTop: scale(15),
  },
  infoView: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  pricetxt: {
    color: theme.colors.black,
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(14),
    textAlign: 'center',
    marginTop: scale(30),
  },
  popupCon: {
    width: '80%',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.blue,
    borderRadius: scale(15),
    position: 'absolute',
    flexDirection: 'row',
    padding: scale(15),
    bottom: scale(140),
    marginLeft: scale(3),
  },
  popuptxt: {
    color: theme.colors.white,
    fontFamily: theme.fonts.muktaRegular,
    lineHeight: scale(18),
    fontSize: scale(14),
  },
  divider: {
    height: 1,
    width: '100%',
    marginHorizontal: scale(20),
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scale(10),
  },
});

export default Sponsor;
