/* eslint-disable eol-last */
/* eslint-disable quotes */
import {Platform} from 'react-native';

export const dollarAmountToSku = {
  0.99: 'sponsored_post_100',
  4.99: 'sponsored_post_500',
  9.99: 'sponsored_post_1000',
  14.99: 'sponsored_post_1500',
  19.99: 'sponsored_post_2000',
  24.99: 'sponsored_post_2500',
};

const productSkus = Platform.select({
  android: ['elog_monthly'],  //  point_1000  //  elog_monthly
});

export const constants = {
  productSkus,
};
