import firebase from 'firebase';
import {notification, Icon} from 'antd';
import React, {Component} from 'react';
import {Redirect} from 'react-router-dom'
import {setFCMToken} from "../auth";
import {getOuterAPI} from "../common";


// Initialize Firebase
let messaging = null;
const successFn = function (firebase_config) {
    firebase.initializeApp(firebase_config.config);
    if (firebase.messaging.isSupported()) {
        messaging = firebase.messaging();
        messaging.onMessage(function (payload) {
            // let noti=payload.notification.body
            // let noti=payload.notification.body
            notification.open({
                message: payload.notification.title,
                description: payload.notification.body,
                icon: <img
                  src={payload.notification.image || '/kidneycarelogo.png'}
                  style={{width: '40px', height: '40px'}}
                />,
                duration: 10
            });
        });
    }
};
const errorFn = function () {

}
getOuterAPI('/firebase.json', successFn, errorFn);
export const createFCMToken = function () {
    if (messaging) {
        messaging.requestPermission()
            .then(function () {
                return messaging.getToken();
            })
            .then(function (token) {
                setFCMToken(token);
            })
            .catch(function (err) {
                console.log("No permissions for notifications!!", err);
            });
    } else {
        setFCMToken(null);
        setTimeout(function(){
            createFCMToken();
        },1000);
    }

};
