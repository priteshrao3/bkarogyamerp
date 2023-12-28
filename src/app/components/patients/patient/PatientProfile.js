import React from 'react';
import {
    Alert,
    Avatar,
    Button,
    Card,
    Col,
    Dropdown,
    Divider,
    Icon,
    List,
    Row,
    Popconfirm,
    Menu,
    Modal,
    Statistic,
    Tag,
    Result,
    Form, Input,
    Select,
    Checkbox,
} from 'antd';

import { Link, Redirect } from 'react-router-dom';
import moment from 'moment';
import PatientSelection from '../PatientSelection';
import { getAPI, postAPI, interpolate, displayMessage, makeFileURL, putAPI } from '../../../utils/common';
import {
    MEDICAL_MEMBERSHIP_CANCEL_API,
    PATIENTS_MEMBERSHIP_API,
    PATIENT_PROFILE,
    ALL_PRACTICE_STAFF, ADDRESS_TICKET_PDF,
} from '../../../constants/api';
import PatientNotes from './PatientNotes';
import MedicalMembership from './MedicalMembership';
import {
    ERROR_MSG_TYPE,
    CHECKBOX_FIELD,
    SUCCESS_MSG_TYPE,
    INPUT_FIELD,
    RADIO_FIELD,
    SELECT_FIELD,
    SINGLE_CHECKBOX_FIELD,
    COLOR_PICKER,
    EMAIL_FIELD,
    RELATION,
} from '../../../constants/dataKeys';
import { hideEmail, hideMobile } from '../../../utils/permissionUtils';
import AddOrEditAgent from './AddOrEditAgent';
import { hashCode, intToRGB } from '../../../utils/clinicUtils';
import PatientAccessModal from '../PatientAccessModal';
import ManagePatientPractice from './ManagePatientPractice';
import DynamicFieldsForm from '../../common/DynamicFieldsForm';
import {
    BLOOD_GROUP_CONFIG_PARAM,
    FAMILY_RELATION_CONFIG_PARAM,
    GENDER_CONFIG_PARAM,
} from '../../../constants/hardData';
import { loadConfigParameters } from '../../../utils/clinicUtils';
import EditPrintPatientModal from './EditPrintPatientModal';
import { BACKEND_BASE_URL } from '../../../config/connect';
import PatientRegistrationFees from './PatientRegistrationFees';


const { Option } = Select;

class PatientProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            patientProfile: null,
            currentPatient: this.props.currentPatient,
            medicalHistory: {},
            loading: true,
            add: '',
            MedicalMembership: null,
            hide: false,
            agentModalVisible: false,
            availablePractices: {},
            addressTicketVisible: false,
            addPrintPatientFormModal: false,
            [BLOOD_GROUP_CONFIG_PARAM]: [],
            [FAMILY_RELATION_CONFIG_PARAM]: [],
            [GENDER_CONFIG_PARAM]: [],
        };
        this.loadProfile = this.loadProfile.bind(this);
        this.loadMedicalMembership = this.loadMedicalMembership.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        if (this.state.currentPatient) {
            this.loadProfile(false);
            this.loadMedicalMembership();
        }
        loadConfigParameters(this, [BLOOD_GROUP_CONFIG_PARAM, FAMILY_RELATION_CONFIG_PARAM, GENDER_CONFIG_PARAM]);
    }

    formChange = value => {
        this.setState({
            add: value,
        });
    };
    updateValues = (name, value) => {
        this.setState({
            [name]: value,
        });
    };

    componentWillReceiveProps(newProps) {
        const that = this;
        if (newProps.currentPatient && newProps.currentPatient != this.state.currentPatient) {
            this.setState(
                {
                    currentPatient: newProps.currentPatient,
                },
                function() {
                    that.loadProfile(false);
                },
            );
        }
    }

    loadProfile(refreshHeader = true) {
        const that = this;
        const successFn = function(data) {
            const availablePractices = {};
            data.practices_data.forEach(function(practiceData) {
                availablePractices[practiceData.practice] = practiceData;
            });
            that.setState({
                availablePractices,
                patientProfile: data,
                loading: false,
            });
            if (that.props.refreshWallet && refreshHeader) {
                that.props.refreshWallet();
            }
        };
        const errorFn = function() {
            that.setState({
                loading: false,
            });
        };
        const params = this.props.activePracticePermissions.ViewAllClinics
            ? {}
            : {
                perm_practice: this.props.active_practiceId,
            };
        if (that.state.currentPatient)
            getAPI(
                interpolate(PATIENT_PROFILE, [that.state.currentPatient.id]),
                successFn,
                errorFn,
                params,
            );
    }

    loadMedicalMembership() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                MedicalMembership: data[data.length - 1],
                loading: false,
            });
        };
        const errorFn = function() {
            that.setState({
                loading: false,
            });
        };
        getAPI(
            interpolate(PATIENTS_MEMBERSHIP_API, [that.props.currentPatient.id]),
            successFn,
            errorFn,
        );
    }

    onClickHandler(value) {
        const that = this;
        if (this.state.MedicalMembership) {
            displayMessage(ERROR_MSG_TYPE, 'Membership Already Exist!!');
            that.setState({
                add: false,
            });
        } else {
            this.setState({
                add: value,
            });
        }
    }

    deleteMembership(id) {
        const that = this;
        const reqData = {
            id,
            is_active: false,
        };
        const successFn = function(data) {
            that.loadProfile();
            that.loadMedicalMembership();
            if (that.props.refreshWallet) {
                that.props.refreshWallet();
            }
        };
        const errorFn = function() {
        };
        postAPI(
            interpolate(MEDICAL_MEMBERSHIP_CANCEL_API, [that.props.currentPatient.id]),
            reqData,
            successFn,
            errorFn,
        );
    }

    addAgent = () => {
        const that = this;
        that.setState({
            agentModalVisible: true,
        });
    };

    addAgentModalClosed = () => {
        this.setState({
            agentModalVisible: false,
        });
    };

    toggleAddressTicket = (option) => {
        this.setState({
            addressTicketVisible: !!option,
        });
    };


    handleSubmit = e => {
        e.preventDefault();
    };
    printPatientForm = () => {
        const that = this;
        console.log('value');
        let { addPrintPatientFormModal } = that.state;
        that.setState({
            addPrintPatientFormModal: !addPrintPatientFormModal,
        });
    };
    toggleDeathDeclarationModal = (option) => {
        this.setState({
            deathDeclareModal: !!option,
        });
    };
    declareDead = () => {
        let that = this;
        let reqData = {
            is_dead: true,
            dead_by: that.props.user.staff.id,
        };
        let successFn = function() {
            displayMessage(SUCCESS_MSG_TYPE, 'Patient declared dead successfully!');
            that.loadProfile();
            that.toggleDeathDeclarationModal(false);
        };
        let errorFn = function() {

        };
        putAPI(interpolate(PATIENT_PROFILE, [that.props.currentPatient.id]), reqData, successFn, errorFn);
    };

    render() {
        const that = this;
        const patient = this.state.patientProfile;
        const practiceData = this.props.activePracticeData;
        const defaultValues = [];
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        const { availablePractices, addPrintPatientFormModal } = this.state;
        if (this.props.currentPatient) {
            if (!patient) return <Card loading={this.state.loading}/>;
            if (!patient.is_active) {
                return (
                    <div>
                        <Result
                            status={403}
                            title="Permission Denied"
                            subTitle={'You don\'t have permission to access this patient'}
                            extra={<Link to="/erp/patients/"><Button type="primary">Go to All Patient</Button></Link>}
                        />
                    </div>
                );
            }
            const fields = [
                {
                    label: 'Practice Name',
                    key: 'name',
                    placeholder: 'Practice Name',
                    required: true,
                    initialValue: practiceData.name ? practiceData.name : '',
                    type: INPUT_FIELD,
                }, {
                    label: 'Practice Address Line 1',
                    key: 'address1',
                    required: true,
                    placeholder: 'Practice Address',
                    initialValue: practiceData.address ? practiceData.address : '',
                    type: INPUT_FIELD,
                }, {
                    label: 'Practice Address Line 2',
                    key: 'address2',
                    placeholder: 'Practice Address',
                    initialValue: '',
                    type: INPUT_FIELD,
                }, {
                    label: 'Extra',
                    key: 'extra',
                    required: false,
                    placeholder: 'City, State, Country',
                    initialValue: `${practiceData.city}, ${practiceData.state}, ${practiceData.pincode}`,
                    type: INPUT_FIELD,
                }, {
                    label: 'Practice Mobile',
                    key: 'contact',
                    required: true,
                    placeholder: 'Practice Mobile',
                    initialValue: practiceData.contact ? practiceData.contact : '',
                    type: INPUT_FIELD,
                }];
            const formProp = {
                successFn(data) {
                    that.toggleAddressTicket(false);
                    if (data.report)
                        window.open(BACKEND_BASE_URL + data.report);
                },
                errorFn() {

                },
                action: interpolate(ADDRESS_TICKET_PDF, [this.props.currentPatient.id]),
                method: 'get',
            };
            const editPatientDropDownMenu = <Menu>
                <Menu.Item key={'death'} onClick={() => this.toggleDeathDeclarationModal(true)}
                           disabled={patient.is_dead}>Declare Dead</Menu.Item>
            </Menu>;
            return (
                <Card
                    loading={this.state.loading}
                    title="Patient Profile"
                    extra={(
                        <>
                            <EditPrintPatientModal visibleModal={addPrintPatientFormModal}
                                                   onCancelModal={that.printPatientForm}
                                                   currentPatient={that.state.currentPatient}
                                                   activePracticeData={practiceData} {...this.props} />
                            <Link onClick={() => this.printPatientForm()}>
                                Print Patient Form
                            </Link>
                            <Button
                                type="primary"
                                style={{ marginLeft: 10 }}
                                onClick={() => this.toggleAddressTicket(true)}
                            >Address
                                Ticket
                            </Button>
                        </>
                    )}
                >
                    {/* <PatientAccessModal /> */}
                    {patient.is_dead ? <Alert type={'error'} message={'The patient has been marked dead.'} banner
                                              style={{ marginBottom: 8 }}/> : null}
                    <Row gutter={16}>
                        <Col span={6} style={{ textAlign: 'center' }}>
                            {patient.image ? (
                                <img src={makeFileURL(patient.image)} style={{ width: '100%' }}/>
                            ) : (
                                <Avatar
                                    size={200}
                                    shape="square"
                                    style={{ backgroundColor: '#87d068', width: '100%' }}
                                >
                                    {patient.user.first_name ? (
                                        patient.user.first_name
                                    ) : (
                                        <Icon type="user"/>
                                    )}
                                </Avatar>
                            )}

                            {patient.is_agent && patient.is_approved ? (
                                <Statistic
                                    title="Referral Code"
                                    value={patient.user.referer_code}
                                />
                            ) : null}
                            {that.props.activePracticePermissions.EditPatient ? (
                                <Dropdown.Button
                                    type={'primary'}
                                    style={{ marginTop: 10 }}
                                    onClick={() => this.props.history.push(`/erp/patient/${this.state.currentPatient.id}/profile/edit`)}
                                    overlay={editPatientDropDownMenu}>
                                    <Icon type="edit"/>Edit Patient Profile
                                </Dropdown.Button>
                            ) : null}
                            {that.props.activePracticePermissions.ManagePatientPractice ? (
                                <ManagePatientPractice
                                    patientData={this.state.patientProfile}
                                    loadData={this.loadProfile}
                                />
                            ) : null}
                            <Col>
                                <Divider/>

                                {this.state.add ? (

                                        <div>
                                            <h1 style={{ fontSize: '18px' }}>
                                                Medical Membership{' '}
                                                <Button type={'link'} onClick={() => this.onClickHandler(false)}>
                                                    Cancel
                                                </Button>
                                            </h1>
                                            <MedicalMembership
                                                {...this.props}
                                                {...this.state}
                                                patientId={patient.id}
                                                loadMedicalMembership={that.loadMedicalMembership}
                                                formChange={that.formChange}
                                                loadProfile={that.loadProfile}
                                            />
                                        </div>

                                    )
                                    : (
                                        <div style={{ padding: '0px' }}><h1
                                            style={{ fontSize: '18px', textAlign: 'center' }}
                                        >Medical Membership <a
                                            href="#"
                                            onClick={() => this.onClickHandler(true)}
                                        >{this.state.MedicalMembership ? 'Renew' : 'Add'}
                                        </a>
                                        </h1>
                                            {this.state.MedicalMembership ? (
                                                    <Card
                                                        size="small"
                                                        title="Membership"
                                                        extra={(
                                                            <Popconfirm
                                                                title="Are you sure delete this Membership?"
                                                                onConfirm={() => that.deleteMembership(this.state.MedicalMembership.id)}
                                                                okText="Yes"
                                                                cancelText="No"
                                                            >
                                                                <Button
                                                                    icon="close"
                                                                    type="danger"
                                                                    shape="circle"
                                                                    size="small"
                                                                />
                                                            </Popconfirm>
                                                        )}
                                                        style={{ textAlign: 'center' }}
                                                    >
                                                        <div style={{ textAlign: 'left' }}>
                                                            <p>
                                                                <strong>Membership : </strong>
                                                                <span>
                                                                {
                                                                    this.state.MedicalMembership
                                                                        .medical_membership ? this.state.MedicalMembership
                                                                        .medical_membership.name : null
                                                                }
                                                            </span>
                                                            </p>

                                                            <p><strong>Membership Code : </strong>
                                                                <span>{this.state.MedicalMembership.membership_code}</span>
                                                            </p>
                                                            <p><strong>Start Date : </strong>
                                                                <span>{this.state.MedicalMembership.medical_from}</span>
                                                            </p>
                                                            <p><strong>Valid Till : </strong>
                                                                <span>{this.state.MedicalMembership.medical_to}</span>
                                                            </p>
                                                            <p>
                                                                <strong>Document : </strong>
                                                                <span>
                                                                {
                                                                    this.state.MedicalMembership
                                                                        .membership_upload ? <a target="_blank"
                                                                                                href={makeFileURL(this.state.MedicalMembership
                                                                                                    .membership_upload)}>Document</a> : '--'
                                                                }
                                                            </span>
                                                            </p>

                                                        </div>
                                                    </Card>
                                                )
                                                : null}
                                        </div>
                                    )}
                                <Divider/>
                                <PatientRegistrationFees
                                    {...this.state}
                                    active_practiceId={that.props.active_practiceId}
                                    loadProfile={that.loadProfile}
                                    patientId={patient.id}
                                    {...this.props}
                                />


                            </Col>

                        </Col>

                        <Col span={11}>
                            <PatientRow label="Patient Name"
                                        value={(patient.is_dead ? '(Late) ' : '') + patient.user.first_name}/>
                            <PatientRow
                                label="Patient ID"
                                value={patient.custom_id ? patient.custom_id : patient.id}
                            />
                            <PatientRow

                                label="Created On"
                                value={
                                    patient.created_at
                                        ? moment(patient.created_at).format('LL')
                                        : null
                                }

                            />
                            {patient && patient.role ? (
                                <PatientRow label="Advisor Role" value={patient.role_data.name}/>
                            ) : null}
                            <PatientRow label="Gender" value={patient.gender}/>
                            {patient.is_age ? (
                                <PatientRow

                                    label="Age"
                                    value={
                                        patient.dob
                                            ? moment().diff(this.props.currentPatient.dob, 'years')
                                            : null
                                    }

                                />
                            ) : (
                                <PatientRow label="Date of Birth" value={patient.dob}/>
                            )}
                            <PatientRow
                                label="Religion"
                                value={patient.religion_data ? patient.religion_data.value : null}
                            />
                            <PatientRow
                                label="On Dialysis?"
                                value={patient.on_dialysis ? 'Yes' : 'No'}
                            />
                            <PatientRow

                                label="Referer"
                                value={
                                    patient.user.referer_data.referer ? (
                                        <Link
                                            to={`/erp/patient/${patient.user.referer_data.patient}/profile`}
                                        >
                                            {patient.user.referer_data.referer.first_name}
                                        </Link>
                                    ) : (
                                        '--'
                                    )
                                }
                            />
                            <PatientRow
                                label={'Create By '}
                                value={patient.self_register?patient.user.first_name:
                                    patient.created_by ? patient.creator : '--'
                                }
                            />
                            <PatientRow
                                label={'Patient Source'}
                                value={
                                    patient.source ? patient.source_name : '--'
                                }
                            />
                            <PatientRow
                                label="PD Doctor"
                                value={
                                    availablePractices[this.props.active_practiceId]
                                        ? availablePractices[this.props.active_practiceId]
                                            .pd_doctor_name
                                        : null
                                }
                            />
                            <Divider/>
                            <h2>Contact Details</h2>
                            <PatientRow

                                label="Email"
                                value={
                                    that.props.activePracticePermissions.PatientEmailId
                                        ? patient.user.email
                                        : hideEmail(patient.user.email)
                                }
                            />
                            <PatientRow
                                label="Primary Mobile"
                                value={
                                    that.props.activePracticePermissions.PatientPhoneNumber
                                        ? patient.user.mobile
                                        : hideMobile(patient.user.mobile)
                                }
                            />
                            <PatientRow
                                label="Secondary Mobile"
                                value={
                                    that.props.activePracticePermissions.PatientPhoneNumber
                                        ? patient.secondary_mobile_no
                                        : hideMobile(patient.secondary_mobile_no)
                                }
                            />
                            <PatientRow label="Landline No" value={patient.landline_no}/>
                            <PatientRow label="Address"
                                        value={that.props.activePracticePermissions.ViewPatientAddress ? patient.address : '--'}/>
                            <PatientRow label="Locality" value={patient.locality}/>
                            <PatientRow
                                label="City"
                                value={patient.city_data ? patient.city_data.name : null}
                            />
                            <PatientRow
                                label="State"
                                value={patient.state_data ? patient.state_data.name : null}
                            />
                            <PatientRow
                                label="Country"
                                value={patient.country_data ? patient.country_data.name : null}
                            />
                            <PatientRow label="Pincode" value={patient.pincode}/>
                            <Divider/>
                            <h2>Relative Details</h2>
                            <PatientRow

                                label="Relative 1"
                                value={
                                    patient.attendee1 || patient.attendee1_mobile_no
                                        ? `${patient.attendee1} (${patient.family_relation1}) [${
                                            that.props.activePracticePermissions.RelativePhoneNumber ? patient.attendee1_mobile_no :
                                                hideMobile(patient.attendee1_mobile_no)}]`
                                        : '--'
                                }
                            />
                            <PatientRow
                                label="Relative 2"
                                value={
                                    patient.attendee2 || patient.attendee2_mobile_no
                                        ? `${patient.attendee2} (${patient.family_relation2}) [${
                                            that.props.activePracticePermissions.RelativePhoneNumber ? patient.attendee2_mobile_no :
                                                hideMobile(patient.attendee2_mobile_no)}]`
                                        : '--'
                                }

                            />
                        </Col>
                        <Col span={7} style={{ borderLeft: '1 px solid #ccc' }}>
                            <h2>Medical History</h2>
                            {patient.medical_history_data
                                ? patient.medical_history_data.map((item, index) => (
                                    <Tag color={`#${intToRGB(hashCode(item.name))}`}>
                                        {item.name}
                                    </Tag>
                                ))
                                : null}
                            {/* <List size="small" loading={this.state.loading} dataSource={patient.medical_history_data} */}
                            {/*      renderItem={(item) => */}
                            {/*          <List.Item>{item.name}</List.Item>}/>} */}
                            <Divider/>
                            <h2>Groups</h2>
                            {patient.patient_group_data ? patient.patient_group_data.map(item =>
                                <Tag>{item.name}</Tag>) : null}
                            <Divider/>
                            {/* <List */}
                            {/*  dataSource={patient.patient_group_data} */}
                            {/*  renderItem={item => <List.Item>{item.name}</List.Item>} */}
                            {/* /> */}
                            <PatientNotes {...this.props} patientId={patient.id}/>
                            {/* <Divider>Medical Membership</Divider>
                            <List dataSource={patient.medical_membership}
                                renderItem={(item) => <List.Item>{item}</List.Item>}/> */}
                        </Col>

                        <Modal
                            title="Add Agent"
                            visible={this.state.agentModalVisible}
                            onOk={null}
                            footer={null}
                            onCancel={this.addAgentModalClosed}
                        >
                            <AddOrEditAgent patientId={patient.id} {...this.state} />
                        </Modal>
                        <Modal
                            title="Address Ticket"
                            visible={this.state.addressTicketVisible}
                            onOk={null}
                            footer={null}
                            width={700}
                            onCancel={() => this.toggleAddressTicket(false)}
                        >
                            <TestFormLayout
                                defaultValues={defaultValues}
                                formProp={formProp}
                                fields={fields}
                            />

                        </Modal>
                        <Modal
                            title="Declare Dead"
                            visible={this.state.deathDeclareModal}
                            onOk={this.declareDead}
                            okText={'Declare Dead'}
                            okButtonProps={{
                                type: 'danger',
                                disabled: patient.custom_id != this.state.deadDeclarationPatientID,
                            }}
                            onCancel={() => this.toggleDeathDeclarationModal(false)}
                        >
                            <Alert type={'warning'}
                                   message="Declaring a patient dead is a irreversible process. Kindly use it with precautions."
                                   banner showIcon/>
                            <Alert style={{ width: '100%', marginTop: 8 }} type={'error'}
                                   message={`Enter the Patient ID ${patient.custom_id} in the input to declare the patient dead`}/>
                            <Input style={{ width: '100%', marginTop: 8 }} placeholder={'Patient ID'}
                                   onCopyCapture={(e) => {
                                       e.preventDefault();
                                   }} onChange={(e) => this.updateValues('deadDeclarationPatientID', e.target.value)}/>

                        </Modal>
                    </Row>

                </Card>
            );
        }
        return <PatientSelection {...this.props} />;
    }
}

export default Form.create()(PatientProfile);

function PatientRow(props) {
    return (
        <Row gutter={16} style={{ marginBottom: '5px' }}>
            <Col span={8} style={{ textAlign: 'right' }}>
                {props.label}:
            </Col>
            <Col span={16}>
                <strong>{props.value}</strong>
            </Col>
        </Row>
    );
}
