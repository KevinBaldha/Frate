import React, {useState} from 'react';
import {StyleSheet, Keyboard, View, Text, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import Icon1 from 'react-native-vector-icons/AntDesign';
import externalStyle from '../../Css';
import {DatePickerModel, Label, InputBox} from '../index';
import {getLocalText} from '../../Locales/I18n';
import {scale, theme, height} from '../../Utils';

const CardDetailsModel = (props) => {
  const {isVisible, close} = props;
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [code, setCode] = useState('');
  const [date, setDate] = useState(getLocalText('Sponsor.expdate'));
  const [open, setOpen] = useState(false);

  const dateHandle = (data) => {
    if (data === '') {
      setOpen(!open);
    } else {
      setDate(data);
      setOpen(!open);
    }
  };
  return (
    <Modal
      isVisible={isVisible}
      animationIn="zoomIn"
      animationOut="zoomOut"
      statusBarTranslucent
      deviceHeight={height}
      backdropOpacity={0}>
      <View style={styles.mainContainer}>
        <View
          style={[
            styles.container,
            externalStyle.shadow,
            {shadowRadius: scale(3)},
          ]}>
          <View style={styles.textCon}>
            <Icon
              name="credit-card"
              color={theme.colors.blue}
              size={scale(22)}
            />
            <Text style={styles.subtext}>{getLocalText('Sponsor.card')}</Text>

            <TouchableOpacity onPress={close}>
              <Icon1
                name="close"
                color={theme.colors.grey15}
                size={scale(22)}
              />
            </TouchableOpacity>
          </View>
          <InputBox
            placeholder={getLocalText('Sponsor.fname')}
            onChangeText={(txt) => {
              setName(txt);
            }}
            value={name}
            style={[
              styles.input,
              {
                shadowRadius: scale(2),
              },
            ]}
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          <InputBox
            placeholder={getLocalText('Sponsor.cardnum')}
            onChangeText={(txt) => {
              setNumber(txt);
            }}
            value={number}
            style={[
              styles.input,
              {
                shadowRadius: scale(2),
              },
            ]}
            onSubmitEditing={() => Keyboard.dismiss()}
            maxLength={16}
            keyboardType="number-pad"
            returnKeyType={'done'}
          />
          <View style={styles.inputs}>
            <TouchableOpacity
              onPress={() => setOpen(!open)}
              style={[
                styles.dateButton,
                externalStyle.shadow,
                {shadowRadius: scale(2)},
              ]}>
              <Label title={date} style={styles.datefmt} />
              <Icon name="chevron-down" color="blue" size={scale(18)} />
            </TouchableOpacity>

            <InputBox
              placeholder={getLocalText('Sponsor.code')}
              value={code}
              onChangeText={(txt) => {
                setCode(txt);
              }}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry={true}
              onSubmitEditing={() => Keyboard.dismiss()}
              style={[styles.input, styles.code]}
              blurOnSubmit={true}
              returnKeyType={'done'}
            />
          </View>
        </View>
      </View>
      <DatePickerModel isShow={open} dateHandle={dateHandle} />
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
    width: theme.SCREENWIDTH - scale(95),
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
  },
  textCon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: scale(22),
  },
  subtext: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(14),
    color: theme.colors.black,
    marginLeft: scale(15),
    flex: 2,
  },
  input: {
    marginHorizontal: scale(0),
    marginBottom: scale(15),
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
  inputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  code: {
    shadowRadius: scale(2),
    width: '40%',
  },
  datefmt: {
    textAlign: 'center',
    marginLeft: scale(5),
    color: theme.colors.grey1,
  },
});

export default CardDetailsModel;
