import axios from "axios/index";
import {message} from 'antd';
import * as lockr from "lockr";
import platform from 'platform';
import {getAuthToken, getReCapatchaToken} from "./auth";
import {API_URL} from "../constants/api";
import {IMAGE_BASE_URL} from "../config/connect";
import {
    ERROR_MESSAGE_400,
    ERROR_MESSAGE_404,
    ERROR_MESSAGE_500,
    PASS_DIGIT,
    PASS_LEN,
    PASS_LOWER, PASS_SPEC,
    PASS_UPPER
} from "../constants/messages";
import {
    ERROR_MSG_TYPE,
    INFO_MSG_TYPE, RECAPTCHA_TOKEN,
    SUCCESS_MSG_TYPE,
    WARNING_MSG_TYPE
} from "../constants/dataKeys";


const extraHeaders = process.env.NODE_ENV === 'production' ? {
    CLIENT_AGENT:platform.name,
    CLIENT_OS:platform.os
} : {};

export const makeURL = function (URL) {
    return `${API_URL}/${URL}`;
};
export const makeFileURL = function (URL) {
    return `${IMAGE_BASE_URL}/${URL}`;
}
export const putAPI = function (URL, dataToSend, successFn, errorFn, headerConfig = {}) {
    console.log("Sending data",dataToSend);
    axios({
        method: 'put',
        url: makeURL(URL),
        data: dataToSend,
        headers: {
            Authorization: `Token ${getAuthToken()}`,
            ...headerConfig,
            ...extraHeaders
        }
    }).then(function (response) {
        const {data} = response;
        successFn(data);
        if (data.detail)
            displayMessage(SUCCESS_MSG_TYPE, data.detail)
    }).catch(function (error) {
        handleErrorResponse(error);
        errorFn(error.response.data);
    });
};

export const postAPI = function (URL, dataToSend, successFn, errorFn, headerConfig = {}) {
    axios({
        method: 'post',
        url: makeURL(URL),
        data: dataToSend,
        headers: {
            Authorization: `Token ${getAuthToken()}`,
            ...headerConfig,
            ...extraHeaders
        }
    }).then(function (response) {
        const {data} = response;
        successFn(data);
        if (data.detail)
            displayMessage(SUCCESS_MSG_TYPE, data.detail)
    }).catch(function (error) {
        handleErrorResponse(error);
        errorFn(error.response.data);
    });
};
export const postOuterAPI = function (URL, dataToSend, successFn, errorFn, headerConfig = {}) {
    axios({
        method: 'post',
        url: URL,
        data: dataToSend,
        headers: {
            ...headerConfig,
            // ...extraHeaders
        }
    }).then(function (response) {
        const {data} = response;
        successFn(data);
        if (data.detail)
            displayMessage(SUCCESS_MSG_TYPE, data.detail)
    }).catch(function (error) {
        handleErrorResponse(error);
        errorFn();
    });
};
export const patchAPI = function (URL, dataToSend, successFn, errorFn, headerConfig = {}) {
    axios({
        method: 'patch',
        url: makeURL(URL),
        data: dataToSend,
        headers: {
            Authorization: `Token ${getAuthToken()}`,
            ...headerConfig,
            ...extraHeaders
        }
    }).then(function (response) {
        const {data} = response;
        successFn(data);
    }).catch(function (error) {
        handleErrorResponse(error);
        errorFn();
    });
};
export const getOuterAPI = function (URL, successFn, errorFn, params = {},headerConfig = {}) {
    axios({
        method: 'get',
        url: URL,
        headers: {
            ...headerConfig,
            ...extraHeaders
        },
        params
    }).then(function (response) {
        const {data} = response;
        successFn(data);
        if (data.detail)
            displayMessage(SUCCESS_MSG_TYPE, data.detail)
    }).catch(function (error) {
        handleErrorResponse(error);
        errorFn();
    });
};
export const getAPI = function (URL, successFn, errorFn, params = {},headerConfig = {}) {
    axios({
        method: 'get',
        url: makeURL(URL),
        headers: {
            Authorization: `Token ${getAuthToken()}`,
            ...headerConfig,
            ...extraHeaders
        },
        params
    }).then(function (response) {
        const {data} = response;
        successFn(data);
        if (data.detail)
            displayMessage(SUCCESS_MSG_TYPE, data.detail)
    }).catch(function (error) {
        handleErrorResponse(error);
        errorFn();
    });
};
export const deleteAPI = function (URL, successFn, errorFn) {
    axios({
        method: 'delete',
        url: makeURL(URL),
        headers: {
            Authorization: `Token ${getAuthToken()}`,
            ...extraHeaders
        }
    }).then(function (response) {
        const {data} = response;
        successFn(data);
        if (data.detail)
            displayMessage(SUCCESS_MSG_TYPE, data.detail)
    }).catch(function (error) {
        handleErrorResponse(error);
        errorFn();
    });
};

