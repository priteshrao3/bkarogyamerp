import React from "react";
import {Button, Card, Form, Icon, Input, Modal} from "antd";
import moment from "moment";
import {
    CANCELINVOICE_RESENT_OTP,
    CANCELINVOICE_VERIFY_OTP,
    SINGLE_INVOICES_API, SINGLE_PAYMENT_API
} from "../../../constants/api";
import {displayMessage, getAPI, interpolate, postAPI, putAPI} from "../../../utils/common";
import {SUCCESS_MSG_TYPE, OTP_DELAY_TIME} from "../../../constants/dataKeys";
import { REQUIRED_FIELD_MESSAGE } from "../../../constants/messages";

const TextArea =Input;
class CancelPaymentModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cancelPaymentVisible: this.props.cancelPaymentVisible,
            otpSent:this.props.otpSent,
            otpField:false,

        };
    }

    componentDidMount(){
        const that =this;
        const created_time = moment().diff(that.props.editPayment.created_at, 'minutes');
        if (created_time > OTP_DELAY_TIME) {
            that.setState({
                otpField:true,
            })
        }

    }


    handleSubmitCancelPayment = (e) => {
        const that = this;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const reqData = {
                    ...values,
                    practice: this.props.active_practiceId,
                }
                const successFn = function (data) {
                    that.setState({
                        cancelPaymentVisible: false,
                    });
                    that.deletePayment(that.props.editPayment.patient_data , that.props.editPayment.id, values.cancel_note);
        
                };
                const errorFn = function () {

                };
                if(that.state.otpField){
                    postAPI(CANCELINVOICE_VERIFY_OTP, reqData, successFn, errorFn);
                }else{
                    that.deletePayment(that.props.editPayment.patient_data, that.props.editPayment.id, values.cancel_note);
                }
                
            }
        });
    }



    deletePayment(patient, payment , cancel_note) {
        const that = this;
        console.log("log",patient ,payment, cancel_note)
        const reqData = {
            patient: patient.id, 
            is_cancelled: true,
            cancel_note,
        };
        const successFn = function (data) {
            that.props.cancelPaymentClose();
            displayMessage(SUCCESS_MSG_TYPE, "Payment cancelled successfully")
            that.props.loadPayments();
        };
        const errorFn = function () {
        };
        putAPI(interpolate(SINGLE_PAYMENT_API, [payment]), reqData, successFn, errorFn);

    }


    sendOTP() {
        const that = this;
        const successFn = function (data) {

        };
        const errorFn = function () {

        };
        getAPI(CANCELINVOICE_RESENT_OTP, successFn, errorFn);
    }

    render() {
        const that = this;
        const {otpField} = this.state;
        const {getFieldDecorator} = that.props.form;
        return(
            <Modal
              visible={that.state.cancelPaymentVisible}
              title="Cancel Payment"
              footer={null}
              onOk={that.handleSubmitCancelPayment}
              onCancel={that.props.cancelPaymentClose}

            >
                <Form>
                    <Form.Item key="text-area-note"> 
                        {getFieldDecorator('cancel_note',{
                            rules:[{required:true, message:REQUIRED_FIELD_MESSAGE}],
                        })(
                            <TextArea placeholder="cancel notes" />
                        )}
                    </Form.Item>

                    {otpField ? (
                        <Form.Item key="otp">
                            {getFieldDecorator('otp', {
                                rules: [{required: otpField, message: 'Please input Otp!'}],
                            })(
                                <Input
                                  prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}} />}
                                  placeholder="Otp"
                                />,
                            )}
                        </Form.Item>
                      ) :null}

                    <Form.Item key="btn">
                        {that.state.otpSent ? (
<a style={{float: 'right'}} type="primary" onClick={that.sendOTP}>
                            Resend Otp ?
</a>
) : null}
                        <Button size="small" type="primary" htmlType="submit" onClick={that.handleSubmitCancelPayment}>
                            Submit
                        </Button>&nbsp;
                        <Button size="small" onClick={that.props.cancelPaymentClose}>
                            Close
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        )
    }


}
export default Form.create()(CancelPaymentModal);
