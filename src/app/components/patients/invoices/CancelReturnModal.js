import React from "react";
import {Button, Card, Form, Icon, Input, Modal} from "antd";
import moment from "moment";
import {
    CANCELINVOICE_RESENT_OTP,
    CANCELINVOICE_VERIFY_OTP,
    SINGLE_INVOICES_API
} from "../../../constants/api";
import {displayMessage, getAPI, interpolate, postAPI, putAPI} from "../../../utils/common";
import {SUCCESS_MSG_TYPE, OTP_DELAY_TIME} from "../../../constants/dataKeys";
import { REQUIRED_FIELD_MESSAGE } from "../../../constants/messages";

const { TextArea } = Input;
class CancelReturnModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cancelIncoiceVisible: this.props.cancelIncoiceVisible,
            otpSent:this.props.otpSent,
            otpField:false

        };
    }

    componentDidMount(){
        const that =this;
        const created_time = moment().diff(that.props.editInvoice.created_at, 'minutes');
        if(created_time>OTP_DELAY_TIME){
            that.setState({
                otpField:true
            })
        }
       
    }

    handleSubmitCancelInvoice = (e) => {
        const that = this;
        const {otpField} =that.state;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const reqData = {
                    ...values,
                    practice: this.props.active_practiceId,
                }
                const successFn = function (data) {
                    that.setState({
                        cancelIncoiceVisible: false,
                    });
                    that.deleteInvoice(that.props.editInvoice.patient, that.props.editInvoice.id, values.cancel_note)
                };
                const errorFn = function () {

                };
                if(otpField){
                    postAPI(CANCELINVOICE_VERIFY_OTP, reqData, successFn, errorFn);
                }else{
                    that.deleteInvoice(that.props.editInvoice.patient, that.props.editInvoice.id, values.cancel_note)
                }
               
            }
        });
    }


    deleteInvoice(patient, invoice, cancel_note) {
        const that = this;
        const reqData = {
            patient, 
            is_cancelled: true,
            cancel_note
        };
        const successFn = function (data) {
            that.props.cancelInvoiceClose();
            displayMessage(SUCCESS_MSG_TYPE, "Invoice cancelled successfully")
            that.props.loadInvoices();
        }
        const errorFn = function () {
        }
        putAPI(interpolate(SINGLE_INVOICES_API, [invoice]), reqData, successFn, errorFn);
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
        const {otpField} =this.state;
        
        const {getFieldDecorator} = that.props.form;
        return(
            <Modal
              visible={that.state.cancelIncoiceVisible}
              title="Cancel Invoice"
              footer={null}
              onOk={that.handleSubmitCancelInvoice}
              onCancel={that.props.cancelInvoiceClose}
            >
                <Form>
                    <Form.Item key="cancel_notes">
                        {getFieldDecorator('cancel_note',{
                            rules:[{required:true, message:REQUIRED_FIELD_MESSAGE}],
                        })(
                            <TextArea placeholder="cancel notes" />
                        )}
                    </Form.Item>
                    { otpField && (
                        <Form.Item key="cancelOtp">
                            {getFieldDecorator('otp', {
                                rules: [{required: true, message: 'Please input Otp!'}],
                            })(
                                <Input
                                  prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}} />}
                                  placeholder="Otp"
                                />
                            )}
                        </Form.Item>
                      )}
                    <Form.Item>
                        {that.props.otpSent ? (
<a style={{float: 'right'}} type="primary" onClick={that.sendOTP}>
                            Resend Otp ?
</a>
) : null}
                        <Button size="small" type="primary" htmlType="submit" onClick={that.handleSubmitCancelInvoice}>
                            Submit
                        </Button>&nbsp;
                        <Button size="small" onClick={that.cancelInvoiceClose}>
                            Close
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        )
    }


}
export default Form.create()(CancelReturnModal);
