import React, {Component} from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {Grid, StackedBarChart, XAxis, YAxis} from 'react-native-svg-charts';
import {G} from 'react-native-svg';
import {Rect} from 'react-native-svg';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import Pie from 'react-native-pie';
import {
  ScreenContainer,
  Label,
  BackgroundChunk,
  HeaderView,
  OfflineModel,
} from '../Components';
import {scale, theme, Api, images} from '../Utils';
import {getLocalText} from '../Locales/I18n';
import externalStyle from '../Css';
import {country} from '../Utils/StaticData';
import {API, getAPICall} from '../Utils/appApi';

export default class Statistics extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      options: [],
      country: country,
      visitor: [
        {id: 1, name: 'Post.male', color: theme.colors.blue, count: 0},
        {id: 2, name: 'Post.female', color: theme.colors.blue2, count: 0},
        {id: 3, name: 'Post.othertxt', color: theme.colors.blue3, count: 0},
      ],
      staticsData: '',
      postData: this.props.route.params,
      genderChart: [],
      totalViewCountChart: [],
      stackedData: [],
      xAxisList: [],
      totalViewPerPost: 0,
    };
  }
  componentDidMount() {
    this.getStatics();
  }

  getStatics = async () => {
    let postId = this.props.route.params.data?.id;
    let staticsResponse = await getAPICall(API.getPostStatics + postId);
    if (staticsResponse.success) {
      let dataValue = staticsResponse.data;
      let countData = [
        {
          title: 'Post.userReach',
          count: dataValue?.user_reach_count,
          icon: images.userIcon,
        },
        {
          title: 'Post.totalInter',
          count: dataValue.total_interactions,
          icon: images.likeEmoji,
        },
      ];
      let lastElement =
        dataValue.total_views_of_post_per_day[
          dataValue.total_views_of_post_per_day.length - 1
        ];
      this.setState({
        staticsData: dataValue,
        options: countData,
        totalViewPerPost: lastElement.count,
      });
      const VisitorArray = [...this.state.visitor];
      VisitorArray[0].count = dataValue?.post_men_views_count;
      VisitorArray[1].count = dataValue?.post_women_views_count;
      VisitorArray[2].count = dataValue?.post_other_views_count;
      this.setState({visitor: VisitorArray});
      let stackedData = [];
      let xAxisList = [];

      dataValue.total_views_of_post_per_day.map((value) => {
        stackedData.push({
          date: moment(value.date).format('DD/MM'),
          count: value.count,
        });
        xAxisList.push(moment(value.date).format('DD/MM'));
      });
      this.setState({stackedData: stackedData, xAxisList: xAxisList});
    } else {
    }
  };

  RoundedCorners = ({x, y, bandwidth}) => {
    return this.state.stackedData.map((item, index) => {
      return (
        <G key={index}>
          <Rect
            x={x(index)}
            y={y(item?.count) - 5} // Subtract Height / 2 to make half of the Rect above the bar
            rx={10} // Set to Height / 2
            ry={10} // Set to Height / 2
            width={bandwidth}
            height={item?.count === 0 ? 0 : 10} // Height of the Rect
            fill={theme.colors.blue}
          />
        </G>
      );
    });
  };

  render() {
    const {options, visitor, stackedData} = this.state;
    const totalCount =
      visitor[0]?.count + visitor[1]?.count + visitor[2]?.count;
    const maleCount =
      visitor[0]?.count === 0 ? 0 : (100 / totalCount) * visitor[0]?.count;
    const femaleCount =
      visitor[1]?.count === 0 ? 0 : (100 / totalCount) * visitor[1]?.count;
    const otherCount =
      visitor[2]?.count === 0 ? 0 : (100 / totalCount) * visitor[2]?.count;
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView {...this.props} title={getLocalText('Post.statistics')} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.row}>
            {options.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index.toString()}
                  style={[
                    styles.container,
                    externalStyle.shadow,
                    {elevation: scale(2), shadowRadius: scale(3)},
                  ]}>
                  <FastImage
                    source={item?.icon}
                    style={{
                      width: scale(20),
                      height: scale(20),
                      marginTop: scale(10),
                    }}
                    resizeMode="contain"
                  />
                  <Label title={item?.count} style={styles.counter} />
                  <Label
                    title={getLocalText(item?.title)}
                    style={styles.title}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.cartContainer}>
            <Label
              title={
                getLocalText('Post.totalView') + this.state.totalViewPerPost
              }
              style={{...styles.counter, fontSize: scale(15)}}
            />
            <Label
              title={getLocalText('Post.last7Day')}
              style={{color: theme.colors.grey10, marginBottom: scale(10)}}
            />
            <View style={styles.chartView}>
              <YAxis
                data={stackedData.map((d) => d.count)}
                contentInset={{top: 20, bottom: 20}}
                svg={{
                  fill: theme.colors.grey10,
                  fontSize: scale(12),
                }}
                numberOfTicks={
                  Math.max(...stackedData.map((d) => d.count)) < 4
                    ? Math.max(...stackedData.map((d) => d.count))
                    : 5
                }
                formatLabel={(value) => `${value}`}
                min={Math.min(...stackedData.map((d) => d.count))}
                max={Math.max(...stackedData.map((d) => d.count))}
              />
              <View style={styles.chartMain}>
                <StackedBarChart
                  style={styles.chartStyles}
                  keys={['count']}
                  colors={[theme.colors.blue]}
                  data={stackedData}
                  yMin={Math.min(...stackedData.map((d) => d.count))}
                  yMax={Math.max(...stackedData.map((d) => d.count))}
                  spacingInner={0.22}
                  spacingOuter={0.22}
                  curve={55}
                  contentInset={{
                    top: 20,
                    bottom: 20,
                  }}>
                  <Grid svg={{strokeDasharray: 10}} />
                  <this.RoundedCorners />
                </StackedBarChart>
                <XAxis
                  style={styles.xAxis}
                  data={this.state.xAxisList}
                  yAccessor={({index}) => index}
                  formatLabel={(_, index) => {
                    return this.state.xAxisList[index];
                  }}
                  contentInset={{
                    left: scale(18),
                    right: scale(35),
                  }}
                  svg={{fontSize: scale(11), fill: theme.colors.grey10}}
                />
              </View>
            </View>
          </View>
          <View style={styles.con}>
            <View style={styles.countryView}>
              <Label
                title={getLocalText('Post.visitor')}
                style={{...styles.counter, fontSize: scale(15)}}
              />
              <Pie
                radius={70}
                sections={[
                  {
                    percentage: maleCount,
                    color: theme.colors.blue,
                  },
                  {
                    percentage: femaleCount,
                    color: theme.colors.blue2,
                  },
                  {
                    percentage: otherCount,
                    color: theme.colors.blue3,
                  },
                ]}
                strokeCap={'butt'}
              />
              {otherCount !== 0 && (
                <View
                  style={[
                    styles.circleViewStyle,
                    styles.shadowStyle,
                    styles.positionView,
                  ]}>
                  <Label
                    title={`${otherCount.toFixed(0)} %`}
                    style={styles.countText}
                  />
                </View>
              )}
              {maleCount !== 0 && (
                <View
                  style={[
                    styles.circleViewStyle,
                    styles.shadowStyle,
                    styles.positionMaleCountView,
                  ]}>
                  <Label
                    title={`${maleCount.toFixed(0)} %`}
                    style={styles.countText}
                  />
                </View>
              )}
              {femaleCount !== 0 && (
                <View
                  style={[
                    styles.circleViewStyle,
                    styles.shadowStyle,
                    styles.positionFemaleCountView,
                  ]}>
                  <Label
                    title={`${femaleCount.toFixed(0)} %`}
                    style={styles.countText}
                  />
                </View>
              )}
              <View style={[styles.row2]}>
                {visitor.map((vItem, vIndex) => {
                  return (
                    <View style={styles.row1} key={vIndex}>
                      <View
                        style={[styles.dote, {backgroundColor: vItem?.color}]}
                      />
                      <Label
                        title={getLocalText(vItem?.name)}
                        style={{
                          paddingHorizontal: scale(5),
                          fontSize: scale(10),
                        }}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <OfflineModel />
        </ScrollView>
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.35),
    left: -(theme.SCREENHEIGHT * 0.5),
    transform: [{rotate: '35deg'}],
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.35),
    left: -(theme.SCREENHEIGHT * 0.65),
    transform: [{rotate: '65deg'}],
  },
  xAxis: {marginTop: -10},
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(5),
    marginTop: scale(20),
    width: scale(100),
    height: scale(100),
    backgroundColor: theme.colors.white,
    borderRadius: scale(20),
  },
  title: {
    textAlign: 'center',
    lineHeight: scale(20),
    fontSize: scale(14),
  },
  chartView: {
    flexDirection: 'row',
    height: scale(200),
    width: '100%',
  },
  chartMain: {width: '93%', marginLeft: scale(5)},
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  chartStyles: {
    height: scale(200),
    width: '95%',
    marginLeft: scale(10),
  },
  counter: {
    color: theme.colors.blue,
    fontWeight: '700',
  },
  countText: {
    color: theme.colors.blue,
    fontWeight: '500',
    fontSize: scale(12),
  },
  cartContainer: {
    marginTop: scale(15),
    backgroundColor: theme.colors.white,
    padding: scale(10),
    marginHorizontal: scale(15),
    borderRadius: scale(20),
  },
  countryView: {
    backgroundColor: theme.colors.white,
    padding: scale(10),
    width: theme.SCREENWIDTH * 0.92,
    paddingHorizontal: scale(15),
    borderRadius: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  con: {
    flexDirection: 'row',
    marginHorizontal: scale(15),
    marginTop: scale(10),
    justifyContent: 'space-between',
  },
  dote: {
    height: scale(14),
    width: scale(14),
    borderRadius: scale(8),
    backgroundColor: theme.colors.blue,
  },
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: scale(10),
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shadowStyle: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 2,
  },
  circleViewStyle: {
    backgroundColor: theme.colors.white,
    width: scale(40),
    height: scale(40),
    borderRadius: scale(100),
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionView: {
    position: 'absolute',
    top: scale(40),
    left: theme.SCREENWIDTH * 0.26,
  },
  positionMaleCountView: {
    position: 'absolute',
    top: scale(40),
    right: theme.SCREENWIDTH * 0.26,
  },
  positionFemaleCountView: {
    position: 'absolute',
    bottom: scale(28),
    right: theme.SCREENWIDTH * 0.36,
  },
});
