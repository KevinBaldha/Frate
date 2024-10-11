import React, {useState} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import {scale, theme, height} from '../../Utils';
import {Label, Button, CardDetailsModel} from '../index';
import {getLocalText} from '../../Locales/I18n';
import {CardPay, GPay, ApplePay, PayPalPay} from '../../Assets/SVGs';
import externalStyle from '../../Css';

const paymentType = [
  {
    id: 1,
    title: getLocalText('Sponsor.card'),
    icon: CardPay,
    icon1: 'credit-card',
    isSelected: true,
  },
  {
    id: 2,
    title: getLocalText('Sponsor.gpay'),
    icon: GPay,
    isSelected: false,
  },
  {
    id: 3,
    title: getLocalText('Sponsor.applypay'),
    icon: ApplePay,
    icon2: 'apple-pay',
    isSelected: false,
  },
  {
    id: 4,
    title: getLocalText('Sponsor.paypal'),
    icon: PayPalPay,
    icon2: 'paypal',
    isSelected: false,
  },
];

const PaymentModel = props => {
  const {isVisible, closeModal, cardData} = props;
  const [cardDetailsModal, setCardDetailsModal] = useState(false);

  const handlePaymentType = async i => {
    if (cardData?.length > 0) {
      // Call sponsor api
      closeModal();
    } else {
      // Card not added
      closeModal(2);
    }
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
        closeModal(1);
      }}>
      <View style={styles.mainContainer}>
        <View style={styles.container}>
          <View style={styles.headerCon}>
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
          <View style={[externalStyle.shadow, styles.cardMain]}>
            <View style={styles.textCon}>
              <Label title={'3.'} style={styles.numbrtTxt} />
              <Text style={styles.subtxt}>
                {getLocalText('Sponsor.thirdtxt')}
              </Text>
            </View>
            {paymentType.map((d, i) => {
              const ButtonImage = d.icon;
              const imageSize =
                d.id === 2 || d.id === 3 ? scale(40) : scale(30);
              return (
                <TouchableOpacity
                  style={[
                    styles.card,
                    externalStyle.shadow,
                    {
                      shadowRadius: scale(5),
                      opacity: i === 0 ? 1 : 0.5,
                      borderWidth: d?.isSelected ? scale(1) : scale(0),
                      borderColor: d?.isSelected
                        ? theme.colors.blue
                        : theme.colors.transparent,
                    },
                  ]}
                  disabled={i !== 0}
                  key={i.toString()}
                  onPress={() => {
                    if (d.id !== 2) {
                      handlePaymentType(i);
                    }
                  }}>
                  <ButtonImage width={imageSize} height={imageSize} />
                  <Label title={d.title} style={styles.cardtxt} />
                </TouchableOpacity>
              );
            })}
          </View>
          <Button
            title={getLocalText('Timeline.sponsor')}
            style={{
              marginTop: scale(30),
              backgroundColor:
                cardDetailsModal !== '' ? theme.colors.blue : theme.colors.grey,
            }}
            onPress={() => handlePaymentType()}
          />
        </View>
        <CardDetailsModel
          isVisible={cardDetailsModal}
          close={() => setCardDetailsModal(false)}
        />
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
  headerCon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    height: scale(65),
    borderRadius: scale(12),
    marginVertical: scale(6),
    paddingHorizontal: scale(15),
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  textCon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(5),
  },
  numbrtTxt: {
    fontSize: scale(35),
    color: theme.colors.blue,
  },
  subtxt: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(14),
    color: theme.colors.black,
    marginLeft: scale(15),
    lineHeight: scale(19),
  },
  cardtxt: {
    marginLeft: scale(20),
  },
  cardMain: {
    backgroundColor: theme.colors.white,
    padding: scale(15),
    shadowRadius: scale(5),
    borderRadius: scale(12),
    marginTop: scale(30),
  },
});

export default PaymentModel;
