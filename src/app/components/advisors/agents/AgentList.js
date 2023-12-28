import React from "react";
import {
    Button,
    Modal,
    Card,
    Form,
    Icon,
    Row,
    Table,
    Divider,
    Popconfirm,
    Tag,
    Select,
    Col,
    Avatar,
    Checkbox,
    DatePicker
} from "antd";
import {Link, Route, Switch} from "react-router-dom";
import moment from "moment";
import ModalImage from "react-modal-image";
import {
    SUCCESS_MSG_TYPE,
    INPUT_FIELD, WARNING_MSG_TYPE, NUMBER_FIELD, DATE_PICKER,
} from "../../../constants/dataKeys";
import {
    AGENT_ROLES,
    ALL_PRACTICE,
    PATIENT_PROFILE,
    PATIENTS_LIST,
    WALLET_LEDGER,
    MY_AGENTS
} from "../../../constants/api"
import {getAPI, displayMessage, interpolate, postAPI, putAPI, makeFileURL} from "../../../utils/common";
import AddOrEditAgent from "./AddOrEditAgent";
import CustomizedTable from "../../common/CustomizedTable";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import PatientWalletLedger from "../../patients/wallet-ledger/PatientWalletLedger";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";
import {hideEmail, hideMobile} from "../../../utils/permissionUtils";
import TeamAnalysis from "../teamAnalysis/TeamAnalysis";
const {  RangePicker } = DatePicker;

// import Col from "antd/es/grid/col";

