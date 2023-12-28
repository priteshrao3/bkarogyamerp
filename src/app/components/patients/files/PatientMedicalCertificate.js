import React from "react";
import {Route} from "react-router";
import {
    Form,
    Icon,
    Input,
    Button,
    Checkbox,
    Card,
    DatePicker,
    Radio,
    Row,
    Col,
    Select,
    TimePicker,
    Affix,
    Dropdown,
    Menu
} from 'antd';
import {Redirect, Link} from 'react-router-dom'
import moment from 'moment';
import {postAPI, interpolate, displayMessage} from "../../../utils/common";
import {NOTES} from "../../../constants/hardData";
import {MEDICAL_CERTIFICATE_API} from "../../../constants/api";
import {SUCCESS_MSG_TYPE ,ERROR_MSG_TYPE} from "../../../constants/dataKeys";
import {loadDoctors} from "../../../utils/clinicUtils";


const {TextArea} = Input;
const {Option} = Select;

class PatientMedicalCertificate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            excused_duty_checked: false,
            fit_light_duty_checked: false,
            attendance_checked: false,
            startDate: this.props.value,
            endDate: new Date(),
            proof_attendance_from: null,
            days: 0,
            practiceDoctors: [],
            selectedDoctor: {},
            selectedDate: moment(),
            value: ''
        }
        this.handleChangeStart = this.handleChangeStart.bind(this);
        this.handleChangeEnd = this.handleChangeEnd.bind(this);
    }

    componentDidMount() {
        loadDoctors(this);
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    handleCheck = (e) => {
        this.setState({
            excused_duty_checked: !this.state.excused_duty_checked
        });
    }

    handleLighDutyCheck = (e) => {
        this.setState({
            fit_light_duty_checked: !this.state.fit_light_duty_checked
        });
    }

    onChangeHandle = (e) => {
        this.setState({
            value: e.target.value,
        });
    }

    handleAttendanceCheck = (e) => {
        this.setState({
            attendance_checked: !this.state.attendance_checked
        });
    }

    handleChangeStart = (date) => {
        this.setState({
            startDate: date
        });

    }

    handleChangeEnd(date) {
        this.setState({
            endDate: date
        });
    }

    // totalDays(){
    //     let {startDate, endDate} = this.state;
    //     let amount = endDate.diff(startDate ,"days");
    //     this.setState({
    //     days: amount
    //     });
    // }

    onChange = (timeString) => {
        this.setState({
            proof_attendance_from: timeString
        });
    }

    selectedDate = (date) => {
        this.setState({
            selectedDate: date
        })
    }

    selectDoctor = (doctor) => {
        this.setState({
            selectedDoctor: doctor
        })
    }

    handleSubmit = (e) => {
        const that = this;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {

            if(values.excused_duty || values.fit_light_duty || values.proof_attendance){
                if (!err) {
                    const reqData = {
                        ...values,
                        doctor: that.state.selectedDoctor.id,
                        practice: that.props.active_practiceId,
                        date: that.state.selectedDate && moment(that.state.selectedDate).isValid() ? that.state.selectedDate.format('YYYY-MM-DD') : null,
                        excused_duty_from: moment(values.excused_duty_from).format("YYYY-MM-DD"),
                        excused_duty_to: moment(values.excused_duty_to).format("YYYY-MM-DD"),
                        fit_light_duty_from: moment(values.fit_light_duty_from).format("YYYY-MM-DD"),
                        fit_light_duty_to: moment(values.fit_light_duty_to).format("YYYY-MM-DD"),
                        proof_attendance_date: moment(values.proof_attendance_date).format("YYYY-MM-DD"),
                        proof_attendance_from: moment(values.proof_attendance_from).format('LT'),
                        proof_attendance_to: moment(values.proof_attendance_to).format('LT'),
                        patient: that.props.match.params.id,
                        is_active: true,
                        valid_court:false,
                        invalid_court:false,
                        no_mention:false
                    };
                    if(values.group)
                        reqData[values.group] = true
                    delete reqData.group;
                    const successFn = function (data) {
                        displayMessage(SUCCESS_MSG_TYPE, "Medical Certificate Generated.");
                        that.props.history.replace(`/erp/patient/${  that.props.match.params.id  }/emr/files`);
                    }
                    const errorFn = function () {
                        that.setState({});
                    }
                    postAPI(interpolate(MEDICAL_CERTIFICATE_API, [this.props.currentPatient.id]), reqData, successFn, errorFn);
                }
            }else{
               displayMessage(ERROR_MSG_TYPE,"Please select at least one of the above options");
            }

        });
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 8},
                md: {span: 8},
                lg: {span: 8},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 16},
                md: {span: 16},
                lg: {span: 16},
            },
        };
        const that = this;
        const radioOption = NOTES.map((option) => <Radio value={option.value}>{option.label}</Radio>)
        return (
<Form onSubmit={this.handleSubmit} {...formItemLayout}>
                <Card
                  title="ADD MEDICAL LEAVE CERTIFICATE"
                  extra={(
<Button.Group>
                          <Button type="primary" htmlType="submit">Save Certificate</Button>
</Button.Group>
)}
                >


                    <Form.Item>
                        {getFieldDecorator('excused_duty', {})(
                            (<Checkbox onClick={this.handleCheck} defaultChecked={this.state.excused_duty_checked}>Excused
                                from duty
                             </Checkbox>),
                        )}
                    </Form.Item>
                    {this.state.excused_duty_checked ? (
                        <Row>
                            <Col span={6} offset={6}>
                                <Form.Item label="From">
                                    {getFieldDecorator('excused_duty_from', {})
                                    (
                                        <DatePicker />
                                    )}
                                </Form.Item>

                                <Form.Item label="till">
                                    {getFieldDecorator('excused_duty_to', {})
                                    (
                                        <DatePicker />
                                    )}
                                </Form.Item>

                            </Col>
                            <Col span={6}>
                                <Form.Item>
                                    {getFieldDecorator('excused_duty_from_session', {
                                        initialValue: "Morning"
                                    })
                                    (
                                        <Select>
                                            <Option value="Morning">Morning Session</Option>
                                            <Option value="Morning">Evening Session</Option>
                                        </Select>
                                    )}

                                </Form.Item>

                                <Form.Item>
                                    {getFieldDecorator('excused_duty_to_session', {
                                        initialValue: "Morning"
                                    })
                                    (
                                        <Select>
                                            <Option value="Morning">Morning Session</Option>
                                            <Option value="Morning">Evening Session</Option>
                                        </Select>
                                    )}
                                </Form.Item>

                            </Col>

                        </Row>
                      )

                        : null}


                    <Form.Item>
                        {getFieldDecorator('fit_light_duty', {})(
                            (<Checkbox
                              onClick={this.handleLighDutyCheck}
                              defaultChecked={this.state.fit_light_duty_checked}
                            >Fit for light
                                duty
                             </Checkbox>),
                        )}
                    </Form.Item>

                    {this.state.fit_light_duty_checked ? (
                        <Row>
                            <Col>
                                <Form.Item label="From">
                                    {getFieldDecorator('fit_light_duty_from', {})
                                    (
                                        <DatePicker />
                                    )}

                                </Form.Item>

                                <Form.Item label="till">
                                    {getFieldDecorator('fit_light_duty_to', {})
                                    (
                                        <DatePicker />
                                    )}

                                </Form.Item>
                            </Col>

                        </Row>
                      )
                        : null}

                    <Form.Item>
                        {getFieldDecorator('proof_attendance', {})(
                            (<Checkbox
                              onClick={this.handleAttendanceCheck}
                              defaultChecked={this.state.attendance_checked}
                            >Proof of attendance at
                                practice
                             </Checkbox>),
                        )}
                    </Form.Item>
                    {this.state.attendance_checked ? (
                        <Row>
                            <Form.Item label="on">
                                {getFieldDecorator('proof_attendance_date', {})
                                (<DatePicker />)}
                            </Form.Item>
                            <Col span={6} offset={6}>
                                <Form.Item label="From">
                                    {getFieldDecorator('proof_attendance_from', {})
                                    (
                                        <TimePicker use12Hours format="h:mm A" />
                                    )}

                                </Form.Item>
                                <Form.Item label="till">
                                    {getFieldDecorator('proof_attendance_to', {})
                                    (
                                        <TimePicker use12Hours format="h:mm A" />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                      )


                        : null}


                    <Form.Item label="Notes">
                        {getFieldDecorator('notes', {})(
                            (<TextArea />),
                        )}
                    </Form.Item>


                    <Form.Item>
                        {getFieldDecorator('group', {initialValue:'no_mention'})(
                            <Radio.Group>
                                {radioOption}
                            </Radio.Group>
                        )}

                    </Form.Item>
                    <Affix offsetBottom={0}>
                        <Card>
                            <span>Issued by &nbsp;&nbsp;</span>
                            <Dropdown
                              placement="topCenter"
                              overlay={(
<Menu>
                                {this.state.practiceDoctors.map(doctor => (
                                    <Menu.Item key="0">
                                        <a onClick={() => this.selectDoctor(doctor)}>{doctor.user.first_name}</a>
                                    </Menu.Item>
                                  ))}
</Menu>
)}
                              trigger={['click']}
                            >
                                <a className="ant-dropdown-link" href="#">
                                    <b>
                                        {this.state.selectedDoctor.user ? this.state.selectedDoctor.user.first_name : 'No DOCTORS Found'}
                                    </b>
                                </a>
                            </Dropdown>
                            <span> &nbsp;&nbsp;on&nbsp;&nbsp;</span>
                            <DatePicker
                              value={this.state.selectedDate}
                              onChange={(value) => this.selectedDate(value)}
                              format="DD-MM-YYYY"
                              allowClear={false}
                            />
                        </Card>
                    </Affix>

                </Card>
</Form>

        );
    }
}

export default Form.create()(PatientMedicalCertificate);
