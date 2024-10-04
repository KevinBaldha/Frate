/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import _ from 'lodash';
import PropTypes from 'prop-types';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import SkinBox from './SkinBox';
import EmojiIcon from './EmojiIcon';
import Icon from 'react-native-vector-icons/Feather';

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  categoryView: {
    position: 'relative',
    flex: 1,
  },
  categoryPageView: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  categoryLabel: {
    height: 40,
    paddingLeft: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: {
    color: '#aaa',
    fontWeight: 'bold',
  },
});

const CategoryView = ({
  category,
  emojis,
  numRows,
  numCols,
  emojiSize,
  labelStyle,
  onClick,
  onClose,
}) => {
  const [toggleSkinBox, setToggleSkinBox] = useState({
    showSkinBox: false,
    emoji: null,
  });
  // Emoji count per page
  const perPage = numRows * numCols;
  const emojiWidth = (width - 20) / numRows;
  const clickEmoji = (emoji) => {
    setToggleSkinBox({
      showSkinBox: false,
      emoji: null,
    });
    onClick(emoji);
  };

  const longPressEmoji = (emoji) => {
    if (emoji.skins) {
      setToggleSkinBox({
        showSkinBox: true,
        emoji,
      });
    } else {
      onClick(emoji);
    }
  };

  const tabBar = () => {
    return (
      <View style={styles.categoryLabel}>
        <Text style={[styles.labelText, labelStyle]}>{category}</Text>

        <TouchableOpacity
          style={{marginRight: 25}}
          onPress={() => {
            onClose(false);
          }}>
          <Icon name={'x'} size={18} color={'#000000'} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCategory = () => {
    if (!emojis.length) {
      return <View />;
    }
    const pages = Math.ceil(emojis.length / perPage);
    const categoryView = [];
    for (let i = 0; i < pages; i++) {
      const currentPageEmojis = _.slice(emojis, i * perPage, (i + 1) * perPage);
      categoryView.push(
        <View
          style={styles.categoryPageView}
          key={`page-${i}`}
          tabLabel={`page-${i}`}>
          {currentPageEmojis.map((emoji, key) => {
            return (
              <EmojiIcon
                key={key}
                emoji={emoji}
                clickEmoji={clickEmoji}
                longPressEmoji={longPressEmoji}
                emojiWidth={emojiWidth}
                emojiSize={emojiSize}
              />
            );
          })}
        </View>,
      );
    }
    return categoryView;
  };
  return (
    <View tabLabel={category} style={styles.categoryView}>
      {toggleSkinBox.showSkinBox && (
        <SkinBox
          emoji={toggleSkinBox.emoji}
          clickEmoji={clickEmoji}
          emojiWidth={emojiWidth}
          emojiSize={emojiSize}
        />
      )}
      <ScrollableTabView
        tabBarPosition="top"
        renderTabBar={() => tabBar()}
        initialPage={0}>
        {renderCategory()}
      </ScrollableTabView>
    </View>
  );
};

CategoryView.propTypes = {
  category: PropTypes.string,
};

export default CategoryView;
