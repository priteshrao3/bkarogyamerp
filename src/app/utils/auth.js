import lockr from 'lockr';
import axios from 'axios';
import platform from "platform";
import {
    AUTH_TOKEN,
    PASSWORD,
    ROLE,
    PRACTICE,
    GROUP,
    ERROR_MSG_TYPE,
    FCM_TOKEN,
    RECAPTCHA_TOKEN
} from "../constants/dataKeys";
import {displayMessage, getAPI, handleErrorResponse, makeURL} from "./common";
import {LOGIN_URL, OTP_LOGIN_URL, USER_DATA,SWITCH_USER_STAFF_LOGIN} from "../constants/api";
import {CURRENT_PRACTICE} from "../constants/formLabels";
var reCaptchaClassRef = null;
console.log(platform)
export const loggedInUser = function () {
    const role = lockr.get(ROLE);
    const token = lockr.get(AUTH_TOKEN);
    const switchedUser = lockr.get('switchedUser')
    if (role && token) {
        return {...role,switchedUser};
    }
    return null;
};

export const setCurrentPractice = function (practice) {
    lockr.set(CURRENT_PRACTICE, practice);
}

export const loggedInUserPractices = function () {
    const role = lockr.get(ROLE);
    const token = lockr.get(AUTH_TOKEN);
    const practice = lockr.get(PRACTICE);
    if (role && token && practice) {
        return practice;
    }
    return [];
};
export const loggedInactivePractice = function () {
    const currentPractice = lockr.get(CURRENT_PRACTICE);
    if (currentPractice && currentPractice != {}) {
        return currentPractice;
    }
    const practice = lockr.get(PRACTICE);
    if (practice && practice.length) {
        setCurrentPractice(practice[0].practice.id);
        return loggedInactivePractice();
    }

    return null
}


export const getAllPermissions = function () {
    const permissions = [];
    const lockrPermissions = lockr.get('PERMISSIONS');
    if (lockrPermissions && lockrPermissions.ADMIN && lockrPermissions.ADMIN.length) {
        return lockrPermissions.ADMIN;
    }

    return permissions
}

export const logInUser = function (dataToSend, successFn, errorFn) {
    const reqData = {
        'mobile': dataToSend.email,
        [PASSWORD]: dataToSend.password,
        [FCM_TOKEN]: getFCMToken() || undefined,
    };
    axios({
        method: 'post',
        url: makeURL(LOGIN_URL),
        data: reqData,
        headers: {

        }
    }).then(function (response) {
        const {data} = response;
        lockr.set(ROLE, data.user);
        lockr.set(AUTH_TOKEN, data.token);
        lockr.set(PRACTICE, data.practice_list);
        // lockr.set('PERMISSIONS', data.permissions_list);
        successFn()
    }).catch(function (error) {
        console.log(error);
        handleErrorResponse(error);
        errorFn();
    })
};
export const logInUserWithOtp = function (dataToSend, successFn, errorFn) {
    const reqData = {
        'phone_no': dataToSend.phone_no,
        'otp': dataToSend.otp,
        [FCM_TOKEN]: getFCMToken(),
    };
    axios({
        method: 'post',
        url: makeURL(OTP_LOGIN_URL),
        data: reqData,
        headers: {

        }
    }).then(function (response) {
        const {data} = response;
        lockr.set(ROLE, data.user);
        lockr.set(AUTH_TOKEN, data.token);
        lockr.set(PRACTICE, data.practice_list);
        successFn()
    }).catch(function (error) {
        handleErrorResponse(error);
        errorFn();
    })
};

export const logInSwitchedUserWithPhoneNum = function (phone_no, successFn, errorFn) {
    const reqData = {
        'phone_no': phone_no,
        [FCM_TOKEN]: getFCMToken(),
    };
    axios({
        method: 'post',
        url: makeURL(SWITCH_USER_STAFF_LOGIN),
        data: reqData,
        headers: {
            Authorization: `Token ${getAuthToken()}`
        }
    }).then(function (response) {
        const {data} = response;
        lockr.set(ROLE, data.user);
        lockr.set('switchedUser',true);
        lockr.set(AUTH_TOKEN, data.token);
        lockr.set(PRACTICE, data.practice_list);
        successFn()
    }).catch(function (error) {
        handleErrorResponse(error);
        errorFn();
    })
};

export const loadUserDetails = function (practice, callBackFn, callBackErrorFn) {
    const successFn = function (data) {
        lockr.set(ROLE, data.user);
        lockr.set(PRACTICE, data.practice_list);
        callBackFn(data);
    }
    const errorFn = function () {
        displayMessage(ERROR_MSG_TYPE, "Permission Loading Failed. Kindly refresh or check your internet connection...");
        callBackErrorFn();
    }
    getAPI(USER_DATA, successFn, errorFn, {practice});
}

export const logOutUser = function (successFn) {
    lockr.rm(ROLE);
    lockr.rm(AUTH_TOKEN);
    lockr.rm(PRACTICE);
    lockr.rm(GROUP);
    lockr.rm('switchedUser');
    successFn();
};
export const getAuthToken = function () {
    const token = lockr.get(AUTH_TOKEN);
    return token;
};

export const sendLoginOTP = function (url, phone, successFn, errorFn) {
    const reqData = {
        "phone_no": phone
    };
    axios({
        method: 'post',
        url:url,
        data: reqData,
    }).then(function (response) {
        successFn(response)
    }).catch(function (error) {
        // eslint-disable-next-line
        console.log(error);
        handleErrorResponse(error);
        errorFn();
    })
}

export const getFCMToken = function () {
    const token = lockr.get(FCM_TOKEN);
    if (token)
        return token;
    return null;
};
export const setFCMToken = function (token) {
    lockr.set(FCM_TOKEN, token);
    return token;

}

export const getReCapatchaToken = function () {
    const token = lockr.get(RECAPTCHA_TOKEN);
    if (token)
        return token;
    return null;
};
export const setReCapatchaToken = function (token) {
    lockr.set(RECAPTCHA_TOKEN, token);
    return token;

}
