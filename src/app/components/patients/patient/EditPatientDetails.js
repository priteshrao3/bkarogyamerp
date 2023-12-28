import React from "react";
import {
    Button,
    Card,
    Checkbox,
    DatePicker,
    Form,
    Icon,
    Input,
    message,
    Modal,
    Select,
    Radio,
    Upload,
    InputNumber,
    Popover, Row, Col,
} from "antd";
import moment from 'moment';
import {Link} from "react-router-dom";
import {
    FILE_UPLOAD_API,
    FILE_UPLOAD_BASE64,
    MEDICAL_HISTORY,
    MEMBERSHIP_API,
    PATIENT_GROUPS,
    PATIENT_PROFILE,
    PATIENTS_LIST,
    COUNTRY,
    STATE,
    CITY, SOURCE, HR_SETTING,
} from "../../../constants/api";
import {
    displayMessage,
    getAPI,
    interpolate,
    makeFileURL,
    makeURL,
    postAPI,
    putAPI,
    removeEmpty
} from "../../../utils/common";
import WebCamField from "../../common/WebCamField";
import {SUCCESS_MSG_TYPE, INPUT_FIELD, SELECT_FIELD, RELATION} from "../../../constants/dataKeys";
import {
    PATIENT_AGE,
    BLOOD_GROUP_CONFIG_PARAM,
    PATIENT_SOURCE_CONFIG_PARAM,
    SMS_LANGUAGE_CONFIG_PARAM,
    FAMILY_RELATION_CONFIG_PARAM,
    GENDER_CONFIG_PARAM
} from "../../../constants/hardData";
import {loadAllDoctors, loadConfigParameters} from "../../../utils/clinicUtils";


const {confirm} = Modal;

const mandatoryFiledRule = (option) => option ? {rules: [{required: true, message: 'This field is required!'}]} : {};

