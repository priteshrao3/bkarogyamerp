import React, { Component } from 'react';
import { Button, Card, Divider, Form, Icon, Input, message, Select, Upload } from 'antd';
import { displayMessage, getAPI, interpolate, makeFileURL, makeURL, putAPI, postAPI } from '../../../../utils/common';
import { CITY, COUNTRY, FILE_UPLOAD_API, PRACTICE, STATE, ALL_PRACTICE } from '../../../../constants/api';
import { loadAllDoctors, loadConfigParameters } from '../../../../utils/clinicUtils';
import { SMS_LANGUAGE_CONFIG_PARAM } from '../../../../constants/hardData';
import { INPUT_FIELD, SELECT_FIELD } from '../../../../constants/dataKeys';

const mandatoryFiledRule = (option) => option ? {
    rules: [{
        required: true,
        message: 'This field is required!',
    }],
} : {};

class AddOrEditPractice extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            practiceDoctors: [],
            practiceDetail: null,
            [SMS_LANGUAGE_CONFIG_PARAM]: [],
            countryList: [],
            stateList: [],
            cityList: [],
            reg_country: null,
            reg_state: null,
        };
        loadAllDoctors(this);
    }

    componentDidMount = async () => {
        let that = this;
        let { practiceId } = this.props;
        if (practiceId) {
            await that.loadEditPractice();
        }
        await loadConfigParameters(this, [SMS_LANGUAGE_CONFIG_PARAM]);
        await that.getCountry();

    };

    loadEditPractice = () => {
        const that = this;
        const successFn = function(data) {
            let { reg_country, reg_state } = data;
            console.log('dat======', data);
            that.setState({
                reg_country,
                reg_state,
                practiceDetail: data,
            });
        };
        const errorFn = function() {
        };
        getAPI(interpolate(PRACTICE, [this.props.practiceId]), successFn, errorFn);
    };

    getCountry = async () => {
        let that = this;
        let successFn = async function(data) {
            that.setState({
                countryList: data,
            });
            await that.getState();
        };
        let errorFun = function() {

        };
        getAPI(COUNTRY, successFn, errorFun);
    };

    getState = async () => {
        let that = this;
        let { reg_country } = that.state;
        let successFn = async function(data) {
            await that.setState({
                stateList: data,
            });
            await that.getCity();

        };
        let errorFn = function() {

        };
        if(reg_country){
            getAPI(STATE, successFn, errorFn, { country: reg_country });
        }

    };

    getCity = () => {
        let that = this;
        let { reg_state } = that.state;
        let successFn = async function(data) {
            await that.setState({
                cityList: data,
            });

        };
        let errorFn = function() {

        };
        if(reg_state){
            getAPI(CITY, successFn, errorFn, {
                state: reg_state,
            });
        }

    };
    onChangeValue = async (type, value) => {
        const that = this;
        const { setFieldsValue } = this.props.form;
        await that.setState({
            [type]: value,
        });
        if (type == 'reg_country') {
            await setFieldsValue({ reg_state: null, reg_city: null });
            await that.getState();
        }
        if (type == 'reg_state') {
            await setFieldsValue({ reg_city: null });
            await that.getCity();
        }

    };


    handleSubmit = (e) => {
        const that = this;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('formValue', values);
                let reqData = {
                    ...values,
                };
                const key = 'image';
                if (reqData[key] && reqData[key].file && reqData[key].file.response)
                    reqData[key] = reqData[key].file.response.image_path;
                let successFn = function(data) {
                    displayMessage('Practice Saved Successfully!!');
                    that.setState({
                        loading: false,
                    });
                    that.props.history.replace('/erp/settings/clinics');
                };
                let errorFn = function() {
                    that.setState({
                        loading: false,
                    });
                };
                if(this.props.practiceId){
                putAPI(interpolate(PRACTICE, [this.props.practiceId]), reqData, successFn, errorFn);
                }
                else{
                    postAPI(ALL_PRACTICE, reqData, successFn, errorFn);
                }
            }
        });
    };

    render() {
        const that = this;
        let { loading, practiceDoctors, countryList, cityList, stateList, practiceDetail } = that.state;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 14 },
        };
        const singleUploadprops = {
            name: 'image',
            data: {
                name: 'hello',
            },
            action: makeURL(FILE_UPLOAD_API),
            headers: {
                authorization: 'authorization-text',
            },
            onChange(info) {
                if (info.file.status !== 'uploading') {

                }
                if (info.file.status === 'done') {
                    message.success(`${info.file.name} file uploaded successfully`);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`);
                }
            },
        };
        return (
            <div>
                <Card>
                    <h2>Practice Details</h2>

                    <Form onSubmit={that.handleSubmit}>
                        <Form.Item key="image" {...formItemLayout} label="Patient Image">
                            {getFieldDecorator('image', { valuePropName: 'image' })(
                                <Upload {...singleUploadprops}>
                                    <Button>
                                        <Icon type="upload"/> Select File
                                    </Button>
                                    {/*{this.state.patientDetails && this.state.patientDetails.image ? (*/}
                                    {/*    <img*/}
                                    {/*        src={makeFileURL(this.state.patientDetails ? this.state.patientDetails.image : null)}*/}
                                    {/*        style={{maxWidth: '100%'}}*/}
                                    {/*    />*/}
                                    {/*) : null}*/}
                                </Upload>,
                            )}

                        </Form.Item>
                        <Form.Item
                            {...formItemLayout}
                            key={'name'}
                            label={'Practice Name'}
                        >
                            {getFieldDecorator('name', {
                                rules: [{ required: true, message: 'This field is required!' }],
                                initialValue: practiceDetail ? practiceDetail.name : '',
                            })
                            (<Input placeholder="Practice Name"/>)
                            }

                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            key={'tagline'}
                            label={'Practice Tagline'}
                        >
                            {getFieldDecorator('tagline', {
                                rules: [{ required: true, message: 'This field is required!' }],
                                initialValue: practiceDetail ? practiceDetail.tagline : '',
                            })
                            (<Input placeholder="Practice Tagline"/>)
                            }

                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            key={'specialisation'}
                            label={'Practice Specialisation'}
                        >
                            {getFieldDecorator('specialisation', {
                                initialValue: practiceDetail ? practiceDetail.specialisation : '',
                            })
                            (<Input placeholder="Practice Specialisation"/>)
                            }

                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            key={'address'}
                            label={'Practice Street Address'}
                        >
                            {getFieldDecorator('address', {
                                initialValue: practiceDetail ? practiceDetail.address : '',
                            })
                            (<Input placeholder="Practice Street Address"/>)
                            }

                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            key={'locality'}
                            label={'Practice Locality'}
                        >
                            {getFieldDecorator('locality', {
                                initialValue: practiceDetail ? practiceDetail.locality : '',
                            })
                            (<Input placeholder="Practice Locality"/>)
                            }

                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            key={'country'}
                            label={'Practice Country'}
                        >
                            {getFieldDecorator('country', {
                                initialValue: practiceDetail ? practiceDetail.country : '',
                            })
                            (<Input placeholder="Practice Country"/>)
                            }

                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            key={'state'}
                            label={'Practice State'}
                        >
                            {getFieldDecorator('state', {
                                initialValue: practiceDetail ? practiceDetail.state : '',
                            })
                            (<Input placeholder="Practice State"/>)
                            }

                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            key={'city'}
                            label={'Practice City'}
                        >
                            {getFieldDecorator('city', {
                                initialValue: practiceDetail ? practiceDetail.city : '',
                            })
                            (<Input placeholder="Practice City"/>)
                            }

                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            key={'pincode'}
                            label={'Practice PINCODE'}
                        >
                            {getFieldDecorator('pincode', {
                                initialValue: practiceDetail ? practiceDetail.pincode : '',
                            })
                            (<Input placeholder="Practice PINCODE"/>)
                            }

                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            key={'contact'}
                            label={'Practice Contact Number'}
                        >
                            {getFieldDecorator('contact', {
                                initialValue: practiceDetail ? practiceDetail.contact : '',
                            })
                            (<Input placeholder="Practice Contact Number"/>)
                            }

                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            key={'email'}
                            label={'Practice Email'}
                        >
                            {getFieldDecorator('email', {
                                initialValue: practiceDetail ? practiceDetail.email : '',
                            })
                            (<Input placeholder="Practice Email"/>)
                            }

                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            key={'language'}
                            label={'SMS Language '}
                        >
                            {getFieldDecorator('language', {
                                initialValue: practiceDetail ? practiceDetail.language : [],
                            })
                            (<Select placeholder="SMS Language ">
                                {this.state[SMS_LANGUAGE_CONFIG_PARAM].map((option) => (
                                    <Select.Option
                                        value={option}
                                    >{option}
                                    </Select.Option>
                                ))}
                            </Select>)}


                        </Form.Item>


                        <Form.Item
                            {...formItemLayout}
                            key={'website'}
                            label={'Practice Website'}
                        >
                            {getFieldDecorator('website', {
                                initialValue: practiceDetail ? practiceDetail.website : '',
                            })
                            (<Input placeholder="Practice Website"/>)
                            }

                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            key={'invoice_prefix'}
                            label={'Invoice Prefix'}
                        >
                            {getFieldDecorator('invoice_prefix', {
                                rules: [{ required: true, message: 'This field is required!' }],
                                initialValue: practiceDetail ? practiceDetail.invoice_prefix : '',
                            })
                            (<Input placeholder="DEL/INV/"/>)
                            }

                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            key={'proforma_prefix'}
                            label={'Proforma Prefix'}
                        >
                            {getFieldDecorator('proforma_prefix', {
                                rules: [{ required: true, message: 'This field is required!' }],
                                initialValue: practiceDetail ? practiceDetail.proforma_prefix : '',
                            })
                            (<Input placeholder="DEL/PRO/"/>)
                            }

                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            key={'payment_prefix'}
                            label={'Payment Prefix'}
                        >
                            {getFieldDecorator('payment_prefix', {
                                initialValue: practiceDetail ? practiceDetail.payment_prefix : '',
                            })
                            (<Input placeholder="DEL/RCPT/"/>)
                            }

                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            key={'return_prefix'}
                            label={'Return Prefix'}
                        >
                            {getFieldDecorator('return_prefix', {
                                initialValue: practiceDetail ? practiceDetail.return_prefix : '',
                            })
                            (<Input placeholder="DEL/RET/"/>)
                            }

                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            key={'default_doctor'}
                            label={'Default Doctor'}
                        >
                            {getFieldDecorator('default_doctor', {
                                initialValue: practiceDetail ? practiceDetail.default_doctor : [],
                            })
                            (<Select placeholder="Default Doctor">
                                {practiceDoctors.map((option) => (
                                    <Select.Option
                                        value={option.id}
                                    >{option.user.first_name}
                                    </Select.Option>
                                ))}
                            </Select>)}


                        </Form.Item>


                        <Form.Item
                            {...formItemLayout}
                            key={'gstin'}
                            label={'GSTIN'}
                        >
                            {getFieldDecorator('gstin', {
                                initialValue: practiceDetail ? practiceDetail.gstin : '',
                            })
                            (<Input placeholder="GSTIN"/>)
                            }

                        </Form.Item>


                        <Form.Item key="reg_country" {...formItemLayout} label="Country">
                            {getFieldDecorator('reg_country', {
                                ...mandatoryFiledRule(!(this.state.country && this.state.country == INPUT_FIELD)),
                                initialValue: practiceDetail ? practiceDetail.reg_country : [],
                            })(
                                <Select
                                    placeholder="Select Country"
                                    onChange={(value) => this.onChangeValue('reg_country', value)}
                                    showSearch
                                    optionFilterProp="children"
                                >

                                    {countryList.map((option) => (
                                        <Select.Option
                                            value={option.id}
                                        >{option.name}
                                        </Select.Option>
                                    ))}
                                </Select>,
                            )}

                        </Form.Item>

                        <Form.Item key="reg_state" {...formItemLayout} label="State">
                            {getFieldDecorator('reg_state', {
                                ...mandatoryFiledRule(!(this.state.country == INPUT_FIELD || this.state.state && this.state.state == INPUT_FIELD)),
                                initialValue: practiceDetail ? practiceDetail.reg_state : [],
                            })(
                                <Select
                                    placeholder="Select State"
                                    onChange={(value) => this.onChangeValue('reg_state', value)}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {stateList.map((option) => (
                                        <Select.Option
                                            value={option.id}
                                        >{option.name}
                                        </Select.Option>
                                    ))}
                                </Select>,
                            )}
                        </Form.Item>

                        <Form.Item key="reg_city" {...formItemLayout} label="City">
                            {getFieldDecorator('reg_city', {
                                ...mandatoryFiledRule(!(this.state.country == INPUT_FIELD || this.state.state == INPUT_FIELD || this.state.city && this.state.city == INPUT_FIELD)),
                                initialValue: practiceDetail ? practiceDetail.reg_city : [],
                            })(
                                <Select showSearch optionFilterProp="children" placeholder="Select City">
                                    {cityList.map((option) => (
                                        <Select.Option
                                            value={option.id}
                                        >{option.name}
                                        </Select.Option>
                                    ))}
                                </Select>,
                            )}
                        </Form.Item>


                        <Form.Item>
                            {that.props.history ? (
                                <Button style={{ margin: 5 }} onClick={() => that.props.history.goBack()}>
                                    Cancel
                                </Button>
                            ) : null}
                            <Button style={{ margin: 5 }} type="primary" htmlType="submit" loading={loading}>
                                Save
                            </Button>

                        </Form.Item>
                    </Form>
                </Card>
            </div>
        );
    }
}

export default Form.create()(AddOrEditPractice);
