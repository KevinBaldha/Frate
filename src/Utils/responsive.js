import {Dimensions} from 'react-native';
const {width, height} = Dimensions.get('screen');

const guideLineBaseWidth = 350;
const guideLineBaseHeight = 680;

const scale = (size) => (width / guideLineBaseWidth) * size;
const verticalScale = (size) => (height / guideLineBaseHeight) * size;
const moderatedScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export {scale, verticalScale, moderatedScale, height, width};
