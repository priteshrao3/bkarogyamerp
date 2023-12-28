import React from "react";
import {
    Alert,
    AutoComplete,
    Avatar,
    Button,
    Card,
    DatePicker,
    Form,
    Input,
    InputNumber,
    List,
    Select,
    Spin,
    Icon,
    Row, Col,
    Checkbox, Radio
} from "antd";
import moment from "moment/moment";
import { REQUIRED_FIELD_MESSAGE } from "../../constants/messages";
import { ALL, DOCTORS_ROLE, SUCCESS_MSG_TYPE } from "../../constants/dataKeys";
import {
    ALL_APPOINTMENT_API,
    APPOINTMENT_API,
    APPOINTMENT_CATEGORIES,
    BLOCK_CALENDAR,
    CALENDER_SETTINGS,
    DOCTOR_VISIT_TIMING_API,
    EMR_TREATMENTNOTES,
    PATIENT_PROFILE,
    PRACTICESTAFF,
    PROCEDURE_CATEGORY,
    SEARCH_PATIENT,
    APPOINTMENT_PERPRACTICE_API,
    APPOINTMENT_SCHEDULE
} from "../../constants/api";

import { displayMessage, getAPI, interpolate, makeFileURL, postAPI, putAPI } from "../../utils/common";
import { APPOINTMENT_CANCEL_REASON, APPOINTMENT_STATUS, CANCELLED_STATUS, DAY_KEYS } from "../../constants/hardData";
import { hideMobile } from "../../utils/permissionUtils";
import PatientAccessModal from "../patients/PatientAccessModal";
import debounce from "lodash/debounce";

