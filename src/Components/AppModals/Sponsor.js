/* eslint-disable radix */
/* eslint-disable no-unused-vars */
/* eslint-disable eol-last */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import {useFocusEffect} from '@react-navigation/core';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import * as RNLocalize from 'react-native-localize';
import {scale, theme, height, constants, dollarAmountToSku} from '../../Utils';
import {getLocalText} from '../../Locales/I18n';
import {Label, Button} from '../index';
import externalStyle from '../../Css';
import {API, postAPICall} from '../../Utils/appApi';
import {
  initConnection,
  requestPurchase,
  withIAPContext,
  getProducts,
  finishTransaction,
  flushFailedPurchasesCachedAsPendingAndroid,
  endConnection,
  getAvailablePurchases,
  purchaseUpdatedListener,
  purchaseErrorListener,
} from 'react-native-iap';
import {dollarAmountToSkuAndroid} from '../../Utils/constants';

const isIos = Platform.OS === 'ios';

const Sponsor = props => {
  const {isVisible, togglePaymentModal} = props;
  const [info, setInfo] = useState(false);
  const [days, setDays] = useState(2);
  const [sliderOneValue, setSliderOneValue] = useState([42]);
  const [people, setPeople] = useState(sliderOneValue * 100);
  const [totalAmount, setTotalAmount] = useState(0);
  const [usDollarRate, setUSDollarRate] = useState(0);
  const animatedValue = useRef(new Animated.Value(sliderOneValue[0])).current;
  const [productData, setProductData] = useState([]);

  const [products, setProducts] = useState([]);
  const [isLoading, setLoading] = useState(false);

  //IN App Purchase===========

  useEffect(() => {
    const initializeIAPConnection = async () => {
      try {
        await initConnection();

        const availableProducts = await getProducts({
          skus: constants.productSkus,
        });

        setProducts(availableProducts);
      } catch (error) {
        console.error('Error initializing IAP connection:', error);
      }
    };

    const purchaseUpdateSubscription = purchaseUpdatedListener(
      async purchase => {
        if (purchase.transactionReceipt) {
          // try {
          const transactionStatus = await finishTransaction({
            purchase,
            isConsumable: true,
          });
          if (transactionStatus?.code !== 'OK' && Platform.OS === 'android') {
            Alert.alert(`${transactionStatus?.message}`);
          }
          // Alert.alert('Success', 'Purchase was successful!');
          // } catch (error) {
          //   console.error('Transaction completion error:', error);
          // }
        }
      },
    );

    const purchaseErrorSubscription = purchaseErrorListener(error => {
      console.error('Purchase error:', error.message);
      Alert.alert('Purchase Error', error.message);
    });

    initializeIAPConnection();

    // Cleanup listeners on unmount
    return () => {
      purchaseUpdateSubscription?.remove();
      purchaseErrorSubscription?.remove();
    };
  }, []);

  const handlePurchaseAndroid = async sku => {
    const skuExists = products.some(product => product.productId === sku);
    if (skuExists) {
      try {
        try {
          const purchase = await requestPurchase({
            skus: [sku],
          });

          if (purchase?.[0] && purchase?.[0]?.transactionId) {
            props.callInappPurchase?.(3, {
              no_of_people: nearestTitle,
              days: 0,
              price: getDollarAmount(sliderOneValue[0]),
              transaction_id: purchase?.[0]?.transactionId,
              type: 'in_app',
            });
          } else {
            Alert.alert(
              'Purchase data is invalid or missing transactionId:',
              purchase?.[0],
            );
          }
        } catch (e) {
          Alert.alert('Error', `${e}`);
        }
      } catch (error) {
        Alert.alert('Error occurred while making purchase', `${error}`);
      }
    }
  };

  const handlePurchaseIOS = async () => {
    const productIds = Object.values(dollarAmountToSku);
    // Fetch product information from the app store
    const connection = await initConnection();

    const productsList = await getProducts({skus: productIds});

    setProductData(productsList[0]?.productId);

    const dollarAmount = getDollarAmount(sliderOneValue[0]);
    const sku = dollarAmountToSku[dollarAmount];

    if (sku) {
      const purchase = await requestPurchase({
        sku: sku,
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
      });
      if (purchase && purchase.transactionId) {
        props.callInappPurchase(3, {
          no_of_people: nearestTitle,
          days: 0,
          price: getDollarAmount(sliderOneValue[0]),
          transaction_id: purchase.transactionId,
          type: 'in_app',
        });
        await finishTransaction({purchase: purchase, isConsumable: true});
      } else {
        Alert.alert(
          'Purchase data is invalid or missing transactionId:',
          purchase?.[0],
        );
      }
    } else {
      Alert.alert('SKU not found for dollar amount:', dollarAmount);
    }
  };

  const handlePurchase = () => {
    const dollarAmount = getDollarAmount(sliderOneValue?.[0]);
    const dollarAmountSKU = isIos
      ? dollarAmountToSku
      : dollarAmountToSkuAndroid;
    const sku = dollarAmountSKU?.[dollarAmount];
    isIos ? handlePurchaseIOS() : handlePurchaseAndroid(sku);
  };

  const pricePoints = [
    {value: 42, title: '100', dollarAmount: '0.99'},
    {value: 467, title: '500', dollarAmount: '4.99'},
    {value: 903, title: '1000', dollarAmount: '9.99'},
    {value: 1375, title: '1500', dollarAmount: '14.99'},
    {value: 1838, title: '2000', dollarAmount: '19.99'},
    {value: 2496, title: '2500', dollarAmount: '24.99'},
  ];

  const getNearestTitle = inputValue => {
    const nearestPoint = pricePoints.reduce((prev, curr) =>
      Math.abs(curr.value - inputValue) < Math.abs(prev.value - inputValue)
        ? curr
        : prev,
    );
    return nearestPoint.title;
  };
  const nearestTitle = getNearestTitle(people);

  const getDollarAmount = value => {
    return (
      pricePoints
        .slice()
        .reverse()
        .find(point => value >= point.value)?.dollarAmount || '0.99'
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      async function checkDefaultRate() {
        sliderOneValuesChange([42]);
        const dollarRate = await calculateSponsorPostAPI(42);
        setUSDollarRate(dollarRate);
        await sliderOneValuesChangeCall();
      }
      checkDefaultRate();
    }, [isVisible]),
  );

  const animateSliderToValue = targetValue => {
    Animated.timing(animatedValue, {
      toValue: targetValue,
      duration: 250, // Adjust the duration as needed
      useNativeDriver: false,
    }).start(() => {
      setSliderOneValue([targetValue]);
    });
  };

  const sliderOneValuesChangeCallIOS = values => {
    const nearestValue = [42, 467, 903, 1375, 1838, 2496].reduce((prev, curr) =>
      Math.abs(curr - values[0]) < Math.abs(prev - values[0]) ? curr : prev,
    );
    animateSliderToValue(nearestValue);
  };
  const sliderOneValuesChange = async values => {
    await setSliderOneValue(values);
    // await setPeople(values * 100);
    await setPeople(values);
  };
  const sliderOneValuesChangeCall = async () => {
    await calculateSponsorPostAPI(parseInt(days, 0));
  };

  const setDay = async i => {
    if (i > 365) {
      await setDays(2);
      await calculateSponsorPostAPI(2);
    } else {
      await setDays(i);
      await calculateSponsorPostAPI(parseInt(i, 0));
    }
  };

  const calculateSponsorPostAPI = async day => {
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

  const renderSponsorIOS = () => {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.container}>
          <View style={styles.headerCon}>
            <View style={styles.flexRow}>
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
          </View>
          <View style={[styles.iosCard, externalStyle.shadow]}>
            <View style={styles.iosCardCon}>
              <Text style={styles.iosSubtext}>
                {getLocalText('Sponsor.subtext')}
              </Text>
            </View>
            <View style={styles.iosSliderView}>
              <MultiSlider
                values={sliderOneValue}
                sliderLength={theme.SCREENWIDTH * 0.7}
                onValuesChange={sliderOneValuesChange}
                onValuesChangeFinish={sliderOneValuesChangeCallIOS}
                markerStyle={{
                  width: scale(15),
                  height: scale(15),
                  backgroundColor: theme.colors.white,
                }}
                markerContainerStyle={styles.picker}
                max={2500}
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
                {pricePoints.map(({value, title}) => {
                  return(
                  <Label
                    key={value}
                    title={title}
                    style={
                      sliderOneValue[0] === value
                        ? styles.blueLimitTx
                        : styles.limitTxt
                    }
                  />
                )})}
              </View>
            </View>
          </View>
          <Button
            title={
              getLocalText('Sponsor.payer') +
              ' $' +
              getDollarAmount(sliderOneValue[0])
            }
            style={{marginTop: scale(30), marginBottom: scale(35)}}
            onPress={() => handlePurchase()}
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
    );
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
        setSliderOneValue([0]);
        togglePaymentModal('close');
      }}>
      {renderSponsorIOS()}
      {/* {isIos ? renderSponsorIOS() : renderSponsorAndroid()} */}
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
  iosSliderView: {
    alignSelf: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: scale(12),
    height: scale(60),
  },
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
  iosCard: {
    backgroundColor: theme.colors.white,
    borderRadius: scale(15),
    padding: scale(15),
    shadowRadius: scale(9),
    marginTop: scale(25),
    minHeight: scale(10),
    maxHeight: scale(150),
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
  iosSubtext: {
    fontFamily: theme.fonts.muktaVaaniLight,
    fontSize: scale(15),
    color: theme.colors.black,
  },
  limitTxt: {
    fontSize: scale(12),
    color: theme.colors.grey10,
  },
  blueLimitTx: {
    fontSize: scale(16),
    color: theme.colors.blue,
    marginTop: scale(10),
    fontFamily: theme.fonts.muktaMedium,
  },
  cardCon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iosCardCon: {
    alignItems: 'center',
    textAlign: 'center',
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(16),
    color: theme.colors.black,
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
  flexRow: {flexDirection: 'row'},
});

export default withIAPContext(Sponsor);