class EditPatientDetails extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            history: [],
            patientGroup: [],
            membership: [],
            webCamState: {},
            countrylist: [],
            stateList: [],
            cityList: [],
            sourceList: [],
            hrsetting:[],
            country: this.props.currentPatient && this.props.currentPatient.country_data ? this.props.currentPatient.country : null,
            state: this.props.currentPatient && this.props.currentPatient.state_data ? this.props.currentPatient.state : null,
            selectedFormType: 'DOB',
            file_count: 10,
            file_enable: true,
            relation_text: true,
            loading: false,
            [BLOOD_GROUP_CONFIG_PARAM]: [],
            [PATIENT_SOURCE_CONFIG_PARAM]: [],
            [SMS_LANGUAGE_CONFIG_PARAM]: [],
            [FAMILY_RELATION_CONFIG_PARAM]: [],
            [GENDER_CONFIG_PARAM]: [],
            number: {},
            practiceDoctors: [],
            availablePractices: {}
        }
        this.changeRedirect = this.changeRedirect.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.getCountry = this.getCountry.bind(this);
        this.getState = this.getState.bind(this);
        this.getCity = this.getCity.bind(this);
        this.getSources = this.getSources.bind(this);
        this.getRelgion=this.getRelgion.bind(this);
        this.loadPatientData = this.loadPatientData.bind(this);
    }

    componentDidMount() {
        loadAllDoctors(this);
        this.loadMedicalHistory();
        this.getPatientGroup();
        this.getPatientMembership();
        this.getSources();
        this.getCountry();
        this.getRelgion();
        if (this.state.country) {
            this.getState();
        }
        if (this.state.state) {
            this.getCity();
        }
        if (this.props.currentPatient) {
            this.loadPatientData(this.props.currentPatient.id);
        }
        loadConfigParameters(this, [BLOOD_GROUP_CONFIG_PARAM, PATIENT_SOURCE_CONFIG_PARAM, SMS_LANGUAGE_CONFIG_PARAM, FAMILY_RELATION_CONFIG_PARAM, GENDER_CONFIG_PARAM])
    }

    getCountry() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                countrylist: data,
            })
        };
        const errorFun = function () {

        };
        getAPI(COUNTRY, successFn, errorFun);
    }

    // Edited arpit
  getRelgion(){
      const that=this;
      const successFn=function(data){
          that.setState({
              hrsetting:data
          })
      };
      const errorFun = function () {
    };
    getAPI(HR_SETTING, successFn, errorFun,{name:"Religion"});
  }

    getSources() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                sourceList: data,
            })
        };
        const errorFun = function () {

        };
        getAPI(SOURCE, successFn, errorFun);
    }

    getState() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                stateList: data,
            })

        };
        const errorFn = function () {

        };
        getAPI(STATE, successFn, errorFn, {country: this.state.country});


    }

    getCity() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                cityList: data,
            })

        };
        const errorFn = function () {

        };
        getAPI(CITY, successFn, errorFn, {
            state: this.state.state,
        });

    }

    getPatientMembership() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                membership: data
            })
        }
        const errorFn = function () {

        }
        getAPI(interpolate(MEMBERSHIP_API, [this.props.active_practiceId]), successFn, errorFn);
    }

    loadMedicalHistory = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                history: data,
            })
        };
        const errorFn = function () {

        };

        getAPI(interpolate(MEDICAL_HISTORY, [this.props.active_practiceId]), successFn, errorFn);

    };

    loadPatientData(patientId) {
        const that = this;
        const successFn = function (data) {
            const availablePractices = {}
            data.practices.forEach(function (practiceData) {
                availablePractices[practiceData.practice] = practiceData;
            });
            that.setState({
                availablePractices,
                patientDetails: data,
                loading: false
            })
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        getAPI(interpolate(PATIENT_PROFILE, [patientId]), successFn, errorFn);
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    setFormParams = (type, value) => {
        this.setState({
            [type]: value
        })
    }

    getPatientGroup = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                patientGroup: data,
                loading: false
            });
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })

        };
        getAPI(interpolate(PATIENT_GROUPS, [this.props.active_practiceId]), successFn, errorFn);
    }

    handleSubmit = (e) => {
        const that = this;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log(values)
                let reqData = {
                    ...values,
                    file_enable: !!values.file_enable,
                    file_count: values.file_count ? values.file_count : this.state.file_count,
                    on_dialysis: !!that.state.on_dialysis,
                    medical_history: values.medical_history,
                    patient_group: values.patient_group,
                    user: {
                        first_name: values.first_name ? values.first_name : '',
                        mobile: values.mobile,
                        email: values.email
                    },
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
                if (!values.custom_id) {
                    reqData.custom_id = null;
                } else {
                    reqData.custom_id = values.custom_id_pre + values.custom_id;
                }
                if (this.props.currentPatient) {
                    reqData.practices = that.props.currentPatient.practices;

                } else {
                    reqData.practices = [{practice: that.props.active_practiceId}];
                }
                const key = 'image';
                if (reqData[key] && reqData[key].file && reqData[key].file.response)
                    reqData[key] = reqData[key].file.response.image_path;
                delete reqData.first_name;
                delete reqData.email;
                delete reqData.referer_code;
                delete reqData.mobile;
                delete reqData.age;
                delete reqData.custom_id_pre;
                that.setState({
                    loading: true
                });
                const successFn = function (data) {
                    displayMessage("Patient Saved Successfully!!");
                    that.setState({
                        loading: false
                    });
                    that.props.history.replace(`/erp/patient/${data.id}/profile`)
                }
                const errorFn = function () {
                    that.setState({
                        loading: false
                    })
                }
                reqData = removeEmpty(reqData);
                reqData = {...reqData, file_enable: !!values.file_enable, on_dialysis: !!values.on_dialysis, is_dead: !!values.is_dead}
                if (that.props.currentPatient) {
                    putAPI(interpolate(PATIENT_PROFILE, [that.props.currentPatient.id]), reqData, successFn, errorFn);
                } else {
                    postAPI(interpolate(PATIENTS_LIST, [that.props.match.params.id]), reqData, successFn, errorFn);
                }
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
        const that = this;
        const reqData = new FormData();

        reqData.append('image', image);
        reqData.append('name', 'file');

        const successFn = function (data) {
            that.props.form.setFieldsValue({[fieldKey]: {file: {response: data}}});
            displayMessage(SUCCESS_MSG_TYPE, "Image Captured and processed.");
            that.setState(function (prevState) {
                return {
                    webCamState: {...prevState.webCamState, [fieldKey]: false}
                }
            })
        }
        const errorFn = function () {

        }
        postAPI(FILE_UPLOAD_BASE64, reqData, successFn, errorFn, {
            'content-type': 'multipart/form-data'
        });

    }

    onChangeValue = (type, value) => {
        const that = this;
        const {setFieldsValue} = this.props.form;
        that.setState({
            [type]: value
        }, function () {
            if (type == 'country') {
                setFieldsValue({state: null, city: null});
                that.getState();
            }
            if (type == 'state') {
                setFieldsValue({city: null});
                that.getCity();
            }

        })

    }

    setFormParams = (type, value) => {
        this.setState({
            [type]: value
        })
    };

    onChangeCheckbox = () => {
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

    onDeletePatient() {
        const that = this;
        confirm({
            title: 'Are you sure delete this patient?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                that.patientDelete();
            },

        });
    }

    patientDelete() {
        const that = this;
        const {id} = that.state.patientDetails
        const reqData = {'id': id, is_active: false}
        const successFn = function () {
            that.setState({
                loading: false,
            });
            displayMessage("Patient Deleted!!");
            that.props.history.push('/erp/patients/profile');
        };
        const errorFn = function () {
        };
        putAPI(interpolate(PATIENT_PROFILE, [id]), reqData, successFn, errorFn)
    };

    handleNumberChange = value => {
        this.setState({
            number: {
                ...numberValidation(value),
                value,
            },
        });
    }

    render() {
        const that = this;
        const {getFieldDecorator} = this.props.form;
        const {practiceDoctors} = this.state;
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

                }
                if (info.file.status === 'done') {
                    message.success(`${info.file.name} file uploaded successfully`);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`);
                }
            },
        };
        const tips =
            'Only numbers are allowed.';
        return (
            <Form onSubmit={that.handleSubmit}>
                <Card
                  title={(
                        <span>{that.props.currentPatient ? "Edit Profile" : "Add Patient"}&nbsp;&nbsp;
                            <Link to="/erp/patients/patientprintform">
                                Print Patient Form
                            </Link>
                        </span>
                    )}
                  extra={(
                        <div><Button style={{margin: 5}} type="primary" htmlType="submit">Save</Button>
                            {that.props.history ? (
                                <Button style={{margin: 5}} onClick={() => that.props.history.goBack()}>
                                    Cancel
                                </Button>
                            ) : null}

                            {that.props.currentPatient ? (
                                    <>
                                        {this.state.patientDetails && this.state.patientDetails.is_approved ? (
                                            <Popover
                                              placement="leftBottom"
                                              trigger="hover"
                                              content="An Agent is associated. Patient can not be deleted."
                                                // onConfirm={()=>that.patientDelete(this.state.patientDetails.id)}
                                                // // onCancel={cancel}
                                                // okText="Yes"
                                                // cancelText="No"
                                            >
                                                <Button style={{margin: 5}} type="danger" disabled>
                                                    Delete
                                                </Button>
                                            </Popover>
                                        ) : (
                                            that.props.activePracticePermissions.DeletePatient || that.props.allowAllPermissions ? (
                                                <Button
                                                  style={{margin: 5}}
                                                  onClick={() => that.onDeletePatient()}
                                                  type="danger"
                                                  disabled={!this.state.patientDetails}
                                                >
                                                    Delete
                                                </Button>
                                            ) : null
                                        )}
                                    </>
                                )
                                : null}


                        </div>
                    )}
                >
                    <Form.Item key="image" {...formItemLayout} label="Patient Image">
                        {getFieldDecorator('image', {valuePropName: 'image',})(
                            <Upload {...singleUploadprops}>
                                <Button>
                                    <Icon type="upload" /> Select File
                                </Button>
                                {this.state.patientDetails && this.state.patientDetails.image ? (
                                    <img
                                      src={makeFileURL(this.state.patientDetails ? this.state.patientDetails.image : null)}
                                      style={{maxWidth: '100%'}}
                                    />
                                ) : null}
                            </Upload>
                        )}
                        <span className="ant-form-text">
                                    <a onClick={() => that.toggleWebCam('image', Math.random())}>
                                        Open Webcam
                                    </a>
                        </span>
                        <Modal
                          footer={null}
                          onCancel={() => that.toggleWebCam('image', false)}
                          visible={!!that.state.webCamState.image}
                          width={680}
                          key={that.state.webCamState.image}
                        >
                            <WebCamField getScreenShot={(value) => that.getImageandUpload('image', value)} />
                        </Modal>
                    </Form.Item>
                    <Form.Item label="Patient Name" {...formItemLayout}>
                        {getFieldDecorator('first_name', {
                            rules: [{required: true, message: 'Input Patient Name!'}],
                            initialValue: this.state.patientDetails ? this.state.patientDetails.user.first_name : ''
                        })
                        (<Input placeholder="Patient Name" />)}
                    </Form.Item>
                    <Row>
                        <Col span={8}>
                            <Form.Item
                              label="Patient Id"
                              labelCol={{span: 18}}
                              wrapperCol={{span: 6}}
                            >
                                {getFieldDecorator('custom_id_pre', {
                                    initialValue: this.state.patientDetails && this.state.patientDetails.is_agent ? 'AD' : 'BK'
                                })
                                (<Select>
                                    <Select.Option value="BK">BK</Select.Option>
                                    <Select.Option value="AD">AD</Select.Option>
                                 </Select>)}
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item
                              labelCol={{span: 0}}
                              wrapperCol={{span: 18}}
                              validateStatus={this.state.number.validateStatus}
                              help={this.state.number.errorMsg || tips}
                            >
                                {getFieldDecorator('custom_id', {
                                    initialValue: this.state.patientDetails ? this.state.patientDetails.custom_id.replace(/\D/g, '') : ''
                                })
                                (<InputNumber

                                  style={{width: '100%'}}
                                  placeholder="Patient Id"
                                  onChange={this.handleNumberChange}
                                />)}
                            </Form.Item>
                        </Col>
                    </Row>

                    {this.state.source && this.state.source == INPUT_FIELD ? (
                            <Form.Item key="source_extra" label="Source" {...formItemLayout}>
                                {getFieldDecorator("source_extra", {
                                    initialValue: '',

                                })(
                                    <Input placeholder="Source" />
                                )}
                                <a onClick={() => that.setFormParams('source', SELECT_FIELD)}>Choose
                                    Source
                                </a>
                            </Form.Item>
                        )
                        : (
                            <Form.Item label="Source" {...formItemLayout}>
                                {getFieldDecorator('source', {initialValue: this.state.patientDetails ? this.state.patientDetails.source : null})
                                (<Select placeholder="Select Source" showSearch optionFilterProp="children">
                                    {this.state.sourceList.map((option) => (
                                        <Select.Option value={option.id}>
                                            {option.name}
                                        </Select.Option>
                                    ))}
                                 </Select>)}
                                {this.props.user.is_superuser ? (
                                    <a onClick={() => that.setFormParams('source', INPUT_FIELD)}>Enter New
                                        Source
                                    </a>
                                ) : null}
                            </Form.Item>
                        )}
                        {/* Edit by Arpit */}
                            <Form.Item label="Religion" {...formItemLayout}>
                                {getFieldDecorator('religion',{initialValue: this.state.patentDetails ? this.state.patientDetails.religion: null})
                                (<Select placeholder="Religion" showSearch optionFilterProp="children">
                                    {this.state.hrsetting.map((option) =>
                                    (
                                        <Select.Option value={option.id}>
                                            {option.value}
                                        </Select.Option>
                                    ))}
                                 </Select>)}
                            </Form.Item>
                    {/* {this.state.patientDetails ? null : */}
                    <Form.Item label="Referral Code" {...formItemLayout}>
                        {getFieldDecorator('referal', {initialValue: that.state.patientDetails && that.state.patientDetails.user.referer_data.referer ? that.state.patientDetails.user.referer_data.referer.referer_code : "",})
                        (<Input placeholder="Referral Code" />)}
                    </Form.Item>
                    {/* } */}
                    <Form.Item label="SMS Language" {...formItemLayout}>
                        {getFieldDecorator('language', {initialValue: this.state.patientDetails && this.state.patientDetails.language ? this.state.patientDetails.language : this.props.activePracticeData.language})
                        (<Select>
                            {this.state[SMS_LANGUAGE_CONFIG_PARAM].map((option) => (
                                <Select.Option value={option}>
                                    {option}
                                </Select.Option>
                            ))}
                         </Select>)}
                    </Form.Item>
                    <Form.Item label="Aadhar ID" {...formItemLayout}>
                        {getFieldDecorator('aadhar_id', {initialValue: this.state.patientDetails ? this.state.patientDetails.aadhar_id : ''})
                        (<Input placeholder="Patient Aadhar Number" />)}
                    </Form.Item>

                    <Form.Item label="Gender" {...formItemLayout}>
                        {getFieldDecorator('gender', {initialValue: this.state.patientDetails ? this.state.patientDetails.gender : null})
                        (<Select placeholder="Select Gender">
                            {this.state[GENDER_CONFIG_PARAM].map((option) => (
                                <Select.Option value={option.value}>
                                    {option.label}
                                </Select.Option>
                            ))}
                         </Select>)}
                    </Form.Item>


                    <Form.Item label=' ' {...formItemLayout} colon={false}>
                        <Radio.Group
                          buttonStyle="solid"
                          size="small"
                          onChange={this.changeFormType}
                          defaultValue={this.state.selectedFormType}
                        >
                            {PATIENT_AGE.map((item) => <Radio value={item.value}>{item.label}</Radio>)}
                        </Radio.Group>
                    </Form.Item>
                    {this.state.selectedFormType == 'DOB' ? (
                            <Form.Item label="DOB" {...formItemLayout}>
                                {getFieldDecorator('dob', {initialValue: this.state.patientDetails && this.state.patientDetails.dob ? moment(this.state.patientDetails.dob) : ''})
                                (<DatePicker />)}
                            </Form.Item>
                        )
                        : (
                            <Form.Item label="Age" {...formItemLayout}>
                                {getFieldDecorator('age', {initialValue: this.state.patientDetails && this.state.patientDetails.dob ? moment().diff(this.state.patientDetails.dob, 'years') : null})
                                (<InputNumber min={0} max={120} placeholder="00" />)}
                                <span className="ant-form-text">Years</span>
                            </Form.Item>
                        )}

                    <Form.Item label="Anniversary" {...formItemLayout}>
                        {getFieldDecorator('anniversary', {initialValue: this.state.patientDetails && this.state.patientDetails.anniversary ? moment(this.state.patientDetails.anniversary) : null})
                        (<DatePicker />)}
                    </Form.Item>

                    {/* <Form.Item label="Blood Group" {...formItemLayout}> */}
                    {/*    {getFieldDecorator('blood_group', {initialValue: this.props.currentPatient ? this.props.currentPatient.blood_group : ''}) */}
                    {/*    (<Input placeholder="Patient Blood Group"/>) */}
                    {/*    } */}
                    {/* </Form.Item> */}
                    <Form.Item label="Blood Group" {...formItemLayout}>
                        {getFieldDecorator("blood_group", {initialValue: this.state.patientDetails ? this.state.patientDetails.blood_group : ''})
                        (<Select placeholder="Blood Group">
                            {this.state[BLOOD_GROUP_CONFIG_PARAM].map((option) => (
                                <Select.Option
                                  value={option}
                                >{option}
                                </Select.Option>
                            ))}
                         </Select>)}
                    </Form.Item>

                    {/* <Form.Item label="Family" {...formItemLayout}> */}
                    {/*    {getFieldDecorator('family_relation', {initialValue: this.state.patientDetails ? this.props.currentPatient.family_relation : ''}) */}
                    {/*    (<Input placeholder="Patient Family Relation"/>) */}
                    {/*    } */}
                    {/* </Form.Item> */}

                    <Form.Item label="Family" {...formItemLayout}>
                        <Form.Item style={{display: 'inline-block', width: 'calc(30% - 12px)'}}>
                            {getFieldDecorator("family_relation1", {initialValue: this.state.patientDetails && this.state.patientDetails.family_relation1 != null ? this.state.patientDetails.family_relation1 : RELATION})
                            (<Select onChange={(value) => this.handleRelation(value)}>
                                <Select.Option value="">{RELATION}</Select.Option>
                                {this.state[FAMILY_RELATION_CONFIG_PARAM].map((option) => (
                                    <Select.Option
                                      value={option.value}
                                    >{option.name}
                                    </Select.Option>
                                ))}
                             </Select>)}
                        </Form.Item>
                        <span style={{display: 'inline-block', width: '14px', textAlign: 'center'}} />
                        <Form.Item style={{display: 'inline-block', width: 'calc(50% - 12px)'}}>
                            {getFieldDecorator("attendee1", {initialValue: this.state.patientDetails ? this.state.patientDetails.attendee1 : ''})
                            (<Input
                              placeholder="Family Member 1 Name"
                              disabled={this.state.patientDetails && this.state.patientDetails.attendee1 ? false : this.state.relation_text}
                            />)}
                        </Form.Item>
                        <Form.Item style={{display: 'inline-block', width: 'calc(50% - 12px)'}}>
                            {getFieldDecorator("attendee1_mobile_no", {initialValue: this.state.patientDetails ? this.state.patientDetails.attendee1_mobile_no : ''})
                            (<Input
                              placeholder="Family Member 1 Mobile No"
                              disabled={this.state.patientDetails && this.state.patientDetails.attendee1_mobile_no ? false : this.state.relation_text}
                            />)}
                        </Form.Item>
                    </Form.Item>
                    <Form.Item label="Family" {...formItemLayout}>
                        <Form.Item style={{display: 'inline-block', width: 'calc(30% - 12px)'}}>
                            {getFieldDecorator("family_relation2", {initialValue: this.state.patientDetails && this.state.patientDetails.family_relation2 != null ? this.state.patientDetails.family_relation2 : RELATION})
                            (<Select onChange={(value) => this.handleRelation(value)}>
                                <Select.Option value="">{RELATION}</Select.Option>
                                {this.state[FAMILY_RELATION_CONFIG_PARAM].map((option) => (
                                    <Select.Option
                                      value={option.value}
                                    >{option.name}
                                    </Select.Option>
                                ))}
                             </Select>)}
                        </Form.Item>
                        <span style={{display: 'inline-block', width: '14px', textAlign: 'center'}} />
                        <Form.Item style={{display: 'inline-block', width: 'calc(50% - 12px)'}}>
                            {getFieldDecorator("attendee2", {initialValue: this.state.patientDetails ? this.state.patientDetails.attendee2 : ''})
                            (<Input
                              placeholder="Family Member 2 Name"
                              disabled={this.state.patientDetails && this.state.patientDetails.attendee2 ? false : this.state.relation_text}
                            />)}
                        </Form.Item>
                        <Form.Item style={{display: 'inline-block', width: 'calc(50% - 12px)'}}>
                            {getFieldDecorator("attendee2_mobile_no", {initialValue: this.state.patientDetails ? this.state.patientDetails.attendee2_mobile_no : ''})
                            (<Input
                              placeholder="Family Member 2 Mobile No"
                              disabled={this.state.patientDetails && this.state.patientDetails.attendee2_mobile_no ? false : this.state.relation_text}
                            />)}
                        </Form.Item>
                    </Form.Item>

                    <Form.Item label="Mobile (Primary)" {...formItemLayout}>
                        {getFieldDecorator('mobile', {
                            initialValue: this.state.patientDetails ? this.state.patientDetails.user.mobile : null,
                            rules: [{required: true, message: 'Input Mobile Number'}]
                        })
                        (<Input placeholder="Patient Mobile Number (Primary)" />)}
                    </Form.Item>

                    <Form.Item label="Mobile (Secondary)" {...formItemLayout}>
                        {getFieldDecorator('secondary_mobile_no', {initialValue: this.state.patientDetails ? this.state.patientDetails.secondary_mobile_no : ''})
                        (<Input placeholder="Patient Mobile Number (Secondary)" />)}
                    </Form.Item>

                    <Form.Item label="Landline" {...formItemLayout}>
                        {getFieldDecorator('landline_no', {initialValue: this.state.patientDetails ? this.state.patientDetails.landline_no : ''})
                        (<Input placeholder="Patient Landline Number" />)}
                    </Form.Item>

                    <Form.Item label="Address" {...formItemLayout}>
                        {getFieldDecorator('address', {initialValue: this.state.patientDetails ? this.state.patientDetails.address : ''})
                        (<Input placeholder="Patient Address" />)}
                    </Form.Item>

                    <Form.Item label="Locality" {...formItemLayout}>
                        {getFieldDecorator('locality', {initialValue: this.state.patientDetails ? this.state.patientDetails.locality : ''})
                        (<Input placeholder="Patient Locality" />)}
                    </Form.Item>

                    {this.state.country && this.state.country == INPUT_FIELD ? (
                            <Form.Item key="country_extra" label="Country" {...formItemLayout}>
                                {getFieldDecorator("country_extra", {
                                    ...mandatoryFiledRule((this.state.country && this.state.country == INPUT_FIELD)),
                                    initialValue: '',

                                })(
                                    <Input placeholder="Country" />
                                )}
                                {this.props.user.is_superuser ? (
                                    <a onClick={() => that.setFormParams('country', SELECT_FIELD)}>Choose
                                        Country
                                    </a>
                                ) : null}
                            </Form.Item>
                        )
                        : (
                            <Form.Item key="country" {...formItemLayout} label="Country">
                                {getFieldDecorator("country", {
                                    ...mandatoryFiledRule(!(this.state.country && this.state.country == INPUT_FIELD)),
                                    initialValue: this.state.patientDetails && this.state.patientDetails.country_data ? this.state.patientDetails.country_data.id : '',
                                })(
                                    <Select
                                      placeholder="Select Country"
                                      onChange={(value) => this.onChangeValue("country", value)}
                                      showSearch
                                      optionFilterProp="children"
                                    >

                                        {this.state.countrylist.map((option) => (
                                            <Select.Option
                                              value={option.id}
                                            >{option.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
                                {this.props.user.is_superuser ? (
                                    <a onClick={() => that.setFormParams('country', INPUT_FIELD)}>Add New
                                        Country
                                    </a>
                                ) : null}
                            </Form.Item>
                        )}


                    {this.state.country == INPUT_FIELD || this.state.state && this.state.state == INPUT_FIELD ? (
                            <Form.Item key="state_extra" label="State" {...formItemLayout}>
                                {getFieldDecorator("state_extra", {
                                    ...mandatoryFiledRule((this.state.country == INPUT_FIELD || this.state.state && this.state.state == INPUT_FIELD)),
                                    initialValue: '',

                                })(
                                    <Input placeholder="State" />
                                )}
                                <a onClick={() => that.setFormParams('state', SELECT_FIELD)}>Choose
                                    State
                                </a>
                            </Form.Item>
                        )
                        : (
                            <Form.Item key="state" {...formItemLayout} label="State">
                                {getFieldDecorator("state", {
                                    ...mandatoryFiledRule(!(this.state.country == INPUT_FIELD || this.state.state && this.state.state == INPUT_FIELD)),
                                    initialValue: this.state.patientDetails && this.state.patientDetails.state_data ? this.state.patientDetails.state_data.id : '',
                                })(
                                    <Select
                                      placeholder="Select State"
                                      onChange={(value) => this.onChangeValue("state", value)}
                                      showSearch
                                      optionFilterProp="children"
                                    >
                                        {this.state.stateList.map((option) => (
                                            <Select.Option
                                              value={option.id}
                                            >{option.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
                                {this.props.user.is_superuser ? (
                                    <a onClick={() => that.setFormParams('state', INPUT_FIELD)}>Add New
                                        state
                                    </a>
                                ) : null}
                            </Form.Item>
                        )}
                    {this.state.country == INPUT_FIELD || this.state.state == INPUT_FIELD || this.state.city && this.state.city == INPUT_FIELD ? (
                            <Form.Item key="city_extra" label="City" {...formItemLayout}>
                                {getFieldDecorator("city_extra", {
                                    ...mandatoryFiledRule((this.state.country == INPUT_FIELD || this.state.state == INPUT_FIELD || this.state.city && this.state.city == INPUT_FIELD)),
                                    initialValue: '',
                                })(
                                    <Input placeholder="City" />
                                )}
                                <a onClick={() => that.setFormParams('city', SELECT_FIELD)}>Choose
                                    City
                                </a>
                            </Form.Item>
                        )
                        : (
                            <Form.Item key="City" {...formItemLayout} label="City">
                                {getFieldDecorator("city", {
                                    ...mandatoryFiledRule(!(this.state.country == INPUT_FIELD || this.state.state == INPUT_FIELD || this.state.city && this.state.city == INPUT_FIELD)),
                                    initialValue: this.state.patientDetails && this.state.patientDetails.city_data ? this.state.patientDetails.city_data.id : '',
                                })(
                                    <Select showSearch optionFilterProp="children" placeholder="Select City">
                                        {this.state.cityList.map((option) => (
                                            <Select.Option
                                              value={option.id}
                                            >{option.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
                                {this.props.user.is_superuser ? (
                                    <a onClick={() => that.setFormParams('city', INPUT_FIELD)}>Add New
                                        City
                                    </a>
                                ) : null}
                            </Form.Item>
                        )}


                    {/* <Form.Item label="City" {...formItemLayout}>
                        {getFieldDecorator('city_extra', {initialValue: this.props.currentPatient ? this.props.currentPatient.city : null})
                        (<Input placeholder="Patient City"/>)
                        }
                    </Form.Item> */}

                    <Form.Item label="Pincode" {...formItemLayout}>
                        {getFieldDecorator('pincode', {initialValue: this.state.patientDetails ? this.state.patientDetails.pincode : ''})
                        (<Input placeholder="Patient PINCODE" />)}
                    </Form.Item>

                    <Form.Item label="Email" {...formItemLayout}>
                        {getFieldDecorator('email', {
                            initialValue: this.state.patientDetails ? this.state.patientDetails.user.email : null,
                        })
                        (<Input placeholder="Patient Email" />)}
                    </Form.Item>
                    <Form.Item label="PD Doctor" {...formItemLayout}>
                        {getFieldDecorator("pd_doctor", {initialValue: this.state.patientDetails ? this.state.patientDetails.pd_doctor : false})
                        (<Select placeholder="PD Doctor">
                            {practiceDoctors.map((option) => (
                                <Select.Option
                                  value={option.id}
                                >{option.user.first_name}
                                </Select.Option>
                            ))}
                         </Select>)}
                    </Form.Item>
                    <Form.Item label="Medical History" {...formItemLayout}>
                        {getFieldDecorator("medical_history", {initialValue: this.state.patientDetails ? this.state.patientDetails.medical_history : []})
                        (<Select placeholder="Medical History" mode="multiple" optionFilterProp="children">
                            {historyOption.map((option) => (
                                <Select.Option
                                  value={option.value}
                                >{option.label}
                                </Select.Option>
                            ))}
                         </Select>)}
                    </Form.Item>

                    <Form.Item label="Patient Group" {...formItemLayout}>
                        {getFieldDecorator("patient_group", {initialValue: this.state.patientDetails ? this.state.patientDetails.patient_group : []})
                        (<Select placeholder="Patient Group" mode="multiple" optionFilterProp="children">
                            {patientGroupOption.map((option) => (
                                <Select.Option
                                  value={option.value}
                                >{option.label}
                                </Select.Option>
                            ))}
                         </Select>)}
                    </Form.Item>

                    <Form.Item label="On Dialysis" {...formItemLayout}>
                        {getFieldDecorator('on_dialysis', {initialValue: this.state.patientDetails ? this.state.patientDetails.on_dialysis : false,  valuePropName: 'checked'})
                        (<Checkbox onChange={(e) => this.onChangeCheckbox(e)} style={{paddingTop: '4px'}} />)}
                    </Form.Item>
                    <Form.Item label="Allow File Upload" {...formItemLayout}>
                        {getFieldDecorator('file_enable', {initialValue: this.state.patientDetails ? this.state.patientDetails.file_enable : true,  valuePropName: 'checked'})
                        (<Checkbox
                          style={{paddingTop: '4px'}}
                          defaultChecked
                        />)}
                    </Form.Item>


                    <Form.Item label="Max Uploads Allowed" {...formItemLayout}>
                        {getFieldDecorator('file_count', {initialValue: this.state.patientDetails ? this.state.patientDetails.file_count : 10})
                        (<InputNumber min={0} />)}
                    </Form.Item>
                    {this.props.user.is_superuser? <Form.Item label="Patient is Dead ?" {...formItemLayout}>
                        {getFieldDecorator('is_dead', {initialValue: this.state.patientDetails ? this.state.patientDetails.is_dead : false,  valuePropName: 'checked'})
                        (<Checkbox  style={{paddingTop: '4px'}} />)}
                    </Form.Item> :null}
                    <Form.Item>
                        {that.props.history ? (
                            <Button style={{margin: 5}} onClick={() => that.props.history.goBack()}>
                                Cancel
                            </Button>
                        ) : null}
                        <Button style={{margin: 5}} type="primary" htmlType="submit" loading={this.state.loading}>
                            Save
                        </Button>

                    </Form.Item>
                </Card>
            </Form>
        )
    }

}

export default Form.create()(EditPatientDetails);

function numberValidation(number) {
    if (isNaN(number)) {
        return {
            validateStatus: 'error',
            errorMsg: 'Patient ID can only be numerical value.',
        };
    }
    return {
        validateStatus: 'success',
        errorMsg: null,
    };
}
