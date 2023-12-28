import React from "react";
import {
    Table,
    Button,
    Card,
    Icon,
    Tag, Menu,
    Dropdown, Modal, Tooltip, Spin, Row, Input
} from "antd";
import { Link } from "react-router-dom";
import moment from "moment";
import { Redirect, Switch, Route } from "react-router";
import * as _ from "lodash";
import {
    PRESCRIPTIONS_API,
    DRUG_CATALOG,
    PATIENT_PROFILE,
    PATIENTS_LIST,
    PRESCRIPTION_PDF, TREATMENTPLANS_PDF
} from "../../../constants/api";
import { getAPI, interpolate, displayMessage, postAPI, putAPI } from "../../../utils/common";
import AddorEditDynamicPatientPrescriptions from "./AddorEditDynamicPatientPrescriptions";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import { BACKEND_BASE_URL } from "../../../config/connect";
import { sendMail } from "../../../utils/clinicUtils";

const { confirm } = Modal;

class PatientPrescriptions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPatient: this.props.currentPatient,
            active_practiceId: this.props.active_practiceId,
            prescription: [],
            drug_catalog: null,
            editPrescription: null,
            loading: true,
            copy: false
        }
        this.loadPrescriptions = this.loadPrescriptions.bind(this);
        this.loadDrugCatalog = this.loadDrugCatalog.bind(this);
        this.editPrescriptionData = this.editPrescriptionData.bind(this);
        this.deletePrescriptions = this.deletePrescriptions.bind(this);

    }

    componentDidMount() {
        // if (this.props.match.params.id) {
        this.loadPrescriptions();
        this.loadDrugCatalog();
        // }

    }

    loadPrescriptions(page = 1) {
        const that = this;
        this.setState({
            loading: true
        })
        const successFn = function (data) {
            that.setState({
                prescription: data.results,
                nextPrescriptionPage: data.next,
                loading: false
            })
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })

        }
        const apiParams = {
            page,
            practice: this.props.active_practiceId
        };
        if (this.props.match.params.id) {
            apiParams.patient = this.props.match.params.id;
        }
        if (this.props.showAllClinic && this.props.match.params.id) {
            delete (apiParams.practice)
        }
        getAPI(PRESCRIPTIONS_API, successFn, errorFn, apiParams)
    }

    loadPDF(id) {
        const that = this;
        const successFn = function (data) {
            if (data.report)
                window.open(BACKEND_BASE_URL + data.report);
        }
        const errorFn = function () {

        }
        getAPI(interpolate(PRESCRIPTION_PDF, [id]), successFn, errorFn);
    }


    loadDrugCatalog() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                drug_catalog: data,
            })

        }
        const errorFn = function () {
            that.setState({})

        }
        getAPI(interpolate(DRUG_CATALOG, [this.props.active_practiceId]), successFn, errorFn)
    }

    editPrescriptionData(record) {
        console.log("logURL", record)
        const that = this;
        this.setState({
            editPrescription: record,
            copy: false
        }, function () {
            that.props.history.push(`/erp/patient/${record.patient.id}/emr/prescriptions/edit`)
        });
    }

    copyPrescriptionData(record) {
        console.log("logURL", record)
        const that = this;
        this.setState({
            editPrescription: record,
            copy: true
        }, function () {
            that.props.history.push(`/erp/patient/${record.patient.id}/emr/prescriptions/edit`)
        });
    }


    deletePrescriptions(record) {
        const that = this;
        confirm({
            title: 'Are you sure to delete this item?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                const reqData = { "id": record.id, patient: record.patient.id, is_active: false };
                const successFn = function (data) {
                    that.loadPrescriptions();
                }
                const errorFn = function () {
                }
                postAPI(interpolate(PRESCRIPTIONS_API, [that.props.match.params.id]), reqData, successFn, errorFn);
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }


    updateFormValue = (type, value) => {
        this.setState({
            [type]: value
        })
    };

    mailModalOpen = () => {
        this.setState({
            visibleMail: true
        })
    };

    mailModalClose = () => {
        this.setState({
            visibleMail: false
        })
    };

    sendPatientMail = (presc) => {
        this.mailModalOpen()
        this.setState({
            patientName: _.get(presc, 'patient.user.first_name'),
            prescriptionId: _.get(presc, 'id'),
            mail_to: _.get(presc, 'patient.user.email')
        })

    };

    sendMailToPatient = () => {
        const { mail_to, prescriptionId } = this.state;
        const apiParams = {
            mail_to,
        }
        sendMail(interpolate(PRESCRIPTION_PDF, [prescriptionId]), apiParams)
        this.mailModalClose();
    }



    render() {
        const drugs = {}
        if (this.state.drug_catalog) {

            this.state.drug_catalog.forEach(function (drug) {
                drugs[drug.id] = (`${drug.name},${drug.strength}`)
            })
        }
        const that = this;
        const columns = [{
            title: 'Drug',
            key: 'name',
            dataIndex: 'name',
        }, {
            title: 'Frequency',
            dataIndex: 'frequency',
            key: 'frequency',
            render: (frequency, record) => <span>{record.dosage}&nbsp;{record.frequency}</span>
        }, {
            title: 'Duration',
            dataIndex: 'duration',
            key: 'duration',
            render: (duration, record) => <span>{duration}&nbsp;{record.duration_type}</span>
        }, {
            title: 'Instruction',
            dataIndex: 'instruction',
            key: 'instruction',
            render: (instruction, record) => (
                <span>
                    {record.before_food ? <Tag>before food </Tag> : null}
                    {record.after_food ? <Tag>after food</Tag> : null}
                    {instruction}
                </span>
            )
        }];

        if (this.props.match.params.id) {
            return (
                <div><Switch>
                    <Route
                      exact
                      path='/erp/patient/:id/emr/prescriptions/add'
                      render={(route) => (
                            <AddorEditDynamicPatientPrescriptions
                              {...this.state}
                              {...this.props}
                              loadData={this.loadPrescriptions}
                              {...route}
                            />
                        )}
                    />
                    <Route
                      exact
                      path='/erp/patient/:id/emr/prescriptions/edit'
                      render={(route) => (that.state.editPrescription ? (
                            <AddorEditDynamicPatientPrescriptions
                              {...this.state}
                              {...route}
                              {...this.props}
                              loadData={this.loadPrescriptions}
                              editId={that.state.editPrescription.id}
                            />
                        ) :
                            <Redirect to={`/erp/patient/${that.props.match.params.id}/emr/prescriptions`} />)}
                    />
                    <Route>
                        <div>
                            <Card
                              bodyStyle={{ padding: 0 }}
                              title={this.state.currentPatient ? `${this.state.currentPatient.user.first_name} Prescriptions` : "Prescriptions"}
                              extra={(
                                    <Button.Group style={{ float: 'right' }}>
                                        <Link to={`/erp/patient/${this.props.match.params.id}/emr/prescriptions/add`}>
                                            <Button type="primary"><Icon type="plus" />Add</Button>
                                        </Link>
                                    </Button.Group>
                                )}
                            />

                            {this.state.prescription.map((presc) => (
                                <div>
                                    <Card
                                      style={{ marginTop: 10 }}
                                      bodyStyle={{ padding: 0 }}
                                      title={<small>{presc.date ? moment(presc.date).format('ll') : null}</small>}
                                      extra={(
                                            <Dropdown.Button
                                              size="small"
                                              style={{ float: 'right' }}
                                              overlay={(
                                                    <Menu>
                                                    <Menu.Item
                                                key="1"
                                                onClick={() => that.copyPrescriptionData(presc)}
                                                disabled={(presc.practice && presc.practice.id != that.props.active_practiceId)}
                                            >
                                                <Icon type="copy" />
                                                Copy
                                                </Menu.Item>
                                                        <Menu.Item
                                                          key="1"
                                                          onClick={() => that.editPrescriptionData(presc)}
                                                          disabled={(presc.practice && presc.practice.id != that.props.active_practiceId)}
                                                        >
                                                            <Icon type="edit" />
                                                            Edit
                                                        </Menu.Item>
                                                        <Menu.Item
                                                          key="2"
                                                          onClick={() => that.deletePrescriptions(presc)}
                                                          disabled={(presc.practice && presc.practice.id != that.props.active_practiceId)}
                                                        >
                                                            <Icon type="delete" />
                                                            Delete
                                                        </Menu.Item>



                                                        <Menu.Divider />
                                                        <Menu.Item key="3">
                                                            <Link to={`/erp/patient/${presc.patient}/emr/timeline`}>
                                                                <Icon type="clock-circle" />
                                                                &nbsp;
                                                                Patient Timeline
                                                            </Link>
                                                        </Menu.Item>

                                                        <Menu.Divider />
                                                        <Menu.Item key="4">
                                                            <a onClick={() => this.sendPatientMail(presc)}><Icon
                                                              type="mail"
                                                            /> Send mail to patient
                                                            </a>
                                                        </Menu.Item>

                                                    </Menu>
                                                )}
                                            >
                                                <a onClick={() => this.loadPDF(presc.id)}><Icon type="printer" /></a>
                                            </Dropdown.Button>
                                        )}
                                    >

                                        <Modal
                                          title={null}
                                          visible={this.state.visibleMail}
                                          onOk={this.sendMailToPatient}
                                          onCancel={this.mailModalClose}
                                          footer={[
                                                <Button key="back" onClick={this.mailModalClose}>
                                                    Cancel
                                                </Button>,
                                                <Button key="submit" type="primary" onClick={this.sendMailToPatient}>
                                                    Send
                                                </Button>,
                                            ]}
                                        >
                                            <p>Send Prescription  To {this.state.patientName} ?</p>
                                            <Input
                                              value={this.state.mail_to}
                                              placeholder="Email"
                                              onChange={(e) => that.updateFormValue('mail_to', e.target.value)}
                                            />
                                        </Modal>


                                        <Table
                                          columns={columns}
                                          dataSource={presc.drugs}
                                          pagination={false}
                                          footer={() => prescriptonFooter(presc)}
                                          key={presc.id}
                                        />
                                    </Card>
                                </div>
                            ))}
                            <Spin spinning={this.state.loading}>
                                <Row />
                            </Spin>
                            <InfiniteFeedLoaderButton
                              loading={this.state.loading}
                              loaderFunction={() => this.loadPrescriptions(this.state.nextPrescriptionPage)}
                              hidden={!this.state.nextPrescriptionPage}
                            />
                        </div>
                    </Route>
                     </Switch>

                </div>
            )
        }

        return (
            <div>
                <Card
                  bodyStyle={{ padding: 0 }}
                  title={this.state.currentPatient ? `${this.state.currentPatient.user.first_name} Prescriptions` : "Prescriptions"}
                  extra={(
                        <Button.Group style={{ float: 'right' }}>
                            <Button type="primary" onClick={() => this.props.togglePatientListModal(true)}>
                                <Icon type="plus" />Add
                            </Button>
                        </Button.Group>
                    )}
                />
                {this.state.prescription.map((presc) => (
                    <div key={presc.id}>
                        <Card
                          style={{ marginTop: 10, }}
                          bodyStyle={{ padding: 0 }}
                          title={(
                                <small>{presc.date ? moment(presc.date).format('ll') : null}
                                    <Link to={`/erp/patient/${presc.patient.id}/emr/prescriptions`}>
                                        &nbsp;&nbsp; {presc.patient.user ? presc.patient.user.first_name : null} (ID: {presc.patient.custom_id ? presc.patient.custom_id : presc.patient.id})&nbsp;
                                    </Link>
                                    <span>, {presc.patient.gender}</span>
                                </small>
                            )}
                          extra={(
                                <Dropdown.Button
                                  size="small"
                                  style={{ float: 'right' }}
                                  overlay={(
                                        <Menu>
                                        <Menu.Item
                                                key="1"
                                                onClick={() => that.copyPrescriptionData(presc)}
                                                disabled={(presc.practice && presc.practice.id != that.props.active_practiceId)}
                                            >
                                                <Icon type="copy" />
                                                Copy
                                  </Menu.Item>
                                            <Menu.Item
                                                key="2"
                                                onClick={() => that.editPrescriptionData(presc)}
                                                disabled={(presc.practice && presc.practice.id != that.props.active_practiceId)}
                                            >
                                                <Icon type="edit" />
                                                Edit
                                            </Menu.Item>
                                            <Menu.Item
                                                key="3"
                                                onClick={() => that.deletePrescriptions(presc)}
                                                disabled={(presc.practice && presc.practice.id != that.props.active_practiceId)}
                                            >
                                                <Icon type="delete" />
                                                Delete
                                            </Menu.Item>
                                            <Menu.Divider />
                                            <Menu.Item key="4">
                                                <Link to={`/erp/patient/${presc.patient}/emr/timeline`}>
                                                    <Icon type="clock-circle" />
                                                    &nbsp;
                                                    Patient Timeline
                                                </Link>
                                            </Menu.Item>

                                            <Menu.Divider />
                                            <Menu.Item key="5">
                                                <a onClick={() => this.sendPatientMail(presc)}><Icon
                                                  type="mail"
                                                /> Send mail to patient
                                                </a>
                                            </Menu.Item>
                                        </Menu>
                                    )}
                                >
                                    <a onClick={() => this.loadPDF(presc.id)}><Icon type="printer" /></a>
                                </Dropdown.Button>
                            )}
                        >
                            <Table
                              columns={columns}
                              dataSource={presc.drugs}
                              pagination={false}
                              footer={() => prescriptonFooter(presc)}
                              key={presc.id}
                            />
                        </Card>
                    </div>
                ))}
                <Spin spinning={this.state.loading}>
                    <Row />
                </Spin>
                <InfiniteFeedLoaderButton
                  loading={this.state.loading}
                  loaderFunction={() => this.loadPrescriptions(this.state.nextPrescriptionPage)}
                  hidden={!this.state.nextPrescriptionPage}
                />

                <Modal
                  title={null}
                  visible={this.state.visibleMail}
                  onOk={this.sendMailToPatient}
                  onCancel={this.mailModalClose}
                  footer={[
                        <Button key="back" onClick={this.mailModalClose}>
                            Cancel
                        </Button>,
                        <Button key="submit" type="primary" onClick={this.sendMailToPatient}>
                            Send
                        </Button>,
                    ]}
                >
                    <p>Send Prescription To {this.state.patientName} ?</p>
                    <Input
                      value={this.state.mail_to}
                      placeholder="Email"
                      onChange={(e) => that.updateFormValue('mail_to', e.target.value)}
                    />
                </Modal>
            </div>
        )


    }
}

export default PatientPrescriptions;

function prescriptonFooter(presc) {
    if (presc) {

        return (
            <div>
                {presc.doctor ? (
                    <Tooltip title="Doctor"><Tag color={presc.doctor ? presc.doctor.calendar_colour : null}>
                        <b>{`prescribed by  ${presc.doctor.user.first_name}`} </b>
                                            </Tag>
                    </Tooltip>
                ) : null}
                {presc.practice ? (
                    <Tag style={{ float: 'right' }}>
                        <Tooltip title="Practice Name">
                            <b>{presc.practice.name} </b>
                        </Tooltip>
                    </Tag>
                ) : null}
                {presc.labs.length ? (
                    <div>
                        +{presc.labs.length}&nbsp;Lab Orders
                {/* <Divider style={{margin:0}}/> */}
                    </div>
                ) : null}
            </div>
        )
    }
    return null
}

function prescriptionHeader(presc) {
    if (presc) {
        return <span>{presc.date ? moment(presc.date).format('lll') : null}</span>
    }
    return null;
}
