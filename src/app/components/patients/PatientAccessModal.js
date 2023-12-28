import React from "react";
import {Button, Col, Form, List, Modal, Result, Row} from "antd";
import DynamicFieldsForm from "../common/DynamicFieldsForm";
import {ERROR_MSG_TYPE, INPUT_FIELD, NUMBER_FIELD, SUCCESS_MSG_TYPE} from "../../constants/dataKeys";
import {displayMessage, getAPI, interpolate, postAPI, putAPI} from "../../utils/common";
import {
    CANCELINVOICE_GENERATE_OTP,
    CANCELINVOICE_RESENT_OTP,
    CANCELINVOICE_VERIFY_OTP,
    PATIENT_PROFILE
} from "../../constants/api";

export default class PatientAccessModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            patientData: {},
            otpModalVisible: false
        }
    }

    componentDidMount() {
        const that = this;
        if (this.props.patientData) {
            this.setState({
                patientData: that.props.patientData
            });
        }
        this.toggleVisibilty(true)
    }

    sendOTP = (option) => {
        this.setState({
            otpModalVisible: !!option
        });
        if (option) {
            const reqData = {
                type: `Access Patient Data to ${this.props.activePracticeData.name} `,
                patient: this.props.patientData.id
            }
            const successFn = function (data) {
                displayMessage(SUCCESS_MSG_TYPE, "OTP Sent Successfully!!");
            }
            const errorFn = function () {
                displayMessage(ERROR_MSG_TYPE, "OTP Sending Failed!!");
            };
            postAPI(CANCELINVOICE_GENERATE_OTP, reqData, successFn, errorFn);
        }
    }

    toggleVisibilty = (option) => {
        this.setState({
            visible: !!option
        })
    }

    reSendOTP() {
        const that = this;
        const successFn = function (data) {

        };
        const errorFn = function () {

        };
        getAPI(CANCELINVOICE_RESENT_OTP, successFn, errorFn);
    }

    render() {
        const that = this;
        const {otpModalVisible, patientData} = this.state;
        const OTPFormLayout = Form.create()(DynamicFieldsForm);
        const OTPFormFields = [{
            label: "OTP",
            type: INPUT_FIELD,
            required: true,
            key: "otp"
        }];
        const defaultFields = [{
            key: 'patient',
            value: patientData.id
        }];
        const formProps = {
            successFn() {
                const putReqData = {
                    practices: [...patientData.practices, {practice: that.props.active_practiceId, pd_doctor: null}]
                };
                const putSuccess = function () {
                    displayMessage(SUCCESS_MSG_TYPE, "Patient Access added to the practice!");
                    that.toggleVisibilty(false);
                    if (that.props.loadData)
                        that.props.loadData()
                }
                const putError = function () {
                    displayMessage(SUCCESS_MSG_TYPE, "Patient Access adding failed!");
                }
                putAPI(interpolate(PATIENT_PROFILE, [patientData.id]), putReqData, putSuccess, putError);
            },
            errorFn() {
                displayMessage(ERROR_MSG_TYPE, "OTP Verification Failed!!")
            },
            action: CANCELINVOICE_VERIFY_OTP,
            method: "post"
        }
        return (
            <Modal
              style={{top: 20}}
              footer={null}
              visible={this.state.visible}
              onCancel={() => this.toggleVisibilty(false)}
            >
                <Row>
                    <Col span={24}>
                        <Result
                          status={403}
                          title="Permission Denied"
                          subTitle="Sorry, your practice is not authorized to access this patient. To Access this patient,"
                          extra={(
                                <Button type="primary" onClick={() => this.sendOTP(true)}>Send OTP to
                                    Patient
                                </Button>
                            )}
                        />
                        <List
                          size="small"
                          bordered
                          header="Or ask any practice from below for access:"
                          dataSource={patientData.practices_data}
                          renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                      title={item.practice_name}
                                    />
                                </List.Item>
                            )}
                        />
                    </Col>
                </Row>
                <Modal
                  closable={false}
                  visible={otpModalVisible}
                  centered
                  footer={null}
                  title="Enter the OTP sent to Patient:"
                >
                    <OTPFormLayout fields={OTPFormFields} defaultValues={defaultFields} formProp={formProps} />
                    <Button style={{float: 'right'}} type="link" onClick={() => this.reSendOTP()}>Re Send OTP?</Button>
                    <Button onClick={() => this.sendOTP(false)}>Cancel</Button>
                </Modal>
            </Modal>
        )
    }
}
