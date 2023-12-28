import React from "react";
import {Col, Form, Row, Select} from "antd";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {SMS_FIELD, SUCCESS_MSG_TYPE, SINGLE_CHECKBOX_FIELD} from "../../../../constants/dataKeys";
import {
    APPOINTMENT_CONFIRMATION_SMS_TAG_OPTIONS,
    SMS_LANGUAGE_CONFIG_PARAM,
    SMS_TEXT, WISH_SMS_TEMPLATE
} from "../../../../constants/hardData";
import {displayMessage, interpolate, getAPI} from "../../../../utils/common";
import {COMMUNICATONS_API} from "../../../../constants/api";
import {loadConfigParameters} from "../../../../utils/clinicUtils";


class WishSMS extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            language: this.props.activePracticeData && this.props.activePracticeData.language ? this.props.activePracticeData.language : '',
            [SMS_LANGUAGE_CONFIG_PARAM]: [],
            [WISH_SMS_TEMPLATE]: {}
        }
        this.loadWishSMS = this.loadWishSMS.bind(this);
    }

    componentDidMount() {
        this.loadWishSMS();
        loadConfigParameters(this, [SMS_LANGUAGE_CONFIG_PARAM, WISH_SMS_TEMPLATE]);
    }

    loadWishSMS() {
        const reqData = {};
        const that = this;
        const successFn = function (data) {
            that.setState({
                wishsmsData: data
            })
        }
        const errorFn = function () {

        }
        if (that.state.language) {
            reqData.language = that.state.language;
        }
        getAPI(interpolate(COMMUNICATONS_API, [this.props.active_practiceId]), successFn, errorFn);
    }

    handleChangeLanguage = (type, value) => {
        const that = this;
        that.setState({
            [type]: value,
        }, function () {
            that.loadWishSMS();
        })
    };

    render() {
        const that = this;
        const fields = [{
            key: "birthday_wish_sms",
            initialValue: this.state.wishsmsData ? this.state.wishsmsData.birthday_wish_sms : false,
            type: SINGLE_CHECKBOX_FIELD,
            extra: "This SMS is sent to the Patient on the morning of their birthday",
            follow: <b>BIRTHDAY WISH SMS</b>
        }, {
            key: "birthday_wish_text",
            initialValue: that.state[WISH_SMS_TEMPLATE][that.state.language] ? that.state[WISH_SMS_TEMPLATE][that.state.language].BIRTHDAY : '',
            minRows: 4,
            type: SMS_FIELD,
            disabled: true,
            options: APPOINTMENT_CONFIRMATION_SMS_TAG_OPTIONS,

        }, {
            key: "anniversary_wish_sms",
            initialValue: this.state.wishsmsData ? this.state.wishsmsData.anniversary_wish_sms : false,
            type: SINGLE_CHECKBOX_FIELD,
            extra: "This SMS is sent to the Patient on the morning of their anniversary",
            follow: <b>ANNIVERSARY WISH SMS</b>
        }, {
            key: "anniversary_wish_text",
            initialValue: that.state[WISH_SMS_TEMPLATE][that.state.language] ? that.state[WISH_SMS_TEMPLATE][that.state.language].ANNIVERSARY : '',
            minRows: 4,
            type: SMS_FIELD,
            disabled: true,
            options: APPOINTMENT_CONFIRMATION_SMS_TAG_OPTIONS
        }];
        const formProp = {
            successFn(data) {
                displayMessage(SUCCESS_MSG_TYPE, "Updated Successfully!!");
            },
            errorFn() {

            },
            action: interpolate(COMMUNICATONS_API, [that.props.active_practiceId]),
            method: "post",
        };
        const defaultValues = [{"key": "practice", "value": this.props.active_practiceId},
            {"key": "id", "value": this.state.wishsmsData ? this.state.wishsmsData.id : null,}
        ];

        const TestFormLayout = Form.create()(DynamicFieldsForm);
        return (
            <div>
                <Row>
                    <Col span={8}>
                        <span style={{float: 'right', color: 'rgba(0, 0, 0, 0.85)'}}>SMS Language : &nbsp;</span>
                    </Col>
                    <Col span={8}>
                        <Select
                            defaultValue={this.state.data && this.state.data.sms_language ? this.state.data.sms_language : that.state.language}
                            style={{width: 220}}
                            onChange={(value) => this.handleChangeLanguage('language', value)}
                        >
                            {this.state[SMS_LANGUAGE_CONFIG_PARAM].map((option) => (
                                <Select.Option value={option}>
                                    {option}
                                </Select.Option>
                            ))}
                        </Select>
                        <br/>
                        <span>SMS to Patients will be sent in this language</span>
                    </Col>

                </Row>
                <TestFormLayout
                    formProp={formProp}
                    defaultValues={defaultValues}
                    fields={fields}
                />
            </div>
        )
    }
}

export default WishSMS;
