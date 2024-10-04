import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import SimpleToast from 'react-native-simple-toast';
import DatePicker from 'react-native-date-picker';
import Modal from 'react-native-modal';
import * as RNLocalize from 'react-native-localize';
import moment from 'moment';
import externalStyle from '../../Css';
import {scale, theme, height} from '../../Utils';
import {Button, Label} from '../index';
import {getLocalText} from '../../Locales/I18n';

const DatePickerModel = (props) => {
  const {isShow, dateHandle, mode} = props;
  const [date, setDate] = useState('');
  const [yearList, setYearList] = useState([]);
  const [selMonth, setSelMonth] = useState('');
  const [selYear, setSelYear] = useState('');
  const locales = RNLocalize.getLocales();
  const langCode = locales[0].languageCode;

  this.years = function (startYear) {
    var currentYear = new Date().getFullYear() + 50;
    var years = [];
    startYear = startYear || new Date().getFullYear();
    while (startYear <= currentYear) {
      years.push({label: startYear++, value: startYear});
    }
    return years;
  };

  useEffect(() => {
    setYearList(this.years());
  }, []);

  const handleConfrim = () => {
    if (mode == 'month') {
      if (selMonth == '' && selYear == '') {
        SimpleToast.show('Plase select month & year');
      } else {
        dateHandle(selMonth, selYear);
        setSelMonth('');
        setSelYear('');
      }
    } else {
      dateHandle(moment(date).format('MM/YY'));
    }
  };

  return (
    <Modal
      isVisible={isShow}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      statusBarTranslucent
      deviceHeight={height}
      backdropColor={theme.colors.grey11}
      backdropOpacity={0.5}>
      <View
        style={[
          styles.mainContainer,
          externalStyle.shadow,
          {
            elevation: scale(3),
            shadowColor: theme.colors.black,
            shadowRadius: scale(2),
          },
        ]}>
        <View style={styles.container}>
          {mode == 'month' ? (
            isShow && (
              <View
                style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                <View>
                  <Label title={'Month'} />
                  <ScrollView
                    style={styles.scrollview}
                    contentContainerStyle={styles.centerView}>
                    {Array(12)
                      .fill(null)
                      .map((item, index) => {
                        return (
                          <TouchableOpacity
                            key={index}
                            style={styles.yearView}
                            onPress={() => {
                              setSelMonth(index + 1);
                            }}>
                            <Text
                              style={[
                                styles.btnLabel,
                                {
                                  color:
                                    selMonth == index + 1
                                      ? theme.colors.blue
                                      : theme.colors.black,
                                },
                              ]}>
                              {index + 1}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                  </ScrollView>
                </View>
                <View>
                  <Label title={'Year'} />
                  <ScrollView
                    style={styles.scrollview}
                    contentContainerStyle={styles.centerView}>
                    {yearList &&
                      yearList.map((item, index) => {
                        return (
                          <TouchableOpacity
                            key={index}
                            style={styles.yearView}
                            onPress={() => {
                              setSelYear(item?.label);
                            }}>
                            <Text
                              style={[
                                styles.btnLabel,
                                {
                                  color:
                                    selYear == item?.label
                                      ? theme.colors.blue
                                      : theme.colors.black,
                                },
                              ]}>
                              {item?.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                  </ScrollView>
                </View>
              </View>
            )
          ) : (
            <DatePicker
              date={date}
              onDateChange={setDate}
              mode="date"
              dividerHeight={0}
              locale={langCode}
              minimumDate={new Date()}
            />
          )}
          <View style={styles.divider} />
          <TouchableOpacity
            style={[styles.confirmButton]}
            onPress={() => {
              handleConfrim();
            }}>
            <Text style={styles.confirmText}>
              {getLocalText('LoginSignup.confirm')}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.btnCon}>
          <Button
            onPress={() => dateHandle('')}
            style={[styles.cancel, externalStyle.shadow, {elevation: scale(3)}]}
            title={getLocalText('Report.cancel')}
            titleStyle={{
              color: theme.colors.red1,
              fontFamily: theme.fonts.rubikNormal,
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.transparent,
    width: theme.SCREENWIDTH - scale(25),
    position: 'absolute',
    bottom: scale(0),
  },
  centerView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    backgroundColor: theme.colors.white,
    paddingHorizontal: scale(35),
    paddingTop: scale(5),
    borderRadius: scale(25),
    marginBottom: scale(70),
  },
  divider: {
    backgroundColor: theme.colors.divider3,
    width: theme.SCREENWIDTH * 0.8,
    alignSelf: 'center',
    height: scale(1),
  },
  btnCon: {
    position: 'absolute',
    bottom: scale(-10),
  },
  confirmButton: {
    paddingVertical: scale(17),
    alignItems: 'center',
  },
  confirmText: {
    color: theme.colors.blue1,
    fontSize: scale(15),
    fontFamily: theme.fonts.rubikNormal,
  },
  cancel: {
    backgroundColor: theme.colors.white,
    width: theme.SCREENWIDTH - scale(36),
    marginHorizontal: scale(18),
    height: scale(55),
  },
  btnLabel: {
    fontFamily: theme.fonts.muktaVaaniSemiBold,
    fontSize: scale(14.2),
  },
  scrollview: {
    height: scale(100),
  },
});

export default DatePickerModel;
