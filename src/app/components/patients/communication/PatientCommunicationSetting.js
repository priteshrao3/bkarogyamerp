import React from "react";
import {Button, List, DatePicker, Card, Form, Icon, Row, Table, Divider, Col, Radio} from "antd";
import {Link} from "react-router-dom";
import moment from "moment";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";
import {SINGLE_CHECKBOX_FIELD, SUCCESS_MSG_TYPE} from "../../../constants/dataKeys";
import {getAPI, displayMessage, interpolate, putAPI} from "../../../utils/common";
import {PATIENT_COMMUNICATION_HISTORY_API, PATIENT_PROFILE} from "../../../constants/api";
import {SMS_ENABLE, BIRTHDAY_SMS_ENABLE, EMAIL_ENABLE} from "../../../constants/hardData";
import CustomizedTable from "../../common/CustomizedTable";

class PatientCommunicationSetting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            parient_communication_history: null,
            patientProfile: null,
            saving: false
        };

        this.loadCommunication = this.loadCommunication.bind(this);
        this.loadProfile = this.loadProfile.bind(this);
    }

    componentDidMount() {
        if (this.props.currentPatient) {
            this.loadCommunication();
            this.loadProfile();
        }
    }

    loadProfile() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                patientProfile: data,
                loading: false
            });
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        getAPI(interpolate(PATIENT_PROFILE, [that.props.match.params.id]), successFn, errorFn);
    }

    loadCommunication() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                parient_communication_history: data.user_sms,
                loading: false
            })
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })
        }
        getAPI(interpolate(PATIENT_COMMUNICATION_HISTORY_API, [this.props.currentPatient.user.id]), successFn, errorFn)
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    onChanged = (name, value) => {
        this.setState({
            [name]: value,
        });
    }

    handleSubmit = (e) => {
        const that = this;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const reqData = {
                    ...values,
                    medicine_from: values.medicine_from != null ? moment(values.medicine_from).format('YYYY-MM-DD') : null,
                    medicine_till: values.medicine_till != null ? moment(values.medicine_till).format('YYYY-MM-DD') : null,
                    follow_up_date: moment(values.follow_up_date).format('YYYY-MM-DD'),
                };
                that.setState({
                    saving: true
                });
                const successFn = function (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "Communication Settings Saved Successfully!!");
                    that.setState({
                        saving: false
                    });
                }
                const errorFn = function () {
                    that.setState({
                        saving: false
                    });
                }
                putAPI(interpolate(PATIENT_PROFILE, [this.props.currentPatient.id]), reqData, successFn, errorFn);
            }
        });
    }


    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 8},
                sm: {span: 8},
                md: {span: 8},
                lg: {span: 8},
            },
            wrapperCol: {
                xs: {span: 16},
                sm: {span: 16},
                md: {span: 16},
                lg: {span: 16},
            },
        };


        const columns = [{
            title: 'SENT TIME',
            dataIndex: 'created_at',
            key: 'created_at',
            render: created_at => <span>{moment(created_at).format('LLL')}</span>,
        }, {
            title: 'MESSAGE',
            dataIndex: 'body',
            key: 'body',
        }, {
            title: 'TYPE',
            dataIndex: 'sms_type',
            key: 'sms_type',
        }, {
            title: 'MESSAGE STATUS',
            dataIndex: 'status',
            key: 'status',
        }];


        const sms_enabled = SMS_ENABLE.map((isSMS) => <Radio value={isSMS.value}>{isSMS.title}</Radio>)
        const email_enabled = EMAIL_ENABLE.map((isEmail) => <Radio value={isEmail.value}>{isEmail.title}</Radio>)
        const bithday_sms_enabled = BIRTHDAY_SMS_ENABLE.map((isBirth_SMS) => (
            <Radio
              value={isBirth_SMS.value}
            >{isBirth_SMS.title}
            </Radio>
        ));
        return (
            <Form onSubmit={this.handleSubmit}>
                <Card
                  title={this.props.currentPatient ? `${this.props.currentPatient.user.first_name} Communication` : "Patient Communication"}
                  extra={(
                        <Button type="primary" htmlType="submit" loading={this.state.saving}>
                            <Icon type="save" /> Save Communication Setting
                        </Button>
                    )}
                >

                    <Form.Item {...formItemLayout} key="sms_enable"> <label>
                        <span className="ant-form-text">Enable SMS the patient : </span>
                        {getFieldDecorator('sms_enable', {initialValue: this.state.patientProfile ? this.state.patientProfile.sms_enable : false})
                        (
                            <Radio.Group onChange={(e) => this.onChanged('sms_enable', e.target.value)}>
                                {sms_enabled}
                            </Radio.Group>
                        )}
                                                                     </label>
                    </Form.Item>

                    <Form.Item {...formItemLayout} key="email_enable"> <label> <span
                      className="ant-form-text"
                    >Enable Email the patient :
                                                                               </span>
                        {getFieldDecorator('email_enable', {initialValue: this.state.patientProfile ? this.state.patientProfile.email_enable : false})
                        (
                            <Radio.Group onChange={(e) => this.onChanged('email_enable', e.target.value)}>
                                {email_enabled}
                            </Radio.Group>
                        )}
                                                                       </label>
                    </Form.Item>

                    <Form.Item {...formItemLayout} key="birthday_sms_email"> <label> <span
                      className="ant-form-text"
                    > Send Birthday wish SMS & Email :
                                                                                     </span>
                        {getFieldDecorator('birthday_sms_email', {initialValue: this.state.patientProfile ? this.state.patientProfile.birthday_sms_email : false})
                        (
                            <Radio.Group onChange={(e) => this.onChanged('birthday_sms_email', e.target.value)}>
                                {bithday_sms_enabled}
                            </Radio.Group>
                        )}
                                                                             </label>
                    </Form.Item>
                    <Form.Item {...formItemLayout} key="medicine_from"> <label>
                        <span
                            className="ant-form-text"
                        > Medicine From :
                        </span>
                        {getFieldDecorator('medicine_from', {initialValue: this.state.patientProfile && this.state.patientProfile.medicine_from ? moment(this.state.patientProfile.medicine_from) : null})
                        (<DatePicker allowClear={false} format="DD-MM-YYYY" />
                        )}
                    </label>
                    </Form.Item>
                    <Form.Item {...formItemLayout} key="medicine_till"> <label>
                        <span
                          className="ant-form-text"
                        > Medicine Till Date :
                        </span>
                        {getFieldDecorator('medicine_till', {initialValue: this.state.patientProfile && this.state.patientProfile.medicine_till ? moment(this.state.patientProfile.medicine_till) : null})
                        (<DatePicker allowClear={false} format="DD-MM-YYYY" />
                        )}
                                                                        </label>
                    </Form.Item>

                    <Form.Item {...formItemLayout} key="follow_up_date"> <label>
                        <span
                          className="ant-form-text"
                        > Next follow-up To :
                        </span>
                        {getFieldDecorator('follow_up_date', {initialValue: this.state.patientProfile && this.state.patientProfile.follow_up_date ? moment(this.state.patientProfile.follow_up_date) : null})
                        (<DatePicker allowClear={false} format="DD-MM-YYYY" />
                        )}
                                                                        </label>
                    </Form.Item>


                    <div>
                        <Divider dashed />
                        <h2>Past Communication</h2>
                        <CustomizedTable
                          loading={this.state.loading}
                          columns={columns}
                          dataSource={this.state.parient_communication_history}
                        />
                    </div>
                </Card>
            </Form>
        );

    }
}

export default Form.create()(PatientCommunicationSetting);
