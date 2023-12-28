import React from "react";
import {
    Avatar, Input, Card, Col, Icon, InputNumber, Radio, Row, Button, Spin, Modal, Tag,
    DatePicker, Select, Form, Divider
} from "antd";
import moment from "moment";
import filter from "lodash/filter";
import mapKeys from "lodash/mapKeys"
import { getAPI, interpolate, makeFileURL } from "../../utils/common";
import {
    PATIENT_GROUPS,
    SEARCH_PATIENT,
    PATIENTS_LIST,
    ADVANCED_SEARCH_PATIENT, SOURCE
} from "../../constants/api";
import InfiniteFeedLoaderButton from "../common/InfiniteFeedLoaderButton";
import PatientGroups from "./patientGroups/PatientGroups";
import { hideEmail, hideMobile } from "../../utils/permissionUtils";
import {
    ADVANCED_SEARCH,
    BLOOD_GROUPS,
    HAS_AADHAR_ID,
    HAS_AGE,
    HAS_DOB,
    HAS_EMAIL,
    HAS_GENDER, HAS_PINCODE, HAS_STREET, REFERED_BY_AGENT, GENDER_OPTION
} from "../../constants/hardData";
import { CHOOSE } from "../../constants/dataKeys";
import PermissionDenied from "../common/errors/PermissionDenied";

const { Meta } = Card;
const { Search } = Input;
const { MonthPicker } = DatePicker;
let id = 1;

