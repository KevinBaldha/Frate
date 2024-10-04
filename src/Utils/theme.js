import {Dimensions} from 'react-native';
const {width, height} = Dimensions.get('window');

const theme = {
  // here Mukta :: Thin 100, Extra-light 200, Light 300, Regular 400, Medium 500, Semi-bold 600, Bold 700
  // here Rubik:: Light 300, Regular 400, Medium 500, Semi-bold 600, Bold 700, Extra-bold 800, Black 900
  // here Mukta vaani
  defaultGradient: ['#095ED630', '#095ED624'],
  fonts: {
    rubicMedium: 'Rubik-Medium', // font-weight: 500
    rubikLight: 'Rubik-Light', // font-weight: 300
    rubikNormal: 'Rubik-Regular', // font-weight: 400
    rubicSemiBold: 'Rubik-SemiBold', // font-weight: 600
    muktaRegular: 'Mukta-Regular', // font-weight:300
    muktaMedium: 'Mukta-Medium', // font-weight: 500
    muktaSemiBold: 'Mukta-SemiBold', //font-weight: 600
    muktaBold: 'Mukta-Bold', // font-weight: 700
    robotoBold: 'Roboto-Bold', // font-weight 700
    muktaVaaniLight: 'MuktaVaani-Light', //font-weight 300 ,
    muktaVaaniSemiBold: 'MuktaVaani-SemiBold', // font-weight : 600
    muktaVaaniExtraBold: 'MuktaVaani-ExtraBold', //font-wight:800
  },

  colors: {
    white: '#FFFFFF',
    white1: '#F2F2F2',
    white2: '#FCFCFC',
    white3: '#FDFDFD',
    black: '#000000',
    black1: '#2e2e2e',
    grey: '#ABABAB',
    grey1: '#AAAAAA',
    grey2: '#555556',
    grey3: '#EBEBEC',
    grey4: '#B7B7B7',
    grey5: '#F8F8F8',
    grey6: '#B9B9B9',
    grey7: '#8C8C8C',
    grey8: '#E3E3E3',
    grey9: '#F5F5F5',
    grey10: '#AFAFB0',
    grey11: '#D0D0D0',
    grey12: '#787878',
    grey13: '#D7D7D7',
    grey14: '#F0F0F0',
    grey15: '#D2D2D2',
    grey16: '#AFAFAF',
    grey17: '#CCCCCC',
    grey18: '#A5A5A6',
    grey19: '#EDEDED',
    grey20: '#D3D3D3',
    grey21: '#9B9B9C',
    grey22: '#E1E1E1',
    grey23: '#4E4E4E',
    grey24: '#555555',
    greyBD: '#BDBDBD',
    purple: '#543864',
    purple1: '#252886',
    purpleLight: '#4A4B6D',
    blue0: '#0249AD',
    blueLine: '#003599',
    blue: '#0249AD',
    blue1: '#095ED6',
    divider: '#2067CB',
    blue2: '#82B3F8',
    blue3: '#BCD4F6',
    blue4: '#84B5FB',
    blue5: '#f5f9ff',
    green: '#7CE163',
    green1: '#7FBE3F',
    green2: '#97C66B',
    green3: '#13B049',
    transparent: 'transparent',
    divider1: '#E0E0E0',
    divider3: '#EFEFEF',
    red: '#E21838',
    red1: '#D9111B',
    yellow: '#F3BE4B',
    orange: '#F06C0C',
    yellow1: '#FDCA14',
    darkGrey: '#525151',
    blackTransparentBlack20: '#00000020',
  },
  SCREENWIDTH: width,
  SCREENHEIGHT: height,
};

export default theme;
