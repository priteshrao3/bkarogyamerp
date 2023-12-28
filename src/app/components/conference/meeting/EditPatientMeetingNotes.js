import {Alert, Button, Form, Input, Select, Spin} from "antd";
import React from "react";
import {displayMessage, getAPI, interpolate, postAPI} from "../../../utils/common";
import {MEETINGS, PATIENT_CALL_NOTES, SINGLE_MEETING} from "../../../constants/api";
import {loadConfigParameters} from "../../../utils/clinicUtils";
import {CALL_NOTES_RESPONSE_CONFIG_PARAMS, CALL_NOTES_TYPE_CONFIG_PARAMS} from "../../../constants/hardData";
import {SUCCESS_MSG_TYPE} from "../../../constants/dataKeys";

class EditPatientCallNotes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            meeting: {},
            [CALL_NOTES_TYPE_CONFIG_PARAMS]: [],
            [CALL_NOTES_RESPONSE_CONFIG_PARAMS]: [],
            patientMeetingResponse: {},
            formLoading: false
        }
    }

    componentDidMount() {
        if (this.props.meetingId) {
            this.loadMeetingDetails();
        }
        loadConfigParameters(this, [CALL_NOTES_TYPE_CONFIG_PARAMS, CALL_NOTES_RESPONSE_CONFIG_PARAMS])
    }

    loadPreviousMeetingResponse = (patient) => {
        const that = this;
        that.setState({
            formLoading: true
        })
        const successFn = function (data) {
            if (data.length)
                that.setState({
                    formLoading: false,
                    patientMeetingResponse: data[0]
                });
            else
                that.setState({
                    formLoading: false,
                    patientMeetingResponse: {}
                })
        }
        const errorFn = function () {
            that.setState({
                formLoading: false,
            })
        }
        const params = {
            patient,
            meeting: that.props.meetingId
        }
        getAPI(PATIENT_CALL_NOTES, successFn, errorFn, params);
    }

    loadMeetingDetails = () => {
        const that = this;
        that.setState({
            loading: true
        })
        const successFn = function (data) {
            that.setState({
                loading: false,
                meeting: data
            })


        }
        const errorFn = function () {
            that.setState({
                loading: false,
                meeting: {}
            })
        }
        getAPI(interpolate(SINGLE_MEETING, [that.props.meetingId]), successFn, errorFn);
    }

    handleSubmit = (e) => {
        const that = this;
        that.setState({
            formLoading: true
        });
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            const reqData = {...values};
            reqData.meeting = that.props.meetingId;
            reqData.practice = that.props.active_practiceId;
            reqData.practce_staff = that.props.user.staff.id;
            console.log(reqData);
            const successFn = function (data) {
                displayMessage(SUCCESS_MSG_TYPE, "Patient Call Entered Successfully!!");
                that.setState({
                    formLoading: false
                });
                if (that.props.loadData)
                    that.props.loadData()
            };
            const errorFn = function () {
                that.setState({
                    formLoading: false
                });
            };
            postAPI(PATIENT_CALL_NOTES, reqData, successFn, errorFn);
        });
    }

    render() {
        const that = this;
        const {getFieldDecorator, getFieldValue,} = this.props.form;
        const {patientMeetingResponse, meeting, formLoading} = this.state;
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        };
        return (
            <Spin spinning={formLoading}>
                <Form title="Edit Patient Call Notes for Meeting" onSubmit={this.handleSubmit}>
                    <Form.Item label="Patient" {...formItemLayout} key="patient">
                        {getFieldDecorator('patient', {initialValue: []})
                        (<Select
                          placeholder="Select Patient"
                          style={{width: '100%'}}
                          onChange={(value) => this.loadPreviousMeetingResponse(value)}
                        >
                            {meeting.patients && meeting.patients_data.map(option => (
                                <Select.Option
                                  value={option.id}
                                >
                                    {option.user.first_name}
                                </Select.Option>
                            ))}
                         </Select>)}
                    </Form.Item>

                    <Form.Item label="Call Type" {...formItemLayout} key="type">
                        {getFieldDecorator('type', {initialValue: null})
                        (<Select
                          placeholder="Select Call Type"
                          style={{width: '100%'}}
                        >

                            {this.state[CALL_NOTES_TYPE_CONFIG_PARAMS] && this.state[CALL_NOTES_TYPE_CONFIG_PARAMS].map(option => (
                                <Select.Option
                                  value={option}
                                >
                                    {option}
                                </Select.Option>
                            ))}
                         </Select>)}
                    </Form.Item>
                    <Form.Item label="Call Status" {...formItemLayout} key="response">
                        {getFieldDecorator('response', {initialValue: null})
                        (<Select
                          placeholder="Select Status Type"
                          style={{width: '100%'}}
                        >
                            {this.state[CALL_NOTES_RESPONSE_CONFIG_PARAMS] && this.state[CALL_NOTES_RESPONSE_CONFIG_PARAMS].map(option => (
                                <Select.Option
                                  value={option}
                                >
                                    {option}
                                </Select.Option>
                            ))}
                         </Select>)}
                    </Form.Item>
                    {patientMeetingResponse.remarks ? (
                        <Alert message={(
                            <><h4>Last Remark for this meeting</h4>
                                <p>{patientMeetingResponse.remarks}</p>
                            </>
                        )}
                        />
                    ) : null}
                    <Form.Item label="Call Note" {...formItemLayout} key="remarks">
                        {getFieldDecorator('remarks', {initialValue: ''})
                        (<Input.TextArea rows={5} />)}
                    </Form.Item>
                    <Form.Item {...formItemLayout}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          style={{margin: 5}}
                          loading={this.state.formLoading}
                        >
                            Submit
                        </Button>
                        {that.props.history ? (
                            <Button style={{margin: 5}} onClick={() => that.props.history.goBack()}>
                                Cancel
                            </Button>
                        ) : null}
                    </Form.Item>
                </Form>
            </Spin>
        )
    }
}

export default Form.create()(EditPatientCallNotes);
