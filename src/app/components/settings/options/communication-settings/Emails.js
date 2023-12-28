import React from "react";
import {Form, Row, Col, Button} from "antd";
import moment from "moment/moment";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {
    DIVIDER_FIELD,
    SUCCESS_MSG_TYPE,
    SINGLE_CHECKBOX_FIELD, TIME_PICKER, MAIL_TEMPLATE_FIELD, INPUT_FIELD, SINGLE_IMAGE_UPLOAD_FIELD, FRAME_VIEW
} from "../../../../constants/dataKeys";
import {EMAIL_COMMUNICATONS_API, EMAIL_FRAME_URL, PRINT_PREVIEW_RENDER} from "../../../../constants/api"
import {getAPI, displayMessage, interpolate, makeURL, makeFileURL} from "../../../../utils/common";
import {APPOINTMENT_CONFIRMATION_SMS_TAG_OPTIONS} from "../../../../constants/hardData";
import {BACKEND_BASE_URL} from "../../../../config/connect";


class Emails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data:{}
        };
        this.loadData = this.loadData.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                data: data[0],
            })
        };
        const errorFn = function () {
        };
        getAPI(interpolate(EMAIL_COMMUNICATONS_API, [this.props.active_practiceId]), successFn, errorFn);
    }

    loadPDF = (path) => {
        const that = this;
        const successFn = function (data) {
            if (data.report)
                window.open(BACKEND_BASE_URL + data.report);
        }
        const errorFn = function () {

        }
        getAPI(path, successFn, errorFn);
    }

    render() {
        const that = this;

        const fields = [{
            label: "Contact Number",
            key: "contact_number",
            placeholder: "Contact Number",
            initialValue: this.state.data ? this.state.data.contact_number : ' ',
            extra: "Maximum 15 characters & represented as {{CLINICCONTACTNUMBER}}",
            type: INPUT_FIELD
        }, {
            label: "Email",
            key: "email",
            placeholder: "Email Address",
            initialValue: this.state.data ? this.state.data.email : ' ',
            extra: "All replies by Patients for emails will be sent to this address",
            type: INPUT_FIELD
        }, {
            label: "SMS clinic Name",
            key: "email_clinic_name",
            placeholder: "Clinic Name",
            initialValue: this.state.data ? this.state.data.email_clinic_name : ' ',
            extra: "{{CLINIC}} will use this name.",
            type: INPUT_FIELD,
        }, {
            label: 'Clinic Logo',
            key: 'clinic_logo',
            initialValue: this.state.data ? this.state.data.clinic_logo : ' ',
            type: SINGLE_IMAGE_UPLOAD_FIELD
        }, {
            key: "appointment_confirmation_email",
            initialValue: this.state.data ? this.state.data.appointment_confirmation_email : false,
            type: SINGLE_CHECKBOX_FIELD,
            follow: <b>APPOINTMENT CONFIRMATION EMAIL</b>,
            options: [],
            extra: "Email is sent to the Patient on successfully adding an appointment"
        }, {
            key: "appointment_confirmation_email_text",
            initialValue: this.state.data ? this.state.data.appointment_confirmation_email_text : '',
            type: FRAME_VIEW,
            iframe_url: makeURL(interpolate(EMAIL_FRAME_URL, ["APPOINTMENT", "CREATE", that.props.active_practiceId, makeFileURL(that.state.data.clinic_logo)])),
            iframe: true
        }, {
            type: DIVIDER_FIELD
        }, {
            key: "appointment_cancellation_email",
            initialValue: this.state.data ? this.state.data.appointment_cancellation_email : false,
            type: SINGLE_CHECKBOX_FIELD,
            follow: <b>APPOINTMENT CANCELLATION EMAIL</b>,
            extra: "Email is sent to the Patient when the appointment is cancelled"
        }, {
            key: "appointment_cancellation_email_text",
            initialValue: this.state.data ? this.state.data.appointment_cancellation_email_text : '',
            type: FRAME_VIEW,
            iframe_url: makeURL(interpolate(EMAIL_FRAME_URL, ["APPOINTMENT", "CANCEL", that.props.active_practiceId, makeFileURL(that.state.data.clinic_logo)])),
            iframe: true
        }, {
            type: DIVIDER_FIELD
        }, {
            key: "appointment_reminder_email",
            initialValue: this.state.data ? this.state.data.appointment_reminder_email : false,
            type: SINGLE_CHECKBOX_FIELD,
            follow: <b>APPOINTMENT REMINDER EMAIL</b>,
            extra: "Email is sent to the Patient on the morning of the appointment date"
        }, {
            key: "send_on_day_of_appointment",
            initialValue: this.state.data ? this.state.data.send_on_day_of_appointment : false,
            type: SINGLE_CHECKBOX_FIELD,
            follow: "Send reminder SMS on the day of appointment at 7:30 AM",
        }, {
            key: "send_before_day_of_appointment",
            initialValue: this.state.data ? this.state.data.send_before_day_of_appointment : false,
            follow: "Send reminder SMS on the day before the appointment at 12:00 PM",
            type: SINGLE_CHECKBOX_FIELD,
        },
            //     {
            //     key: "appointment_cancellation_email_text",
            //     initialValue: this.state.data ? this.state.data.appointment_cancellation_email_text : '',
            //     type: MAIL_TEMPLATE_FIELD,
            //     options: APPOINTMENT_CONFIRMATION_SMS_TAG_OPTIONS,
            // },
            {
                type: DIVIDER_FIELD
            }, {
                key: "followup_reminder_email",
                initialValue: this.state.data ? this.state.data.followup_reminder_email : false,
                type: SINGLE_CHECKBOX_FIELD,
                follow: <b>FOLLOW-UP REMINDER EMAIL</b>,
                extra: "Email is sent to the Patient on the morning of their planned follow-up date",
        }, {
            key: "appointment_reminder_email_text",
            initialValue: this.state.data ? this.state.data.appointment_reminder_email_text : '',
            type: FRAME_VIEW,
            iframe_url: makeURL(interpolate(EMAIL_FRAME_URL, ["APPOINTMENT", "FOLLOWUP", that.props.active_practiceId, makeFileURL(that.state.data.clinic_logo)])),
            iframe: true
        }, {
            type: DIVIDER_FIELD
        }, {
            key: "birthday_wish_email",
            initialValue: this.state.data ? this.state.data.birthday_wish_email : false,
            type: SINGLE_CHECKBOX_FIELD,
            follow: <b>BIRTHDAY WISH EMAIL</b>,
            extra: "Email is sent to the Patient on the morning of their birthday"
        }, {
            key: "birthday_wish_email_text",
            initialValue: this.state.data ? this.state.data.birthday_wish_email_text : '',
            type: FRAME_VIEW,
            iframe_url: makeURL(interpolate(EMAIL_FRAME_URL, ["GREETING", "BIRTHDAY", that.props.active_practiceId, makeFileURL(that.state.data.clinic_logo)])),
            iframe: true
        }, {
            type: DIVIDER_FIELD
        }, {
            key: "anniversary_wish_email",
            initialValue: this.state.data ? this.state.data.anniversary_wish_email : false,
            type: SINGLE_CHECKBOX_FIELD,
            follow: <b>ANNIVERSARY WISH EMAIL</b>,
            extra: "Email is sent to the Patient on the morning of their anniversary"
        }, {
            key: "anniversary_wish_email_text",
            initialValue: this.state.data ? this.state.data.anniversary_wish_email_text : '',
            type: FRAME_VIEW,
            iframe_url: makeURL(interpolate(EMAIL_FRAME_URL, ["GREETING", "ANNIVERSARY", that.props.active_practiceId, makeFileURL(that.state.data.clinic_logo)])),
            iframe: true
        }];

        const formProp = {
            successFn(data) {
                displayMessage(SUCCESS_MSG_TYPE, "Communication Settings Saved Successfully!!");
                console.log("form", data);
            },
            errorFn() {

            },
            action: interpolate(EMAIL_COMMUNICATONS_API, [that.props.active_practiceId]),
            method: "post",
        };

        const defaultValues = [{"key": "practice", "value": this.props.active_practiceId, "is_active": false}, {
            "key": "id",
            "value": this.state.data ? this.state.data.id : null,
        }];

        const TestFormLayout = Form.create()(DynamicFieldsForm);
        return (
            <div>
                <TestFormLayout
                    formProp={formProp}
                    defaultValues={defaultValues}
                    fields={fields}
                    {...this.props}
                />
            </div>
        )
    }
}

export default Emails;
