import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import {scale, theme, height} from '../../Utils';
import {Label, Button, InputBox, ReasonsModel} from '../index';
import {getLocalText} from '../../Locales/I18n';
import {BLOCKTYPES} from '../../Utils/StaticData';

const ReportDetailsModel = (props) => {
  const {show, closeModal, postData, reasonList, id, reportType} = props;
  const [selectedId, setSelectedId] = useState('');
  const [selectResion, setSelectResion] = useState(
    getLocalText('Report.selectreason'),
  );
  const [details, setDetails] = useState('');
  const [open, setOpen] = useState(false);
  const handleReson = (data) => {
    if (data === '') {
      setSelectResion(getLocalText('Report.selectreason'));
      setOpen(!open);
    } else {
      setSelectResion(data.name);
      setSelectedId(data.id);
      //  reportDetails(data, details);
      setTimeout(() => {
        setOpen(!open);
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <Modal
        isVisible={show}
        animationIn="zoomIn"
        animationOut="zoomOut"
        statusBarTranslucent
        deviceHeight={height}
        backdropColor={theme.colors.grey11}>
        <View style={styles.mainContainer}>
          <View style={styles.container}>
            <View style={styles.headerCon}>
              <Icon
                name="alert-triangle"
                size={scale(19)}
                color={theme.colors.blue}
              />
              <Label
                title={getLocalText('Report.reporttitle')}
                style={{marginLeft: scale(10)}}
              />

              <TouchableOpacity
                onPress={() => {
                  closeModal();
                }}
                style={[styles.close, {opacity: open ? 0.2 : 1}]}>
                <Icon name="x" size={scale(20)} color={theme.colors.blue} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              {id
                ? getLocalText('Report.report')
                : postData && reportType === BLOCKTYPES.REPORT_GROUP
                ? getLocalText('Report.reportgrp')
                : getLocalText('Report.report')}
              {postData && (
                <Text style={styles.nametxt}>
                  {/* {postData.first_name} */}
                  {/* {getLocalText('Report.reportpost')} */}
                </Text>
              )}
            </Text>

            <Label title={getLocalText('Report.reason')} style={styles.title} />
            <TouchableOpacity
              onPress={() => setOpen(!open)}
              style={styles.dropdownCon}>
              <Label
                title={selectResion}
                style={[
                  styles.label,
                  {
                    color:
                      selectResion === getLocalText('Report.selectreason')
                        ? theme.colors.grey1
                        : theme.colors.black,
                  },
                ]}
              />
              <Icon name="chevron-down" color="blue" size={25} />
            </TouchableOpacity>

            <Label
              title={getLocalText('Report.details')}
              style={styles.title}
            />

            <InputBox
              multiline={true}
              style={styles.input1}
              numberOfLines={5}
              inputStyle={styles.inputStyle}
              placeholder={getLocalText('Report.placeholder')}
              textAlignVertical="top"
              onChangeText={(txt) => setDetails(txt)}
              value={details}
            />

            <Button
              onPress={() => {
                if (selectedId || details) {
                  closeModal(details, selectedId);
                  setSelectResion(getLocalText('Report.selectreason'));
                  setSelectedId('');
                  setDetails('');
                } else {
                  Alert.alert(getLocalText('Report.reportgroupselection'));
                }
              }}
              title={getLocalText('Report.reporttxt')}
              style={styles.reportBtn}
            />
          </View>
        </View>
        <ReasonsModel
          isShow={open}
          reasonHanlde={handleReson}
          reportList={reasonList}
        />
      </Modal>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: theme.colors.white,
    padding: scale(25),
    borderRadius: scale(12),
    width: theme.SCREENWIDTH - scale(35),
  },
  label: {textAlign: 'center', left: scale(20)},
  headerCon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(13),
    color: theme.colors.black,
    marginTop: scale(10),
  },
  nametxt: {
    fontFamily: theme.fonts.muktaMedium,
  },
  close: {
    position: 'absolute',
    right: scale(0),
  },
  title: {
    fontFamily: theme.fonts.muktaRegular,
    color: theme.colors.black,
    marginTop: scale(10),
  },
  input1: {
    width: '100%',
    alignSelf: 'center',
    height: theme.SCREENHEIGHT * 0.23,
    zIndex: -1,
  },
  inputStyle: {
    height: theme.SCREENHEIGHT * 0.23,
    width: '100%',
    textAlign: 'left',
    padding: scale(12),
    paddingTop: scale(10),
  },
  dropdownCon: {
    marginHorizontal: scale(30),
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: scale(19),
    height: theme.SCREENHEIGHT * 0.068,
    backgroundColor: theme.colors.white,
    borderRadius: scale(15),
    flexDirection: 'row',
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 1,
    elevation: 1,
  },
  reportBtn: {
    marginTop: scale(0),
    marginBottom: scale(0),
    width: '100%',
  },
});

export default ReportDetailsModel;
