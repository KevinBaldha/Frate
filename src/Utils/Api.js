import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Config from './Config';

export default class API {
  token = '';

  constructor() {
    this.getToken();
  }

  async setToken(token) {
    try {
      this.token = await AsyncStorage.setItem('api_token', token);
      if (token) {
        Config.API_TOKEN = token;
      }
    } catch (e) {
      // error reading value
    }
  }

  async getToken() {
    try {
      let token = await AsyncStorage.getItem('api_token');

      if (token) {
        return (Config.API_TOKEN = token);
      } else {
        return Config.API_TOKEN;
      }
    } catch (e) {}
  }

  getHeader = async () => {
    try {
      const value = await AsyncStorage.getItem('api_token');
      if (value !== null) {
        this.token = Config.API_TOKEN = value;
        return value;
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  // GET Method call
  get(apiURL) {
    try {
      return fetch(apiURL, {
        method: 'GET',
        headers: {Authorization: 'Bearer ' + Config.API_TOKEN},
      }).then((response) => {
        return response.text().then((text) => {
          return JSON.parse(text);
        });
      });
    } catch (error) {
      console.log(apiURL + 'API call failed:', error);
    }
  }

  // POST Method call
  post(apiURL, body) {
    return fetch(apiURL, {
      method: 'POST',
      'Content-Type': 'multipart/form-data',
      headers: {Authorization: 'Bearer ' + Config.API_TOKEN},
      body: body,
    }).then((response) => {
      return response.text().then((text) => {
        return JSON.parse(text);
      });
    });
  }

  // PUT Method call
  put(apiURL, body) {
    return fetch(apiURL, {
      method: 'PUT',
      headers: this.getHeader(),
      body: body,
    }).then((response) => {
      return response.text().then((text) => {
        return JSON.parse(text);
      });
    });
  }

  // DELETE Method call
  delete(apiURL, body) {
    return fetch(apiURL, {
      method: 'DELETE',
      headers: this.getHeader(),
      // body:body
    }).then((response) => {
      return response.text().then((text) => {
        return JSON.parse(text);
      });
    });
  }
}
