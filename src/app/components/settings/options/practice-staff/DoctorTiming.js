import React from "react";
import {Form, Card, Divider, Checkbox, Row, Col, TimePicker, Button} from "antd";
import {Redirect} from "react-router-dom";
import moment from "moment/moment";
import {REQUIRED_FIELD_MESSAGE} from "../../../../constants/messages";
import {displayMessage, getAPI, interpolate, postAPI} from "../../../../utils/common";
import {CALENDER_SETTINGS, DOCTOR_VISIT_TIMING_API} from "../../../../constants/api";
import {SUCCESS_MSG_TYPE, WARNING_MSG_TYPE} from "../../../../constants/dataKeys";
import {DAY_KEYS} from "../../../../constants/hardData";

class DoctorTiming extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            doctorId: this.props.match.params.docId,
            timings: null,
            openPracticeDays: {},
            visting_hour_same_week: true,
            twoSessions: {},
            loading:true,
        }

    }

    componentDidMount() {
        if (this.state.doctorId) {
            this.loadData();
        }
    }

    loadData = () => {
        const that = this;
        const successFn = function (data) {
            let visting_hour_same_week = true;
            const openPracticeDays = {};
            const twoSessions = {};
            if (data.length && data[0]) {
                const dataObject = data[0]
                DAY_KEYS.forEach(function (dayKey) {
                    openPracticeDays[dayKey] = dataObject[dayKey];
                    twoSessions[`is_two_sessions_${dayKey}`] = dataObject[`is_two_sessions_${dayKey}`];
                });
                visting_hour_same_week = dataObject.visting_hour_same_week;
                twoSessions.is_two_sessions = dataObject.is_two_sessions;
            }
            if (data.length) {
                that.setState({
                    timings: data[0],
                    visting_hour_same_week,
                    openPracticeDays,
                    twoSessions,
                    loading:false,
                })
            } else {
                that.setState({
                    timings: {},
                    visting_hour_same_week,
                    openPracticeDays,
                    twoSessions,
                    loading:false,
                })
                displayMessage(WARNING_MSG_TYPE, "Doctors visit timing is empty");
            }
        }
        const errorFn = function () {

        }
        getAPI(interpolate(DOCTOR_VISIT_TIMING_API, [this.props.active_practiceId]), successFn, errorFn, {
            doctor: this.state.doctorId
        });
    }

    handleSubmit = (e) => {
        const that = this;
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    console.log(values);
                    const reqData = {...values};
                    if (reqData.first_start_time) {
                        reqData.first_start_time = moment(reqData.first_start_time).format('HH:mm');
                    }
                    if (reqData.first_end_time) {
                        reqData.first_end_time = moment(reqData.first_end_time).format('HH:mm');
                    }
                    if (reqData.second_start_time) {
                        reqData.second_start_time = moment(reqData.second_start_time).format('HH:mm');
                    }
                    if (reqData.second_end_time) {
                        reqData.second_end_time = moment(reqData.second_end_time).format('HH:mm');
                    }
                    reqData.doctor = that.state.doctorId;
                    DAY_KEYS.forEach(function (dayKey) {
                        if (reqData[`first_start_time_${dayKey}`]) {
                            reqData[`first_start_time_${dayKey}`] = moment(reqData[`first_start_time_${dayKey}`]).format('HH:mm');
                        }
                        if (reqData[`first_end_time_${dayKey}`]) {
                            reqData[`first_end_time_${dayKey}`] = moment(reqData[`first_end_time_${dayKey}`]).format('HH:mm');
                        }
                        if (reqData[`second_start_time_${dayKey}`]) {
                            reqData[`second_start_time_${dayKey}`] = moment(reqData[`second_start_time_${dayKey}`]).format('HH:mm');
                        }
                        if (reqData[`second_end_time_${dayKey}`]) {
                            reqData[`second_end_time_${dayKey}`] = moment(reqData[`second_end_time_${dayKey}`]).format('HH:mm');
                        }
                    });
                    if (that.state.timings) {
                        reqData.id = that.state.timings.id
                    }
                    const successFn = function (data) {
                        that.setState({
                            loading:true,
                        });
                        that.props.history.goBack();
                        if (that.props.loadData)
                            that.props.loadData();
                        displayMessage(SUCCESS_MSG_TYPE, "Doctor Timings Saved successfully!!");
                    };
                    const errorFn = function () {

                    };
                    postAPI(interpolate(DOCTOR_VISIT_TIMING_API, [this.props.active_practiceId]), reqData, successFn, errorFn);
                }
            }
        )
    }

    changeVistingHourSameWeek = (e) => {
        console.log(e.target)
        this.setState({
            [e.target.id]: e.target.checked
        })
    }

    changeOpenPracticeDays = (type, value) => {
        this.setState(function (prevState) {
            return {openPracticeDays: {...prevState.openPracticeDays, [type]: value}}
        })
    }

    changePracticeTwoSessions = (type, value) => {
        this.setState(function (prevState) {
            return {twoSessions: {...prevState.twoSessions, [type]: value}}
        })
    }

    render() {
        if (!this.state.doctorId) {
            return <Redirect to="/erp/settings/clinics-staff" />
        } if (!this.state.timings) {
            return <Card loading />
        } 

            const that = this;
            const formItemLayout = (this.props.formLayout ? this.props.formLayout : {
                labelCol: {span: 12},
                wrapperCol: {span: 12},
            });
            const {getFieldDecorator} = this.props.form;
            return (
<div>
                <Card loading={this.state.loading}>
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Item key="visting_hour_same_week" {...formItemLayout}>
                            {getFieldDecorator("visting_hour_same_week", {
                                valuePropName: 'checked',
                                initialValue: that.state.timings ? that.state.visting_hour_same_week : false
                            }, {
                                rules: [{message: REQUIRED_FIELD_MESSAGE}],
                            })(
                                <Checkbox onChange={this.changeVistingHourSameWeek}>
                                    Visiting hours are  same for all working days in a week
                                </Checkbox>
                            )}
                        </Form.Item>
                        <Divider style={{margin: 4}} />
                        {this.state.visting_hour_same_week ? (
                            <div>
                                <Row>
                                    <Col span={4}/>
                                    <Col span={18}>
                                        <Form.Item key="is_two_sessions" {...formItemLayout}>
                                            {getFieldDecorator("is_two_sessions", {
                                                valuePropName: 'checked',
                                                initialValue: that.state.timings ? that.state.timings.is_two_sessions || that.state.twoSessions.is_two_sessions : false
                                            }, {
                                                rules: [{message: REQUIRED_FIELD_MESSAGE}],
                                            })(
                                                <Checkbox
                                                  onChange={(e) => this.changePracticeTwoSessions("is_two_sessions", e.target.checked)}
                                                >
                                                    Practice operates in two sessions.
                                                </Checkbox>
                                            )}
                                        </Form.Item>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item
                                                  key="first_start_time"
                                                  label="Practice Starts At"
                                                  {...formItemLayout}
                                                >
                                                    {getFieldDecorator("first_start_time", {
                                                        initialValue: that.state.timings && that.state.timings.first_start_time ? moment(that.state.timings.first_start_time, "HH:mm") : null,
                                                        rules: [{required: true, message: REQUIRED_FIELD_MESSAGE}],
                                                    })(
                                                        <TimePicker format="HH:mm" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            {that.state.twoSessions.is_two_sessions ? (
<div>
                                                <Col span={12}>
                                                    <Form.Item
                                                      key="first_end_time"
                                                      label="Lunch At"
                                                      {...formItemLayout}
                                                    >
                                                        {getFieldDecorator("first_end_time", {
                                                            initialValue: that.state.timings && that.state.timings.first_end_time ? moment(that.state.timings.first_end_time, "HH:mm") : null,
                                                            rules: [{required: true, message: REQUIRED_FIELD_MESSAGE}],
                                                        })(
                                                            <TimePicker format="HH:mm" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item
                                                      key="second_start_time"
                                                      label="Resume At"
                                                      {...formItemLayout}
                                                    >
                                                        {getFieldDecorator("second_start_time", {
                                                            initialValue: that.state.timings && that.state.timings.second_start_time ? moment(that.state.timings.second_start_time, "HH:mm") : null,
                                                            rules: [{required: true, message: REQUIRED_FIELD_MESSAGE}],
                                                        })(
                                                            <TimePicker format="HH:mm" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
</div>
) : null}

                                            <Col span={12}>
                                                <Form.Item
                                                  key="second_end_time"
                                                  label="Practice Ends At"
                                                  {...formItemLayout}
                                                >
                                                    {getFieldDecorator("second_end_time", {
                                                        initialValue: that.state.timings && that.state.timings.second_end_time ? moment(that.state.timings.second_end_time, "HH:mm") : null,
                                                        rules: [{required: true, message: REQUIRED_FIELD_MESSAGE}],
                                                    })(
                                                        <TimePicker format="HH:mm" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Divider style={{margin: 4}} />
                            </div>
                          ) : DAY_KEYS.map(dayKey => (
<div key={dayKey}>
                                <Row>
                                    <Col span={4}>
                                        <h4>{dayKey.replace(/^\w/, c => c.toUpperCase())}</h4>
                                    </Col>

                                    <Col span={18}>
                                        <Form.Item key={`${dayKey}`} {...formItemLayout}>
                                            {getFieldDecorator(`${dayKey}`, {
                                                valuePropName: 'checked',
                                                initialValue: that.state.timings ? that.state.timings[`${dayKey}`] || that.state.openPracticeDays[dayKey] : false
                                            }, {
                                                rules: [{message: REQUIRED_FIELD_MESSAGE}],
                                            })(
                                                <Checkbox
                                                  onChange={(e) => that.changeOpenPracticeDays(dayKey, e.target.checked)}
                                                >
                                                    {`Practice is open on ${dayKey.replace(/^\w/, c => c.toUpperCase())}`}
                                                </Checkbox>
                                            )}
                                        </Form.Item>
                                        {that.state.openPracticeDays[dayKey] ? (
<div>
                                                <Form.Item key={`is_two_sessions_${dayKey}`} {...formItemLayout}>
                                                    {getFieldDecorator(`is_two_sessions_${dayKey}`, {
                                                        valuePropName: 'checked',
                                                        initialValue: that.state.timings ? that.state.timings[`is_two_sessions_${dayKey}`] || that.state.twoSessions[`is_two_sessions_${dayKey}`] : false
                                                    }, {
                                                        rules: [{message: REQUIRED_FIELD_MESSAGE}],
                                                    })(
                                                        <Checkbox
                                                          onChange={(e) => this.changePracticeTwoSessions(`is_two_sessions_${dayKey}`, e.target.checked)}
                                                        >
                                                            Practice operates in two sessions.
                                                        </Checkbox>
                                                    )}
                                                </Form.Item>
                                                <Row gutter={16}>
                                                    <Col span={12}>
                                                        <Form.Item
                                                          key={`first_start_time_${dayKey}`}
                                                          label="Practice Starts At"
                                                          {...formItemLayout}
                                                        >
                                                            {getFieldDecorator(`first_start_time_${dayKey}`, {
                                                                initialValue: that.state.timings && that.state.timings[`first_start_time_${dayKey}`] ? moment(that.state.timings[`first_start_time_${dayKey}`], "HH:mm") : null,
                                                                rules: [{required: true, message: REQUIRED_FIELD_MESSAGE}],
                                                            })(
                                                                <TimePicker format="HH:mm" />
                                                            )}
                                                        </Form.Item>
                                                    </Col>
                                                    {that.state.twoSessions[`is_two_sessions_${dayKey}`] ? (
<div>
                                                        <Col span={12}>
                                                            <Form.Item
                                                              key={`first_end_time_${dayKey}`}
                                                              label="Lunch At"
                                                              {...formItemLayout}
                                                            >
                                                                {getFieldDecorator(`first_end_time_${dayKey}`, {
                                                                    initialValue: that.state.timings && that.state.timings[`first_end_time_${dayKey}`] ? moment(that.state.timings[`first_end_time_${dayKey}`], "HH:mm") : null,
                                                                    rules: [{
                                                                        required: true,
                                                                        message: REQUIRED_FIELD_MESSAGE
                                                                    }],
                                                                })(
                                                                    <TimePicker format="HH:mm" />
                                                                )}
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Form.Item
                                                              key={`second_start_time_${dayKey}`}
                                                              label="Resume At"
                                                              {...formItemLayout}
                                                            >
                                                                {getFieldDecorator(`second_start_time_${dayKey}`, {
                                                                    initialValue: that.state.timings && that.state.timings[`second_start_time_${dayKey}`] ? moment(that.state.timings[`second_start_time_${dayKey}`], "HH:mm") : null,
                                                                    rules: [{
                                                                        required: true,
                                                                        message: REQUIRED_FIELD_MESSAGE
                                                                    }],
                                                                })(
                                                                    <TimePicker format="HH:mm" />
                                                                )}
                                                            </Form.Item>
                                                        </Col>
</div>
) : null}
                                                    <Col span={12}>
                                                        <Form.Item
                                                          key={`second_end_time_${dayKey}`}
                                                          label="Practice Ends At"
                                                          {...formItemLayout}
                                                        >
                                                            {getFieldDecorator(`second_end_time_${dayKey}`, {
                                                                initialValue: that.state.timings && that.state.timings[`second_end_time_${dayKey}`] ? moment(that.state.timings[`second_end_time_${dayKey}`], "HH:mm") : null,
                                                                rules: [{required: true, message: REQUIRED_FIELD_MESSAGE}],
                                                            })(
                                                                <TimePicker format="HH:mm" />
                                                            )}
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
</div>
)
                                            : null}
                                    </Col>
                                </Row>
                                <Divider style={{margin: 4}} />
</div>
))}
                        <Form.Item {...formItemLayout}>
                            <Button loading={that.state.loading} type="primary" htmlType="submit" style={{margin: 5}}>
                                Submit
                            </Button>
                            {that.props.history ? (
                                <Button style={{margin: 5}} onClick={() => that.props.history.goBack()}>
                                    Cancel
                                </Button>
                              ) : null}
                        </Form.Item>
                    </Form>
                </Card>
</div>
)
        
    }
}

export default Form.create()(DoctorTiming);
