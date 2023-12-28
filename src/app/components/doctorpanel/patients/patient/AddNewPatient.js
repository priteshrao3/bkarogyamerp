import React from "react";
import {Route} from "react-router";

import {
    Button,
    Card,
    Form,
    Input,
    DatePicker,
    Select,
    Upload,
    Icon,
    message,
    Modal,
    Radio,
    InputNumber,
    Checkbox, Col, Row
} from "antd";
import {
    PATIENTS_LIST,
    PATIENT_PROFILE,
    FILE_UPLOAD_BASE64,
    FILE_UPLOAD_API,
    COUNTRY,
    STATE,
    CITY
} from "../../../../constants/api";
import {getAPI, postAPI, interpolate, displayMessage, putAPI, makeFileURL, makeURL} from "../../../../utils/common";
import moment from 'moment';
import {SUCCESS_MSG_TYPE, SELECT_FIELD, INPUT_FIELD, RELATION} from "../../../../constants/dataKeys";
import WebCamField from "../../common/WebCamField";
import {FAMILY_GROUPS, PATIENT_AGE} from "../../../../constants/hardData";

const {Option} = Select;

class AddNewPatient extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            webCamState: {},
            countrylist: [],
            stateList: [],
            cityList: [],
            relation_text: true,
            selectedFormType: 'DOB',

        }
        this.loadProfile = this.loadProfile.bind(this);
        this.changeRedirect = this.changeRedirect.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.getCountry = this.getCountry.bind(this);
        this.getState = this.getState.bind(this);
        this.getCity = this.getCity.bind(this);
    }

    componentDidMount() {
        // this.loadProfile();
        this.getCountry();
        // if(this.state.country){
        //     this.getState();
        // }
        // if(this.state.state){
        //     this.getCity();
        // }

    }


    getCountry() {
        let that = this;
        let successFn = function (data) {
            that.setState({
                countrylist: data,
            })
        };
        let errorFun = function () {

        };
        getAPI(COUNTRY, successFn, errorFun);
    }

    getState(countryId) {
        let that = this;
        let successFn = function (data) {
            that.setState({
                stateList: data,
            })

        };
        let errorFn = function () {

        };
        getAPI(STATE, successFn, errorFn, {country: countryId});
    }

    getCity(stateId) {
        let that = this;
        let successFn = function (data) {
            that.setState({
                cityList: data,
            })

        };
        let errorFn = function () {

        };
        getAPI(CITY, successFn, errorFn, {state: stateId});

    }

    loadProfile() {
        let that = this;
        let successFn = function (data) {
            that.getState(data.country);
            that.getCity(data.state);
            that.setState({
                patientProfile: data,
                loading: false,
            });

        };
        let errorFn = function () {
            that.setState({
                loading: false
            })
        };
        if (that.props.currentPatient)
            getAPI(interpolate(PATIENT_PROFILE, [that.props.currentPatient.id]), successFn, errorFn);
    }

    changeRedirect() {
        var redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }


    handleSubmit = (e) => {
        let that = this;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let reqData = {
                    ...values,
                    referal: that.props.currentPatient.user.referer_code,
                    user: {
                        first_name: values.first_name ? values.first_name : '',
                        mobile: values.mobile,
                        email: values.email,

                    },
                    // on_dialysis: that.state.on_dialysis ? true : false,
                    // user: {
                    //     first_name: values.first_name,
                    //     // mobile:values.mobile,
                    //     // referer_code:values.referer_code,
                    //     // email: values.email
                    // },
                };

                if (values.anniversary) {
                    reqData.anniversary = moment(values.anniversary).format("YYYY-MM-DD");
                }

                if (values.dob) {
                    reqData.dob = moment(values.dob).format("YYYY-MM-DD");
                }
                if (values.age) {
                    reqData.is_age = true;
                    reqData.dob = moment().subtract(values.age, 'years').format("YYYY-MM-DD");
                }
                let key = 'image';
                if (reqData[key] && reqData[key].file && reqData[key].file.response)
                    reqData[key] = reqData[key].file.response.image_path;
                delete reqData.first_name;
                delete reqData.email;
                delete reqData.referer_code;
                delete reqData.mobile;
                delete reqData.medical_history;
                delete reqData.patient_group;
                delete reqData.age;
                that.setState({
                    loading: true
                });
                let successFn = function (data) {
                    that.setState({
                        loading: false
                    });
                    displayMessage(SUCCESS_MSG_TYPE, "Successfully Added");
                    that.props.history.push("/");
                }
                let errorFn = function () {
                    that.setState({
                        loading: false
                    });
                }
                postAPI(interpolate(PATIENTS_LIST, [that.props.match.params.id]), reqData, successFn, errorFn);
            }
        });
    }
    toggleWebCam = (type, value) => {
        this.setState(function (prevState) {
            return {
                webCamState: {...prevState.webCamState, [type]: value}
            }
        })
    }
    getImageandUpload = (fieldKey, image) => {
        let that = this;
        let reqData = new FormData();

        reqData.append('image', image);
        reqData.append('name', 'file');

        let successFn = function (data) {
            that.props.form.setFieldsValue({[fieldKey]: {file: {response: data}}});
            displayMessage(SUCCESS_MSG_TYPE, "Image Captured and processed.");
            that.setState(function (prevState) {
                return {
                    webCamState: {...prevState.webCamState, [fieldKey]: false}
                }
            })
        }
        let errorFn = function () {

        }
        postAPI(FILE_UPLOAD_BASE64, reqData, successFn, errorFn, {
            'content-type': 'multipart/form-data'
        });

    }
    onChangeValue = (type, value) => {
        let that = this;
        that.setState({
            [type]: value
        }, function () {
            if (type == 'country') {
                that.getState(value);
            }
            if (type == 'state') {
                that.getCity(value);
            }

        })

    }
    setFormParams = (type, value) => {
        this.setState({
            [type]: value
        })
    };
    onChangeCheckbox = (e) => {
        this.setState({
            on_dialysis: !this.state.on_dialysis,
        });
    };
    changeFormType = (e) => {
        this.setState({
            selectedFormType: e.target.value
        })

    };
    handleRelation = (e) => {
        if (e) {
            this.setState({
                relation_text: false,
            });
        } else {
            this.setState({
                relation_text: true,
            });
        }

    };


    render() {
        let that = this;
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = ({
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        });
        const historyOption = []
        if (this.state.history) {
            this.state.history.forEach(function (historyItem) {
                historyOption.push({label: (historyItem.name), value: historyItem.id});
            })
        }
        const patientGroupOption = []
        if (this.state.patientGroup) {
            this.state.patientGroup.forEach(function (patientGroupItem) {
                patientGroupOption.push({label: (patientGroupItem.name), value: patientGroupItem.id});
            });
        }

        const membershipOption = []
        if (this.state.membership) {
            this.state.membership.forEach(function (membershipItem) {
                membershipOption.push({label: (membershipItem.name), value: membershipItem.id});
            });
        }
        const singleUploadprops = {
            name: 'image',
            data: {
                name: 'hello'
            },
            action: makeURL(FILE_UPLOAD_API),
            headers: {
                authorization: 'authorization-text',
            },
            onChange(info) {
                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    message.success(`${info.file.name} file uploaded successfully`);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`);
                }
            },
        };
        return (
            <Form onSubmit={that.handleSubmit}>
                <Card title="Add Patient" extra={<> <Button type="primary" htmlType="submit">Save</Button>
                    {that.props.history ?
                        <Button style={{margin: 5}} onClick={() => that.props.history.goBack()}>
                            Cancel
                        </Button> : null}</>
                }>

                    <Form.Item key={'image'} {...formItemLayout} label={'Image'}>
                        {getFieldDecorator('image', {valuePropName: 'image',})(
                            <Upload {...singleUploadprops}>
                                <Button>
                                    <Icon type="upload"/> Select File
                                </Button>
                                {this.state.patientProfile && this.state.patientProfile.image ?
                                    <img
                                        src={makeFileURL(this.state.patientProfile ? this.state.patientProfile.image : null)}
                                        style={{maxWidth: '100%'}}/> : null}
                            </Upload>
                        )}
                        <span className="ant-form-text">
                            <Row>
                                <Col xs={0} sm={0} md={24} lg={24}>
                                    <a onClick={() => that.toggleWebCam('image', Math.random())}>
                                        Open Webcam
                                    </a>
                                </Col>
                            </Row>
                        </span>
                        <Modal
                            footer={null}
                            onCancel={() => that.toggleWebCam('image', false)}
                            visible={!!that.state.webCamState['image']}
                            width={680}
                            key={that.state.webCamState['image']}>
                            <WebCamField getScreenShot={(value) => that.getImageandUpload('image', value)}/>
                        </Modal>
                    </Form.Item>
                    <Form.Item label="Name" {...formItemLayout}>
                        {getFieldDecorator('first_name', {initialValue: this.state.patientProfile ? this.state.patientProfile.user.first_name : null})
                        (<Input placeholder="Name"/>)
                        }
                    </Form.Item>

                    <Form.Item label="Aadhar ID" {...formItemLayout}>
                        {getFieldDecorator('aadhar_id', {initialValue: this.state.patientProfile ? this.state.patientProfile.aadhar_id : null})
                        (<Input placeholder="Aadhar Number"/>)
                        }
                    </Form.Item>

                    <Form.Item label="Gender" {...formItemLayout}>
                        {getFieldDecorator('gender', {initialValue: this.state.patientProfile ? this.state.patientProfile.gender : null})
                        (<Select>
                            <Option value="male">Male</Option>
                            <Option value="female">Female</Option>
                            <Option value="other">Other</Option>
                        </Select>)
                        }
                    </Form.Item>

                    <Form.Item label=' ' {...formItemLayout} colon={false}>
                        <Radio.Group buttonStyle="solid" size="small" onChange={this.changeFormType}
                                     defaultValue={this.state.selectedFormType}>
                            {PATIENT_AGE.map((item) => <Radio value={item.value}>{item.label}</Radio>)}
                        </Radio.Group>
                    </Form.Item>
                    {this.state.selectedFormType == 'DOB' ?
                        <Form.Item label="DOB" {...formItemLayout}>
                            {getFieldDecorator('dob', {initialValue: this.state.patientProfile && this.state.patientProfile.dob ? moment(this.state.patientProfile.dob) : ''})
                            (<DatePicker/>)
                            }
                        </Form.Item>
                        : <Form.Item label="Age" {...formItemLayout}>
                            {getFieldDecorator('age', {initialValue: this.state.patientProfile && this.state.patientProfile.dob ? moment().diff(this.state.patientProfile.dob, 'years') : null})
                            (<InputNumber min={0} max={120} placeholder="Age"/>)
                            }
                        </Form.Item>}

                    {/*<Form.Item label="Anniversary" {...formItemLayout}>*/}
                    {/*    {getFieldDecorator('anniversary', {initialValue: this.state.patientProfile && this.state.patientProfile.anniversary ? moment(this.state.patientProfile.anniversary) : null})*/}
                    {/*    (<DatePicker/>)*/}
                    {/*    }*/}
                    {/*</Form.Item>*/}

                    {/*<Form.Item label="Blood Group" {...formItemLayout}>*/}
                    {/*    {getFieldDecorator('blood_group', {initialValue: this.state.patientProfile ? this.state.patientProfile.blood_group : null})*/}
                    {/*    (<Input placeholder="Blood Group"/>)*/}
                    {/*    }*/}
                    {/*</Form.Item>*/}

                    {/*<Form.Item label="Family" {...formItemLayout}>*/}
                    {/*    <Form.Item style={{display: 'inline-block', width: 'calc(30% - 12px)'}}>*/}
                    {/*        {getFieldDecorator("family_relation", {initialValue: this.state.patientProfile && this.state.patientProfile.family_relation != null ? this.state.patientProfile.family_relation : RELATION})*/}
                    {/*        (<Select onChange={(value) => this.handleRelation(value)}>*/}
                    {/*            <Select.Option value={''}>{RELATION}</Select.Option>*/}
                    {/*            {FAMILY_GROUPS.map((option) => <Select.Option*/}
                    {/*                value={option.value}>{option.name}</Select.Option>)}*/}
                    {/*        </Select>)*/}
                    {/*        }*/}
                    {/*    </Form.Item>*/}
                    {/*    <span style={{display: 'inline-block', width: '14px', textAlign: 'center'}}/>*/}
                    {/*    <Form.Item style={{display: 'inline-block', width: 'calc(50% - 12px)'}}>*/}
                    {/*        {getFieldDecorator("attendee", {initialValue: this.state.patientProfile ? this.state.patientProfile.attendee : ''})*/}
                    {/*        (<Input disabled={ this.state.patientProfile && this.state.patientProfile.attendee ?false:this.state.relation_text}/>)*/}
                    {/*        }*/}
                    {/*    </Form.Item>*/}
                    {/*</Form.Item>*/}

                    <Form.Item label="Mobile (Primary)" {...formItemLayout}>
                        {getFieldDecorator('mobile', {
                            initialValue: this.state.patientProfile ? this.state.patientProfile.user.mobile : null,
                            rules: [{required: true, message: 'Input Mobile Number'}]
                        })
                        (<Input placeholder="Mobile Number (Primary)"/>)
                        }
                    </Form.Item>

                    <Form.Item label="Mobile (Secondary)" {...formItemLayout}>
                        {getFieldDecorator('secondary_mobile_no', {initialValue: this.state.patientProfile ? this.state.patientProfile.secondary_mobile_no : null})
                        (<Input placeholder="Mobile Number (Secondary)"/>)
                        }
                    </Form.Item>

                    <Form.Item label="Landline" {...formItemLayout}>
                        {getFieldDecorator('landline_no', {initialValue: this.state.patientProfile ? this.state.patientProfile.landline_no : null})
                        (<Input placeholder="Landline Number"/>)
                        }
                    </Form.Item>

                    <Form.Item label="Address" {...formItemLayout}>
                        {getFieldDecorator('address', {initialValue: this.state.patientProfile ? this.state.patientProfile.address : null})
                        (<Input placeholder="Address"/>)
                        }
                    </Form.Item>

                    <Form.Item label="Locality" {...formItemLayout}>
                        {getFieldDecorator('locality', {initialValue: this.state.patientProfile ? this.state.patientProfile.locality : null})
                        (<Input placeholder="Locality"/>)
                        }
                    </Form.Item>

                    {this.state.country && this.state.country == INPUT_FIELD ?
                        <Form.Item key={'country_extra'} label={"Country"}  {...formItemLayout}>
                            {getFieldDecorator("country_extra", {
                                initialValue: ''

                            })(
                                <Input/>
                            )}
                            <a onClick={() => that.setFormParams('country', SELECT_FIELD)}>Choose
                                Country</a>
                        </Form.Item>
                        : <Form.Item key={"country"} {...formItemLayout} label={"Country"}>
                            {getFieldDecorator("country", {
                                initialValue: this.state.patientProfile && this.state.patientProfile.country_data ? this.state.patientProfile.country_data.id : '',
                            })(
                                <Select onChange={(value) => this.onChangeValue("country", value)}>

                                    {this.state.countrylist.map((option) => <Select.Option
                                        value={option.id}>{option.name}</Select.Option>)}
                                </Select>
                            )}
                            <a onClick={() => that.setFormParams('country', INPUT_FIELD)}>Add New
                                Country</a>
                        </Form.Item>
                    }

                    {this.state.country == INPUT_FIELD || this.state.state && this.state.state == INPUT_FIELD ?
                        <Form.Item key={'state_extra'} label={"State"}  {...formItemLayout}>
                            {getFieldDecorator("state_extra", {
                                initialValue: ''

                            })(
                                <Input/>
                            )}
                            <a onClick={() => that.setFormParams('state', SELECT_FIELD)}>Choose
                                State</a>
                        </Form.Item>
                        : <Form.Item key={"state"} {...formItemLayout} label={"State"}>
                            {getFieldDecorator("state", {
                                initialValue: this.state.patientProfile && this.state.patientProfile.state_data ? this.state.patientProfile.state_data.id : '',
                            })(
                                <Select onChange={(value) => this.onChangeValue("state", value)}>
                                    {this.state.stateList.map((option) => <Select.Option
                                        value={option.id}>{option.name}</Select.Option>)}
                                </Select>
                            )}
                            <a onClick={() => that.setFormParams('state', INPUT_FIELD)}>Add New
                                state</a>
                        </Form.Item>
                    }
                    {this.state.country == INPUT_FIELD || this.state.state == INPUT_FIELD || this.state.city && this.state.city == INPUT_FIELD ?
                        <Form.Item key={'city_extra'} label={"City"}  {...formItemLayout}>
                            {getFieldDecorator("city_extra", {
                                initialValue: ''
                            })(
                                <Input/>
                            )}
                            <a onClick={() => that.setFormParams('city', SELECT_FIELD)}>Choose
                                City</a>
                        </Form.Item>
                        : <Form.Item key={"City"} {...formItemLayout} label={"City"}>
                            {getFieldDecorator("city", {
                                initialValue: this.state.patientProfile && this.state.patientProfile.city_data ? this.state.patientProfile.city_data.id : '',
                            })(
                                <Select>
                                    {this.state.cityList.map((option) => <Select.Option
                                        value={option.id}>{option.name}</Select.Option>)}
                                </Select>
                            )}
                            <a onClick={() => that.setFormParams('city', INPUT_FIELD)}>Add New
                                City</a>
                        </Form.Item>
                    }

                    {/* <Form.Item label="City" {...formItemLayout}>
                        {getFieldDecorator('city', {initialValue: this.state.patientProfile ? this.state.patientProfile.city : null})
                        (<Input placeholder="Patient City"/>)
                        }
                    </Form.Item> */}

                    <Form.Item label="Pincode" {...formItemLayout}>
                        {getFieldDecorator('pincode', {initialValue: this.state.patientProfile ? this.state.patientProfile.pincode : null})
                        (<Input placeholder="PINCODE"/>)
                        }
                    </Form.Item>

                    <Form.Item label="Email" {...formItemLayout}>
                        {getFieldDecorator('email', {
                            initialValue: this.state.patientProfile ? this.state.patientProfile.user.email : null,
                            rules: [{required: true, message: 'Input Email ID!'}]
                        })
                        (<Input placeholder="Email"/>)
                        }
                    </Form.Item>

                    {/*<Form.Item label="On Dialysis" {...formItemLayout}>*/}
                    {/*    {getFieldDecorator('on_dialysis', {initialValue: this.state.patientProfile ? this.state.patientProfile.on_dialysis : false})*/}
                    {/*    (<Checkbox onChange={(e) => this.onChangeCheckbox(e)} style={{paddingTop: '4px'}} />)*/}
                    {/*    }*/}
                    {/*</Form.Item>*/}

                    <Form.Item>
                        {that.props.history ?
                            <Button style={{margin: 5}} onClick={() => that.props.history.goBack()}>
                                Cancel
                            </Button> : null}
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                    </Form.Item>

                </Card>
            </Form>)
    }
}

export default Form.create()(AddNewPatient);