class PatientSelection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            patientListData: [],
            patientGroup: [],
            morePatients: null,
            loading: true,
            selectedPatientGroup: 'all',
            advanced_option: ADVANCED_SEARCH,
            selectedOption: {},
            sourceList: [],
            custm_col: 8,
            advanceLoading: false,
        };
        this.getPatientListData = this.getPatientListData.bind(this);
        this.searchPatient = this.searchPatient.bind(this);
        this.getMorePatient = this.getMorePatient.bind(this);
        this.getSources = this.getSources.bind(this);
    }

    componentDidMount() {
        this.getPatientListData();
        this.getPatientGroup();
        this.getSources();
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


    getPatientGroup() {
        const that = this;
        const successFn = function (data) {
            const filteredData = data.sort(function (a, b) {
                return b.patient_count - a.patient_count
            })
            that.setState({
                patientGroup: filteredData,
            });
        };
        const errorFn = function () {
            that.setState({})

        };
        getAPI(interpolate(PATIENT_GROUPS, [this.props.active_practiceId]), successFn, errorFn);
    }

    getPatientListData() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                patientListData: data.results,
                morePatients: data.next,
                currentPage: data.current,
                totalPatients: data.count,
                loading: false,
                // advancedOptionShow: false,
            })
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })

        };
        const params =this.props.showAllClinic ? {} : {
            perm_practice:this.props.active_practiceId
        };
        getAPI(PATIENTS_LIST, successFn, errorFn,params);
    }

    searchPatient(value, page = 1) {
        const that = this;
        that.setState({
            searchvalue: true,
            searchString: value
        });
        const successFn = function (data) {
            that.setState(function (prevState) {
                if (prevState.searchString == value)
                    if (data.current > 1) {
                        return {
                            patientListData: [...prevState.patientListData, ...data.results],
                            morePatients: data.next,
                            currentPage: data.current,
                        }
                    } else {
                        return {
                            patientListData: [...data.results],
                            morePatients: data.next,
                            currentPage: data.current,
                            loading: false
                        }
                    }
            })

        };
        const errorFn = function () {

        };
        const apiParams = {
            page,
            page_size: 20
        };
        const params = this.props.showAllClinic ? {...apiParams} : {
            ...apiParams,
            perm_practice:this.props.active_practiceId
        };
        if (value) {
            getAPI(interpolate(SEARCH_PATIENT, [value]), successFn, errorFn, params);
        } else {
            this.getPatientListData();
        }
    }

    getMorePatient() {
        const that = this;
        const current = this.state.currentPage;

        const successFn = function (data) {
            if (data.current == current + 1)
                that.setState(function (prevState) {
                    if (data.current > 1)
                        return {
                            patientListData: [...prevState.patientListData, ...data.results],
                            morePatients: data.next,
                            currentPage: data.current,
                        }
                    return {
                        patientListData: [...data.results],
                        morePatients: data.next,
                        currentPage: data.current,
                        loading: false
                    }
                })
        }
        const errorFn = function () {

        }
        const params = this.props.showAllClinic ? {} : {
            perm_practice:this.props.active_practiceId
        };
        if (current) {
            params.page = parseInt(current) + 1;
        } else {
            this.setState({
                loading: true
            })
        }
        const patientGroup = this.state.selectedPatientGroup;
        if (patientGroup != 'all') {
            if (patientGroup == 'smart_a' || patientGroup == 'smart_b' || patientGroup == 'smart_c' || patientGroup == 'smart_d' || patientGroup == 'smart_e' || patientGroup == 'smart_f') {
                switch (patientGroup) {
                    case 'smart_a':
                        params.gender = 'male';
                        break;
                    case 'smart_b':
                        params.gender = 'female';
                        break;
                    case 'smart_c':
                        params.gender = 'female';
                        params.age = 30;
                        params.type = 'gt';
                        break;
                    case 'smart_d':
                        params.gender = 'female';
                        params.age = 30;
                        params.type = 'lt';
                        break;
                    case 'smart_e':
                        params.gender = 'male';
                        params.age = 30;
                        params.type = 'gt';
                        break;
                    case 'smart_f':
                        params.gender = 'male';
                        params.age = 30;
                        params.type = 'lt';
                        break;
                }
            } else {
                params.group = this.state.selectedPatientGroup
            }

        }
        getAPI(PATIENTS_LIST, successFn, errorFn, { ...params });
    }

    togglePatientGroupEditing = (option) => {
        this.setState({
            showPatientGroupModal: !!option
        });
        if (!option) {
            this.getPatientGroup();
        }
    }

    changeSelectedPatientGroup = (e) => {
        const that = this;
        this.setState({
            selectedPatientGroup: e.target.value,
            currentPage: null
        }, function () {
            that.getMorePatient();
        })
    };

    advancedOption(value) {
        // console.log("value",value)
        const that = this;
        this.getPatientListData();
        this.setState({
            advancedOptionShow: !value,
            selectedOption: '',
        });
        if (value) {
            that.props.form.setFieldsValue({
                keys: [0],
            });
        }

    }

    addNewOptionField = () => {

        const { form } = this.props;

        const keys = form.getFieldValue('keys');
        // console.log("form",form,keys)
        const nextKeys = keys.concat(id++);
        form.setFieldsValue({
            keys: nextKeys,
        });
    };

    removeNewOptionField = (k) => {
        const { form } = this.props;
        const keys = form.getFieldValue('keys');
        if (keys.length === 1) {
            return;
        }

        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        });
    };

    handleChangeOption = (index, type, value) => {
        const that = this;
        const selectedOption = {};
        that.setState(function (prevState) {
            return {
                selectedOption: { ...prevState.selectedOption, [index]: value },
                custm_col: value ? 12 : 8,
            }
        })
    };

    AdvanceSearchPatient = (e) => {
        const that = this;
        e.preventDefault();
        let reqData = {};
        this.props.form.validateFields((err, values) => {
            if (!err) {
                reqData = {
                    ...values,
                    dob: values.dob ? moment(values.dob).format('YYYY-MM-DD') : null,
                    dob_gte: values.dob_gte ? moment(values.dob_gte).format('YYYY-MM-DD') : null,
                    dob_lte: values.dob_lte ? moment(values.dob_lte).format('YYYY-MM-DD') : null,
                    dob_month: values.dob_month ? moment(values.dob_month).format('MM') : null,
                };
            }
        });
        delete reqData.keys;
        that.setState({
            patientData: reqData,
        }, function () {
            that.loadAdvanceSearchPatient();
        });

    };

    loadAdvanceSearchPatient = (page = 1) => {
        const that = this;
        const reqData = that.state.patientData;
        that.setState({
            advancedSearch: true,
            advanceLoading: true,
            morePatients:null,
        });
        const successFn = function (data) {
            that.setState(function (prevState) {
                if (data.current > 1) {
                    return {
                        patientListData: [...prevState.patientListData, ...data.results],
                        morePatientList: data.next,
                        currentPage: data.current,
                        advanceLoading: false
                    }
                }
                return {
                    patientListData: [...data.results],
                    morePatientList: data.next,
                    currentPage: data.current,
                    advanceLoading: false
                }

            });
        };
        const errorFn = function () {
            that.setState({
                advanceLoading: false,
            })
        };

        reqData.page = page;
        const params = this.props.showAllClinic ? {...reqData} : {
            ...reqData,
            perm_practice:this.props.active_practiceId
        };
        getAPI(ADVANCED_SEARCH_PATIENT, successFn, errorFn, params)

    }

    render() {
        const that = this;
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const { searchString, morePatients } = this.state;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 }
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 }
            }
        };
        getFieldDecorator('keys', { initialValue: [0] });
        const keys = getFieldValue('keys');
        const selectedOptionKeys = {
            ...mapKeys(this.state.selectedOption, function (value) {
                return value
            })
        }
        const chooseOption = keys.map((k, index) => (
            <Row gutter={12} key={k}>
                <Col span={10}>
                    <Select
                      style={{ width: '200px' }}
                      defaultValue={CHOOSE}
                      key={k}
                      size="small"
                      onChange={(value) => this.handleChangeOption(k, 'type', value)}
                    >
                        <Select.Option value="">{CHOOSE}</Select.Option>
                        {filter(this.state.advanced_option, function (item) {
                            if (that.state.selectedOption[k] == item.value)
                                return true
                            return !selectedOptionKeys[item.value]
                        }).map((item) => (
                            <Select.Option value={item.value} key={k}>
                                {item.label}
                            </Select.Option>
                        ))}
                    </Select>
                </Col>
                {this.state.selectedOption ? (
                    <>
                        <Col span={8}>
                            <FormItems
                              k={k}
                              selectedOption={this.state.selectedOption}
                              form={this.props.form}
                              sourceList={this.state.sourceList}
                            />
                        </Col>
                        <Col span={4}>
                            {index ? (
                                <Button onClick={() => this.removeNewOptionField(k)} size="small" style={{ margin: 5 }}>
                                    <Icon
                                      className="dynamic-delete-button"
                                      type="minus-circle-o"
                                      style={{ color: "red" }}
                                    />
                                </Button>
                            ) : null}
                            {index == keys.length - 1 && that.state.selectedOption[k] ? (
                                <Button onClick={this.addNewOptionField} size="small" style={{ margin: 5 }}>
                                    <Icon className="dynamic-delete-button" type="plus-circle-o" />
                                </Button>
                            ) : null}
                        </Col>
                    </>
                ) : null}
            </Row>
        ));


        return that.props.activePracticePermissions.ViewPatient ? (
            <div>

                <Row gutter={16}>
                    {this.state.advancedOptionShow ? (
                        <Form onSubmit={this.AdvanceSearchPatient} layout="inline">
                            <Row gutter={16}>
                                <Col span={16}>
                                    {chooseOption}
                                </Col>
                                <Col span={4} style={{ display: 'flex' }}>
                                    <Form.Item>
                                        <Button
                                          icon="search"
                                          htmlType="submit"
                                          onSubmit={this.AdvanceSearchPatient}
                                          type="primary"
                                          style={{ margin: 5 }}
                                        >Search
                                        </Button>
                                    </Form.Item>
                                    <Form.Item>
                                        <Button
                                          style={{ margin: 5 }}
                                          onClick={(value) => this.advancedOption(true)}
                                          size="small"
                                        >Basic
                                                                    Search
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    )
                        : (
                            <>
                                <Col span={12}>
                                    <Search
                                      style={{ margin: 5 }}
                                      placeholder="Search Patient By Name / ID / Mobile No / Aadhar No"
                                      size="small"
                                      onChange={value => this.searchPatient(value.target.value)}
                                      enterButton
                                    />
                                </Col>
                                <Col span={12} style={{ textAlign: "center" }}>
                                    <Button style={{ margin: 5 }} onClick={(value) => this.advancedOption(false)} size="small">Advance
                                        Search
                                    </Button>
                                </Col>

                            </>
                        )}
                    <Divider style={{ margin: 0 }} />
                </Row>
                <Row gutter={16}>
                    <Col
                      span={5}
                      style={{
                            height: 'calc(100% - 55px)',
                            overflow: 'auto',
                            padding: '10px',
                            // backgroundColor: '#e3e5e6',
                            // borderRight: '1px solid #ccc'
                        }}
                    >
                        <Radio.Group
                          buttonStyle="solid"
                          defaultValue={this.state.selectedPatientGroup}
                          onChange={this.changeSelectedPatientGroup}
                        >
                            <h2>Patients</h2>
                            <Radio.Button
                              key="all"
                              style={{ width: '100%', backgroundColor: 'transparent', border: '0px' }}
                              value="all"
                            >
                                All Patients
                            <Tag color="#87d068" style={{ float: 'right', margin: 4 }}>
                                    {this.state.totalPatients ? this.state.totalPatients : 0}
                            </Tag>
                            </Radio.Button>
                            {/* <Radio.Button style={{width: '100%', backgroundColor: 'transparent', border: '0px'}} value="b"> */}
                            {/* Recently Visited */}
                            {/* </Radio.Button> */}
                            {/* <Radio.Button style={{width: '100%', backgroundColor: 'transparent', border: '0px'}} value="c"> */}
                            {/* Recently Added */}
                            {/* </Radio.Button> */}
                            <p><br /></p>
                            <h2>Groups</h2>
                            <p><b>My Groups</b>
                                <a
                                  style={{ float: 'right' }}
                                  onClick={() => this.togglePatientGroupEditing(true)}
                                >Manage
                                </a>
                            </p>
                            {this.state.patientGroup.map((group) => (
                                <Radio.Button
                                  key={group.id}
                                  style={{ width: '100%', backgroundColor: 'transparent', border: '0px' }}
                                  value={group.id}
                                >
                                    {group.name}
                                    <Tag color="#87d068" style={{ float: 'right', margin: 4 }}>
                                        {group.practice_count[`practice_${that.props.active_practiceId}`]}
                                    </Tag>
                                </Radio.Button>
                            ))}
                            <p><br /></p>
                            <p><b>Smart Groups</b></p>
                            <Radio.Button
                              style={{ width: '100%', backgroundColor: 'transparent', border: '0px' }}
                              key="smart_a"
                              value="smart_a"
                            >
                                All Male
                            </Radio.Button>
                            <Radio.Button
                              style={{ width: '100%', backgroundColor: 'transparent', border: '0px' }}
                              key="smart_b"
                              value="smart_b"
                            >
                                All Female
                            </Radio.Button>
                            <Radio.Button
                              style={{ width: '100%', backgroundColor: 'transparent', border: '0px' }}
                              key="smart_e"
                              value="smart_e"
                            >
                                Male Over 30
                            </Radio.Button>
                            <Radio.Button
                              style={{ width: '100%', backgroundColor: 'transparent', border: '0px' }}
                              key="smart_c"
                              value="smart_c"
                            >
                                Female Over 30
                            </Radio.Button>
                            <Radio.Button
                              style={{ width: '100%', backgroundColor: 'transparent', border: '0px' }}
                              key="smart_f"
                              value="smart_f"
                            >
                                Male Under 30
                            </Radio.Button>
                            <Radio.Button
                              style={{ width: '100%', backgroundColor: 'transparent', border: '0px' }}
                              key="smart_d"
                              value="smart_d"
                            >
                                Female Under 30
                            </Radio.Button>
                            <p><br /></p>
                        </Radio.Group>
                    </Col>
                    <Col span={19} style={{ overflow: 'scroll', borderLeft: '1px solid #ccc' }}>


                        <Spin spinning={this.state.loading}>
                            <Row>
                                {this.state.patientListData.length ?
                                    this.state.patientListData.map((patient) => (
                                        <PatientCard
                                          {...patient}
                                          key={patient.id}
                                          showMobile={that.props.activePracticePermissions.PatientPhoneNumber}
                                          showEmail={that.props.activePracticePermissions.PatientEmailId}
                                          setCurrentPatient={that.props.setCurrentPatient}
                                        />
                                    )) :
                                    <p style={{ textAlign: 'center' }}>No Data Found</p>}
                            </Row>
                        </Spin>
                        {this.state.searchvalue ? (
                            <InfiniteFeedLoaderButton
                              loaderFunction={() => this.searchPatient(searchString, morePatients)}
                              loading={this.state.loading}
                              hidden={!this.state.morePatients}
                            />
                        ) : (this.state.advancedSearch ? (
                            <InfiniteFeedLoaderButton
                              loading={this.state.advanceLoading}
                              loaderFunction={() => this.loadAdvanceSearchPatient(that.state.morePatientList)}
                              hidden={!this.state.morePatientList}
                            />
                        ) : (
                                <InfiniteFeedLoaderButton
                                  loaderFunction={this.getMorePatient}
                                  loading={this.state.loading}
                                  hidden={!this.state.morePatients}
                                />
                            ))}
                    </Col>

                    {/* <Col span={19} style={{overflow: 'scroll', borderLeft: '1px solid #ccc'}}> */}
                    {/*    <Search placeholder="Search Patient By Name / ID / Mobile No / Aadhar No" */}
                    {/*            onChange={value => this.searchPatient(value.target.value)} */}
                    {/*            enterButton/> */}

                    {/*    <Spin spinning={this.state.loading}> */}
                    {/*        <Row> */}
                    {/*            {this.state.patientListData.length ? */}
                    {/*                this.state.patientListData.map((patient) => <PatientCard {...patient} */}
                    {/*                                                                         key={patient.id} */}
                    {/*                                                                         showMobile={that.props.activePracticePermissions.PatientPhoneNumber} */}
                    {/*                                                                         showEmail={that.props.activePracticePermissions.PatientEmailId} */}
                    {/*                                                                         setCurrentPatient={that.props.setCurrentPatient}/>) : */}
                    {/*                <p style={{textAlign: 'center'}}>No Data Found</p> */}
                    {/*            } */}
                    {/*        </Row> */}
                    {/*    </Spin> */}
                    {/*    {this.state.searchvalue ?  <InfiniteFeedLoaderButton loaderFunction={this.searchPatient} */}
                    {/*                                                         loading={this.state.loading} */}
                    {/*                                                         hidden={!this.state.morePatients}/> : */}

                    {/*        <InfiniteFeedLoaderButton loaderFunction={this.getMorePatient} */}
                    {/*                                  loading={this.state.loading} */}
                    {/*                                  hidden={!this.state.morePatients}/> */}
                    {/*    } */}

                    {/* </Col> */}
                    <Modal
                      visible={this.state.showPatientGroupModal}
                      footer={null}
                      onCancel={() => this.togglePatientGroupEditing(false)}
                    >
                        <PatientGroups {...this.props} />
                    </Modal>
                </Row>
            </div>
        ) : <PermissionDenied />
    }
}

