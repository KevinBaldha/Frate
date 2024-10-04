import {getLocalText} from '../Locales/I18n';

export const MSG_VALID = {
  field_require: 'All field are require',
  field_valid: 'Not a valid value',
  name: 'Name required',
  firstName: getLocalText('ErrorMsgs.firstname'),
  specialcharnotAllow: getLocalText('ErrorMsgs.special'),
  lastName: getLocalText('ErrorMsgs.lastname'),
  name_valid: 'Please enter valid Name',
  email: getLocalText('ErrorMsgs.email'),
  email_valid: getLocalText('ErrorMsgs.emailvalid'),
  profile_pic: getLocalText('ErrorMsgs.imageNoselected'),
  general_error: 'There is some error, please try again',
  mobile: getLocalText('ErrorMsgs.mobile'),
  mobileEmpty: getLocalText('ErrorMsgs.mobileEmpty'),
  mobile_valid: 'Please enter valid mobile',
  password: getLocalText('ErrorMsgs.password'),
  passwordNotMatch: getLocalText('ErrorMsgs.passwordc'),
  passwordmustbesame: 'New password and confrim new password not matched',
  terms: getLocalText('ErrorMsgs.terms'),
  strongPassword: getLocalText('ErrorMsgs.strongPassword'),
  about: 'Please enter about you',
  category: getLocalText('ErrorMsgs.category'),
  groupname: getLocalText('ErrorMsgs.groupName'),
  groupDetailsErr: getLocalText('ErrorMsgs.groupDetails'),
  groupruleErr: getLocalText('ErrorMsgs.grouprule'),
  cardnumber: getLocalText('ErrorMsgs.cardnumber'),
  expdate: getLocalText('ErrorMsgs.expdate'),
  cvv: getLocalText('ErrorMsgs.cvv'),
  chooseCity: getLocalText('ErrorMsgs.selectCity'),
};

export const validDecimal = (value) => {
  //   let regExp = /^[-+]?[0-9]+\.[0-9]+$/;
  let regExp = /^-{0,1}\d*\.{0,1}\d+$/;
  if (regExp.test(value)) {
    return true;
  }
  return false;
};

export const strongPassword = (value) => {
  let strongRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
  if (strongRegex.test(value)) {
    return true;
  }
  return false;
};

export const mediumPassword = (value) => {
  let mediumRegex =
    /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
  if (mediumRegex.test(value)) {
    return true;
  }
  return false;
};
export const validAlhphaNumaric = (value) => {
  let regExp = /[^0-9a-zA-Z_ ]/;
  if (regExp.test(value)) {
    return false;
  }
  return true;
};

export const validateEmpty = (value) => {
  if (!value || value.trim() === '') {
    return false;
  }

  return true;
};
export const validateEmail = (email) => {
  var re =
    /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};