const FormItem = Form.Item;
const { Meta } = Card;
export default class CreateAppointmentForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            practice_doctors: [],
            appointmentCategories: null,
            procedure_category: null,
            treatmentNotes: null,
            practice_staff: [],
            appointment: null,
            loading: false,
            patientListData: [],
            patientDetails: null,
            appointmentDetail: null,
            saving: false,
            doctorBlock: false,
            doctorOutsideAvailableTiming: false,
            practiceBlock: false,
            practiceOutsideAvailableTiming: false,
            timeToCheckBlock: {
                schedule_at: moment(),
                slot: 10
            },
            procedureObjectsById: {},
            // appointmentList:[],
            startTime: this.props.startTime,
            unAllowedPatient: false

        };
        this.changeRedirect = this.changeRedirect.bind(this);
        this.loadDoctors = this.loadDoctors.bind(this);
        this.loadProcedureCategory = this.loadProcedureCategory.bind(this);
        this.loadTreatmentNotes = this.loadTreatmentNotes.bind(this);
        this.searchPatient = debounce(this.searchPatient.bind(this), 500);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.loadAppointment = this.loadAppointment.bind(this);
        this.loadAppointmentList = this.loadAppointmentList.bind(this);

    }

    componentDidMount() {
        const that = this;
        this.loadDoctors();
        // this.loadProcedureCategory();
        this.loadTreatmentNotes();
        this.loadAppointmentCategories();
        this.loadPracticeTiming();
        if (this.props.match.params.appointmentid) {
            that.loadAppointment();
        } else {
            that.loadAppointmentList();
        }
        if (this.props.history && this.props.history.location.search) {
            const pairValueArray = this.props.history.location.search.substr(1).split("&");
            if (pairValueArray.length) {
                pairValueArray.forEach(function(item) {
                    const keyValue = item.split("=");
                    if (keyValue && keyValue.length == 2) {
                        if (keyValue[0] == "patient" && keyValue[1]) {
                            that.handlePatientSelect(keyValue[1]);
                        } else if (keyValue[0] == "status" && keyValue[1] == "cancel") {
                            that.setState({
                                appointment_status: CANCELLED_STATUS
                            });
                        }
                        if (keyValue[0] == "startTime" && keyValue[1] && moment(keyValue[1]).isValid()) {
                            that.setState({
                                startTime: moment(keyValue[1])
                            });
                        }
                    }
                });
            }
        }
    }

    setClassState = (type, value) => {
        this.setState({
            [type]: value
        });
    };

    loadPracticeTiming = () => {
        const that = this;
        const successFn = function(data) {
            let dataObject = {};
            if (data.length)
                dataObject = data[0];
            const timing = {};
            DAY_KEYS.forEach(function(dayKey) {
                timing[dayKey] = {};
                if (dataObject.visting_hour_same_week) {
                    timing[dayKey].startTime = moment(dataObject.first_start_time, "HH:mm:ss");
                    timing[dayKey].endTime = moment(dataObject.second_end_time, "HH:mm:ss");
                    if (dataObject.is_two_sessions) {
                        timing[dayKey].lunch = true;
                        timing[dayKey].lunchStartTime = moment(dataObject.first_end_time, "HH:mm:ss");
                        timing[dayKey].lunchEndTime = moment(dataObject.second_start_time, "HH:mm:ss");
                    } else {
                        timing[dayKey].lunch = false;
                    }
                } else if (dataObject[dayKey]) {
                    timing[dayKey].startTime = moment(dataObject[`first_start_time_${dayKey}`], "HH:mm:ss");
                    timing[dayKey].endTime = moment(dataObject[`second_end_time_${dayKey}`], "HH:mm:ss");
                    if (dataObject[`is_two_sessions_${dayKey}`]) {
                        timing[dayKey].lunch = true;
                        timing[dayKey].lunchStartTime = moment(dataObject[`first_end_time_${dayKey}`], "HH:mm:ss");
                        timing[dayKey].lunchEndTime = moment(dataObject[`second_start_time_${dayKey}`], "HH:mm:ss");
                    } else {
                        timing[dayKey].lunch = false;
                    }
                } else {
                    timing[dayKey] = null;
                }
            });
            that.setState({
                calendarTimings: { ...timing }
            }, function() {
                that.findOutsidePracticeTiming();
            });
        };
        const errorFn = function() {
            that.setState({
                calendarTimings: {}
            });
        };
        getAPI(interpolate(CALENDER_SETTINGS, [this.props.active_practiceId]), successFn, errorFn);
    };

    loadDoctorsTiming = () => {
        const that = this;
        const successFn = function(data) {
            let dataObject = {};
            if (data.length)
                dataObject = data[0];
            const timing = {};
            DAY_KEYS.forEach(function(dayKey) {
                timing[dayKey] = {};
                if (dataObject.visting_hour_same_week) {
                    timing[dayKey].startTime = moment(dataObject.first_start_time, "HH:mm:ss");
                    timing[dayKey].endTime = moment(dataObject.second_end_time, "HH:mm:ss");
                    if (dataObject.is_two_sessions) {
                        timing[dayKey].lunch = true;
                        timing[dayKey].lunchStartTime = moment(dataObject.first_end_time, "HH:mm:ss");
                        timing[dayKey].lunchEndTime = moment(dataObject.second_start_time, "HH:mm:ss");
                    } else {
                        timing[dayKey].lunch = false;
                    }
                } else if (dataObject[dayKey]) {
                    timing[dayKey].startTime = moment(dataObject[`first_start_time_${dayKey}`], "HH:mm:ss");
                    timing[dayKey].endTime = moment(dataObject[`second_end_time_${dayKey}`], "HH:mm:ss");
                    if (dataObject[`is_two_sessions_${dayKey}`]) {
                        timing[dayKey].lunch = true;
                        timing[dayKey].lunchStartTime = moment(dataObject[`first_end_time_${dayKey}`], "HH:mm:ss");
                        timing[dayKey].lunchEndTime = moment(dataObject[`second_start_time_${dayKey}`], "HH:mm:ss");
                    } else {
                        timing[dayKey].lunch = false;
                    }
                } else {
                    timing[dayKey] = null;
                }
            });
            that.setState({
                doctorTimings: { ...timing }
            }, function() {
                that.findOutsideDoctorTiming();
            });
        };
        const errorFn = function() {

        };
        if (that.state.timeToCheckBlock.doctor)
            getAPI(interpolate(DOCTOR_VISIT_TIMING_API, [this.props.active_practiceId]), successFn, errorFn, {
                doctor: that.state.timeToCheckBlock.doctor
            });
    };

    setBlockedTiming = (type, value) => {
        const that = this;
        if (type) {
            this.setState(function(prevState) {
                return {
                    timeToCheckBlock: { ...prevState.timeToCheckBlock, [type]: value }
                };
            }, function() {
                that.loadAppointmentList();
                that.findBlockedTiming();
                that.findOutsidePracticeTiming();
                if (type == "doctor") {
                    that.loadDoctorsTiming();
                } else {
                    that.findOutsideDoctorTiming();
                }

            });
        }
    };

    findBlockedTiming = () => {
        const that = this;
        const successFn = function(data) {
            data.forEach(function(blockRow) {
                if (blockRow.doctor == null) {
                    that.setState({
                        practiceBlock: true
                    });
                } else if (blockRow.doctor == that.props.timeToCheckBlock.doctor) {
                    that.setState({
                        doctorBlock: true
                    });
                }
            });
        };
        const errorFn = function() {

        };
        getAPI(BLOCK_CALENDAR, successFn, errorFn, {
            practice: this.props.active_practiceId,
            cal_fdate: moment(that.state.timeToCheckBlock.schedule_at).format(),
            cal_tdate: moment(that.state.timeToCheckBlock.schedule_at).add(that.state.timeToCheckBlock.slot, "minutes").format()
        });
    };

    findOutsidePracticeTiming = () => {
        const that = this;
        let flag = true;
        if (that.state.timeToCheckBlock.schedule_at && that.state.timeToCheckBlock.slot) {
            const { schedule_at } = that.state.timeToCheckBlock;
            const { calendarTimings } = that.state;
            const dayValue = moment(schedule_at).isValid() ? moment(schedule_at).format("dddd").toLowerCase() : null;
            /**
             * Checking for Calendar Clinic Timings
             * */
            if (calendarTimings && dayValue && calendarTimings[dayValue]) {
                const daysTimings = calendarTimings[dayValue];
                if (daysTimings.lunch) {
                    if (
                        (moment(schedule_at, "HH:mm:ss").format("HH:mm:ss") <= daysTimings.startTime.format("HH:mm:ss")
                            || moment(schedule_at, "HH:mm:ss").format("HH:mm:ss") > daysTimings.endTime.format("HH:mm:ss")
                        ) || (
                            moment(schedule_at, "HH:mm:ss").format("HH:mm:ss") < daysTimings.lunchEndTime.format("HH:mm:ss")
                            && moment(schedule_at, "HH:mm:ss").format("HH:mm:ss") >= daysTimings.lunchStartTime.format("HH:mm:ss")
                        )
                    ) {
                        flag = false;
                    }
                } else if (moment(schedule_at, "HH:mm:ss").format("HH:mm:ss") <= daysTimings.startTime.format("HH:mm:ss") || moment(schedule_at, "HH:mm:ss").format("HH:mm:ss") > daysTimings.endTime.format("HH:mm:ss")) {
                    flag = false;
                }
            } else if (dayValue && !calendarTimings[dayValue]) {
                /**
                 * If the practice isnot opening for the day
                 * */
                flag = false;
            }

        }
        that.setState({
            practiceOutsideAvailableTiming: !flag
        });
    };

    findOutsideDoctorTiming = () => {
        const that = this;
        let flag = true;
        if (that.state.timeToCheckBlock.schedule_at && that.state.timeToCheckBlock.slot) {
            const { schedule_at } = that.state.timeToCheckBlock;
            const calendarTimings = that.state.doctorTimings;
            const dayValue = moment(schedule_at).isValid() ? moment(schedule_at).format("dddd").toLowerCase() : null;
            /**
             * Checking for Calendar Clinic Timings
             * */
            if (calendarTimings && dayValue && calendarTimings[dayValue]) {
                const daysTimings = calendarTimings[dayValue];
                if (daysTimings.lunch) {
                    if (
                        (moment(schedule_at, "HH:mm:ss").format("HH:mm:ss") <= daysTimings.startTime.format("HH:mm:ss")
                            || moment(schedule_at, "HH:mm:ss").format("HH:mm:ss") > daysTimings.endTime.format("HH:mm:ss")
                        ) || (
                            moment(schedule_at, "HH:mm:ss").format("HH:mm:ss") < daysTimings.lunchEndTime.format("HH:mm:ss")
                            && moment(schedule_at, "HH:mm:ss").format("HH:mm:ss") >= daysTimings.lunchStartTime.format("HH:mm:ss")
                        )
                    ) {
                        flag = false;
                    }
                } else if (moment(schedule_at, "HH:mm:ss").format("HH:mm:ss") <= daysTimings.startTime.format("HH:mm:ss") || moment(schedule_at, "HH:mm:ss").format("HH:mm:ss") > daysTimings.endTime.format("HH:mm:ss")) {
                    flag = false;
                }
            } else if (dayValue && calendarTimings && !calendarTimings[dayValue]) {
                /**
                 * If the practice isnot opening for the day
                 * */
                flag = false;
            }
        }
        that.setState({
            doctorOutsideAvailableTiming: !flag
        });
    };

    loadAppointment() {
        const that = this;
        this.setState({
            loading: true
        });
        const successFn = function(data) {
            that.setState(function(prevState) {
                return {
                    appointment: data,
                    patientDetails: data.patient,
                    timeToCheckBlock: data,
                    loading: false,
                    appointment_status: prevState.appointment_status ? prevState.appointment_status : data.status,
                    appointment_cancel_reason: data.cancel_by
                };
            }, function() {
                that.findBlockedTiming();
                that.findOutsideDoctorTiming();
                that.loadDoctorsTiming();
                that.loadAppointmentList();
            });

        };

        const errorFn = function() {
            that.setState({
                loading: false
            });
        };
        getAPI(interpolate(APPOINTMENT_API, [this.props.match.params.appointmentid]), successFn, errorFn);

    }

    loadDoctors() {
        const that = this;
        const successFn = function(data) {
            const doctor = [];
            let selectedDoctor = {};
            data.staff.forEach(function(usersdata) {
                if (usersdata.role == DOCTORS_ROLE) {
                    doctor.push(usersdata);
                    if (that.props.user.id == usersdata.user.id) {
                        selectedDoctor = usersdata;
                    }

                }
            });
            that.setState(function(prevState) {


                return {
                    selectedDoctor: (doctor.length && !selectedDoctor.id ? doctor[0].id : selectedDoctor.id),
                    practice_doctors: doctor,
                    timeToCheckBlock: {
                        ...prevState.timeToCheckBlock,
                        doctor: (doctor.length && !selectedDoctor.id ? doctor[0].id : selectedDoctor.id)
                    }
                };
            }, function() {
                that.findBlockedTiming();
                that.loadDoctorsTiming();
            });
        };
        const errorFn = function() {
        };
        getAPI(interpolate(PRACTICESTAFF, [this.props.active_practiceId]), successFn, errorFn);
    }

    loadProcedureCategory() {
        const that = this;
        const successFn = function(data) {
            const obj = {};
            data.forEach(function(item) {
                obj[item.id] = item;
            });
            that.setState({
                procedure_category: data,
                procedureObjectsById: { ...obj }
            });
        };
        const errorFn = function() {

        };
        getAPI(interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId]), successFn, errorFn, { pagination: false });
    }

    loadTreatmentNotes() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                treatmentNotes: data
            });

        };
        const errorFn = function() {

        };
        getAPI(interpolate(EMR_TREATMENTNOTES, [this.props.active_practiceId]), successFn, errorFn);
    }

    loadAppointmentCategories() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                appointmentCategories: data
            });

        };
        const errorFn = function() {

        };
        getAPI(interpolate(APPOINTMENT_CATEGORIES, [this.props.active_practiceId]), successFn, errorFn);
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar
        });
    }

    searchPatient(value) {
        const that = this;
        this.setState({
            searchPatientString: value
        });
        const successFn = function(data) {
            that.setState(function(prevState) {
                if (prevState.searchPatientString == value)
                    if (data.current > 1) {
                        return {
                            patientListData: [...prevState.patientListData, ...data.results]

                        };
                    } else {
                        return {
                            patientListData: [...data.results]

                        };
                    }
            });
        };
        const errorFn = function(data) {
            that.setState({
                searchPatientString: null
            });
        };
        if (value) {
            getAPI(interpolate(SEARCH_PATIENT, [value]), successFn, errorFn, { perm_practice: this.props.active_practiceId });
        }

    };

    handleSubmit = (e) => {
        const that = this;
        const patient = {};
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                that.setState({
                    saving: true
                });
                const formData = { ...values };
                formData.patient = { user: {} };
                if (!this.state.patientDetails) {
                    formData.patient.user.first_name = formData.patient_name;
                    formData.patient.user.email = formData.patient_email;
                    formData.patient.user.mobile = formData.patient_mobile;
                    formData.patient_email = undefined;
                    formData.patient_name = undefined;
                    formData.patient_mobile = undefined;
                } else {
                    formData.patient = this.state.patientDetails;
                }
                formData.practice = that.props.active_practiceId;
                // formData.treatment_plans = []
                // values.procedure.forEach(function (id) {
                //     let item = that.state.procedureObjectsById[id];
                //     formData.treatment_plans.push({
                //         "procedure": item.id,
                //         "cost": item.cost,
                //         "quantity": 1,
                //         "margin": item.margin,
                //         "default_notes": item.default_notes,
                //         "is_active": true,
                //         "is_completed": false,
                //         "discount": item.discount,
                //         "discount_type": "%",
                //     })
                // });
                // delete formData.procedure;
                // console.log(formData);
                const successFn = function(data) {
                    that.setState({
                        saving: false
                    });
                    if (that.props.history) {
                        that.props.history.goBack();
                        that.props.history.replace("/erp/patients/appointments");
                    }

                    if (that.props.loadData)
                        that.props.loadData();
                    if (data) {
                        // console.log(data)
                        displayMessage(SUCCESS_MSG_TYPE, "Appointment Created Successfully");
                    }
                };
                const errorFn = function() {
                    that.setState({
                        saving: false
                    });
                };
                if (this.state.appointment) {
                    putAPI(interpolate(APPOINTMENT_API, [this.state.appointment.id]), formData, successFn, errorFn);
                } else {
                    postAPI(ALL_APPOINTMENT_API, formData, successFn, errorFn);
                }
            }
        });

    };

    handlePatientSelect = (event) => {
        if (event) {
            const that = this;
            const successFn = function(data) {
                that.setState({
                    unAllowedPatientData: data,
                    patientDetails: data.is_active ? data : null,
                    unAllowedPatient: data.is_active ? false : data.id
                });
            };
            const errorFn = function() {
            };
            const params = this.props.activePracticePermissions.ViewAllClinics ? {} : {
                perm_practice: this.props.active_practiceId
            };
            getAPI(interpolate(PATIENT_PROFILE, [event]), successFn, errorFn, params);
        }
    };

    handleClick = (e) => {
        this.setState({
            patientDetails: null
        });
    };

    loadAppointmentList() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                appointmentList: data
            });
        };
        const errorFn = function(data) {
        };
        const apiParams = {
            start_time: moment(this.state.timeToCheckBlock.schedule_at).format(),
            end_time: moment(this.state.timeToCheckBlock.schedule_at).add(this.state.timeToCheckBlock.slot, "minutes").format(),
            doctor: this.state.timeToCheckBlock.doctor
        };
        getAPI(interpolate(APPOINTMENT_SCHEDULE, [this.props.active_practiceId]), successFn, errorFn, apiParams);
    }

    render() {
        const that = this;
        const formItemLayout = (this.props.formLayout ? this.props.formLayout : {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 }
        });
        const formPatients = (this.props.formLayout ? this.props.formLayout : {
            wrapperCol: { offset: 6, span: 14 }
        });
        const { getFieldDecorator } = this.props.form;

        // let doctorArray=this.state.practice_doctors;
        // let loginUser =that.props.user;
        // const doctorId={};
        // let flag=true;
        // doctorArray.forEach(function (items) {
        //    if (items.user.id == that.props.user.id){
        //        doctorId.id=that.props.user.id;
        //        flag=false;
        //        return false;
        //    }
        // },function () {
        //     doctorId.id=doctorArray[0].user.id;
        // });

        const treatmentNotesOption = [];
        if (this.state.treatmentNotes) {
            this.state.treatmentNotes.forEach(function(drug) {
                treatmentNotesOption.push({ label: drug.name, value: drug.id });
            });
        }
        const categoryOptions = [];
        if (this.state.appointmentCategories) {
            this.state.appointmentCategories.forEach(function(category) {
                categoryOptions.push({ label: category.name, value: category.id });
            });
        }
        let appointmentTime = this.state.appointment ? this.state.appointment.schedule_at : this.state.startTime;
        if (!appointmentTime) {
            appointmentTime = new moment(new Date()).format();
        }
        const fields = [];

        return (
            <Card>
                <Spin spinning={this.state.saving}>
                    {this.state.unAllowedPatient ? (
                        <PatientAccessModal
                            key={this.state.unAllowedPatient}
                            {...this.props}
                            patientData={this.state.unAllowedPatientData}
                            loadData={() => this.handlePatientSelect(this.state.unAllowedPatientData.id)}
                        />
                    ) : null}
                    <Form onSubmit={this.handleSubmit}>
                        {this.props.title ? <h2>{this.props.title}</h2> : null}

                        <FormItem key="schedule_at" label="Appointment Schedule" {...formItemLayout}>
                            {getFieldDecorator("schedule_at",
                                {
                                    initialValue: appointmentTime ? moment(appointmentTime) : moment(this.props.startTime),
                                    rules: [{ required: true, message: REQUIRED_FIELD_MESSAGE }]
                                })(
                                <DatePicker
                                    showTime={{ use12Hours: true }}
                                    format="YYYY/MM/DD hh:mm a"
                                    allowClear={false}
                                    onChange={(value) => this.setBlockedTiming("schedule_at", value)}
                                />
                            )}
                            {this.state.practiceOutsideAvailableTiming ? (
                                <Alert
                                    message="Selected time is outside available clinic time!!"
                                    type="warning"
                                    showIcon
                                />
                            ) : null}
                            {this.state.practiceBlock ? (
                                <Alert
                                    message="Selected time is blocked in this clinic !!"
                                    type="warning"
                                    showIcon
                                />
                            ) : null}
                        </FormItem>
                        <FormItem
                            key="slot"
                            {...formItemLayout}
                            label="Time Slot"
                        >
                            {getFieldDecorator("slot", {
                                initialValue: this.state.appointment ? this.state.appointment.slot : 10,
                                rules: [{ required: true, message: REQUIRED_FIELD_MESSAGE }]
                            })(
                                <InputNumber min={1} onChange={(value) => this.setBlockedTiming("slot", value)}/>
                            )}
                            <span className="ant-form-text">mins
                        <Row style={{ float: "right" }}>
                            <Col span={24}>
                                {this.state.appointmentList && this.state.appointmentList.length > 0 ? (
                                        <div span={5} style={{ float: "right" }}>
                                            <ul style={{
                                                listStyle: "none",
                                                display: "inline-flex",
                                                paddingLeft: "15px",
                                                paddingRight: "10px"
                                            }}
                                            >
                                                {that.state.appointmentList.map((item) => (
                                                    <li style={{
                                                        border: "1px solid #bbb",
                                                        marginLeft: "13px",
                                                        padding: " 0.01em 14px"
                                                    }}
                                                    ><span
                                                        style={{ width: "calc(100% - 60px)" }}
                                                    ><b>{moment(item.schedule_at).format("LT")}</b>&nbsp;{item.patient.user.first_name}
                                                     </span>
                                                        &nbsp;
                                                        <b>with</b> &nbsp;{item.doctor_data ? item.doctor_data.user.first_name : "--"}
                                                    </li>
                                                ))}

                                            </ul>
                                        </div>
                                    )

                                    : null}
                            </Col>
                        </Row>

                            </span>
                            {this.state.appointmentList && this.state.appointmentList.length > 0 ? (
                                    <>

                                        <Alert
                                            message="Selected time slot have assigned someone else !! please select another slot."
                                            type="warning"
                                            showIcon
                                        />
                                        {/* <div style={{backgroundColor:"#fffbe6"}}>
                                    <p style={{color:red ,padding:"7px"}}><Icon type="exclamation-circle" theme="twoTone" twoToneColor="#faad14" /> </p>
                                </div> */}

                                    </>
                                )
                                : null}
                        </FormItem>


                        {that.state.patientDetails ? (
                                <FormItem key="id" value={this.state.patientDetails.id} {...formPatients}>
                                    <Card bordered={false} style={{ background: "#ECECEC" }}>
                                        <Meta
                                            avatar={(this.state.patientDetails.image ?
                                                <Avatar src={makeFileURL(this.state.patientDetails.image)}/> : (
                                                    <Avatar style={{ backgroundColor: "#87d068" }}>
                                                        {this.state.patientDetails.user.first_name ? this.state.patientDetails.user.first_name.charAt(0) :
                                                            <Icon type="user"/>}
                                                    </Avatar>
                                                ))}

                                            title={this.state.patientDetails.user.first_name}
                                            description={(
                                                <span>{that.props.activePracticePermissions.PatientPhoneNumber ? this.state.patientDetails.user.mobile : hideMobile(this.state.patientDetails.user.mobile)}<br/>
                                    <Button type="primary" style={{ float: "right" }} onClick={this.handleClick}>Add New
                                    Patient
                                    </Button>
                                                </span>
                                            )}
                                        />


                                    </Card>
                                </FormItem>
                            )
                            : (
                                <div>
                                    <FormItem key="patient_name" label="Patient Name" {...formItemLayout}>
                                        {getFieldDecorator("patient_name", {
                                            initialValue: this.state.appointment ? this.state.appointment.patient.user.first_name : null,
                                            rules: [{ required: true, message: REQUIRED_FIELD_MESSAGE }]
                                        })(
                                            <AutoComplete
                                                placeholder="Patient Name"
                                                showSearch
                                                onSearch={this.searchPatient}
                                                defaultActiveFirstOption={false}
                                                showArrow={false}
                                                filterOption={false}
                                                onSelect={this.handlePatientSelect}
                                            >
                                                {this.state.patientListData.map((option) => (
                                                    <AutoComplete.Option
                                                        value={option.id.toString()}
                                                    >
                                                        <List.Item style={{ padding: 0 }}>
                                                            <List.Item.Meta
                                                                avatar={(option.image ?
                                                                    <Avatar src={makeFileURL(option.image)}/> : (
                                                                        <Avatar style={{ backgroundColor: "#87d068" }}>
                                                                            {option.user.first_name ? option.user.first_name.charAt(0) :
                                                                                <Icon type="user"/>}
                                                                        </Avatar>
                                                                    ))}
                                                                title={`${option.user.first_name} (ID:${option.custom_id ? option.custom_id : option.user.id})`}
                                                                description={that.props.activePracticePermissions.PatientPhoneNumber ? option.user.mobile : hideMobile(option.user.mobile)}
                                                            />

                                                        </List.Item>
                                                    </AutoComplete.Option>
                                                ))}
                                            </AutoComplete>
                                        )}
                                    </FormItem>
                                    <FormItem key="patient_mobile" label="Mobile Number" {...formItemLayout}>
                                        {getFieldDecorator("patient_mobile", {
                                            initialValue: this.state.appointment ? this.state.appointment.patient.user.mobile : null,
                                            rules: [{ required: true, message: REQUIRED_FIELD_MESSAGE }]
                                        })(
                                            <Input placeholder="Mobile Number"/>
                                        )}
                                    </FormItem>
                                    <FormItem key="patient_email" label="Email Address" {...formItemLayout}>
                                        {getFieldDecorator("patient_email", {
                                            initialValue: this.state.appointment ? this.state.appointment.patient.user.email : null,
                                            rules: [{ type: "email", message: "The input is not valid E-mail!" }]
                                        })(
                                            <Input placeholder="Email Address"/>
                                        )}
                                    </FormItem>

                                </div>
                            )}

                        <FormItem key="doctor" {...formItemLayout} label="Doctor">
                            {getFieldDecorator("doctor", { initialValue: this.state.appointment ? this.state.appointment.doctor : this.state.selectedDoctor }, {
                                rules: [{ required: true, message: REQUIRED_FIELD_MESSAGE }]
                            })(
                                <Select
                                    optionFilterProp="children"
                                    showSearch
                                    placeholder="Doctor"
                                    onChange={(value) => this.setBlockedTiming("doctor", value)}
                                >
                                    {this.state.practice_doctors.map((option) => (
                                        <Select.Option
                                            value={option.id}
                                        >{(`${option.user.first_name}(${option.user.email})`)}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                            {this.state.doctorBlock ? (
                                <Alert
                                    message="Selected time is blocked for selected doctor in this clinic!!"
                                    type="warning"
                                    showIcon
                                />
                            ) : null}
                            {this.state.doctorOutsideAvailableTiming ? (
                                <Alert
                                    message="Selected time is out of doctor's visit time in this clinic!!"
                                    type="warning"
                                    showIcon
                                />
                            ) : null}
                            {this.state.appointmentList && this.state.appointmentList.length > 0 ? (
                                <>
                                    <Alert
                                        message="Selected time doctor's busy on other patients in  this clinic!!"
                                        type="warning"
                                        showIcon
                                    />
                                </>
                            ) : null}
                        </FormItem>
                        <FormItem key="category" {...formItemLayout} label="Category">
                            {getFieldDecorator("category", {
                                initialValue: this.state.appointment ? this.state.appointment.category : null,
                                rules: [{ required: true, message: REQUIRED_FIELD_MESSAGE }]
                            })(
                                <Select placeholder="Category" optionFilterProp="children" showSearch>
                                    {categoryOptions.map((option) => (
                                        <Select.Option
                                            value={option.value}
                                        >{option.label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                        {/* <FormItem key="procedure" {...formItemLayout} label="Procedures Planned">
                        {getFieldDecorator("procedure", {initialValue: this.state.appointment ? this.state.appointment.procedure_data.treatment_plans.id :null}, {
                            rules: [{required: true, message: REQUIRED_FIELD_MESSAGE}],
                        })(
                            <Select placeholder="Procedures Planned" mode={"multiple"}>
                                {this.state.procedure_category && this.state.procedure_category.map((drug) =>
                                    <Select.Option
                                        value={drug.id}>{drug.name}</Select.Option>
                                )}
                            </Select>
                        )}
                    </FormItem> */}
                        {this.state.appointment ? (
                            <FormItem key="status" {...formItemLayout} label="Status">
                                {getFieldDecorator("status", {
                                    initialValue: this.state.appointment_status ? this.state.appointment_status : this.state.appointment.status,
                                    rules: [{ required: true, message: REQUIRED_FIELD_MESSAGE }]
                                })
                                (
                                    <Select
                                        placeholder="Status"
                                        onChange={(e) => this.setClassState("appointment_status", e)}
                                    >
                                        {APPOINTMENT_STATUS.map((option) => (
                                            <Select.Option
                                                value={option.value}
                                            >{option.label}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
                            </FormItem>
                        ) : null}
                        {this.state.appointment && this.state.appointment_status == CANCELLED_STATUS ? (
                            <FormItem key="cancel_by" {...formItemLayout} label="Cancellation Reason">
                                {getFieldDecorator("cancel_by", {
                                    initialValue: this.state.appointment.cancel_by,
                                    rules: [{ required: true, message: REQUIRED_FIELD_MESSAGE }]
                                })
                                (
                                    <Select
                                        placeholder="Cancellation Reason"
                                        onChange={(e) => this.setClassState("appointment_cancel_reason", e)}
                                    >
                                        {APPOINTMENT_CANCEL_REASON.map((option) => (
                                            <Select.Option
                                                value={option.value}
                                            >{option.label}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
                            </FormItem>
                        ) : null}
                        {this.state.appointment && this.state.appointment_status == CANCELLED_STATUS && this.state.appointment_cancel_reason == "OTHERS" ? (
                            <FormItem key="cancel_reason" {...formItemLayout} label="Other Cancellation Reason">
                                {getFieldDecorator("cancel_reason", {
                                    initialValue: this.state.appointment.cancel_reason,
                                    rules: [{ required: true, message: REQUIRED_FIELD_MESSAGE }]
                                })
                                (
                                    <Input placeholder="Reason"/>
                                )}
                            </FormItem>
                        ) : null}

                        <FormItem key="notes" {...formItemLayout} label="Notes">
                            {getFieldDecorator("notes", { initialValue: this.state.appointment ? this.state.appointment.notes : null }, {
                                rules: [{ required: true, message: REQUIRED_FIELD_MESSAGE }]
                            })(
                                <Input placeholder="Notes"/>
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout}>
                            <Button loading={that.state.saving} type="primary" htmlType="submit" style={{ margin: 5 }}>
                                Submit
                            </Button>
                            {that.props.history ? (
                                <Button style={{ margin: 5 }} onClick={() => that.props.history.goBack()}>
                                    Cancel
                                </Button>
                            ) : null}
                        </FormItem>
                    </Form>
                </Spin>
            </Card>
        );
    }
}
