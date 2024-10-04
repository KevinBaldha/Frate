import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Modal from 'react-native-modal';
import externalStyle from '../../Css';
import {scale, theme, height} from '../../Utils';
import {Button} from '../index';
import {getLocalText} from '../../Locales/I18n';

const ReasonsModel = (props) => {
  const {isShow, reasonHanlde, reportList} = props;
  const [selectReason, setSelectResion] = useState({});
  const handleItem = (item) => {
    setSelectResion(item);
  };

  return (
    <Modal
      backdropTransitionInTiming={5000}
      isVisible={isShow}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      statusBarTranslucent
      deviceHeight={height}
      backdropColor={theme.colors.grey11}
      backdropOpacity={0}>
      <View
        style={[
          styles.mainContainer,
          externalStyle.shadow,
          {
            elevation: scale(2),
            shadowColor: theme.colors.blue1,
            shadowRadius: scale(2),
          },
        ]}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {reportList?.map((d, i) => {
              return (
                <Text
                  key={i.toString()}
                  onPress={() => handleItem(d)}
                  style={[
                    styles.txt,
                    {
                      fontFamily:
                        d.id === selectReason.id
                          ? theme.fonts.muktaMedium
                          : theme.fonts.muktaRegular,
                      color:
                        d.id === selectReason.id
                          ? theme.colors.blue
                          : theme.colors.black,
                    },
                  ]}>
                  {d.name}
                </Text>
              );
            })}
          </ScrollView>
          <View style={styles.divider} />
          <TouchableOpacity
            style={[styles.btn]}
            onPress={() => {
              reasonHanlde(selectReason);
            }}>
            <Text style={styles.btntxt}>
              {getLocalText('LoginSignup.confirm')}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.btnCon}>
          <Button
            onPress={() => reasonHanlde('')}
            style={styles.cancel}
            title={getLocalText('Report.cancel')}
            titleStyle={{
              color: theme.colors.red,
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.transparent,
    width: '100%',
    height: theme.SCREENHEIGHT * 0.68,
    position: 'absolute',
    bottom: scale(0),
  },
  txt: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(16),
    textAlign: 'center',
    paddingVertical: scale(12),
  },
  container: {
    width: '102%',
    height: theme.SCREENHEIGHT * 0.53,
    backgroundColor: theme.colors.white,
    padding: scale(35),
    borderRadius: scale(25),
    marginTop: scale(-25),
  },
  divider: {
    backgroundColor: theme.colors.divider3,
    width: '110%',
    alignSelf: 'center',
    height: 1,
  },
  btnCon: {
    position: 'absolute',
    bottom: scale(-10),
  },
  btn: {
    top: scale(15),
    alignSelf: 'center',
  },
  btntxt: {
    color: theme.colors.blue1,
    fontSize: scale(15),
    fontFamily: theme.fonts.rubikNormal,
  },
  cancel: {
    height: scale(55),
    backgroundColor: theme.colors.white,
    width: '115%',
  },
});

export default ReasonsModel;
