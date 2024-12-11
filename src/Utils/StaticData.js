// import {AddImage, AddStory, AddVideo} from '../Assets/SVGs';
import {getLocalText} from '../Locales/I18n';
const {images} = require('./index');
// const DeepLink = 'https://frate.eugeniuses.com/share';
const DeepLink = 'https://share.frate.ink';
const appStoreIds = '1587359923';
const chatData = [
  // {
  //   id: 1,
  //   name: 'Alice Guillot',
  //   color: theme.colors.green,
  //   msgType: 'recive',
  //   msg: 'Lorem ipsum dolor sit amet aliquon aqueduto',
  //   userImage: images.user,
  //   media: '',
  //   time: '9:55 PM',
  // },
  // {
  //   id: 2,
  //   name: 'Odile Dumas',
  //   color: theme.colors.yellow,
  //   msgType: 'recive',
  //   msg: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lacus et, cursus id sed egestas ut egestas et. Adipiscing semper proin in arcu. Tincidunt quam integer arcu eget viverra libero. Velit euismod enim sed volutpat. Ultrices rhoncus non facilisi augue velit. Ipsum est lobortis nunc tempor. ',
  //   userImage: images.user3,
  //   media: '',
  //   time: '9:55 PM',
  // },
  // {
  //   id: 3,
  //   name: 'Salomé Gabodze',
  //   color: theme.colors.orange,
  //   msgType: 'recive',
  //   msg: 'Lorem ipsum dolor sit amet aliquon aqueduto ',
  //   userImage: images.user,
  //   media: '',
  //   time: '9:55 PM',
  // },
  // {
  //   id: 4,
  //   name: 'Alice Guillot',
  //   color: theme.colors.blue,
  //   msgType: 'send',
  //   msg: 'commodo ligula eget dolor.',
  //   userImage: images.user,
  //   media: '',
  //   time: '9:55 PM',
  // },
  // {
  //   id: 6,
  //   name: 'Alice Guillot',
  //   color: theme.colors.blue,
  //   msgType: 'send',
  //   msg: '',
  //   userImage: images.user,
  //   image: '',
  //   time: '9:55 PM',
  //   media: {
  //     mediaType: 'audio',
  //     audio:
  //       'https://raw.githubusercontent.com/zmxv/react-native-sound-demo/master/advertising.mp3',
  //   },
  // },
  // {
  //   id: 7,
  //   name: 'Alice Guillot',
  //   color: theme.colors.blue,
  //   msgType: 'recive',
  //   msg: '',
  //   userImage: images.user,
  //   media: {
  //     mediaType: 'video',
  //     video: require('../Assets/Video/sports.mp4'),
  //     isPlay: false,
  //   },
  //   time: '1:55 PM',
  //   audio: '',
  // },
  // {
  //   id: 5,
  //   name: 'Gabrielle Cordier',
  //   color: theme.colors.orange,
  //   newjoin: true,
  //   userImage: images.user1,
  //   image: '',
  //   time: '9:55 PM',
  //   media: {},
  // },
];

const postFooterOptions = [
  {
    id: 0,
    title: 'Group.messagebtn',
    icon: 'message-square',
  },
  {
    id: 1,
    title: 'Group.startAudio',
    icon: 'mic',
  },
];
const audioCallList = [
  // {
  //   id: 1,
  //   name: 'Julien Gazel',
  //   image: '',
  //   mic: true,
  // },
  // {
  //   id: 2,
  //   name: 'Alice Guillot',
  //   image: 1,
  //   mic: false,
  // },
  // {
  //   id: 3,
  //   name: 'Odile Dumas',
  //   image: images.user3,
  //   mic: false,
  // },
  // {
  //   id: 4,
  //   name: 'Salomé Gabodze',
  //   image: images.user,
  //   mic: false,
  // },
  // {
  //   id: 5,
  //   name: 'Julien Gazel',
  //   image: '',
  //   mic: false,
  // },
  // {
  //   id: 6,
  //   name: 'Julien Gazel',
  //   image: '',
  //   mic: false,
  // },
  // {
  //   id: 7,
  //   name: 'Julien Gazel',
  //   image: '',
  //   mic: false,
  // },
  // {
  //   id: 8,
  //   name: 'Alice Guillot',
  //   image: images.user,
  //   mic: false,
  // },
  // {
  //   id: 9,
  //   name: 'Odile Dumas',
  //   image: images.user3,
  //   mic: false,
  // },
  // {
  //   id: 10,
  //   name: 'Salomé Gabodze',
  //   image: images.user,
  //   mic: false,
  // },
  // {
  //   id: 11,
  //   name: 'Julien Gazel',
  //   image: '',
  //   mic: false,
  // },
  // {
  //   id: 12,
  //   name: 'Julien Gazel',
  //   image: '',
  //   mic: false,
  // },
  // {
  //   id: 13,
  //   name: 'Julien Gazel',
  //   image: '',
  //   mic: false,
  // },
  // {
  //   id: 14,
  //   name: 'Alice Guillot',
  //   image: images.user,
  //   mic: false,
  // },
  // {
  //   id: 15,
  //   name: 'Odile Dumas',
  //   image: images.user3,
  //   mic: false,
  // },
];
const country = [
  {id: 1, country_name: 'United States'},
  {id: 2, country_name: 'Canada'},
  {id: 3, country_name: 'England'},
  {id: 4, country_name: 'Ireland'},
  {id: 5, country_name: 'Brazil'},
];

