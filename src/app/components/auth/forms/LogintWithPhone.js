import React from 'react';
import {Button, Col, Divider, Form, Icon, Input, Row} from 'antd';
import {Link} from "react-router-dom";
import {displayMessage, makeURL} from "../../../utils/common";
import {sendLoginOTP} from "../../../utils/auth";
import {SUCCESS_MSG_TYPE, WARNING_MSG_TYPE} from "../../../constants/dataKeys";
import {LOGIN_RESEND_OTP, LOGIN_SEND_OTP} from "../../../constants/api";

const FormItem = Form.Item;

class LoginWithPhone extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        this.handleSubmit = this.handleSubmit.bind(this);

    }


    handleSubmit = (e) => {
        const that = this;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                if (!err) {

                    if (that.props.login)
                        that.props.login(values,false);

                }
            }
        });
    }

    setPhone = (type, value) => {
        this.setState({
            [type]: value
        })
    }

    sendOTP = () => {
        const that = this;
        if (this.state.phone) {
            const successFn = function (data) {
                that.setState({
                    otpSent: true
                });
                displayMessage(SUCCESS_MSG_TYPE, "OTP Sent successfully!")
            }
            const errorFn = function () {

            }
            if (this.state.otpSent) {
                sendLoginOTP(makeURL(LOGIN_RESEND_OTP), this.state.phone, successFn, errorFn);
            } else {
                sendLoginOTP(makeURL(LOGIN_SEND_OTP), this.state.phone, successFn, errorFn);
            }
        } else {
            displayMessage(WARNING_MSG_TYPE, "Phone No can not be empty!!");
        }
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        return (
            <Form onSubmit={this.handleSubmit} className="login-form">

                <Input.Group size="large">
                    <Row>
                        <Col span={this.state.otpSent ? 24 : 18}>
                            <FormItem>
                                {getFieldDecorator('phone_no', {
                                    rules: [{required: true, message: 'Please input your phone!'}],
                                })(
                                    <Input
                                      prefix={<Icon type="phone" style={{color: 'rgba(0,0,0,.25)'}} />}
                                      type="text"
                                      placeholder="Phone"
                                      onChange={(e) => this.setPhone('phone', e.target.value)}
                                    />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={this.state.otpSent ? 0 : 6}>
                            <Button type="primary" size="large" block onClick={this.sendOTP}>Send OTP</Button>
                        </Col>
                    </Row>
                </Input.Group>

                <FormItem>
                    {getFieldDecorator('otp', {
                        rules: [{required: true, message: 'Please input otp!'}],
                    })(
                        <Input
                          size="large"
                          prefix={<Icon type="key" style={{color: 'rgba(0,0,0,.25)'}} />}
                          type="text"
                          placeholder="otp"
                        />
                    )}
                </FormItem>
                <FormItem>
                    {this.state.otpSent ? (
<a style={{float: 'right'}} type="primary" onClick={this.sendOTP}>
                        Resend Otp ?
</a>
) : null}
                    <Button
                      size="large"
                      type="primary"
                      htmlType="submit"
                      className="login-form-button"
                    >
                        Log in
                    </Button>
                </FormItem>

                <Divider>OR</Divider>
                <h4>
                    <Link to="/"> <Button
                      size="large"
                      type="primary"
                      htmlType="submit"
                      className="login-form-button"
                    >Log in with password
                                  </Button>

                    </Link>
                </h4>


            </Form>
        );
    }

}

export default LoginWithPhone;
