/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  PermissionsAndroid,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {isIphoneX} from 'react-native-iphone-x-helper';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import DropDownPicker from 'react-native-dropdown-picker';
import {scale, theme, height} from '../../Utils';
import {Label} from '../index';

const GalleryModel = props => {
  const [attachImages, setattachImages] = useState([]);
  const {isVisible, handleGallery} = props;
  const [images, setImages] = useState([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    //album list
    CameraRoll.getAlbums({
      assetType: 'Photos',
    }).then(res => {
      let arr = [];
      res.map((d, i) => {
        return arr.push({label: d.title, value: d.title});
      });

      setItems(arr);
    });

    //images list
    if (images) {
      CameraRoll.getPhotos({
        first: 1000000,
        assetType: 'Photos',
        groupName: value,
        groupTypes: 'All',
      })
        .then(r => {
          setImages(r.edges);
        })
        .catch(() => {});
    }
    if (Platform.OS === 'android') {
      hasAndroidPermission();
    }
  }, [0]);

  const hadlealb = () => {
    setImages('');
    CameraRoll.getPhotos({
      first: 1000000,
      assetType: 'Photos',
      groupName: value,
      groupTypes: 'All',
    })
      .then(r => {
        setImages(r.edges);
      })
      .catch(() => {});
  };

  const hasAndroidPermission = async () => {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }
  };

  const addImages = (data, index) => {
    let checkimg = attachImages && attachImages.find(d => d.uri === data);
    if (checkimg) {
      //remove image
      const arr = attachImages.filter(item => item?.uri !== data);
      let imagesTmp = [];
      arr.forEach(myFunction);
      function myFunction(item, i) {
        imagesTmp.push({uri: item?.uri, index: i + 1, type: 'image/jpeg'});
      }
      setattachImages(imagesTmp);
    } else {
      //add imagee
      setattachImages([
        ...attachImages,
        {uri: data, index: index, type: 'image/jpeg'},
      ]);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      statusBarTranslucent
      deviceHeight={height}
      style={styles.modelView}
      backdropOpacity={0}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setattachImages(['']);
              handleGallery('');
              setValue('');
            }}
            style={{
              paddingHorizontal: scale(10),
            }}>
            <Icon name="x" color={theme.colors.black} size={scale(20)} />
          </TouchableOpacity>
          <View>
            <DropDownPicker
              placeholder={'ALL'}
              style={styles.dropDown}
              dropDownContainerStyle={styles.dropdownContainer}
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              showBadgeDot={true}
              onChangeValue={() => hadlealb()}
              listMode="MODAL"
            />
          </View>

          <TouchableOpacity
            style={styles.rightIcon}
            onPress={() => {
              attachImages.length > 0 ? handleGallery(attachImages) : null;
            }}>
            <Icon
              name="chevron-right"
              color={
                attachImages.length > 0
                  ? theme.colors.blue
                  : theme.colors.grey20
              }
              size={scale(20)}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.gallreyView}>
          <FlatList
            data={images}
            keyExtractor={index => index.toString()}
            renderItem={(data, index) => (
              <TouchableOpacity
                onPress={() =>
                  addImages(data.item?.node.image.uri, attachImages.length + 1)
                }>
                {attachImages.map((i, d) => {
                  if (data.item?.node.image.uri === i.uri) {
                    return (
                      <View style={styles.counterCon}>
                        <Label title={i.index} style={styles.label} />
                      </View>
                    );
                  } else {
                    null;
                  }
                })}

                <FastImage
                  source={{uri: data.item?.node.image.uri}}
                  style={styles.imageView}
                  key={data.id}
                />
              </TouchableOpacity>
            )}
            numColumns={3}
          />
        </View>
      </View>
    </Modal>
  );
};
export default GalleryModel;
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white1,
    width: theme.SCREENWIDTH,
    height: '100%',
    marginTop: isIphoneX() ? scale(25) : scale(0),
    flex: 1,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    height: scale(55),
    alignItems: 'center',
  },
  modelView: {
    marginBottom: 0,
  },
  label: {
    color: theme.colors.white,
    fontSize: scale(12),
    textAlign: 'center',
  },
  image: {
    width: theme.SCREENWIDTH / 3.2,
    marginHorizontal: scale(2),
    marginVertical: scale(2),
    height: 100,
  },
  rightIcon: {position: 'absolute', right: scale(15)},
  gallreyView: {
    width: '100%',
    height: theme.SCREENHEIGHT * 0.95,
    alignItems: 'center',
    zIndex: -11,
  },
  dropdownContainer: {
    width: '35%',
    zIndex: 111,
    height: 100,
  },
  counterCon: {
    backgroundColor: theme.colors.blue,
    height: scale(20),
    width: scale(20),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    margin: scale(10),
    zIndex: 111,
    borderColor: theme.colors.white,
    borderWidth: scale(1.5),
  },
  dropDown: {
    zIndex: -1111,
    width: '45%',
    borderColor: theme.colors.transparent,
  },
  imageView: {
    width: theme.SCREENWIDTH / 3.2,
    marginHorizontal: scale(2),
    marginVertical: scale(2),
    height: 100,
  },
});