const Cradatial = {
  email: 'api@frate.com',
  password: 'Etrc%Zk#JeP@UEqN',
};

const AllCategory = {
  id: 0,
  name: 'All',
  image: images.allCategory,
};

const BLOCKTYPES = {
  REPORT_POST: 'REPORT_POST',
  REPORT_USER: 'REPORT_USER',
  REPORT_GROUP: 'REPORT_GROUP',
};
const REPORTSTATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  UNBLOCKED: 'UNBLOCKED',
};

const groupOptionData = [
  {id: 0, title: getLocalText('Groups.seeProfile')},
  {id: -1, title: getLocalText('Groups.makeAdmin')},
  {id: 3, title: getLocalText('Groups.remove')},
  {id: 2, title: getLocalText('Report.reporttxt')},
  {id: 4, title: getLocalText('Group.messagebtn'), icon: 'message-square'},
];
const groupOptionData1 = [
  {id: 0, title: getLocalText('Groups.seeProfile')},
  {id: 2, title: getLocalText('Report.reporttxt')},
  {id: 5, title: getLocalText('Report.block')},
  {id: 4, title: getLocalText('Group.messagebtn'), icon: 'message-square'},
];

const shareOptionsData = [
  {
    id: 0,
    title: getLocalText('Post.sharepost'),
    icon: 'arrow-right',
  },
  {
    id: 1,
    title: getLocalText('Post.shareingroup'),
    icon: 'users',
  },
];

const personList = [
  {
    id: 1,
    name: 'Julien Gazel',
    image: images.user,
  },
  {
    id: 2,
    name: 'Alice Guillot',
    image: images.user,
  },
  {
    id: 3,
    name: 'Odile Dumas',
    image: images.user3,
  },
  {
    id: 4,
    name: 'Salomé Gabodze',
    image: images.user,
  },
  {
    id: 5,
    name: 'Julien Gazel',
    image: images.user,
  },
  {
    id: 6,
    name: 'Julien Gazel',
    image: images.user,
  },
];

const GenderData = [
  {id: 1, name: getLocalText('Post.male')},
  {id: 1, name: getLocalText('Post.female')},
];
const CLIENT_ID = 'app.frates.com';
const RedirectUri = 'https://app.frate.com/apple/callback';
const SCOPE = 'email';
const notificationResponse = {
  JoinNewRequest: 'Join group request',
  FriendRequest: 'Friend request',
};

