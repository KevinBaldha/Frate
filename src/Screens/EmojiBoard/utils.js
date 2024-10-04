import {Dimensions, Platform, Text} from 'react-native';
import React from 'react';
import _ from 'lodash';
import {scale, theme} from '../../Utils';
require('string.fromcodepoint');

export const toEmoji = (code) => {
  return String.fromCodePoint(...code.split('-').map((u) => '0x' + u));
};

export const isIphoneXorAbove = () => {
  const dimen = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (dimen.height === 812 ||
      dimen.width === 812 ||
      dimen.height === 896 ||
      dimen.width === 896)
  );
};

export const isAndroid = () => {
  return Platform.OS === 'android';
};

export const handleDefaultEmoji = (data, blackList) => {
  const filteredData = data.filter((e) => !_.includes(blackList, e.short_name));
  const sortedData = _.orderBy(filteredData, 'sort_order');
  const groupedData = _.groupBy(sortedData, 'category');

  const transformData = _.mapValues(groupedData, (group) =>
    group.map((value) => {
      let skins = null;
      if (value.skin_variations) {
        skins = _.toArray(value.skin_variations).map((skin) => {
          return {
            code: toEmoji(skin.unified),
            name: value.name,
          };
        });
      }
      return {
        code: toEmoji(value.unified),
        name: value.short_name,
        skins,
      };
    }),
  );
  return transformData;
};

export const handleCustomEmoji = (data, blackList) => {
  const filteredData = data.filter((e) => !_.includes(blackList, e.name));
  const sortedData = _.orderBy(filteredData, 'sort_order');
  const groupedData = _.groupBy(sortedData, 'category');

  const transformData = _.mapValues(groupedData, (group) =>
    group.map((value) => {
      return {
        code: value.code || null,
        img: value.img || null,
        name: value.name || null,
        skins: value.skins || null,
      };
    }),
  );
  return transformData;
};

export const HASHTAG_FORMATTER = (string, onPressHastag) => {
  return string
    .split(/((?:^|\s)(?:#[a-z\d-]+))/gi)
    .filter(Boolean)
    .map((v, i) => {
      if (v.includes('#')) {
        return (
          <Text
            style={{
              marginVertical: scale(8),
              fontFamily: theme.fonts.muktaRegular,
              fontSize: scale(12),
              color: theme.colors.blue,
            }}
            key={i}
            onPress={() => {
              onPressHastag(v);
            }}>
            {` ${v}`}
          </Text>
        );
      } else {
        return (
          <Text
            key={i}
            style={{
              marginVertical: scale(8),
              fontFamily: theme.fonts.muktaRegular,
              fontSize: scale(12),
            }}>
            {v}
          </Text>
        );
      }
    });
};
