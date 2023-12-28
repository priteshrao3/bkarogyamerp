import { Button, Card, Form, Input, Select, Spin } from 'antd';
import React from 'react';
import { ERROR_MSG_TYPE, SUCCESS_MSG_TYPE } from '../../../constants/dataKeys';
import { displayMessage, getAPI, postAPI, interpolate } from '../../../utils/common';
import { CALL_DATA, CITY, COUNTRY, MEDICAL_HISTORY, STATE } from '../../../constants/api';
import { loadConfigParameters } from '../../../utils/clinicUtils';

const { Option } = Select;

class AddOrEditCallData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editingData: {},
            countrylist: [],
            stateList: [],
            cityList: [],
            loading: false,
        };
    }

    componentDidMount() {
        this.loadMedicalHistory();
        this.getCountry();
        loadConfigParameters(this, ['config_call_response']);
        if (this.props.match.params.id) {
            this.loadCallData(this.props.match.params.id);
        }

    }

    getCountry() {
        let that = this;
        let successFn = function(data) {
            that.setState({
                countrylist: data,
            });
        };
        let errorFun = function() {

        };
        getAPI(COUNTRY, successFn, errorFun);
    }

    getState(countryId) {
        let that = this;
        let successFn = function(data) {
            that.setState({
                stateList: data,
            });

        };
        let errorFn = function() {

        };
        getAPI(STATE, successFn, errorFn, { country: countryId });
    }

    getCity(stateId) {
        let that = this;
        let successFn = function(data) {
            that.setState({
                cityList: data,
            });

        };
        let errorFn = function() {

        };
        getAPI(CITY, successFn, errorFn, { state: stateId });

    }

    loadCallData = (id) => {
        let that = this;
        that.setState({
            loading: true,
        });
        let successFn = function(data) {
            that.setState(function(prevState) {
                if (data.count == 1) {
                    let editingData = data.results[0];
                    if (editingData.medical_history) {
                        editingData.medical_history = editingData.medical_history.map(item => item.id);
                    }
                    if (editingData.country)
                        that.getState(editingData.country.id);
                    if (editingData.state)
                        that.getCity(editingData.state.id);
                    return {
                        editingData: editingData,
                        loading: false,
                    };
                }
                return {
                    loading: false,
                };
            });
        };
        let errorFn = function() {
            that.setState({
                loading: false,
            });
        };
        let apiParams = { id: id };
        getAPI(CALL_DATA, successFn, errorFn, apiParams);
    };
    onChangeValue = (type, value) => {
        let that = this;
        that.setState({
            [type]: value,
        }, function() {
            if (type == 'country') {
                that.getState(value);
            }
            if (type == 'state') {
                that.getCity(value);
            }
        });
    };
    handleSubmit = (e) => {
        let that = this;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let reqData = { ...values, created_staff: that.props.user.staff.id };
                if (that.state.editingData.id)
                    reqData.id = that.state.editingData.id;
                let successFn = function(data) {
                    that.props.history.push('/erp/advisors/calldata');
                    displayMessage(SUCCESS_MSG_TYPE, 'Data Updated Successfully!!');
                };
                let errorFn = function() {
                    displayMessage(ERROR_MSG_TYPE, 'Something went wrong!!');
                };
                postAPI(CALL_DATA, reqData, successFn, errorFn);
            }
        });
    };

    loadMedicalHistory = () => {
        const that = this;
        const successFn = function(data) {
            that.setState({
                history: data,
            });
        };
        const errorFn = function() {
        };
        getAPI(interpolate(MEDICAL_HISTORY, [this.props.active_practiceId]), successFn, errorFn);
    };

    render() {
        let that = this;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = ({
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        });
        const { editingData, loading } = this.state;
        const historyOption = [];
        if (this.state.history) {
            this.state.history.forEach(function(historyItem) {
                historyOption.push({ label: (historyItem.name), value: historyItem.id });
            });
        }
        return (<div >
            <Spin spinning={loading}>
                <Form onSubmit={that.handleSubmit}>
                    <Card title={editingData.id ? 'Edit Call Record' : 'Add Call Records'}
                          extra={<> <Button type="primary" htmlType="submit">Save</Button>
                              {that.props.history ?
                                  <Button style={{ margin: 5 }} onClick={() => that.props.history.goBack()}>
                                      Cancel
                                  </Button> : null}</>
                          }>

                        <Form.Item label="Name" {...formItemLayout}>
                            {getFieldDecorator('name', {
                                initialValue: editingData.name
                            })
                            (<Input placeholder="Name"/>)
                            }
                        </Form.Item>


                        <Form.Item label="Mobile " {...formItemLayout}>
                            {getFieldDecorator('mobile', {
                                initialValue: editingData.mobile,
                                rules: [{ required: true, message: 'Input Mobile Number' }],
                            })
                            (<Input placeholder="Mobile Number (Primary)"/>)
                            }
                        </Form.Item>

                        <Form.Item key={'country'} {...formItemLayout} label={'Country'}>
                            {getFieldDecorator('country', {
                                initialValue: editingData.country ? editingData.country.id : '',
                            })(
                                <Select onChange={(value) => this.onChangeValue('country', value)}>

                                    {this.state.countrylist.map((option) => <Select.Option
                                        value={option.id}>{option.name}</Select.Option>)}
                                </Select>
                            )}

                        </Form.Item>


                        <Form.Item key={'state'} {...formItemLayout} label={'State'}>
                            {getFieldDecorator('state', {
                                initialValue: editingData.state ? editingData.state.id : '',
                            })(
                                <Select onChange={(value) => this.onChangeValue('state', value)}>
                                    {this.state.stateList.map((option) => <Select.Option
                                        value={option.id}>{option.name}</Select.Option>)}
                                </Select>
                            )}
                        </Form.Item>

                        <Form.Item key={'City'} {...formItemLayout} label={'City'}>
                            {getFieldDecorator('city', {
                                initialValue: editingData.city ? editingData.city.id : '',
                            })(
                                <Select>
                                    {this.state.cityList.map((option) => <Select.Option
                                        value={option.id}>{option.name}</Select.Option>)}
                                </Select>
                            )}
                        </Form.Item>

                        <Form.Item label="Pincode" {...formItemLayout}>
                            {getFieldDecorator('pincode', { initialValue: editingData.pincode })
                            (<Input placeholder="PINCODE"/>)
                            }
                        </Form.Item>
                        <Form.Item label="Medical History" {...formItemLayout}>
                            {getFieldDecorator('medical_history', { initialValue: editingData.medical_history || [] })
                            (<Select placeholder="Medical History" mode="multiple" optionFilterProp="children">
                                {historyOption.map((option) => (
                                    <Select.Option
                                        value={option.value}
                                    >{option.label}
                                    </Select.Option>
                                ))}
                            </Select>)}
                        </Form.Item>
                        <Form.Item key={'status'} {...formItemLayout} label={'Response'}>
                            {getFieldDecorator('status', {
                                initialValue: editingData.status,
                            })(
                                <Select>
                                    {this.state.config_call_response && this.state.config_call_response.map((option) =>
                                        <Select.Option
                                            value={option}>{option}</Select.Option>)}
                                </Select>,
                            )}
                        </Form.Item>
                        <Form.Item label="Remark" {...formItemLayout}>
                            {getFieldDecorator('remarks', { initialValue: editingData.remarks })
                            (<Input.TextArea placeholder="Remarks" rows={4}/>)
                            }
                        </Form.Item>

                        <Form.Item>
                            {that.props.history ?
                                <Button style={{ margin: 5 }} onClick={() => that.props.history.goBack()}>
                                    Cancel
                                </Button> : null}
                            <Button type="primary" htmlType="submit">
                                Save
                            </Button>
                        </Form.Item>

                    </Card>
                </Form>
            </Spin>
        </div>);
    }
}

export default Form.create()(AddOrEditCallData);
