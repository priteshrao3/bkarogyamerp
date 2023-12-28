import {Modal} from "antd";
import React from "react";
import {interpolate, postAPI} from "./common";
import {START_TASK, STOP_TASK} from "../constants/api";

let TaskTrackerModulePropsComponents = null;
export const TaskTrackerModuleProps = function () {
    if (TaskTrackerModulePropsComponents)
        return TaskTrackerModulePropsComponents;
    return null;
};
export const startTask = (id, callback, errorCallback) => {
    const successFn = function (data) {
        if (callback)
            callback(data)
    }
    const errorFn = function () {
        if (errorCallback)
            errorCallback()
    }
    postAPI(interpolate(START_TASK, [id]), {}, successFn, errorFn);
}

export const stopTask = (id, callback, errorCallback) => {
    const successFn = function (data) {
        if (callback)
            callback(data)
    }
    const errorFn = function () {
        if (errorCallback)
            errorCallback()
    }
    postAPI(interpolate(STOP_TASK, [id]), {}, successFn, errorFn);
}

export const completeTask = (id, callback, errorCallBack) => {
    TaskTrackerModulePropsComponents = (
<Modal />
)
}
