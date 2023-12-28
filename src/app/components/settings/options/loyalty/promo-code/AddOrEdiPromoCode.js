import React from "react";
import {Alert, Button, Card, DatePicker, Form, Input, InputNumber, Row, Select} from "antd";
import moment from "moment";
import {displayMessage, getAPI, interpolate, postAPI} from "../../../../../utils/common";
import {PROMO_CODE, SEARCH_PATIENT} from "../../../../../constants/api";
import {CURRENCY_TYPE} from "../../../../../constants/hardData";
import {SUCCESS_MSG_TYPE} from "../../../../../constants/dataKeys";

class AddOrEdiPromoCode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editPromoCode: [],
            patientList: [],
            loading: false,
        };
    }


    loadPatient = (value) => {
        const that = this;
        const successFn = function (data) {
            if (data.results.length > 0) {
                that.setState({
                    patientList: data.results,
                })
            }
        };
        const errorFn = function () {
        };
        if (value) {
            getAPI(interpolate(SEARCH_PATIENT, [value]), successFn, errorFn);
        }

    };

    handleSubmit = (e) => {
        const that = this;
        that.setState({
            loading: true
        });
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const reqData = values;
                reqData.practice = that.props.active_practiceId;
                const successFn = function (data) {
                    that.setState({
                        loading: false,
                    });
                    displayMessage(SUCCESS_MSG_TYPE, "Successfully Created!")
                    that.props.form.resetFields();
                    that.props.loadData();
                    if (that.props.history){
                        that.props.history.replace("/erp/settings/loyalty");
                    }
                };
                const errorFn = function () {

                };

                postAPI(PROMO_CODE, reqData, successFn, errorFn)

            }
        })
    };

    render() {
        const {patientList} = this.state;

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 14},
        };
        const {getFieldDecorator} = this.props.form;


        return (
<div>
                <Form onSubmit={this.handleSubmit}>
                    <Form.Item label="Promo Code" {...formItemLayout} key="promo_code">
                        {getFieldDecorator('promo_code', {initialValue: ''})
                        (<Input placeholder="Promo Code" />)}
                    </Form.Item>

                    <Form.Item label="Promo Code Value" {...formItemLayout} key="code_value">
                        {getFieldDecorator('code_value', {initialValue: ''})
                        (<InputNumber placeholder="Promo Code Value" />)}
                    </Form.Item>

                    <Form.Item label="Code Type" {...formItemLayout} key="code_type">
                        {getFieldDecorator('code_type', {initialValue: ''})
                        (<Select placeholder="Code Type" style={{width: '100%'}}>

                            {CURRENCY_TYPE.map(option => (
                                <Select.Option
                                  value={option.value}
                                >{option.label} ({option.value})
                                </Select.Option>
))}
                         </Select>)}
                    </Form.Item>

                    <Form.Item label="Min Order" {...formItemLayout} key="minimum_order">
                        {getFieldDecorator('minimum_order', {initialValue: ''})
                        (<InputNumber placeholder="Min Order" />)}
                    </Form.Item>

                    <Form.Item label="Max Discount" {...formItemLayout} key="maximum_discount">
                        {getFieldDecorator('maximum_discount', {initialValue: ''})
                        (<InputNumber placeholder="Min Order" />)}
                    </Form.Item>

                    <Form.Item label="Expiry Date" {...formItemLayout} key="expiry_date">

                        {getFieldDecorator('expiry_date', {initialValue: moment()})
                        (<DatePicker format="YYYY/MM/DD" allowClear={false} />)}
                    </Form.Item>


                    <Form.Item label="Patients" {...formItemLayout} key="patient">
                        {getFieldDecorator('patients', {initialValue: []})
                        (<Select
                          mode="multiple"
                          placeholder="Select Patient"
                          style={{width: '100%'}}
                          showSearch
                          onSearch={this.loadPatient}
                          filterOption={false}
                        >
                            {patientList.map(option => (
                                <Select.Option
                                  value={option.id}
                                >{option.user.first_name} ({option.custom_id})
                                </Select.Option>
))}
                         </Select>)}
                        <span className="ant-form-text">If no patient is selected, promo code will be available to all patients.</span>
                    </Form.Item>

                    <Form.Item {...formItemLayout}>
                        <Button type="primary" htmlType="submit" style={{margin: 5}}>
                            Submit
                        </Button>
                        {this.props.history ? (
                            <Button style={{margin: 5}} onClick={() => this.props.history.goBack()}>
                                Cancel
                            </Button>
                          ) : null}
                    </Form.Item>

                </Form>
</div>
        )
    }
}

export default Form.create()(AddOrEdiPromoCode);
