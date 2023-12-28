import React from "react";
import {Button, Card, Form, Icon, Input, Modal} from "antd";
import {CANCELINVOICE_RESENT_OTP, CANCELINVOICE_VERIFY_OTP} from "../../../constants/api";
import {getAPI, postAPI} from "../../../utils/common";

class EditPaymentModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            otpSent:this.props.otpSent,
            editPaymentVisible: this.props.editPaymentVisible,
            cancelPaymentVisible:this.props.cancelPaymentVisible,


        };
        this.editPaymentData = this.editPaymentData.bind(this);
    }

    handleSubmitEditPayment = (e) => {
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
                        editPaymentVisible: false,
                    });
                    that.editPaymentData(that.props.editPayment);
                    that.props.editPaymentClose();
                };
                const errorFn = function () {

                };
                postAPI(CANCELINVOICE_VERIFY_OTP, reqData, successFn, errorFn);
            }
        });
    };

    editPaymentData = (record) => {
        const that = this;
        that.props.history.push(`/erp/patient/${  record.patient  }/billing/payments/edit/`);
    };


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
        const {getFieldDecorator} = that.props.form;
        return(
            <Modal
              visible={(that.state.editPaymentVisible && that.props.editPayment && that.props.editPayment.id == that.props.payment.id)}
              title="Edit Invoice"
              footer={null}
              onOk={that.handleSubmitEditPayment}
              onCancel={that.props.editPaymentClose}
            >
                <Form>
                    <Form.Item>
                        {getFieldDecorator('otp', {
                            rules: [{required: true, message: 'Please input Otp!'}],
                        })(
                            <Input
                              prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}} />}
                              placeholder="Otp"
                            />,
                        )}
                    </Form.Item>
                    <Form.Item>
                        {that.props.otpSent ? (
<a style={{float: 'right'}} type="primary" onClick={that.sendOTP}>
                            Resend Otp ?
</a>
) : null}
                        <Button size="small" type="primary" htmlType="submit" onClick={that.handleSubmitEditPayment}>
                            Submit
                        </Button>&nbsp;
                        <Button size="small" onClick={that.props.editPaymentClose}>
                            Close
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        )
    }


}
export default Form.create()(EditPaymentModal);