export default Form.create()(PatientSelection);

function PatientCard(patient) {
    return (
        <Col xs={24} sm={24} md={12} lg={8} xl={8} xxl={6}>
            <Card onClick={() => patient.setCurrentPatient(patient)} style={{ margin: '3px', paddingBottom: "8px" }}>
                <Meta
                  avatar={(patient.image ? <Avatar src={makeFileURL(patient.image)} size={50} /> : (
                        <Avatar style={{ backgroundColor: '#87d068' }} size={50}>
                            {patient.user.first_name ? patient.user.first_name.charAt(0) :
                                <Icon type="user" />}
                        </Avatar>
                    ))}
                  title={(patient.is_dead ? "(Late) ":"") +patient.user.first_name}
                  description={(
                        <span>{patient.showMobile ? patient.user.mobile : hideMobile(patient.user.mobile)}<br />{patient.showEmail ? patient.user.email : hideEmail(patient.user.email)}
                            <br />
                            <span className="patientIdHighlight">#
                              {patient.custom_id ? patient.custom_id : patient.id}
                                {patient.gender ? `,${patient.gender.charAt(0).toUpperCase()}` : null}
                            </span>

                        </span>
                    )}
                />
            </Card>
        </Col>
    );
}

function FormItems(index) {
    return (
        <>
            {index.selectedOption[index.k] == 'name' ? (
                <Form.Item key={index.key} label="contains">
                    {index.form.getFieldDecorator('name')
                        (<Input placeholder="patient Name" size="small" />)}
                </Form.Item>
            ) : null}

            {index.selectedOption[index.k] == 'phone' ? (
                <Form.Item key={index.key} label="contains">
                    {index.form.getFieldDecorator('phone')
                        (<Input placeholder="Contact Number" size="small" />)}
                </Form.Item>
            ) : null}

            {index.selectedOption[index.k] == 'age' ? (
                <Form.Item key={index.key}>
                    {index.form.getFieldDecorator('age')
                        (<InputNumber placeholder="Patient Age" size="small" />)}
                </Form.Item>
            ) : null}

            {index.selectedOption[index.k] == 'age_gte' ? (
                <Form.Item key={index.key}>
                    {index.form.getFieldDecorator('age_gte')
                        (<InputNumber placeholder="Age more than" size="small" />)}
                </Form.Item>
            ) : null}

            {index.selectedOption[index.k] == 'age_lte' ? (
                <Form.Item key={index.key}>
                    {index.form.getFieldDecorator('age_lte')
                        (<InputNumber placeholder="Age Less than" size="small" />)}
                </Form.Item>
            ) : null}

            {index.selectedOption[index.k] == 'has_age' ? (
                <Form.Item>
                    {index.form.getFieldDecorator('has_age')
                        (<Select style={{ width: 100 }} size="small">
                            {HAS_AGE.map((option) => <Select.Option value={option.value}>{option.label} </Select.Option>)}
                         </Select>)}
                </Form.Item>
            )
                : null}

            {index.selectedOption[index.k] == 'dob' ? (
                <Form.Item key={index.key} label="is">
                    {index.form.getFieldDecorator('dob')
                        (<DatePicker placeholder="Date of Birth" size="small" />)}
                </Form.Item>
            ) : null}

            {index.selectedOption[index.k] == 'dob_gte' ? (
                <Form.Item key={index.key}>
                    {index.form.getFieldDecorator('dob_gte')
                        (<DatePicker size="small" />)}
                </Form.Item>
            ) : null}

            {index.selectedOption[index.k] == 'dob_lte' ? (
                <Form.Item key={index.key}>
                    {index.form.getFieldDecorator('dob_lte')
                        (<DatePicker size="small" />)}
                </Form.Item>
            ) : null}

            {index.selectedOption[index.k] == 'dob_month' ? (
                <Form.Item key={index.key}>
                    {index.form.getFieldDecorator('dob_month')
                        (<MonthPicker size="small" />)}
                </Form.Item>
            ) : null}

            {index.selectedOption[index.k] == 'has_dob' ? (
                <Form.Item>
                    {index.form.getFieldDecorator('has_dob')
                        (<Select style={{ width: 100 }} size="small">
                            {HAS_DOB.map((option) => <Select.Option value={option.value}>{option.label} </Select.Option>)}
                         </Select>)}
                </Form.Item>
            )
                : null}

            {index.selectedOption[index.k] == 'patient_id' ? (
                <Form.Item key={index.key} label="contains">
                    {index.form.getFieldDecorator('patient_id')
                        (<Input placeholder="Patient Id" size="small" />)}
                </Form.Item>
            ) : null}

            {index.selectedOption[index.k] == 'has_aadhar' ? (
                <Form.Item>
                    {index.form.getFieldDecorator('has_aadhar')
                        (<Select style={{ width: 100 }} size="small">
                            {HAS_AADHAR_ID.map((option) => (
                                <Select.Option
                                  value={option.value}
                                >{option.label}
                                </Select.Option>
                            ))}
                         </Select>)}
                </Form.Item>
            )
                : null}

            {index.selectedOption[index.k] == 'aadhar' ? (
                <Form.Item key={index.key} label="contains">
                    {index.form.getFieldDecorator('aadhar')
                        (<Input placeholder="Aadhar Id" size="small" />)}
                </Form.Item>
            ) : null}

            {index.selectedOption[index.k] == 'email' ? (
                <Form.Item key={index.key} label="contains">
                    {index.form.getFieldDecorator('email')
                        (<Input placeholder="Email Id" size="small" />)}
                </Form.Item>
            ) : null}

            {index.selectedOption[index.k] == 'has_email' ? (
                <Form.Item>
                    {index.form.getFieldDecorator('has_email')
                        (<Select style={{ width: 100 }} size="small">
                            {HAS_EMAIL.map((option) => <Select.Option value={option.value}>{option.label} </Select.Option>)}
                         </Select>)}
                </Form.Item>
            )
                : null}

            {index.selectedOption[index.k] == 'gender' ? (
                <Form.Item key={index.key} label="is">
                    {index.form.getFieldDecorator('gender')
                        (<Select style={{ width: 100 }} size="small">
                            {GENDER_OPTION.map((option) => (
                                <Select.Option
                                  value={option.value}
                                >{option.label}
                                </Select.Option>
                            ))}
                         </Select>)}
                </Form.Item>
            )
                : null}


            {index.selectedOption[index.k] == 'has_gender' ? (
                <Form.Item>
                    {index.form.getFieldDecorator('has_gender')
                        (<Select style={{ width: 100 }} size="small">
                            {HAS_GENDER.map((option) => (
                                <Select.Option
                                  value={option.value}
                                >{option.label}
                                </Select.Option>
                            ))}
                         </Select>)}
                </Form.Item>
            )
                : null}

            {index.selectedOption[index.k] == 'pincode' ? (
                <Form.Item key={index.key} label="contains">
                    {index.form.getFieldDecorator('pincode')
                        (<Input placeholder="PINCODE" size="small" />)}
                </Form.Item>
            ) : null}

            {index.selectedOption[index.k] == 'has_pincode' ? (
                <Form.Item>
                    {index.form.getFieldDecorator('has_pincode')
                        (<Select style={{ width: 100 }} size="small">
                            {HAS_PINCODE.map((option) => (
                                <Select.Option
                                  value={option.value}
                                >{option.label}
                                </Select.Option>
                            ))}
                         </Select>)}
                </Form.Item>
            )
                : null}

            {index.selectedOption[index.k] == 'has_street' ? (
                <Form.Item>
                    {index.form.getFieldDecorator('has_street')
                        (<Select style={{ width: 100 }} size="small">
                            {HAS_STREET.map((option) => (
                                <Select.Option
                                  value={option.value}
                                >{option.label}
                                </Select.Option>
                            ))}
                         </Select>)}
                </Form.Item>
            )
                : null}


            {index.selectedOption[index.k] == 'street' ? (
                <Form.Item key={index.key} label="contains">
                    {index.form.getFieldDecorator('street')
                        (<Input placeholder="Street Address" size="small" />)}
                </Form.Item>
            ) : null}

            {index.selectedOption[index.k] == 'blood_group' ? (
                <Form.Item key={index.key} label="is">
                    {index.form.getFieldDecorator('blood_group')
                        (<Select style={{ width: 100 }} size="small">
                            {BLOOD_GROUPS.map((option) => (
                                <Select.Option
                                  value={option.value}
                                >{option.name}
                                </Select.Option>
                            ))}
                         </Select>)}
                </Form.Item>
            )
                : null}

            {index.selectedOption[index.k] == 'source' ? (
                <Form.Item>
                    {index.form.getFieldDecorator('source')
                        (<Select style={{ width: 100 }} size="small">
                            {index.sourceList.map((option) => (
                                <Select.Option
                                  value={option.id}
                                >{option.name}
                                </Select.Option>
                            ))}
                         </Select>)}
                </Form.Item>
            )
                : null}

            {index.selectedOption[index.k] == 'agent_referal' ? (
                <Form.Item>
                    {index.form.getFieldDecorator('agent_referal')
                        (<Select style={{ width: 100 }} size="small">
                            {REFERED_BY_AGENT.map((option) => (
                                <Select.Option
                                  value={option.value}
                                >{option.label}
                                </Select.Option>
                            ))}
                         </Select>)}
                </Form.Item>
            )
                : null}


        </>
    )
}
