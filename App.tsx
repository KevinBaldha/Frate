import React, {Component} from 'react';
import {LogBox} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import SplashScreen from 'react-native-splash-screen';
import {store, persistor} from './src/Redux/Store';
import Navigation from './src/Navigation';

export default class App extends Component {
  async componentDidMount() {
    SplashScreen.hide();
    LogBox.ignoreAllLogs();
  }
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Navigation />
        </PersistGate>
      </Provider>
    );
  }
}
