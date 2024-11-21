import {Platform} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import moment from 'moment';
const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();
import translate from 'translate';
import {appStoreIds, DeepLink} from './StaticData';
import {getLocalText} from '../Locales/I18n';
translate.engine = 'google';
translate.key = 'AIzaSyC30DEa_qqRLc9E56OnvpwqoWatMa3WzD0';

export const getDynamicLink = async (screenType, item) => {
  const link = await dynamicLinks().buildLink({
    link: DeepLink + `/${screenType}?${item?.id}`,
    // ?type=timeline&id=1
    // domainUriPrefix is created in your Firebase console
    domainUriPrefix: DeepLink,
    // optional setup which updates Firebase analytics campaign
    android: {
      packageName: 'com.frate.app',
    },
    ios: {
      appStoreId: appStoreIds,
      bundleId: 'com.Frate',
    },
  });
  return link;
};

const imageData = uri => {
  let nameofImageArr = uri.split('/');
  let nameofImage = nameofImageArr[nameofImageArr.length - 1];
  let extofImageArr = uri.split('.');
  let ext = 'image/' + extofImageArr[extofImageArr.length - 1];
  return {name: nameofImage, ext};
};

const imagesOptions = {
  title: getLocalText('Timeline.selectImage'),
  quality: 0.5,
  mediaType: 'photo',
  noData: true,
  maxWidth: 800,
  includeBase64: true,
  takePhotoButtonTitle: getLocalText('Timeline.takeImage'),
  chooseFromLibraryButtonTitle: getLocalText('Timeline.chooseLibrary'),
  storageOptions: {
    skipBackup: true,
    path: 'image',
  },
};

const mixOptions = {
  title: getLocalText('Timeline.chooseLibrary'),
  quality: 0.9,
  mediaType: 'mixed',
  noData: true,
  // maxWidth: 1280,
  takePhotoButtonTitle: getLocalText('Timeline.takeImage'),
  chooseFromLibraryButtonTitle: getLocalText('Timeline.chooseLibrary'),
  storageOptions: {
    skipBackup: true,
    path: 'imageVideo',
  },
};

const getTimeWithDay = value => {
  var date, hour, minutes, fullTime;
  date = new Date(value);
  // Getting current hour from Date object.
  hour = date.getHours().toString();
  if (hour.length < 2) {
    hour = '0' + hour.toString();
  }

  minutes = date.getMinutes().toString();
  if (minutes.length < 2) {
    minutes = '0' + minutes.toString();
  }

  let weekday = [
    getLocalText('WeekDays.sun').slice(0, 3),
    getLocalText('WeekDays.mon').slice(0, 3),
    getLocalText('WeekDays.tue').slice(0, 3),
    getLocalText('WeekDays.wed').slice(0, 3),
    getLocalText('WeekDays.thu').slice(0, 3),
    getLocalText('WeekDays.fri').slice(0, 3),
    getLocalText('WeekDays.sat').slice(0, 3),
  ][new Date().getDay()];

  fullTime = weekday.toString() + ' ' + hour + ':' + minutes;
  return fullTime;
};

const getWeekDay = day => {
  if (day === 'Mon') {
    return getLocalText('WeekDays.mon').slice(0, 3);
  } else if (day === 'Tue') {
    return getLocalText('WeekDays.tue').slice(0, 3);
  } else if (day === 'Wed') {
    return getLocalText('WeekDays.wed').slice(0, 3);
  } else if (day === 'Thu') {
    return getLocalText('WeekDays.thu').slice(0, 3);
  } else if (day === 'Fri') {
    return getLocalText('WeekDays.fri').slice(0, 3);
  } else if (day === 'Sat') {
    return getLocalText('WeekDays.sat').slice(0, 3);
  } else {
    return getLocalText('WeekDays.sun').slice(0, 3);
  }
};

const getTime = () => {
  return moment().format('HH') + 'h' + moment().format('mm') + 'm';
};

const amPmTime = () => {
  return moment().format('h:mm A');
};

const getDuration = type => {
  var hrs = type / 3600;
  var mins = (type % 3600) / 60;
  var secs = type % 60;
  var ret = '';
  if (hrs > 0) {
    // ret += '' + hrs.toString().split('.')[0] + ':' + (mins < 10 ? '0' : '');
  }
  ret += '' + mins.toString().split('.')[0] + ':' + (secs < 10 ? '0' : '');
  ret += '' + secs.toString().split('.')[0];
  return ret;
};

export const checkValidUrl = url => {
  if (url !== undefined && url !== null) {
    //define some image formats
    var types = [
      'jpg',
      'jpeg',
      'tiff',
      'png',
      'gif',
      'bmp',
      'JPG',
      'PNG',
      'JPEG',
      'webp',
    ];

    //split the url into parts that has dots before them
    var parts = url?.split('.');

    //get the last part
    var extension = parts[parts?.length - 1];

    //check if the extension matches list
    if (types.indexOf(extension) !== -1) {
      return true;
    } else {
      false;
    }
  }
};

export const handleResponse = async res => {
  if ((res.status === 200 || res.status === 201 || res.status === 204) && res) {
    return res.data;
  }
  return handleError(res);
};

export const handleError = async errorMsg => {
  try {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      if (state.isInternetReachable) {
        if (typeof errorMsg === 'object') {
          return {error: true, errorMsg: errorMsg};
        }
        return {error: true, errorMsg};
      }
      return {
        error: true,
        errorMsg: getLocalText('ErrorMessages.Unable_to_Reach'),
      };
    }
    return {
      error: true,
      errorMsg: getLocalText('ErrorMessages.No_Internet_Connection'),
    };
  } catch (e) {
    return {error: true, errorMsg: e.message};
  }
};

const LanguageIs = item => {
  return lngDetector.detect(item, 1);
};

const ConvertInFranch = async item => {
  const bar = await translate(item, {to: 'en', from: 'fr'});
  return bar;
  // const result = await translate(item, {
  //   tld: 'cn',
  //   to: 'fr',
  // });
  // return await result;
};

const Con = async () => {
  // const translator = TranslatorFactory.createTranslator();
  // translator.translate('good afternoon ').then((translated) => {
  //   return translated;
  //   //Do something with the translated text
  // });
  // const translator = await TranslatorFactory.createTranslator();
  // translator
  //   .translate('Engineering physics or engineering science', 'fr')
  //   .then((translated) => {
  //     return translated;
  //     //Do something with the translated text which would be in French
  //   });
};

class NotificationsPermissions {
  static async requestPermissionsNotifications() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
        // Handling the result of the permit request
        if (result === RESULTS.GRANTED) {
          console.log('Permissions granted');
        } else {
          console.log('Permissions not granted');
        }
      } catch (error) {
        // Error handling during permission request
        console.error(error);
      }
    }
  }
}

export {
  imageData,
  imagesOptions,
  getTimeWithDay,
  mixOptions,
  getTime,
  getDuration,
  amPmTime,
  getWeekDay,
  LanguageIs,
  ConvertInFranch,
  Con,
  NotificationsPermissions,
};