class AgentRoles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            visible: false,
            data: null,
            loading: true,
            agentRoles: [],
            practiceList: [],
            approved: null,
            showAgentData: null,
            patientModalVisible: false,
            patientList: [],
            KYCModal: null
        };
        this.loadData = this.loadData.bind(this);
        this.deleteObject = this.deleteObject.bind(this);
        this.loadAgentRoles = this.loadAgentRoles.bind(this);
    }

    componentDidMount() {
        this.loadData();
        this.loadAgentRoles();
    }

    openKYCModal = (record) => {
        this.setState({
            KYCModal: record
        })
    }

    loadAgentRoles() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                agentRoles: data,
            })
        };
        const errorFn = function () {
        };
        getAPI(AGENT_ROLES, successFn, errorFn);

    }

    loadData(page = 1) {
        const that = this;
        this.setState({
            loading: true
        })
        const successFn = function (data) {
            if (data.current == 1) {
                that.setState({
                    data: data.results,
                    total: data.count,
                    nextPage: data.next,
                    loading: false
                })
            } else {
                that.setState(function (prevState) {
                    return {
                        data: [...prevState.data, ...data.results],
                        total: data.count,
                        nextPage: data.next,
                        loading: false
                    }
                })
            }
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        const apiParams = {
            agent: true,
            page : page
        }
        if (that.state.role)
            apiParams.role = that.state.role;
        if (that.state.approved != null && that.state.approved !== 'null') {
            apiParams.approved = that.state.approved;
        }
        if(! this.props.user.staff.is_manager || !this.props.user.is_superuser){

            apiParams.practice = this.props.active_practiceId;
        }
        if(that.state.stdate !== null && that.state.endate !== null){
            apiParams.adjoin_gte = that.state.stdate;
            apiParams.adjoin_lte = that.state.endate;
        }

        getAPI(PATIENTS_LIST, successFn, errorFn, apiParams);
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    handleCancel = () => {
        this.setState({visible: false});
    }

    editObject(record) {
        this.setState({
            editAgentData: record,
            loading: false
        });

        this.props.history.push(`/erp/advisors/${record.id}/edit`)

    }

    showWallet = (record) => {
        this.setState({
            showAgentData: record,
        });
    }

    showPatient = (record) => {
        this.setState({
            patientModalVisible: true,
            advisorId: record.user.id
        }, function () {
            this.loadPatients(1)
        });
    }

    closePatientModal = () => {
        this.setState({
            patientModalVisible: false,
            patientList: null,
        })
    }


    loadPatients = (page = 1) => {
        const that = this;
        that.setState({
            loading: true
        });
        const successFn = function (data) {
            that.setState(function (prevState) {
                if (data.current == 1) {
                    return {
                        patientList: data.results,
                        nextPage: data.next,
                        loading: false
                    }
                }
                return {
                    patientList: [...prevState.patientList, ...data.results],
                    nextPage: data.next,
                    loading: false
                }

            })
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })
        }
        const apiParams = {
            referred_by: this.state.advisorId,
            page,
            agent:false

        }
        getAPI(PATIENTS_LIST, successFn, errorFn, apiParams);
    }


    payAgentModal = (record) => {
        this.setState({
            payAgentData: record,
        });
    }

    deleteObject(record) {
        const that = this;
        const reqData = {'id': record.id, is_agent: false, approved_by: this.props.user.id};
        const successFn = function (data) {
            that.setState({
                loading: false,
            })
            that.loadData();
        }
        const errorFn = function () {
        };
        putAPI(interpolate(PATIENT_PROFILE, [record.id]), reqData, successFn, errorFn)
    }

    approveAgent = (record) => {
        const that = this;

        const reqData = {'id': record.id, is_approved: true};
        const successFn = function (data) {
            displayMessage(SUCCESS_MSG_TYPE, "Agent Approved Successfully!");
            that.setState(function (prevState) {
                const agentList = [];
                prevState.data.forEach(function (agent) {
                    if (agent.id == record.id) {
                        agent.is_approved = true
                    }
                    agentList.push(agent);
                });
                return {
                    data: agentList,
                    approvalLoading: false
                }
            })
        }
        const errorFn = function () {
            that.setState({
                approvalLoading: false
            })
        };
        if (record.role) {
            that.setState({
                approvalLoading: true
            })
            putAPI(interpolate(PATIENT_PROFILE, [record.id]), reqData, successFn, errorFn)
        } else {
            displayMessage(WARNING_MSG_TYPE, "Kindly assign the role before approving!")
        }
    }

    // handleChange=(key,value)=>{
    //     console.log("type",key,value)
    //     this.props.form.setFieldsValue({
    //         [key]: value,
    //     });
    // }
    handleSubmit = (e) => {
        const that = this;
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {

            if (!err) {
                that.setState({
                    role: values.role,
                    approved: values.approved,
                }, function () {
                    that.loadData();
                })
            }
        })
    }


    handledatapicker = (dates)=>{
        const [startDate, endDate] = dates

        this.setState({
            stdate : startDate,
            endate : endDate
        })

    }


    render() {
        const that = this;
        let i = 1;
        const {getFieldDecorator} = this.props.form;
        const columns = [{
            title: 'S. No',
            key: 'sno',
            dataIndex: 'sno',
            render: (item, record) => <span> {i++}</span>,
            export: (item, record, index) => index + 1,
        }, {
            title: 'Name',
            dataIndex: 'user.first_name',
            key: 'first_name',
            render: (value, record) => <Link to={`/erp/patient/${record.id}/profile`}>{value}</Link>,
            export: (item, record) => (record.user.first_name),
        }, {
            title: 'Email',
            dataIndex: 'user.email',
            key: 'email',
            export: (item, record) => (record.user.email),
        }, {
            title: 'Mobile',
            dataIndex: 'user.mobile',
            key: 'mobile',
            export: (item, record) => (record.user.mobile),
        }, {
            title: 'Referrer',
            dataIndex: 'user.referer_data.referer.first_name',
            key: 'referrer',
            render: (value, record) => (value && record.user.referer_data.patient ?
                <Link to={`/erp/patient/${record.user.referer_data.patient}/profile`}>{value}</Link> : '--'),
            export: (item, record) => (record.user.referer ? record.user.referer_data.referer.first_name : '--'),
        }, {
            title: 'Role',
            dataIndex: 'role_data.name',
            key: 'role_data',
            export: (item, record) => (record.role_data.name),
        }, {
            title: 'Aadhar',
            dataIndex: 'aadhar_id',
            key: 'aadhar_id',
            export: (value) => (value),
        }, {
            title: 'Document',
            dataIndex: 'aadhar_upload',
            key: 'aadhar_upload',
            hideExport: true,
            render: (value, record) => (value ?
                <Button type="link" onClick={() => this.openKYCModal(record)}>Open KYC</Button> : '--')
        }, {
            title: 'Status',
            dataIndex: 'is_approved',
            key: 'is_approved',
            render: (value, record) => (
                value ? <Tag color="#87d068">Approved</Tag> : (
                    <Popconfirm
                      title="Are you sure approve this Advisor?"
                      onConfirm={() => that.approveAgent(record)}
                      okText="Yes"
                      cancelText="No"
                    >
                        <a href="#" disabled={that.state.approvalLoading}>Approve</a>
                    </Popconfirm>
                )
            )
        }, {
            title: 'History',
            key: 'history',
            hideExport: true,
            width: '15%',
            render: (text, record) => (
                <Button.Group size="small">
                    <Button type="link" onClick={() => this.showPatient(record)}> Patient</Button>
                    <Button type="link" onClick={() => this.showWallet(record)}> Wallet</Button>
                    <Button type="link" onClick={() => this.payAgentModal(record)}> Pay&nbsp;Out</Button>
                </Button.Group>
            ),
        }, {
            title: 'Action',
            key: 'action',
            hideExport: true,
            width: '10%',
            render: (text, record) => (
                <Button.Group size="small">
                    <Button type="link" onClick={() => this.editObject(record)}> Edit</Button>
                    <Popconfirm
                      title="Are you sure delete this item?"
                      onConfirm={() => that.deleteObject(record)}
                      okText="Yes"
                      cancelText="No"
                    >
                        <Button type="link">Delete</Button>
                    </Popconfirm>
                </Button.Group>
            ),
        }];
        const status = [
            {label: 'Approved', value: true},
            {label: 'Pending', value: false},
            {label: 'All', value: null}
        ];
        const PayAgentForm = Form.create()(DynamicFieldsForm);
        return (
            <Switch>
                <Route
                  exact
                  path="/erp/advisors/add"
                  render={(route) => (
                        <AddOrEditAgent
                          {...this.props}
                          title="Create Advisor"
                          loadData={this.loadData}
                        />
                    )}
                />

                <Route
                  exact
                  path="/erp/advisors/:id/edit"
                  render={(route) => (
                        <AddOrEditAgent
                          {...this.props}
                          {...this.state}
                          title="Edit Advisor"
                          loadData={this.loadData}
                        />
                    )}
                />
                <Route>
                    <Card title={(
                        <h4>Advisor List <Link to="/erp/advisors/add">
                            <Button style={{float: 'right'}} type="primary"><Icon type="plus" />
                                Add
                            </Button>
                                    </Link>
                        </h4>
                    )}
                    >
                        <Row>
                            <Col style={{float: "right"}}>
                                <Form layout="inline" onSubmit={this.handleSubmit}>
                                    <Form.Item key="date" label = "Date ">
                                    <RangePicker onChange={this.handledatapicker} />
                                    </Form.Item>
                                    <Form.Item key="role" label="Advisor Role">
                                        {getFieldDecorator("role", {initialValue: this.state.agentRoles ? this.state.agentRoles.id : ''},
                                        )(
                                            <Select placeholder="Advisor Role" style={{minWidth: 150}} allowClear>
                                                {this.state.agentRoles.map((option) => (
                                                    <Select.Option
                                                        key={option.id}
                                                      value={option.id}
                                                    >{option.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    </Form.Item>

                                    <Form.Item key="approved" label="Status">
                                        {getFieldDecorator("approved", {initialValue: this.state.approved ? this.state.approved : null},
                                        )(
                                            <Select placeholder="status" style={{minWidth: 150}}>
                                                {status.map(item => (
                                                    <Select.Option
                                                        key={item.id}
                                                      value={String(item.value)}
                                                    >
                                                        {item.label}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" style={{margin: 5}}>
                                            Submit
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Col>
                        </Row>

                        <CustomizedTable

                          loading={this.state.loading}
                          columns={columns}
                          dataSource={this.state.data}
                          pagination={false}
                        />
                        <InfiniteFeedLoaderButton
                          loading={this.state.loading}
                          loaderFunction={() => that.loadData(that.state.nextPage)}
                          hidden={!this.state.nextPage}
                        />
                        <Modal
                          visible={this.state.showAgentData}
                          closable={false}
                          centered
                          width={1000}
                          footer={null}
                          style={{top: 60}}
                        >
                            <Button
                              type="primary"
                              style={{position: 'absolute', top: '-50px'}}
                              onClick={() => this.payAgentModal(this.state.showAgentData)}
                            >Pay Out
                            </Button>
                            <Button
                              icon="close"
                              type="danger"
                              shape="circle"
                              style={{position: 'absolute', top: '-50px', right: 0}}
                              onClick={() => this.showWallet(null)}
                            />
                            {this.state.showAgentData ? (
                                <PatientWalletLedger
                                  currentPatient={this.state.showAgentData}
                                  key={this.state.showAgentData ? this.state.showAgentData.id + this.state.payAgentData : null}
                                />
                            ) : null}
                        </Modal>
                        <Modal
                          visible={this.state.payAgentData}
                          closable={false}
                          centered
                          footer={null}
                          closeIcon={null}
                          style={{top: 60}}
                        >
                            <Button
                              icon="close"
                              type="danger"
                              shape="circle"
                              style={{position: 'absolute', top: '-50px', right: 0}}
                              onClick={() => this.payAgentModal(null)}
                            />
                            {this.state.payAgentData ? (
                                <div>
                                    <h2>Pay {this.state.payAgentData.user.first_name}</h2>
                                    <PayAgentForm
                                      formProp={{
                                            method: 'post',
                                            action: WALLET_LEDGER,
                                            successFn() {
                                                that.payAgentModal(null)
                                            },
                                            errorFn() {

                                            },
                                            confirm: true,
                                            confirmText: "Are you sure to pay out this advisor?"
                                        }}
                                      fields={[{
                                            label: 'Amount',
                                            key: 'amount',
                                            type: NUMBER_FIELD,
                                            required: true,
                                            follow: 'INR'
                                        }, {
                                            label: 'Date',
                                            key: 'date',
                                            type: DATE_PICKER,
                                            required: true,
                                            format: 'YYYY-MM-DD',
                                            initialValue: moment()
                                        }, {
                                            label: 'Comments',
                                            key: 'comments',
                                            type: INPUT_FIELD,
                                            required: true,
                                            extra: 'Comments for this transaction'
                                        }]}
                                      defaultValues={[{
                                            key: 'ledger_type',
                                            value: 'Payout',
                                        }, {
                                            key: 'amount_type',
                                            value: 'Non Refundable',
                                        }, {
                                            key: 'practice',
                                            value: this.props.active_practiceId
                                        }, {
                                            key: 'is_mlm',
                                            value: false
                                        }, {
                                            key: 'is_cancelled',
                                            value: false
                                        }, {
                                            key: 'patient',
                                            value: this.state.payAgentData.id
                                        }, {
                                            key: 'staff',
                                            value: this.props.user.id
                                        }]}
                                    />
                                </div>
                            ) : null}
                        </Modal>
                        <Modal
                          visible={!!this.state.KYCModal}
                          footer={null}
                          closable={false}
                          width={1000}
                          style={{top: 60}}
                          onCancel={() => this.openKYCModal(null)}
                        >
                            {this.state.KYCModal ? (
                                <Row gutter={16}>
                                    <Col span={8} style={{textAlign: 'center'}}>
                                        {this.state.KYCModal.image ? (
                                            <img src={makeFileURL(this.state.KYCModal.image)} style={{width: '100%'}} />
                                        ) : (
                                            <Avatar
                                              size={200}
                                              shape="square"
                                              style={{backgroundColor: '#87d068'}}
                                            >
                                                {this.state.KYCModal.user.first_name ? (
                                                    this.state.KYCModal.user.first_name
                                                ) : (
                                                    <Icon type="user" />
                                                )}
                                            </Avatar>
                                        )}
                                        <Divider>KYC Documents</Divider>
                                        <div
                                          style={{

                                                width: '100%',
                                                height: '150px',
                                                border: '1px solid #bbb',
                                                // background: '#fff url("' + makeFileURL(item.file_type) + '") no-repeat center center',
                                                backgroundSize: 'cover',
                                                padding: 'auto',
                                                overflow: 'hidden',
                                                marginTop: 5,
                                                marginBottom: 5
                                            }}
                                        >
                                            <ModalImage
                                              style={{border: "3px solid red"}}
                                                // small={makeFileURL(this.state.filesData.file_type)}
                                              large={makeFileURL(this.state.KYCModal.aadhar_upload)}
                                              small={makeFileURL(this.state.KYCModal.aadhar_upload)}
                                            />
                                        </div>
                                        <div
                                          style={{

                                                width: '100%',
                                                height: '150px',
                                                border: '1px solid #bbb',
                                                // background: '#fff url("' + makeFileURL(item.file_type) + '") no-repeat center center',
                                                backgroundSize: 'cover',
                                                padding: 'auto',
                                                overflow: 'hidden',
                                                marginTop: 5,
                                                marginBottom: 5
                                            }}
                                        >
                                            <ModalImage
                                              style={{border: "3px solid red"}}
                                                // small={makeFileURL(this.state.filesData.file_type)}
                                              large={makeFileURL(this.state.KYCModal.pan_upload)}
                                              small={makeFileURL(this.state.KYCModal.pan_upload)}
                                            />
                                        </div>
                                    </Col>
                                    <Col span={16}>
                                        <h2>Advisor Details</h2>
                                        <PatientRow label="Name" value={this.state.KYCModal.user.first_name} />
                                        <PatientRow
                                          label="Referer"
                                          value={
                                                this.state.KYCModal.user.referer_data.referer ? (
                                                    <Link to={`/erp/patient/${this.state.KYCModal.user.referer_data.patient}/profile`}>
                                                        {this.state.KYCModal.user.referer_data.referer.first_name}
                                                    </Link>
                                                ) : (
                                                    '--'
                                                )
                                            }
                                        />
                                        <PatientRow label="AADHAR No" value={this.state.KYCModal.aadhar_id} />
                                        <PatientRow label="PAN Card No" value={this.state.KYCModal.pan_card_id} />
                                        <PatientRow
                                          label="Email"
                                          value={
                                                that.props.activePracticePermissions.PatientEmailId
                                                    ? this.state.KYCModal.user.email
                                                    : hideEmail(this.state.KYCModal.user.email)
                                            }
                                        />
                                        <PatientRow
                                          label="Primary Mobile"
                                          value={
                                                that.props.activePracticePermissions.PatientPhoneNumber
                                                    ? this.state.KYCModal.user.mobile
                                                    : hideMobile(this.state.KYCModal.user.mobile)
                                            }
                                        />
                                        <PatientRow
                                          label="Secondary Mobile"
                                          value={
                                                that.props.activePracticePermissions.PatientPhoneNumber
                                                    ? this.state.KYCModal.secondary_mobile_no
                                                    : hideMobile(this.state.KYCModal.secondary_mobile_no)
                                            }
                                        />
                                        <PatientRow label="Landline No" value={this.state.KYCModal.landline_no} />
                                        <PatientRow label="Address" value={this.state.KYCModal.address} />
                                        <PatientRow label="Locality" value={this.state.KYCModal.locality} />
                                        <PatientRow
                                          label="City"
                                          value={this.state.KYCModal.city_data ? this.state.KYCModal.city_data.name : null}
                                        />
                                        <PatientRow
                                          label="State"
                                          value={this.state.KYCModal.state_data ? this.state.KYCModal.state_data.name : null}
                                        />
                                        <PatientRow
                                          label="Country"
                                          value={this.state.KYCModal.country_data ? this.state.KYCModal.country_data.name : null}
                                        />
                                        <PatientRow label="Pincode" value={this.state.KYCModal.pincode} />
                                    </Col>
                                </Row>
                            ) : null}
                        </Modal>
                        <Modal
                          visible={this.state.patientModalVisible}
                          closable={false}
                            // centered
                          width={1000}
                          footer={null}
                          style={{top: 60}}
                        >

                            <Button
                              icon="close"
                              type="danger"
                              shape="circle"
                              style={{position: 'absolute', top: '-50px', right: 0}}
                              onClick={() => this.closePatientModal()}
                            />

                            <PatientList {...this.state} loadPatients={this.loadPatients} />
                        </Modal>


                    </Card>
                </Route>

            </Switch>
        )


    }
}

export default Form.create()(AgentRoles);

function PatientList(props) {

    const columns = [{
        title: "Id",
        dataIndex: 'custom_id',
        key: 'id',
        render: (item, record) => <span>{item}</span>
    }, {
        title: 'Name',
        dataIndex: 'user.first_name',
        key: 'name',
        render: (item, record) => <span>{record.user.first_name}</span>
    }, {
        title: 'City',
        dataIndex: 'city_data',
        key: 'city',
        render: (value) => value ? value.name : '--'
    }, {
        title: 'State',
        dataIndex: 'state_data',
        key: 'state',
        render: (value) => value ? value.name : '--'
    }, {
        title: 'PinCode',
        dataIndex: 'pincode',
        key: 'pincode',
        render: (item) => item || '--'
    }];


    return (
        <Card title="My Patients" bordered bodyStyle={{padding: 0}}>
            <CustomizedTable
              pagination={false}
              dataSource={props.patientList}
              columns={columns}
              hideReport={true}
              loading={props.loading}
            />
            <InfiniteFeedLoaderButton
              loading={props.loading}
              loaderFunction={() => props.loadPatients(props.nextPage)}
              hidden={!props.nextPage}
            />
         
        </Card>
       
    )
}

function PatientRow(props) {
    return (
        <Row gutter={16} style={{marginBottom: '5px'}}>
            <Col span={8} style={{textAlign: 'right'}}>
                {props.label}:
            </Col>
            <Col span={16}>
                <strong>{props.value}</strong>
            </Col>
        </Row>
    );
}
