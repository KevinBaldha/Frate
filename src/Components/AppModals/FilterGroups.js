import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import {isIphoneX} from 'react-native-iphone-x-helper';
import Icon from 'react-native-vector-icons/Feather';
import {scale, theme, height} from '../../Utils';
import externalStyle from '../../Css';
import {Label, RadioButton, Button, CheckBox} from '../index';
import {getLocalText} from '../../Locales/I18n';

const FilterGroups = (props) => {
  const {isVisible, categories, toggleFilterModal, All} = props;
  const [filterBy] = useState([
    {title: 'Groups.moreRecentGroups'},
    {title: 'Groups.olderGroups'},
  ]);
  const [showOnlyFriendGroups, setShowOnlyFriendGroups] = useState(false);
  const [selectedRadioKey, setRadioKey] = useState('');
  const [category, setCategory] = useState('');
  const handleModel = () => {
    if (selectedRadioKey?.length > 0 || category?.length > 0) {
      toggleFilterModal();
    } else {
      toggleFilterModal({selectedRadioKey, category, showOnlyFriendGroups});
      // setCategory('');
      // setRadioKey('');
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      backdropColor={theme.colors.darkBlue}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      statusBarTranslucent
      deviceHeight={height}
      style={{margin: scale(0)}}
      backdropOpacity={0}>
      <View
        style={[
          styles.container,
          externalStyle.shadow,
          {shadowRadius: scale(2)},
        ]}>
        <ScrollView
          contentContainerStyle={{
            padding: scale(17),
            paddingBottom: scale(20),
          }}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Label title={getLocalText('Groups.filterGroups')} />

            <TouchableOpacity
              style={{padding: scale(5)}}
              onPress={toggleFilterModal}>
              <Icon name="x" color={theme.colors.blue} size={scale(20)} />
            </TouchableOpacity>
          </View>

          <Label
            title={getLocalText('Groups.categories')}
            style={styles.category}
          />
          <TouchableOpacity
            onPress={() => {
              All();
            }}
            style={[
              styles.categoryCard,
              externalStyle.shadow,
              styles.catCard,
              {shadowRadius: scale(10)},
            ]}>
            <View style={styles.circle}>
              <Icon name="globe" color={theme.colors.black} size={scale(20)} />
            </View>
            <Text style={styles.categoryText}>
              {getLocalText('Groups.showAllCategory')}
            </Text>
          </TouchableOpacity>

          <View style={styles.catView}>
            {categories.slice(1).map((d, i) => {
              var CatImage = d.image?.original;
              return (
                <TouchableOpacity
                  onPress={() => {
                    if (d?.id === category?.id) {
                      setCategory('');
                    } else {
                      setCategory(d);
                    }
                  }}
                  key={i.toString()}
                  style={[
                    styles.categoryCard,
                    externalStyle.shadow,
                    styles.catCard1,
                    {
                      borderColor:
                        d?.id === category?.id
                          ? theme.colors.black
                          : theme.colors.transparent,
                      shadowRadius: scale(12),
                      marginRight: i % 2 ? scale(0) : '3%',
                    },
                  ]}>
                  <View style={styles.circle}>
                    <FastImage
                      source={{uri: CatImage}}
                      style={{height: scale(30), width: scale(30)}}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryText1,
                      d?.id === category?.id ? {fontWeight: '700'} : {},
                    ]}>
                    {d.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Label
            title={getLocalText('Groups.filterBy')}
            style={[styles.category, {marginBottom: scale(8)}]}
          />
          {filterBy.map((d, i) => {
            return (
              <TouchableOpacity
                key={i.toString()}
                style={styles.optionsContainer}
                onPress={() => {
                  setRadioKey(i);
                }}>
                <RadioButton index={i} selectedIndex={selectedRadioKey} />
                <Label title={getLocalText(d.title)} style={styles.options} />
              </TouchableOpacity>
            );
          })}
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.optionsContainer}
            onPress={() => {
              setShowOnlyFriendGroups(!showOnlyFriendGroups);
            }}>
            <CheckBox isChecked={showOnlyFriendGroups} />
            <Label
              title={getLocalText('Groups.friendsGroup')}
              style={styles.options}
            />
          </TouchableOpacity>
        </ScrollView>
        <Button
          title={getLocalText('Groups.refresh')}
          onPress={() => handleModel()}
          style={styles.refreshButton}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    width: theme.SCREENWIDTH,
    height: theme.SCREENHEIGHT,
    marginTop: isIphoneX() ? scale(85) : scale(85),
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontFamily: theme.fonts.muktaSemiBold,
    color: theme.colors.black,
    marginTop: scale(20),
  },
  catCard: {
    justifyContent: 'center',
    marginTop: scale(15),
  },
  catCard1: {
    width: '48%',
    marginBottom: scale(9),
    paddingHorizontal: scale(13),
  },
  categoryCard: {
    backgroundColor: theme.colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    height: scale(73),
    borderRadius: scale(18),
    borderWidth: scale(1.2),
    borderColor: theme.colors.transparent,
  },
  circle: {
    width: scale(35),
    height: scale(35),
    borderRadius: scale(18),
    backgroundColor: theme.colors.grey9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(9),
  },
  categoryText: {
    color: theme.colors.grey2,
    fontSize: scale(11.5),
    fontFamily: theme.fonts.muktaRegular,
    lineHeight: scale(15),
  },
  categoryText1: {
    color: theme.colors.grey2,
    fontSize: scale(11.5),
    fontFamily: theme.fonts.muktaRegular,
    lineHeight: scale(15),
    width: '70%',
  },
  catView: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: scale(9),
  },
  optionsContainer: {
    flexDirection: 'row',
    marginVertical: scale(7),
    alignItems: 'center',
  },
  options: {
    marginLeft: scale(13),
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.grey1,
    marginVertical: scale(17),
  },
  refreshButton: {
    borderRadius: scale(33),
    marginTop: scale(30),
  },
});

export default FilterGroups;
