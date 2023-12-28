import React from 'react';
import {Button, Card, Checkbox, Form, Input, InputNumber, Select} from "antd";
import {displayMessage, getAPI, interpolate, postAPI} from "../../../../utils/common";
import {PROCEDURE_CATEGORY, PRODUCT_MARGIN, TAXES} from "../../../../constants/api";
import {REQUIRED_FIELD_MESSAGE} from "../../../../constants/messages";
import {INPUT_FIELD, SUCCESS_MSG_TYPE} from "../../../../constants/dataKeys";

class AddorEditProcedure extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editingProcedureData: this.props.editingProcedureData ? this.props.editingProcedureData : null,
            taxes: [],
            procedure_category: [],
            redirect: false,
            productMargin: [],
            retail_price: 0
        }
        this.loadTaxes = this.loadTaxes.bind(this);
        this.loadProcedures = this.loadProcedures.bind(this)
    }

    componentDidMount() {
        this.loadTaxes();
        this.loadProcedures();
        this.loadProductMargin();
        if (this.props.editingProcedureData) {
            this.setState({
                retail_price: this.props.editingProcedureData.cost
            });
        }
        if (this.props.history && this.props.history.location.search) {
            const pairValueArray = this.props.history.location.search.substr(1).split('&');
            if (pairValueArray.length) {
                const urlInitialValue = {};
                const {setFieldsValue} = this.props.form;
                pairValueArray.forEach(function (item) {
                    const keyValue = item.split('=');
                    if (keyValue && keyValue.length == 2) {
                        if (!isNaN(keyValue[1]) && keyValue[1].toString().indexOf('.') != -1) {
                            urlInitialValue[keyValue[0]] = parseFloat(keyValue[1]);
                            setFieldsValue({
                                [keyValue[0]]: parseFloat(keyValue[1])
                            })
                        } else if (!isNaN(keyValue[1])) {
                            urlInitialValue[keyValue[0]] = parseInt(keyValue[1]);
                            setFieldsValue({
                                [keyValue[0]]: parseInt(keyValue[1])
                            })
                        } else {
                            urlInitialValue[keyValue[0]] = keyValue[1];
                            setFieldsValue({
                                [keyValue[0]]: keyValue[1]
                            })
                        }
                    }
                });
            }
        }
    }

    loadProductMargin() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                productMargin: data
            })
        }
        const errorFn = function () {

        }
        getAPI(PRODUCT_MARGIN, successFn, errorFn);
    }


    loadProcedures() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                procedure_category: data,
            })
        };
        const errorFn = function () {
        };
        getAPI(interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId]), successFn, errorFn, {pagination: false});
    }

    loadTaxes() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                taxes: data
            })
        }
        const errorFn = function () {
        }
        getAPI(interpolate(TAXES, [this.props.active_practiceId]), successFn, errorFn);
    }

    changeNetPrice = (value) => {
        const that = this;
        const {getFieldsValue, setFields} = this.props.form;
        setTimeout(function () {
            const values = getFieldsValue();
            if (values.cost_with_tax) {
                let totalTaxAmount = 0;
                values.taxes.forEach(function (taxid) {
                    that.state.taxes.forEach(function (taxObj) {
                        if (taxObj.id == taxid)
                            totalTaxAmount += taxObj.tax_value;
                    })
                });
                const retailPrice = values.cost_with_tax / (1 + totalTaxAmount * 0.01);
                that.setState({
                    retail_price: retailPrice.toFixed(2)
                })
            } else {
                that.setState({
                    retail_price: 0
                })
            }
        }, 1000);

    }

    handleSubmit = (e) => {
        const that = this;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const reqData = {
                    ...values,
                    cost: that.state.retail_price
                }
                const successFn = function (data) {
                    displayMessage(SUCCESS_MSG_TYPE, 'Procedure Updated Successfully!!');
                    if (that.props.loadData)
                        that.props.loadData();
                    that.props.history.replace("settings/procedures");
                }
                const errorFn = function () {

                }
                if (this.state.editingProcedureData) {
                    reqData.id = this.state.editingProcedureData.id
                }
                postAPI(interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId]), reqData, successFn, errorFn)
            }
        })
    }

    render() {
        const that = this;
        const formItemLayout = ({
            labelCol: {span: 8},
            wrapperCol: {span: 14},
        });
        const {getFieldDecorator} = this.props.form;
        return (
            <div>
                <Card>
                    <Form onSubmit={this.handleSubmit}>
                        <h2>{this.state.editingProcedureData ? "Edit Procedures" : "Add Procedures"}</h2>
                        <Form.Item label="Procedure Name" {...formItemLayout}>
                            {getFieldDecorator('name', {
                                initialValue: this.state.editingProcedureData ? this.state.editingProcedureData.name : null,
                                rules: [{required: true, message: REQUIRED_FIELD_MESSAGE}]
                            })
                            (<Input placeholder="Procedure Name" />)}
                        </Form.Item>
                        <Form.Item label="Procedure Net Price" {...formItemLayout}>
                            {getFieldDecorator('cost_with_tax', {
                                initialValue: this.state.editingProcedureData ? this.state.editingProcedureData.cost_with_tax : null,
                                rules: [{
                                    required: true,
                                    message: REQUIRED_FIELD_MESSAGE
                                }]
                            })
                            (<InputNumber onChange={this.changeNetPrice} />)}<span className="ant-form-text">INR</span>
                        </Form.Item>
                        <Form.Item label="Same State Tax" {...formItemLayout}>
                            {getFieldDecorator('taxes', {initialValue: this.state.editingProcedureData && this.state.editingProcedureData.taxes ? this.state.editingProcedureData.taxes.map(item => item.id) : []})
                            (<Checkbox.Group onChange={this.changeNetPrice}>
                                {this.state.taxes.map((tax) => (
                                    <Checkbox
                                      value={tax.id}
                                    >{tax.name + (tax.tax_value ? `(${tax.tax_value}%)` : '')}
                                    </Checkbox>
                                ))}
                             </Checkbox.Group>)}
                        </Form.Item>
                        <Form.Item label="Other State Tax" {...formItemLayout}>
                            {getFieldDecorator('state_taxes', {initialValue: this.state.editingProcedureData && this.state.editingProcedureData.state_taxes ? this.state.editingProcedureData.state_taxes.map(item => item.id) : []})
                            (<Checkbox.Group >
                                {this.state.taxes.map((tax) => (
                                    <Checkbox
                                        value={tax.id}
                                    >{tax.name + (tax.tax_value ? `(${tax.tax_value}%)` : '')}
                                    </Checkbox>
                                ))}
                            </Checkbox.Group>)}
                        </Form.Item>
                        <Form.Item label="Procedure Retail Price" {...formItemLayout}>
                            <span className="ant-form-text"><b>{that.state.retail_price}</b>&nbsp;INR</span>
                        </Form.Item>
                        <Form.Item key="margin" {...formItemLayout} label="MLM Margin">
                            {getFieldDecorator("margin", {
                                initialValue: this.state.editingProcedureData && this.state.editingProcedureData.margin ? this.state.editingProcedureData.margin.id : null,
                            })(
                                <Select>
                                    {this.state.productMargin.map((option) => (
                                        <Select.Option
                                          value={option.id}
                                        >{option.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>
                        <Form.Item key="under" {...formItemLayout} label="Add Under">
                            {getFieldDecorator("under", {
                                initialValue: this.state.editingProcedureData ? this.state.editingProcedureData.under : null,
                            })(
                                <Select disabled={this.state.editingProcedureData && this.state.editingProcedureData.children.length}>
                                    {this.state.procedure_category.map((option) => (
                                        <Select.Option
                                          value={option.id}
                                          disabled={(this.state.editingProcedureData && option.id == this.state.editingProcedureData.id)}
                                        >{option.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>
                        <Form.Item label="Default Note" {...formItemLayout}>
                            {getFieldDecorator('default_notes', {
                                initialValue: this.state.editingProcedureData ? this.state.editingProcedureData.default_notes : null,
                                rules: [{required: true, message: REQUIRED_FIELD_MESSAGE}]
                            })
                            (<Input placeholder="Default Note" />)}
                        </Form.Item>
                        <Form.Item>
                            <Button style={{margin: 5}} type="primary" htmlType="submit">
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

export default Form.create()(AddorEditProcedure);