export const handleErrorResponse = function (error,sentData={}) {
    const {response} = error;
    if (response) {
        // eslint-disable-next-line
        console.info("Error Response Received", response);
        const {status} = response;
        if (status == 400) {
            if (response.data.detail) {
                message.error(response.data.detail);
                // logErrorToSlackChannel(ERROR_MESSAGE_400,{componentStack:JSON.stringify(sentData)})
            }else{
                message.error(ERROR_MESSAGE_400);
            }
        } else if (status == 401) {
            if (response.data.detail) {
                message.error(response.data.detail);
            }
        } else if (status == 403) {
            if (response.data.detail) {
                message.error(response.data.detail);
            }
        } else if (status == 404) {
            if (response.data.detail) {
                message.error(response.data.detail);
            } else {
                message.error(ERROR_MESSAGE_404);
            }
        } else if (status == 500) {
            message.error(ERROR_MESSAGE_500);
        }
    } else {
        // message.error(ERROR_INTERNET_CONNECTIVITY);
        // eslint-disable-next-line
        console.error(error, response);
    }
};

export const interpolate = function (theString, argumentArray) {
    const regex = /%s/;
    const _r = function (p, c) {
        return p.replace(regex, c);
    };
    return argumentArray.reduce(_r, theString);
};


export const displayMessage = function (type, msg) {
    if (type == SUCCESS_MSG_TYPE)
        message.success(msg);
    else if (type == INFO_MSG_TYPE)
        message.info(msg);
    else if (type == WARNING_MSG_TYPE)
        message.warning(msg);
    else if (type == ERROR_MSG_TYPE)
        message.error(msg);
};

export const startLoadingMessage = function (msg) {
    return message.loading(msg, 0);
};
export const stopLoadingMessage = function (msgFn, finishMsgType, finishMsg) {
    msgFn();
    if (finishMsgType)
        displayMessage(finishMsgType, finishMsg);
    return true;
}

export const parseQueryString = function (query) {
    const obj = {};
    if (query.length) {
        if (query[0] == '?' || query[0] == '#') {
            query = query.substring(1, query.length)
        }
        const tempArr = query.split('&');
        tempArr.forEach(function (str) {
            const arr = str.split('=');
            if (arr.length == 2) {
                obj[arr[0]] = arr[1]
            }
        });
    }
    return obj;
}
export const validatePassword = function (rule, value) {

    if (value.length < 6 && value.length != 0) {
        return (PASS_LEN);
    }
    if (value == value.toLowerCase() && value.length != 0) {
        return (PASS_UPPER);
    }
    if (value == value.toUpperCase() && value.length != 0) {
        return (PASS_LOWER);
    }
    if (value.search(/[0-9]/) < 0 && value.length != 0) {
        return (PASS_DIGIT);
    }
    if (!(/^[a-zA-Z0-9 ]*$/.test(value) == true && value.length != 0)) {
    } else {
        return (PASS_SPEC);
    }

}

export const saveCommonSettings = function (type, value) {
    lockr.set(type, value);
}
export const getCommonSettings = function (type) {
    const savedStates = lockr.get(type);
    if (savedStates)
        return savedStates;
    return false;
}

export const removeEmpty = (obj) => {
    Object.keys(obj).forEach(k =>
        (obj[k] && typeof obj[k] === 'object') && removeEmpty(obj[k]) ||
        (!obj[k] && obj[k] !== undefined) && delete obj[k]
    );
    return obj;
};

export const findFileExtension = function (path) {
    if (!path)
        return null;
    const name = path.split('.');
    if (name.length) {
        return name[name.length - 1]
    }
    return null;
}

export const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);