const notificationTypes = {
  newMessageInPersonalChatroom: 'New message in personal chatroom',
  postSponsored: 'Post sponsored',
  invitationPrivateConversation: 'Invitation for a private conversation',
  invitationPrivateAudioRoom: 'Invitation for a private audio room',
  audioRoomConversationStarted: 'Audio room conversation started',
  postLiked: 'Post liked',
  sponsorPostLiked: 'Sponsor post liked',
  commentOnPost: 'Comment on post',
  likeOnComment: 'Like on comment',
  commentOnSponsorPost: 'Comment on sponsor post',
  newPost: 'New post',
  groupRequestAccepted: 'Group request accepted',
  postSponsorAlert: 'Post sponsor alert',
  newMessageInChatroom: 'New message in chat room',
  POST_SHARED: 'Post shared',
  SPONSORED_POST_SHARED: 'Shared a sponsor post',
  JOIN_GROUP_REQUEST: 'Join group request',
  FRIEND_REQUEST_RECEIVED: 'Friend request',
  FRIEND_REQUEST_ACCEPTED: 'Friend request accepted',
  INVITE_PERSONAL_CHAT: 'Invitation for a personal conversation',
};
const FreindStatus = {
  NOTHING: 0,
  REQEST_SENT: 1,
  REQEST_RECEIVED: 2,
  REQEST_CONFIR: 3,
};
const SCREEN_TYPE = {
  NOTIFICATION: 'notification',
  NEW_USER: 'new_user',
};
const StaticPost = {
  id: 35,
  details: 'Testing post',
  is_sponsored: 0,
  time: '2022-07-27T09:27:03.000000Z',
  is_like: true,
  is_save: false,
  user_id: 21,
  first_name: 'Demo',
  last_name: 'Demo',
  email: 'd1@gmail.com',
  user_pic: {
    medium:
      'https://frate.eugeniuses.com/storage/users/thumbnail/767x767/EftF3lHFjN6eU5nnbJdt0O6NLDumH0oVCfPmAPqk.jpg',
    large:
      'https://frate.eugeniuses.com/storage/users/thumbnail/1024x1024/EftF3lHFjN6eU5nnbJdt0O6NLDumH0oVCfPmAPqk.jpg',
    small:
      'https://frate.eugeniuses.com/storage/users/thumbnail/200x200/EftF3lHFjN6eU5nnbJdt0O6NLDumH0oVCfPmAPqk.jpg',
    optimize:
      'https://frate.eugeniuses.com/storage/users/optimize/EftF3lHFjN6eU5nnbJdt0O6NLDumH0oVCfPmAPqk.jpg',
    original:
      'https://frate.eugeniuses.com/storage/users/original/EftF3lHFjN6eU5nnbJdt0O6NLDumH0oVCfPmAPqk.jpg',
  },
  about_user: 'Testing dsdasd',
  group: {
    id: 16,
    admin_name: 'Demo Demo',
    name: 'Dsfdsfds',
    image: {
      medium:
        'https://frate.eugeniuses.com/storage/groups/thumbnail/767x767/i60OldZZld51ZnBTUzWPtP84RrTe0zUpeXPF5Yll.jpg',
      large:
        'https://frate.eugeniuses.com/storage/groups/thumbnail/1024x1024/i60OldZZld51ZnBTUzWPtP84RrTe0zUpeXPF5Yll.jpg',
      small:
        'https://frate.eugeniuses.com/storage/groups/thumbnail/200x200/i60OldZZld51ZnBTUzWPtP84RrTe0zUpeXPF5Yll.jpg',
      optimize:
        'https://frate.eugeniuses.com/storage/groups/optimize/i60OldZZld51ZnBTUzWPtP84RrTe0zUpeXPF5Yll.jpg',
      original:
        'https://frate.eugeniuses.com/storage/groups/original/i60OldZZld51ZnBTUzWPtP84RrTe0zUpeXPF5Yll.jpg',
    },
  },
  post_attachment: [
    {
      uri: {
        medium:
          'https://frate.eugeniuses.com/storage/postattachment/thumbnail/35/767x767/8zWR3Q09eAbOC9FU4fbRwGFz2Pd32peVRdnz4pmA.png',
        large:
          'https://frate.eugeniuses.com/storage/postattachment/thumbnail/35/1024x1024/8zWR3Q09eAbOC9FU4fbRwGFz2Pd32peVRdnz4pmA.png',
        small:
          'https://frate.eugeniuses.com/storage/postattachment/thumbnail/35/200x200/8zWR3Q09eAbOC9FU4fbRwGFz2Pd32peVRdnz4pmA.png',
        optimize:
          'https://frate.eugeniuses.com/storage/postattachment/optimize/35/8zWR3Q09eAbOC9FU4fbRwGFz2Pd32peVRdnz4pmA.png',
        original:
          'https://frate.eugeniuses.com/storage/postattachment/original/35/8zWR3Q09eAbOC9FU4fbRwGFz2Pd32peVRdnz4pmA.png',
      },
      media_type: 'image',
      name: 'postattachment/optimize/35/8zWR3Q09eAbOC9FU4fbRwGFz2Pd32peVRdnz4pmA.png',
      thumbnail: 'https://frate.eugeniuses.com/storage/',
    },
  ],
  thumbnail: ['https://frate.eugeniuses.com/storage/'],
  total_like: 1,
  total_share: 0,
  total_comment: 0,
  comments: [],
  is_blocked_user: false,
  is_notification_blocked: false,
  admins: [21],
  is_reshared: true,
  shared_by_id: null,
  shared_by: null,
};

const tutorialData = [
  {
    id: 1,
    title: getLocalText('Groups.categories'),
    subtital:
      'Lorem ipsum dolor sit amet aliquon scicilant apud ad infinitum draconis aller sit uo sieu.',
  },
  {
    id: 2,
    title: getLocalText('UserData.group'),
    subtital:
      'Lorem ipsum dolor sit amet aliquon scicilant apud ad infinitum draconis aller sit uo sieu.',
  },
  {
    id: 3,
    title: getLocalText('Groups.filters'),
    subtital:
      'Lorem ipsum dolor sit amet aliquon scicilant apud ad infinitum draconis aller sit uo sieu.',
  },
  // {
  //   id: 4,
  //   title: getLocalText('Groups.categories'),
  //   subtital:
  //     'Lorem ipsum dolor sit amet aliquon scicilant apud ad infinitum draconis aller sit uo sieu.',
  // },
];

export {
  chatData,
  postFooterOptions,
  audioCallList,
  country,
  Cradatial,
  AllCategory,
  BLOCKTYPES,
  REPORTSTATUS,
  groupOptionData,
  DeepLink,
  personList,
  CLIENT_ID,
  RedirectUri,
  SCOPE,
  appStoreIds,
  GenderData,
  groupOptionData1,
  FreindStatus,
  shareOptionsData,
  StaticPost,
  tutorialData,
  notificationResponse,
  notificationTypes,
  SCREEN_TYPE,
};
