import React, {Component} from "react";
import moment from "moment";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import TimeGrid from 'react-big-calendar/lib/TimeGrid';
import {Calendar as BigCalendar, momentLocalizer, Navigate} from 'react-big-calendar';
import {
    Modal,
    Row,
    Col,
    Button,
    Divider,
    Layout,
    Spin,
    Menu,
    Dropdown,
    Icon,
    DatePicker, Checkbox,
    Radio
} from "antd";
import "./app.css";
import {Route, Link, Switch} from "react-router-dom";
import * as dates from 'date-arithmetic'
import {DOCTORS_ROLE, SUCCESS_MSG_TYPE, WARNING_MSG_TYPE,} from "../../constants/dataKeys";
import {getAPI, putAPI, interpolate, displayMessage} from "../../utils/common";
import {
    APPOINTMENT_PERPRACTICE_API,
    APPOINTMENT_API,
    PRACTICESTAFF,
    CALENDER_SETTINGS,
    BLOCK_CALENDAR, DOCTOR_VISIT_TIMING_API
} from "../../constants/api";
import EventComponent from "./EventComponent";
import {
    getCalendarSettings,
    loadAppointmentCategories,
    saveCalendarSettings, TimeSlotWrapper
} from "../../utils/calendarUtils";
import CalendarRightPanel from "./CalendarRightPanel";
import {
    CANCELLED_STATUS,
    DAY_KEYS,
    SCHEDULE_STATUS,
} from "../../constants/hardData";
import CreateAppointment from "./CreateAppointment";
import PermissionDenied from "../common/errors/PermissionDenied";

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(BigCalendar);
const {Content} = Layout;
const {confirm} = Modal;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startTime: null,
            visiblePopover: false,
            events: [],
            filteredEvent: [],
            appointments: [],
            practice_doctors: [],
            practice_categories: [],
            practice_staff: [],
            doctors_object: null,
            categories_object: null,
            calendarTimings: null,
            timing: {},
            loading: true,
            selectedDoctor: 'ALL',
            selectedCategory: 'ALL',
            selectedDate: moment(),
            filterType: 'DOCTOR',
            calendarType: 'APPOINTMENTS',
            doctorsAppointmentCount: {},
            categoriesAppointmentCount: {},
            blockedCalendar: [],
            showCalendarEvents: true,
            showAppointments: true,
            doctorTiming: {},
            ...getCalendarSettings()
        }
        ;
        this.onSelectSlot = this.onSelectSlot.bind(this);
        this.onSelectEvent = this.onSelectEvent.bind(this);
        this.moveEvent = this.moveEvent.bind(this)
        this.resizeEvent = this.resizeEvent.bind(this);
        this.loadDoctors = this.loadDoctors.bind(this);
        this.eventStyleGetter = this.eventStyleGetter.bind(this);
        this.loadCalendarTimings = this.loadCalendarTimings.bind(this);
        this.loadCalendarTimings()
    }

    componentDidMount() {
        this.appointmentList(moment().startOf('day'), moment().endOf('day'));
        this.loadDoctors();
        loadAppointmentCategories(this);
    }

    changeCalendarType = (value) => {
        const that = this;
        this.setState({
            calendarType: value,
            selectedDoctor: 'ALL',
            selectedCategory: 'ALL',
            filterType: 'DOCTOR',
        }, function () {
            if (value == 'APPOINTMENTS') {
                that.changeFilter('selectedDoctor', 'ALL');

            } else if (value == 'AVAILABILITY') {
                if (that.state.practice_doctors.length) {
                    that.changeFilter('selectedDoctor', that.state.practice_doctors[0].id);
                }
            }
        })
    }

    loadDoctors() {
        const that = this;
        that.setState({
            doctorLoading: true
        })
        const successFn = function (data) {
            const doctors = [];
            const staff = [];
            const doctor_object = {}
            data.staff.forEach(function (usersdata) {
                if (usersdata.role == DOCTORS_ROLE) {
                    doctors.push(usersdata);
                    doctor_object[usersdata.id] = usersdata;
                } else {
                    staff.push(usersdata);
                }
            });
            that.setState({
                practice_staff: staff,
                practice_doctors: doctors,
                doctors_object: doctor_object,
                doctorLoading: false
            })
        }
        const errorFn = function () {
            that.setState({
                doctorLoading: false
            })
        };
        getAPI(interpolate(PRACTICESTAFF, [this.props.active_practiceId]), successFn, errorFn);
    }

    loadCalendarTimings() {
        const that = this;
        const successFn = function (data) {
            let dataObject = {};
            if (data.length)
                dataObject = data[0];
            const timing = {};
            DAY_KEYS.forEach(function (dayKey) {
                timing[dayKey] = {};
                if (dataObject.visting_hour_same_week) {
                    timing[dayKey].startTime = moment(dataObject.first_start_time, 'HH:mm:ss');
                    timing[dayKey].endTime = moment(dataObject.second_end_time, 'HH:mm:ss');
                    if (dataObject.is_two_sessions) {
                        timing[dayKey].lunch = true;
                        timing[dayKey].lunchStartTime = moment(dataObject.first_end_time, 'HH:mm:ss');
                        timing[dayKey].lunchEndTime = moment(dataObject.second_start_time, 'HH:mm:ss');
                    } else {
                        timing[dayKey].lunch = false
                    }
                } else if (dataObject[dayKey]) {
                    timing[dayKey].startTime = moment(dataObject[`first_start_time_${dayKey}`], 'HH:mm:ss');
                    timing[dayKey].endTime = moment(dataObject[`second_end_time_${dayKey}`], 'HH:mm:ss');
                    if (dataObject[`is_two_sessions_${dayKey}`]) {
                        timing[dayKey].lunch = true;
                        timing[dayKey].lunchStartTime = moment(dataObject[`first_end_time_${dayKey}`], 'HH:mm:ss');
                        timing[dayKey].lunchEndTime = moment(dataObject[`second_start_time_${dayKey}`], 'HH:mm:ss');
                    } else {
                        timing[dayKey].lunch = false
                    }
                } else {
                    timing[dayKey] = null
                }
            });
            that.setState({
                calendarTimings: {
                    ...dataObject,
                },
                timing: {...timing},
                loading: false
            });
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        getAPI(interpolate(CALENDER_SETTINGS, [this.props.active_practiceId]), successFn, errorFn);
    }

    /** *
     * Calenders Functions
     * */


    moveEvent({event, start, end, isAllDay: droppedOnAllDaySlot}) {
        if (event.appointment.status != SCHEDULE_STATUS) {
            displayMessage(WARNING_MSG_TYPE, "Action Not Allowed");
            return true;
        }
        const {events} = this.state;
        const idx = events.indexOf(event)
        let {allDay} = event
        const that = this;
        if (!event.allDay && droppedOnAllDaySlot) {
            allDay = true
        } else if (event.allDay && !droppedOnAllDaySlot) {
            allDay = false
        }
        const updatedEvent = {...event, start, end, allDay}
        const nextEvents = [...events]
        const changedEvent = {
            // "id": event.id,
            "schedule_at": moment(start).format(),
            "slot": parseInt((end - start) / 60000)
        };
        const successFn = function (data) {
            displayMessage(SUCCESS_MSG_TYPE, "time changed");
            nextEvents.splice(idx, 1, updatedEvent);
            that.setState({
                events: nextEvents,
            }, function () {
                that.refreshFilterList();
            })
        }
        const errorFn = function () {
        }
        confirm({
            title: 'Are you sure to change the time of this appointment?',
            // content: 'Some descriptions',
            onOk() {
                putAPI(interpolate(APPOINTMENT_API, [event.id]), changedEvent, successFn, errorFn);
            },
            onCancel() {
            },
        });

    }

    resizeEvent = ({event, start, end}) => {
        if (event.appointment.status != SCHEDULE_STATUS) {
            displayMessage(WARNING_MSG_TYPE, "Action Not Allowed");
            return true;
        }
        const {events} = this.state
        let changedEvent = {};
        const that = this;
        const nextEvents = [];
        events.forEach((existingEvent) => {
            if (existingEvent.id == event.id) {
                changedEvent = {
                    // "id": event.id,
                    "schedule_at": moment(start).format(),
                    "slot": parseInt((end - start) / 60000)
                };
            }
        })

        const successFn = function (data) {
            displayMessage(SUCCESS_MSG_TYPE, "time changed");
            events.forEach((existingEvent) => {
                nextEvents.push(existingEvent.id == event.id
                    ? {...existingEvent, start, end}
                    : existingEvent)
            });
            that.setState({
                events: nextEvents,
            }, function () {
                that.refreshFilterList();
            })
        }
        const errorFn = function () {
        }
        confirm({
            title: 'Are you sure to change the time of this appointment?',
            // content: 'Some descriptions',
            onOk() {
                putAPI(interpolate(APPOINTMENT_API, [event.id]), changedEvent, successFn, errorFn);
            },
            onCancel() {
                // console.log('Cancel');
            },
        });
    }


    onSelectSlot(value) {
        const time = moment(value.start).format();
        if (value.action == "doubleClick") {
            this.setState({
                // startTime: time,
                redirect: true
            });
            this.props.history.push('/erp/calendar/create-appointment?startTime='+moment(time).format())
        }
    }


    onSelectEvent(event, e) {
        this.setState({
            visiblePopover: true
        })
        this.props.history.push(`/erp/patients/appointments/${  event.id}`)
    }


    /** *
     * List and style settings
     * */


    appointmentList(start, end) {
        const that = this;
        that.setState({
            loading: true
        });
        const successFn = function (data) {
            that.setState(function (prevState) {
                const previousEvent = prevState.events;
                const newEvents = [];
                const filteredEvent = [];
                const doctorsAppointmentCount = {};
                const categoriesAppointmentCount = {};
                // newEvents.concat(previousEvent);
                data.forEach(function (appointment) {
                    const endtime = new moment(appointment.schedule_at).add(appointment.slot, 'minutes')
                    const event = {
                        appointment,
                        start: new Date(moment(appointment.schedule_at)),
                        end: new Date(endtime),
                        title: appointment.patient.user.first_name,
                        id: appointment.id,
                        doctor: appointment.doctor,
                        loading: false
                    };

                    if (doctorsAppointmentCount.ALL) {
                        doctorsAppointmentCount.ALL.ALL += 1
                        if (appointment.status == CANCELLED_STATUS) {
                            doctorsAppointmentCount.ALL.CANCELLED += 1;
                        }
                    } else {
                        doctorsAppointmentCount.ALL = {}
                        doctorsAppointmentCount.ALL.ALL = 1;
                        if (appointment.status == CANCELLED_STATUS) {
                            doctorsAppointmentCount.ALL.CANCELLED = 1;
                        } else {
                            doctorsAppointmentCount.ALL.CANCELLED = 0;
                        }
                    }
                    if (appointment.doctor && doctorsAppointmentCount[appointment.doctor]) {
                        doctorsAppointmentCount[appointment.doctor].ALL += 1
                        if (appointment.status == CANCELLED_STATUS) {
                            doctorsAppointmentCount[appointment.doctor].CANCELLED += 1;
                        }
                    } else {
                        doctorsAppointmentCount[appointment.doctor] = {}
                        doctorsAppointmentCount[appointment.doctor].ALL = 1;
                        if (appointment.status == CANCELLED_STATUS) {
                            doctorsAppointmentCount[appointment.doctor].CANCELLED = 1;
                        } else {
                            doctorsAppointmentCount[appointment.doctor].CANCELLED = 0;
                        }
                    }
                    if (appointment.category && doctorsAppointmentCount[appointment.category]) {
                        categoriesAppointmentCount[appointment.category] += 1
                    } else {
                        categoriesAppointmentCount[appointment.category] = 1;
                    }
                    newEvents.push(event);
                    if (!prevState.filterCancelledAppointment && event.appointment.status == CANCELLED_STATUS) {
                        return true;
                    }
                    if ((prevState.filterType == 'DOCTOR' && prevState.selectedDoctor == 'ALL') || (prevState.filterType == 'CATEGORY' && prevState.selectedCategory == 'ALL')) {
                        filteredEvent.push(event)
                    } else if (prevState.filterType == 'DOCTOR' && event.doctor == prevState.selectedDoctor) {
                        filteredEvent.push(event)
                    } else if (prevState.filterType == 'CATEGORY' && event.appointment.category == prevState.selectedCategory) {
                        filteredEvent.push(event)
                    }

                });
                return {
                    events: newEvents,
                    filteredEvent,
                    doctorsAppointmentCount: {...doctorsAppointmentCount},
                    categoriesAppointmentCount: {...categoriesAppointmentCount, 'ALL': data.length},
                    appointments: data,
                    loading: false
                }
            });
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })
        }
        getAPI(interpolate(APPOINTMENT_PERPRACTICE_API, [this.props.active_practiceId]), successFn, errorFn, {
            start: start.format('YYYY-MM-DD'),
            end: end.format('YYYY-MM-DD')
        });
        this.blockedCalendarTiming(start, end)
    }

    blockedCalendarTiming = (start, end) => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                blockedCalendar: data
            })
        }
        const errorFn = function () {

        }
        getAPI(BLOCK_CALENDAR, successFn, errorFn, {
            practice: this.props.active_practiceId,
            cal_fdate: start.format(),
            cal_tdate: end.format()
        })
    };

    eventStyleGetter(event, start, end, isSelected) {
        const {doctor} = event;
        const {category} = event.appointment;
        let color_object = null;
        const style = {
            borderRadius: '0px',
            opacity: 0.8,
            border: '5px',
            color: 'white',
            display: 'block'
        };
        if (event.appointment.status == CANCELLED_STATUS) {
            style.backgroundColor = '#aaa';
            style.textDecoration = 'line-through';
        } else {
            if (this.state.filterType == 'DOCTOR') {
                if (doctor && this.state.doctors_object && this.state.doctors_object[doctor]) {
                    color_object = this.state.doctors_object[doctor].calendar_colour;
                } else {
                    color_object = 'black';
                }
            } else if (this.state.filterType == 'CATEGORY') {
                if (category && this.state.categories_object && this.state.categories_object[category]) {
                    color_object = `#${  this.state.categories_object[category].calendar_colour}`;
                } else {
                    color_object = 'black';
                }
            }
            style.backgroundColor = color_object;
        }
        return {
            style
        };
    }

    onRangeChange = (e) => {
        if (e.start && e.end) {
            this.appointmentList(moment(e.start), moment(e.end));
            if (moment(e.start).date() == 1) {
                this.setState({
                    selectedDate: moment(e.start)
                })
            } else {
                const newDate = moment(e.start);
                this.setState({
                    selectedDate: newDate.month(newDate.month() + 1).date(1)
                })
            }
        } else if (e.length) {
            if (e.length == 7) {
                this.appointmentList(moment(e[0]).subtract(1, 'day'), moment(e[e.length - 1]).subtract(1, 'day'));
            } else {
                this.appointmentList(moment(e[0]), moment(e[e.length - 1]));
            }
            this.setState({
                selectedDate: moment(e[0])
            });
        }
    }

    onSelectedDateChange = (e) => {
        const that = this;
        this.setState({
            selectedDate: moment(e)
        },function(){
            that.appointmentList(moment(e).startOf('day'),moment(e).endOf('day'));
        });
    }

    setFilterType = (e) => {
        const that = this;
        this.setState({
            filterType: e.key,
            selectedDoctor: 'ALL',
            selectedCategory: 'ALL'
        }, function () {
            if (e.key == 'DOCTOR') {
                that.changeFilter('selectedDoctor', 'ALL')
            } else if (e.key == 'CATEGORY') {
                that.changeFilter('selectedCategory', 'ALL')
            }
        })
    }

    setFilter = (type, value) => {
        const that = this;
        this.setState({
            [type]: value
        }, function () {
            saveCalendarSettings(type, value);
            that.changeFilter('tempKey', 'ALL')
        })
    }

    refreshFilterList = () => {
        const stateValues = this.state;
        if (stateValues.filterType == 'DOCTOR') {
            this.changeFilter('selectedDoctor', stateValues.selectedDoctor)
        } else if (stateValues.filterType == 'CATEGORY') {
            this.changeFilter('selectedCategory', stateValues.selectedCategory)
        }
    }

    changeFilter = (type, value) => {
        if (type == "selectedDoctor" && value != 'ALL') {
            this.loadDoctorTiming(value)
        }
        this.setState(function (prevState) {
            const filteredEvent = [];
            prevState.events.forEach(function (event) {
                if (!prevState.filterCancelledAppointment && event.appointment.status == CANCELLED_STATUS) {
                    return true;
                }
                if (value == 'ALL') {
                    filteredEvent.push(event)
                } else if (type == "selectedDoctor" && event.doctor == value) {
                    filteredEvent.push(event)
                } else if (type == "selectedCategory" && event.appointment.category == value) {
                    filteredEvent.push(event)
                }
            })
            return {
                [type]: value,
                filteredEvent
            }
        })
    };

    changeState = (type, value) => {
        this.setState({
            [type]: value
        }, function () {
            saveCalendarSettings(type, value)
        })
    }

    loadDoctorTiming = (id) => {
        const that = this;
        const successFn = function (data) {
            let dataObject = {};
            if (data.length)
                dataObject = data[0];
            const timing = {};
            DAY_KEYS.forEach(function (dayKey) {
                timing[dayKey] = {};
                if (dataObject.visting_hour_same_week) {
                    timing[dayKey].startTime = moment(dataObject.first_start_time, 'HH:mm:ss');
                    timing[dayKey].endTime = moment(dataObject.second_end_time, 'HH:mm:ss');
                    if (dataObject.is_two_sessions) {
                        timing[dayKey].lunch = true;
                        timing[dayKey].lunchStartTime = moment(dataObject.first_end_time, 'HH:mm:ss');
                        timing[dayKey].lunchEndTime = moment(dataObject.second_start_time, 'HH:mm:ss');
                    } else {
                        timing[dayKey].lunch = false
                    }
                } else if (dataObject[dayKey]) {
                    timing[dayKey].startTime = moment(dataObject[`first_start_time_${dayKey}`], 'HH:mm:ss');
                    timing[dayKey].endTime = moment(dataObject[`second_end_time_${dayKey}`], 'HH:mm:ss');
                    if (dataObject[`is_two_sessions_${dayKey}`]) {
                        timing[dayKey].lunch = true;
                        timing[dayKey].lunchStartTime = moment(dataObject[`first_end_time_${dayKey}`], 'HH:mm:ss');
                        timing[dayKey].lunchEndTime = moment(dataObject[`second_start_time_${dayKey}`], 'HH:mm:ss');
                    } else {
                        timing[dayKey].lunch = false
                    }
                } else {
                    timing[dayKey] = null
                }
            });
            that.setState(function (prevState) {
                return {doctorTiming: {...prevState.doctorTiming, [id]: {...timing}}}
            });
        }
        const errorFn = function () {

        };
        getAPI(interpolate(DOCTOR_VISIT_TIMING_API, [this.props.active_practiceId]), successFn, errorFn, {
            doctor: id
        });
    }

    render() {
        const that = this;
        let {startTime} = this.state;
        // let startTime = null;
        let endTime = null;
        if (this.state.calendarTimings) {
            // console.log(new Date(new moment(this.state.calendarTimings.start_time, 'HH:mm:ss')));
            startTime = new Date(new moment(this.state.calendarTimings.start_time, 'HH:mm:ss'));
            endTime = new Date(new moment(this.state.calendarTimings.end_time, 'HH:mm:ss'))

        }
        const summaryEvents = [];
        // if(this.state.calendarType==)
        return (
<Content className="main-container">
                <div style={{padding: '5px'}}>
                    <Switch>



                        <Route>

                            <div style={{backgroundColor: '#fff', padding: '5px 10px'}}>
                                <Row gutter={16}>
                                    <Col span={3}>

                                        <DatePicker
                                          onChange={this.onSelectedDateChange}
                                          value={this.state.selectedDate}
                                          format="DD-MM-YYYY"
                                          style={{margin: 5}}
                                          allowClear={false}
                                        />
                                        {this.state.calendarType == 'APPOINTMENTS' ? (
                                            <div>
                                                {that.props.activePracticePermissions.BlockCalendar || that.props.allowAllPermissions ? (
                                                    <Button block style={{margin: 5}}>
                                                        <Link to="/erp/calendar/blockcalendar">
                                                            <Icon type="stop" /> Block Calendar
                                                        </Link>
                                                    </Button>
                                                  ) : null}
                                                <Dropdown
                                                  trigger="click"
                                                  overlay={(
                                                    <Menu onClick={this.setFilterType}>
                                                        <Menu.Item key="DOCTOR">
                                                            DOCTOR
                                                        </Menu.Item>
                                                        <Menu.Item key="CATEGORY">
                                                            CATEGORY
                                                        </Menu.Item>
                                                    </Menu>
                                                  )}
                                                >
                                                    <Button block style={{margin: 5}}>
                                                        {this.state.filterType} <Icon type="caret-down" />
                                                    </Button>
                                                </Dropdown>
                                            </div>
                                          ) : null}
                                        <Spin spinning={this.state.doctorLoading}>
                                            {this.state.filterType == 'DOCTOR' ? (
                                                <Menu
                                                  selectedKeys={[this.state.selectedDoctor]}
                                                  size="small"
                                                  onClick={(e) => this.changeFilter('selectedDoctor', e.key)}
                                                >
                                                    {this.state.calendarType == 'APPOINTMENTS' ? (
                                                        <Menu.Item
                                                          key="ALL"
                                                          style={{
                                                            marginBottom: 2,
                                                            textOverflow: "ellipsis",
                                                            borderLeft: '5px solid black',
                                                            borderRight: 'none'
                                                        }}
                                                        >
                                                            <span>({this.state.doctorsAppointmentCount.ALL ? (!this.state.filterCancelledAppointment ? (this.state.doctorsAppointmentCount.ALL.ALL - this.state.doctorsAppointmentCount.ALL.CANCELLED) : this.state.doctorsAppointmentCount.ALL.ALL) : 0}) All Doctors</span>
                                                        </Menu.Item>
                                                      ) : null}
                                                    {this.state.practice_doctors.map(item => (
                                                        <Menu.Item
                                                          key={item.id}
                                                          style={{
                                                            textOverflow: "ellipsis",
                                                            borderRight: 'none',
                                                            borderLeft: `5px solid ${  item.calendar_colour}`,
                                                            backgroundColor: this.state.selectedDoctor == item.id ? item.calendar_colour : 'inherit',
                                                            color: this.state.selectedDoctor == item.id ? 'white' : 'inherit',
                                                            fontWeight: this.state.selectedDoctor == item.id ? 'bold' : 'inherit',
                                                        }}
                                                        >
                                                            <span>({this.state.doctorsAppointmentCount[item.id] ? (!this.state.filterCancelledAppointment ? (this.state.doctorsAppointmentCount[item.id].ALL - this.state.doctorsAppointmentCount[item.id].CANCELLED) : this.state.doctorsAppointmentCount[item.id].ALL) : 0}) {item.user.first_name}</span>
                                                        </Menu.Item>
                                                      )
                                                    )}
                                                </Menu>
                                              )
                                                : (
<Menu
  selectedKeys={[this.state.selectedCategory]}
  size="small"
  onClick={(e) => this.changeFilter('selectedCategory', e.key)}
>
                                                    <Menu.Item
                                                      key="ALL"
                                                      style={{
                                                        marginBottom: 2,
                                                        textOverflow: "ellipsis",
                                                        borderLeft: '5px solid black',
                                                        borderRight: 'none'
                                                    }}
                                                    >
                                                        <span>({this.state.categoriesAppointmentCount.ALL ? this.state.categoriesAppointmentCount.ALL : 0}) All Categories</span>
                                                    </Menu.Item>
                                                    {this.state.practice_categories.map(item => (
                                                        <Menu.Item
                                                          key={item.id}
                                                          style={{
                                                            textOverflow: "ellipsis",
                                                            borderRight: 'none',
                                                            borderLeft: `5px solid #${  item.calendar_colour}`,
                                                            backgroundColor: this.state.selectedCategory == item.id ? `#${  item.calendar_colour}` : 'inherit',
                                                            color: this.state.selectedCategory == item.id ? 'white' : 'inherit',
                                                            fontWeight: this.state.selectedCategory == item.id ? 'bold' : 'inherit',
                                                        }}
                                                        >
                                                            <span>({this.state.categoriesAppointmentCount[item.id] ? this.state.categoriesAppointmentCount[item.id] : 0}) {item.name}</span>
                                                        </Menu.Item>
                                                      )
                                                    )}
</Menu>
)}
                                            <div style={{marginTop: 16}}>
                                                <Radio.Group
                                                  size="small"
                                                  checked={this.state.calendarType}
                                                  defaultValue={this.state.calendarType}
                                                  buttonStyle="solid"
                                                  onChange={(e) => this.changeCalendarType(e.target.value)}
                                                >
                                                    <Radio.Button value="APPOINTMENTS">
                                                        <small>Appointments</small>
                                                    </Radio.Button>
                                                    <Radio.Button value="AVAILABILITY">
                                                        <small>Availability</small>
                                                    </Radio.Button>
                                                </Radio.Group>
                                            </div>
                                            <div style={{position: 'fixed', bottom: 10, zIndex: 9}}>
                                                {this.state.openMorePanel ? (
                                                    <div style={{
                                                        // width: 100,
                                                        boxShadow: '0 2px 4px #111',
                                                        border: '1px solid #bbb',
                                                        borderRadius: 2,
                                                        padding: 5,
                                                        backgroundColor: 'white'
                                                    }}
                                                    >
                                                        <ul style={{listStyle: 'none', paddingInlineStart: 0}}>
                                                            <li>
                                                                <Checkbox
                                                                  checked={this.state.showCalendarEvents}
                                                                  onChange={(e) => that.changeState('showCalendarEvents', e.target.checked)}
                                                                >
                                                                    <small>Events</small>
                                                                </Checkbox>
                                                            </li>
                                                            <li>
                                                                <Checkbox
                                                                  checked={this.state.showAppointments}
                                                                  onChange={(e) => that.changeState('showAppointments', e.target.checked)}
                                                                >
                                                                    <small>Appointments</small>
                                                                </Checkbox>
                                                            </li>
                                                            <li>
                                                                <Checkbox
                                                                  checked={this.state.show24HourCalendar}
                                                                  onChange={(e) => that.changeState('show24HourCalendar', e.target.checked)}
                                                                >
                                                                    <small>24 Hours</small>
                                                                </Checkbox>
                                                            </li>
                                                            <li>
                                                                <Checkbox
                                                                  checked={this.state.filterCancelledAppointment}
                                                                  onChange={(e) => that.setFilter('filterCancelledAppointment', e.target.checked)}
                                                                >
                                                                    <small>Cancellled Appointment</small>
                                                                </Checkbox>
                                                            </li>
                                                            <li>
                                                                <Divider />
                                                            </li>
                                                            <li>
                                                                <Link to="/erp/settings/clinics-staff#staff">
                                                                    <small>Add Doctor</small>
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link to="/erp/settings/calendarsettings#timings">
                                                                    <small> Customize Calendar</small>
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <a>
                                                                    <small>Resync</small>
                                                                </a>
                                                                <Button
                                                                  onClick={() => this.changeState('openMorePanel', false)}
                                                                  shape="circle"
                                                                  size="small"
                                                                  type="danger"
                                                                  icon="close"
                                                                  style={{float: 'right'}}
                                                                />
                                                            </li>
                                                        </ul>

                                                    </div>
                                                  ) : (
                                                    <a onClick={() => this.changeState('openMorePanel', true)}>
                                                        More <Icon type="caret-down" />
                                                    </a>
                                                  )}
                                            </div>
                                        </Spin>
                                    </Col>
                                    {this.state.calendarType == 'APPOINTMENTS' ? (
                                        <div>
                                            <Col span={15}>
                                                <Spin size="large" spinning={this.state.loading}>
                                                    <DragAndDropCalendar
                                                      key="APPOINTMENTS"
                                                      defaultDate={new Date()}
                                                      localizer={localizer}
                                                      defaultView="day"
                                                      step={10}
                                                      timeslots={1}
                                                      truncateEvents={false}
                                                      events={this.state.showAppointments ? this.state.filteredEvent : []}

                                                      onEventDrop={this.moveEvent}
                                                      onEventResize={this.resizeEvent}
                                                      resizable
                                                      selectable
                                                      popup={this.onSelectEvent}
                                                      onSelectSlot={this.onSelectSlot}
                                                        // onSelectEvent={this.onSelectEvent}
                                                      views={{month: true, week: MyWeek, day: true, agenda: true}}
                                                      style={{height: "calc(100vh - 85px)"}}
                                                      eventPropGetter={(this.eventStyleGetter)}
                                                      date={new Date(this.state.selectedDate.format())}
                                                      onRangeChange={this.onRangeChange}
                                                      components={{
                                                            event (option) {
                                                                return <EventComponent {...option} {...that.props} />
                                                            },
                                                            timeSlotWrapper (options) {
                                                                return (
<TimeSlotWrapper
  {...options}
  key={options.value.toString()}
  blockedCalendar={that.state.blockedCalendar}
  calendarTimings={that.state.timing}
  doctorTimings={that.state.doctorTiming[that.state.selectedDoctor]}
  filterType={that.state.filterType}
  selectedDoctor={that.state.selectedDoctor}
  showCalendarEvents={that.state.showCalendarEvents}
/>
)
                                                            },
                                                        }}
                                                    />

                                                </Spin>
                                            </Col>
                                            <Col span={6}>
                                                <CalendarRightPanel
                                                  {...this.props}
                                                  {...this.state}
                                                  selectedDate={this.state.selectedDate}
                                                  key={moment(this.state.selectedDate).format('l')}
                                                />
                                            </Col>
                                        </div>
                                      )
                                        : (
                                        <Col span={21}>
                                            <DragAndDropCalendar
                                              key="AVAILABILITY"
                                              defaultDate={new Date()}
                                              localizer={localizer}
                                              defaultView="day"
                                              step={10}
                                              timeslots={1}
                                              truncateEvents={false}
                                              events={this.state.showAppointments ? this.state.filteredEvent : []}
                                              onEventDrop={this.moveEvent}
                                              onEventResize={this.resizeEvent}
                                              resizable
                                              selectable
                                              popup={this.onSelectEvent}
                                              onSelectSlot={this.onSelectSlot}
                                                // onSelectEvent={this.onSelectEvent}
                                              views={{week: true, day: true}}
                                              style={{height: "calc(100vh - 85px)"}}
                                              eventPropGetter={(this.eventStyleGetter)}
                                              date={new Date(this.state.selectedDate.format())}
                                              onRangeChange={this.onRangeChange}
                                              components={{
                                                    event (option) {
                                                        return <EventComponent {...option} {...that.props} />
                                                    },
                                                    timeSlotWrapper (options) {
                                                        return (
<TimeSlotWrapper
  {...options}
  key={options.value.toString()}
  blockedCalendar={that.state.blockedCalendar}
  calendarTimings={that.state.timing}
  doctorTimings={that.state.doctorTiming[that.state.selectedDoctor]}
  filterType={that.state.filterType}
  selectedDoctor={that.state.selectedDoctor}
  showCalendarEvents={that.state.showCalendarEvents}
/>
)
                                                    },
                                                }}
                                            />
                                        </Col>
                                      )}
                                </Row>
                            </div>
                        </Route>

                    </Switch>
                </div>
</Content>
        );
    }
}

export default App;


class MyWeek
    extends React
        .Component {
    render() {
        const {date} = this.props
        const range = MyWeek.range(date)

        return <TimeGrid {...this.props} range={range} eventOffset={15} />
    }
}

MyWeek.range = date => {
    const start = dates.add(date, -1, 'day')
    const end = dates.add(start, 6, 'day')
    let current = start
    const range = []
    while (dates.lte(current, end, 'day')) {
        range.push(current)
        current = dates.add(current, 1, 'day')
    }
    return range
}

MyWeek.navigate = (date, action) => {
    switch (action) {
        case Navigate.PREVIOUS:
            return dates.add(date, -3, 'day')

        case Navigate.NEXT:
            return dates.add(date, 3, 'day')

        default:
            return date
    }
}

MyWeek.title = date => {
    return ` ${date.toLocaleDateString()}`
}


function MonthEventWrapper(props) {
    return props.children;
}
