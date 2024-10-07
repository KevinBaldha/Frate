/* eslint-disable no-unused-vars */
import TrackPlayer, {Event} from 'react-native-track-player';

module.exports = async function () {
  var autoplay = '';

  TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async event => {});
  TrackPlayer.addEventListener(Event.RemoteNext, async () => {});

  TrackPlayer.addEventListener('remote-play', () => TrackPlayer.play());

  TrackPlayer.addEventListener('remote-pause', () => TrackPlayer.pause());

  TrackPlayer.addEventListener('remote-stop', () => TrackPlayer.destroy());
};
