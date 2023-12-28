import React from "react";
import {Button, Card, Col, Icon, Radio, Row, Select, Checkbox} from "antd";
import moment from "moment"
import {APPOINTMENT_REPORTS, APPOINTMENT_CATEGORIES, PRACTICESTAFF, COUNTRY, STATE, CITY} from "../../../constants/api";
import {
    ALL_APPOINTMENT,
    APPOINTMENT_FOR_EACH_CATEGORY,
    CANCELLATION_NUMBERS,
    AVERAGE_WAITING_ENGAGED_TIME_DAY_WISE,
    AVERAGE_WAITING_ENGAGED_TIME_MONTH_WISE,
    REASONS_FOR_CANCELLATIONS,
    DAILY_APPOINTMENT_COUNT,
    APPOINTMENT_FOR_EACH_DOCTOR,
    MONTHLY_APPOINTMENT_COUNT,
    APPOINTMENT_FOR_EACH_PATIENT_GROUP,
    NEW_PATIENTS, DOCTORS_ROLE, APPOINTMENT_FOR_PATIENT_CONVERSION,
    APPOINTMENT_CANCELATION
}
    from "../../../constants/dataKeys";
import {getAPI, displayMessage, interpolate} from "../../../utils/common";
import {APPOINTMENT_RELATED_REPORT} from "../../../constants/hardData";
import AllAppointments from "./AllAppointments";
import AppointmentByCategory from "./AppointmentByCategory";
import AppointmentForEachDoctor from "./AppointmentForEachDoctor";
import AppointmentForEachPatientGroup from "./AppointmentForEachPatientGroup";
import AverageWaitingOrEngagedTimeDayWise from "./AverageWaitingOrEngagedTimeDayWise";
import AverageWaitingOrEngagedTimeMonthWise from "./AverageWaitingOrEngagedTimeMonthWise";
import CancellationsNumbers from "./CancellationsNumbers";
import DailyAppointmentCount from "./DailyAppointmentCount";
import MonthlyAppointmentCount from './MonthlyAppointmentCount'
import ReasonsForCancellations from "./ReasonsForCancellations";
import {loadDoctors, loadMailingUserListForReportsMail} from "../../../utils/clinicUtils";
import Patient_Conversion from "./PatientConversion";
import AppointmentCancel from "./AppointmentCancel";

