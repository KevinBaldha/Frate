import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import Icon from 'react-native-vector-icons/Feather';
import RNFetchBlob from 'rn-fetch-blob';
import FastImage from 'react-native-fast-image';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import {images, scale, theme} from '../Utils';
import externalStyle from '../Css';
import {PdfViewer, Label} from './index';
import {getLocalText} from '../Locales/I18n';

const DocumentsFile = (props) => {
  const {item, isAttach, isVisible} = props;
  const [pdfView, setPdfView] = React.useState(false);
  const handlepdf = () => {
    setPdfView(!pdfView);
  };

  const checkPermission = async () => {
    if (Platform.OS === 'ios') {
      downloadFile();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: getLocalText('Settings.storagetitle'),
            message: getLocalText('Settings.storagemessage'),
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // Start downloading
          downloadFile();
        } else {
          // If permission denied then show alert
          Alert.alert('Error', getLocalText('Settings.needstorage'));
        }
      } catch (err) {
        // To handle permission related exception
      }
    }
  };

  const downloadFile = () => {
    Toast.show('Download start', Toast.SHORT);
    // Get today's date to add the time suffix in filename
    let date = new Date();
    // File URL which we want to download
    let FILE_URL = item?.uri.optimize; ///item?.pdf
    // Function to get extention of the file url
    let file_ext = getFileExtention(FILE_URL);
    file_ext = '.' + file_ext[0];
    // config: To get response by passing the downloading related options
    // fs: Root directory path to download
    const {config, fs} = RNFetchBlob;
    let RootDir = fs.dirs.PictureDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        path:
          RootDir +
          '/file_' +
          Math.floor(date.getTime() + date.getSeconds() / 2) +
          file_ext,
        description: 'downloading file...',
        notification: true,
        // useDownloadManager works with Android only
        useDownloadManager: true,
      },
    };
    config(options)
      .fetch('GET', FILE_URL)
      .then((res) => {
        // Alert after successful downloading
        Toast.show('File Downloaded Successfully.', Toast.SHORT);
      });
  };

  const getFileExtention = (fileUrl) => {
    // To get the file extension
    return /[.]/.exec(fileUrl) ? /[^.]+$/.exec(fileUrl) : '';
  };

  const ShareFile = async () => {
    let filePath = null;
    const configOptions = {fileCache: true};
    RNFetchBlob.config(configOptions)
      .fetch('GET', item?.uri.optimize)
      .then((resp) => {
        filePath = resp.path();
        return resp.readFile('base64');
      })
      .then(async (base64Data) => {
        base64Data = `data:${'application/pdf'};base64,` + base64Data;
        await Share.open({url: base64Data});
        // remove the image or pdf from device's storage
        await RNFS.unlink(filePath);
      });
  };
  return (
    <>
      <TouchableOpacity
        onPress={() => {
          if (!isVisible) {
            handlepdf();
          }
        }}>
        {item?.duration !== undefined ? (
          <Label
            title={item?.duration.toUpperCase()}
            style={{color: theme.colors.grey10}}
          />
        ) : (
          <View
            style={[
              styles.pdfBlock,
              externalStyle.shadow,
              {
                shadowRadius: scale(5),
                flexDirection: isAttach ? 'row' : 'column',
              },
            ]}>
            <View style={styles.imageView}>
              <FastImage source={images.pdf} style={styles.image} />
              {isAttach ? null : (
                <View style={styles.row}>
                  <TouchableOpacity
                    // style={{right: scale(30)}}
                    onPress={() => {
                      handlepdf();
                      // ShareFile();
                    }}>
                    <View>
                      {/* <FastImage
                        source={images.forword}
                        style={styles.forword}
                      /> */}
                      <Icon
                        name="download"
                        size={scale(25)}
                        color={theme.colors.blue}
                        onPress={() => {
                          checkPermission();
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <Label
              title={item?.name ? item?.name : 'testing.pdf'}
              style={[
                styles.pdfname,
                {
                  marginTop: isAttach ? scale(0) : scale(10),
                  marginLeft: isAttach ? scale(10) : scale(0),
                },
              ]}
              numberOfLines={2}
            />
          </View>
        )}
      </TouchableOpacity>
      <PdfViewer
        isVisible={pdfView}
        pdfuri={item?.uri?.optimize}
        close={handlepdf}
      />
    </>
  );
};

const styles = StyleSheet.create({
  pdfBlock: {
    width: '100%',
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.black,
    paddingVertical: scale(20),
    paddingHorizontal: scale(20),
    marginBottom: scale(10),
    elevation: scale(2),
    justifyContent: 'space-between',
  },
  row: {},
  imageView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pdfname: {
    alignSelf: 'flex-start',
    fontSize: scale(14),
  },
  image: {
    height: scale(30),
    width: scale(25),
    resizeMode: 'contain',
  },
  forword: {
    height: scale(20),
    width: scale(20),
    resizeMode: 'stretch',
    top: scale(3),
    left: scale(10),
  },
});

export default DocumentsFile;
