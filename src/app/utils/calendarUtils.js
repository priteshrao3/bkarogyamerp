import {Menu} from "antd";
import React from 'react';
import {Link} from "react-router-dom";
import * as lockr from "lockr";
import moment from "moment/moment";
import {getAPI, interpolate} from "./common";
import {APPOINTMENT_CATEGORIES} from "../constants/api";
import {hashCode, intToRGB} from "./clinicUtils";
import {CALENDAR_SETTINGS} from "../constants/dataKeys";

export const calendarSettingMenu = (
<Menu>
        <Menu.Item key="1">
            <Link to="/erp/settings/calendarsettings#timings">
                Modify Calendar Timings
            </Link>
        </Menu.Item>
        <Menu.Item key="2">
            <Link to="/erp/settings/clinics-staff#staff">
                Add/Edit Doctor or Staff
            </Link>
        </Menu.Item>
        <Menu.Item key="3">
            <Link to="/erp/settings/clinics-staff#notification">
                Modify SMS/Email for Doctor/Staff
            </Link>
        </Menu.Item>
        <Menu.Item key="4">
            <Link to="/erp/settings/communication-settings">
                Modify SMS/Email for Patients
            </Link>
        </Menu.Item>
        <Menu.Item key="5">
            <Link to="/erp/settings/calendarsettings#categories">
                Add/Edit Categroies
            </Link>
        </Menu.Item>
</Menu>
);
export const loadAppointmentCategories = function (that) {
    const successFn = function (data) {
        const categories_object = {}
        const categories = data.map((item) => {
                categories_object[item.id] = {...item, calendar_colour: intToRGB(hashCode(item.name))}
                return categories_object[item.id]
            }
        )
        that.setState({
            categories_object,
            practice_categories: categories,
        })

    }
    const errorFn = function () {

    }
    getAPI(interpolate(APPOINTMENT_CATEGORIES, [that.props.active_practiceId]), successFn, errorFn)
}

export const saveCalendarSettings = function (type, value) {
    let settings = lockr.get(CALENDAR_SETTINGS);
    if (!settings) {
        settings = {}
    }
    settings = {...settings, [type]: value}
    lockr.set(CALENDAR_SETTINGS, settings);
}
export const getCalendarSettings = function () {
    let settings = lockr.get(CALENDAR_SETTINGS);
    if (!settings) {
        settings = {}
    }
    return settings;
}


export const TimeSlotWrapper = function (props) {
    let flag = true;
    const dayValue = moment(props.value).isValid() ? moment(props.value).format('dddd').toLowerCase() : null;
    if (props.filterType != 'DOCTOR' || props.selectedDoctor == 'ALL') {
        /**
         * Checking for Calendar Clinic Timings
         * */
        if (props.calendarTimings && dayValue && props.calendarTimings[dayValue]) {
            const daysTimings = props.calendarTimings[dayValue];
            if (daysTimings.lunch) {
                if (
                    (moment(props.value, 'HH:mm:ss').format('HH:mm:ss') <= daysTimings.startTime.format('HH:mm:ss')
                        || moment(props.value, 'HH:mm:ss').format('HH:mm:ss') > daysTimings.endTime.format('HH:mm:ss')
                    ) || (
                        moment(props.value, 'HH:mm:ss').format('HH:mm:ss') < daysTimings.lunchEndTime.format('HH:mm:ss')
                        && moment(props.value, 'HH:mm:ss').format('HH:mm:ss') >= daysTimings.lunchStartTime.format('HH:mm:ss')
                    )
                ) {
                    flag = false;
                }
            } else if (moment(props.value, 'HH:mm:ss').format('HH:mm:ss') <= daysTimings.startTime.format('HH:mm:ss') || moment(props.value, 'HH:mm:ss').format('HH:mm:ss') > daysTimings.endTime.format('HH:mm:ss')) {
                    flag = false;
                }
        } else if (dayValue && !props.calendarTimings[dayValue]) {
            /**
             * If the practice is not opening for the day
             * */
            flag = false;
        }
    } else if (props.doctorTimings && dayValue && props.doctorTimings[dayValue]) {
            const daysTimings = props.doctorTimings[dayValue];
            if (daysTimings.lunch) {
                if (
                    (moment(props.value, 'HH:mm:ss').format('HH:mm:ss') <= daysTimings.startTime.format('HH:mm:ss')
                        || moment(props.value, 'HH:mm:ss').format('HH:mm:ss') > daysTimings.endTime.format('HH:mm:ss')
                    ) || (
                        moment(props.value, 'HH:mm:ss').format('HH:mm:ss') < daysTimings.lunchEndTime.format('HH:mm:ss')
                        && moment(props.value, 'HH:mm:ss').format('HH:mm:ss') >= daysTimings.lunchStartTime.format('HH:mm:ss')
                    )
                ) {
                    flag = false;
                }
            } else if (moment(props.value, 'HH:mm:ss').format('HH:mm:ss') <= daysTimings.startTime.format('HH:mm:ss') || moment(props.value, 'HH:mm:ss').format('HH:mm:ss') > daysTimings.endTime.format('HH:mm:ss')) {
                    flag = false;
                }
        } else if (props.doctorTimings && dayValue && !props.doctorTimings[dayValue]) {
            /**
             * If the doctor is not working for the day
             * */
            flag = false;
        }
    /**
     * Checking for Events Timings
     * */
    if (props.showCalendarEvents && flag) {
        for (let i = 0; i < props.blockedCalendar.length; i++) {
            if (props.blockedCalendar[i].doctor && props.filterType == 'DOCTOR') {
                if (props.blockedCalendar[i].doctor == props.selectedDoctor && moment(props.value).isBetween(moment(props.blockedCalendar[i].block_from), moment(props.blockedCalendar[i].block_to))) {
                    flag = false;
                    break;
                }
            } else if (moment(props.value).isBetween(moment(props.blockedCalendar[i].block_from), moment(props.blockedCalendar[i].block_to))) {
                    flag = false;
                    break;
                }
        }
    }

    if (flag)
        return props.children;


    const child = React.Children.only(props.children);
    return React.cloneElement(child, {className: `${child.props.className  } rbc-off-range-bg`});
}