export default class AppointmentsReportHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sidePanelColSpan: 4,
            appointmentReports: [],
            type: 'ALL',
            advancedOptionShow: true,
            appointmentCategory: [],
            categories: '',
            practiceDoctors: [],
            countrylist: [],
            stateList: [],
            appointmentType: null,
            conversionType:null,
            cityList: [],
        };
        this.loadAppointmentCategory = this.loadAppointmentCategory.bind(this);


    }

    componentDidMount() {
        this.loadAppointmentCategory();
        loadDoctors(this);
        this.getCountry();

    }


    getCountry() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                countrylist: data,
            })
        };
        const errorFun = function () {

        };
        getAPI(COUNTRY, successFn, errorFun);
    }


    getState() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                stateList: data,
            })
        };
        const errorFn = function () {

        };
        getAPI(STATE, successFn, errorFn, {country: this.state.country});


    }

    getCity() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                cityList: data,
            })

        };
        const errorFn = function () {

        };
        getAPI(CITY, successFn, errorFn, {
            state: this.state.state,
        });

    }


    loadAppointmentCategory() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                appointmentCategory: data,
            })
        };
        const errorFn = function () {

        }
        getAPI(interpolate(APPOINTMENT_CATEGORIES, [this.props.active_practiceId]), successFn, errorFn);
    };


    onChangeHandle = (type, value) => {
        const that = this;
        this.setState({
            [type]: value.target.value,
        });
    }

    advancedOption(value) {
        this.setState({
            advancedOptionShow: value,
        })
    }

    handleChangeOption = (type, value) => {
        const that = this;
        this.setState({
            [type]: value,
        }, function () {
            if (type == 'country') {
                that.setState({
                    state: '',
                    city: '',
                }, function () {
                    that.getState();
                })


            }
            if (type == 'state') {
                that.setState({
                    city: '',
                }, function () {
                    that.getCity();
                })


            }

        })
    }

    onChangeCheckbox = (e) => {
        this.setState({
            exclude_cancelled: !this.state.exclude_cancelled,
        });
    };


    changeSidePanelSize = (sidePanel) => {
        this.setState({
            sidePanelColSpan: sidePanel ? 0 : 4
        })
    }

    render() {
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };
        const {sidePanelColSpan, type, advancedOptionShow, practiceDoctors, appointmentCategory, appointmentType, conversionType} = this.state;
        return (
            <div>
                <h2>Appointments Report <Button
                  type="primary"
                  shape="round"
                  icon={sidePanelColSpan ? "double-right" : "double-left"}
                  style={{float: "right"}}
                  onClick={() => this.changeSidePanelSize(sidePanelColSpan)}
                >Panel
                                        </Button>
                </h2>
                <Card>
                    <Row gutter={16}>
                        <Col span={(24 - sidePanelColSpan)}>
                            {type == ALL_APPOINTMENT ?
                                <AllAppointments type={ALL_APPOINTMENT} {...this.state} {...this.props} /> : null}
                            {type == APPOINTMENT_FOR_EACH_CATEGORY ?
                                <AppointmentByCategory {...this.state} {...this.props} /> : null}

                            {type == APPOINTMENT_FOR_EACH_DOCTOR ?
                                <AppointmentForEachDoctor {...this.state} {...this.props} /> : null}
                            {type == APPOINTMENT_FOR_EACH_PATIENT_GROUP ?
                                <AppointmentForEachPatientGroup {...this.state} {...this.props} /> : null}
                            {type == AVERAGE_WAITING_ENGAGED_TIME_DAY_WISE ?
                                <AverageWaitingOrEngagedTimeDayWise {...this.state} {...this.props} /> : null}
                            {type == AVERAGE_WAITING_ENGAGED_TIME_MONTH_WISE ?
                                <AverageWaitingOrEngagedTimeMonthWise {...this.state} {...this.props} /> : null}
                            {type == CANCELLATION_NUMBERS ?
                                <CancellationsNumbers {...this.state} {...this.props} /> : null}
                            {type == DAILY_APPOINTMENT_COUNT ?
                                <DailyAppointmentCount {...this.state} {...this.props} /> : null}
                            {type == MONTHLY_APPOINTMENT_COUNT ?
                                <MonthlyAppointmentCount {...this.state} {...this.props} /> : null}
                            {type == APPOINTMENT_FOR_PATIENT_CONVERSION ?
                                <Patient_Conversion {...this.props} {...this.state} /> : null}
                            {type==APPOINTMENT_CANCELATION ?
                            <AppointmentCancel {...this.props} {...this.state}/>:null}

                        </Col>
                        <Col span={sidePanelColSpan}>
                            <Radio.Group
                              buttonStyle="solid"
                              defaultValue={ALL_APPOINTMENT}
                              onChange={(value) => this.onChangeHandle('type', value)}
                            >
                                <h2>Appointments</h2>
                                <Radio.Button
                                  style={{width: '100%', backgroundColor: 'transparent', border: '0px'}}
                                  value={ALL_APPOINTMENT}
                                >
                                    All Appointments
                                </Radio.Button>
                                <p><br /></p>
                                <h2>Related Reports</h2>
                                {APPOINTMENT_RELATED_REPORT.map((item) => (
                                    <Radio.Button
                                      style={{width: '100%', backgroundColor: 'transparent'}}
                                      value={item.value}
                                    >
                                        {item.name}
                                    </Radio.Button>
                                ))}
                            </Radio.Group>


                            <br />
                            <br />
                            {advancedOptionShow ? (
                                <>
                                    <Button type="link" onClick={(value) => this.advancedOption(false)}>Hide Advanced
                                        Options
                                    </Button>

                                    <Col>
                                        {type == APPOINTMENT_FOR_PATIENT_CONVERSION ? (
                                            <>
                                                <h4>Appointment Type</h4>
                                                <Select
                                                  onChange={(e) => this.handleChangeOption('appointmentType', e)}
                                                  value={appointmentType}
                                                  style={{minWidth: '200px'}}
                                                >
                                                    <Select.Option value={null}>All Appointment</Select.Option>
                                                    <Select.Option value="true">First Time Appointment</Select.Option>
                                                    <Select.Option value="false">Repeated Appointment</Select.Option>
                                                </Select>
                                                <br />
                                                <br />
                                            </>
                                        ) : null}
                                        {type == APPOINTMENT_FOR_PATIENT_CONVERSION ? (
                                            <>
                                                <h4>Conversion Type</h4>
                                                <Select
                                                  onChange={(e) => this.handleChangeOption('conversionType', e)}
                                                  value={conversionType}
                                                  style={{minWidth: '200px'}}
                                                >
                                                    <Select.Option value={null}>All Appointment</Select.Option>
                                                    <Select.Option value="true">Converted Appointment</Select.Option>
                                                    <Select.Option value="false">Not Converted
                                                        Appointment
                                                    </Select.Option>
                                                </Select>
                                                <br />
                                                <br />
                                            </>
                                        ) : null}
                                        <h4>Country</h4>
                                        <Select
                                          style={{minWidth: '200px'}}
                                            // mode="multiple"
                                          placeholder="Select Country"
                                          onChange={(value) => this.handleChangeOption('country', value)}
                                        >
                                            {this.state.countrylist.map((option) => (
                                                <Select.Option
                                                  value={option.id}
                                                >{option.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        <br />
                                        <br />

                                        <h4>State</h4>
                                        <Select
                                          style={{minWidth: '200px'}}
                                            // mode="multiple"
                                          value={this.state.state}
                                          placeholder="Select State"
                                          onChange={(value) => this.handleChangeOption('state', value)} 
                                          allowclear
                                        >
                                            {this.state.stateList.map((option) => (
                                                <Select.Option
                                                  value={option.id}
                                                >{option.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        <br />
                                        <br />

                                        <h4>City</h4>
                                        <Select
                                          style={{minWidth: '200px'}}
                                          value={this.state.city}
                                          placeholder="Select City"
                                          onChange={(value) => this.handleChangeOption('city', value)}
                                        >
                                            {this.state.cityList.map((option) => (
                                                <Select.Option
                                                  value={option.id}
                                                >{option.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        <br/>
                                        <br/>
                                        <h4>Doctors</h4>
                                        <Select
                                          style={{minWidth: '200px'}}
                                          mode="multiple"
                                          placeholder="Select Doctors"
                                          onChange={(value) => this.handleChangeOption('doctors', value)}
                                        >
                                            {practiceDoctors.map((item) => (
                                                <Select.Option value={item.id}>
                                                    {item.user.first_name}
                                                </Select.Option>
                                            ))}
                                        </Select>

                                        <br />
                                        <br />
                                        <h4>Appointment Categories</h4>
                                        <Select
                                          style={{minWidth: '200px'}}
                                          mode="multiple"
                                          placeholder="Select Category"
                                          onChange={(value) => this.handleChangeOption('categories', value)}
                                        >
                                            {appointmentCategory.map((item) => (
                                                <Select.Option value={item.id}>
                                                    {item.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        {/* <h4>Offer Applied</h4> */}
                                        {/* <Select style={{minWidth: '200px'}} */}
                                        {/*        onChange={(value)=>this.handleChangeOption('referrer',value)}> */}
                                        {/*    {this.state.referrerOption.map((item) => <Select.Option value={item.id}> */}
                                        {/*        {item.name}</Select.Option>)} */}
                                        {/* </Select> */}

                                        <br />
                                        <br />
                                        <Checkbox onChange={(e) => this.onChangeCheckbox(e)}> Exclude
                                            Cancelled
                                        </Checkbox>
                                    </Col>
                                </>
                            ) : (
                                <Button type="link" onClick={(value) => this.advancedOption(true)}>Show Advanced
                                    Options
                                </Button>
                            )}

                        </Col>
                    </Row>
                </Card>
            </div>
        )
    }
}
