import {
    Button,
    Card,
    Checkbox,
    Divider,
    Icon,
    Table,
    Dropdown,
    Menu,
    Col,
    Row,
    Tag,
    Spin,
    Tooltip,
    Avatar,
    Form, Input
,Modal} from "antd";
import React from "react";
import moment from "moment";
import {Route, Switch} from "react-router";
import {Link, Redirect} from "react-router-dom";
import * as _ from 'lodash'
import {getAPI, interpolate, postAPI, putAPI} from "../../../utils/common";
import {INVOICES_API, PATIENT_CLINIC_NOTES_API, CLINIC_NOTES_PDF} from "../../../constants/api";
import AddClinicNotes from "./AddClinicNotes";
import {CUSTOM_STRING_SEPERATOR} from "../../../constants/hardData";
import AddClinicNotesDynamic from "./AddClinicNotesDynamic";

import {BACKEND_BASE_URL} from "../../../config/connect";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import {sendMail} from  "../../../utils/clinicUtils";

const {confirm} = Modal;

class PatientClinicNotes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPatient: this.props.currentPatient,
            active_practiceId: this.props.active_practiceId,
            clinicNotes: [],
            editClinicNotes: null,
            loading: true,
            mail_to:null,

        }
        this.loadClinicNotes = this.loadClinicNotes.bind(this);
        this.editClinicNotesData = this.editClinicNotesData.bind(this);
    }

    componentDidMount() {
        // if (this.props.match.params.id) {
        this.loadClinicNotes();
        // }

    }

    loadClinicNotes(page = 1) {
        const that = this;
        const successFn = function (data) {
            that.setState(function (prevState) {
                if (data.current == 1)
                    return {
                        clinicNotes: [...data.results],
                        next: data.next,
                        loading: false
                    }
                return {
                    clinicNotes: [...prevState.clinicNotes, ...data.results],
                    next: data.next,
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
            page,
            practice: this.props.active_practiceId
        };
        if (this.props.match.params.id) {
            apiParams.patient = this.props.match.params.id;
        }
        if (this.props.showAllClinic && this.props.match.params.id) {
            delete (apiParams.practice)
        }

        getAPI(PATIENT_CLINIC_NOTES_API, successFn, errorFn, apiParams)

    }


    editClinicNotesData(record) {
        this.setState({
            editClinicNotes: record,
            loading: false
        });
        const {id} = this.props.match.params
        this.props.history.push(`/erp/patient/${  id  }/emr/clinicnotes/edit`)

    }

    deleteClinicNote(record) {
        const that = this;
        confirm({
            title: 'Are you sure to delete this item?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                const reqData = {id: record.id, patient: record.patient, is_active: false};
                const successFn = function (data) {
                    that.loadClinicNotes();
                }
                const errorFn = function () {
                }
                postAPI(interpolate(PATIENT_CLINIC_NOTES_API, [that.props.match.params.id]), reqData, successFn, errorFn);
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }

    loadPDF(id) {
        const that = this;
        const successFn = function (data) {
            if (data.report)
                window.open(BACKEND_BASE_URL + data.report);
        }
        const errorFn = function () {

        }
        getAPI(interpolate(CLINIC_NOTES_PDF, [id]), successFn, errorFn);
    }

    updateFormValue =(type,value)=>{
        this.setState({
            [type]: value
        })
    };

    mailModalOpen =() =>{
        this.setState({
            visibleMail:true
        })
    };

    mailModalClose =() =>{
        this.setState({
            visibleMail:false
        })
    };

    sendPatientMail =(clinicalNotes)=>{
        this.mailModalOpen()
        this.setState({
            patientName:_.get(clinicalNotes,'patient.user.first_name'),
            clinicId:_.get(clinicalNotes,'id'),
            mail_to:_.get(clinicalNotes,'patient.user.email')
        })

    };

    sendMailToPatient =()=>{
        const {mail_to ,clinicId } = this.state;
        const apiParams ={
            mail_to,
        }
        sendMail(interpolate(CLINIC_NOTES_PDF,[clinicId]),apiParams)
        this.mailModalClose();
    }

    render() {

        const that = this;
        const columns = [{
            title: 'Time',
            dataIndex: 'created_at',
            key: 'name',
            render: created_at => <span>{moment(created_at).format('LLL')}</span>,
        }, {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'Chief Complaints',
            dataIndex: 'chief_complaints',
            key: 'chief_complaints',
        }, {
            title: 'Investigations',
            dataIndex: 'investigations',
            key: 'investigations',
        }, {
            title: 'Diagnosis',
            dataIndex: 'diagnosis',
            key: 'diagnosis',
        }, {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
        }, {
            title: 'Observations',
            dataIndex: 'observations',
            key: 'observations',
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span>
                <a onClick={() => this.editClinicNotesData(record)}>Edit</a>
                <Divider type="vertical" />
                <a href="javascript:;">Delete</a>
                </span>
            ),
        }];

        if (this.props.match.params.id) {
            return (
<div><Switch>
                <Route
                  exact
                  path='/erp/patient/:id/emr/clinicnotes/add'
                  render={(route) => (
<AddClinicNotesDynamic
  {...route}
  {...this.props}
  loadData={this.loadClinicNotes}
/>
)}
                />
                <Route
                  exact
                  path='/erp/patient/:id/emr/clinicnotes/edit'
                  render={(route) => (this.state.editClinicNotes ? (
<AddClinicNotesDynamic
  {...this.state}
  {...route}
  loadData={this.loadClinicNotes}
/>
) :
                           <Redirect to={`/erp/patient/${  that.props.match.params.id  }/emr/clinicnotes/`} />)}
                />
                <Route>
                    <div>
                        <Card
                          bodyStyle={{padding: 0}}
                          title={this.state.currentPatient ? `${this.state.currentPatient.user.first_name  } ClinicNotes` : "ClinicNotes"}
                          extra={(
<Button.Group>
                                  <Link to={`/erp/patient/${  this.props.match.params.id  }/emr/clinicnotes/add`}>
                                      <Button type="primary">
                                          <Icon type="plus" />Add
                                      </Button>
                                  </Link>
</Button.Group>
)}
                        >

                            {/* <Table loading={this.state.loading} columns={columns} dataSource={this.state.clinicNotes}/> */}

                        </Card>
                        {this.state.clinicNotes.map(clinicNote => (
<Card
  style={{marginTop: 20}}
  title={<small>{clinicNote.date ? moment(clinicNote.date).format('ll') : null}</small>}
  extra={(
<Dropdown.Button
  size="small"
  style={{float: 'right'}}
  overlay={(
<Menu>
                                    <Menu.Item
                                      key="1"
                                      onClick={() => that.editClinicNotesData(clinicNote)}
                                      disabled={(clinicNote.practice && clinicNote.practice.id != this.props.active_practiceId)}
                                    >
                                        <Icon type="edit" />
                                        Edit
                                    </Menu.Item>
                                    <Menu.Item
                                      key="2"
                                      onClick={() => that.deleteClinicNote(clinicNote)}
                                      disabled={(clinicNote.practice && clinicNote.practice.id != this.props.active_practiceId)}
                                    >
                                        <Icon type="delete" />
                                        Delete
                                    </Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item key="3">
                                        <Link
                                          to={`/erp/patient/${  clinicNote.patient  }/emr/timeline`}
                                        >
                                            <Icon
                                              type="clock-circle"
                                            />
                                            &nbsp;
                                            Patient Timeline
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item key="4">
                                        <a onClick={() => this.sendPatientMail(clinicNote)}><Icon
                                          type="mail"
                                        /> Send mail to patient
                                        </a>
                                    </Menu.Item>
</Menu>
)}
>
                                <a onClick={() => this.loadPDF(clinicNote.id)}><Icon
                                  type="printer"
                                />
                                </a>

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
                                <p>Send Clinical Notes To {_.get(clinicNote,'patient.user.first_name')} ?</p>
                                <Input
                                  value={this.state.mail_to}
                                  placeholder="Email"
                                  onChange={(e)=>that.updateFormValue('mail_to',e.target.value)}
                                />
                            </Modal>

                            <Row>
                                <Col span={6}>
                                    <h3>Complaints</h3>
                                </Col>
                                <Col span={18} style={{borderLeft: '1px solid #ccc', padding: 4}}>
                                    <div style={{minHeight: 30}}>
                                        {clinicNote.chief_complaints ? clinicNote.chief_complaints.split(CUSTOM_STRING_SEPERATOR).map((str, index) =>
                                            <span>{index ? <br /> : null}{str}</span>) : null}
                                    </div>
                                    <Divider style={{margin: 0}} />
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    <h3>Observations</h3>
                                </Col>
                                <Col span={18} style={{borderLeft: '1px solid #ccc', padding: 4}}>
                                    <div style={{minHeight: 30}}>
                                        {clinicNote.observations ? clinicNote.observations.split(CUSTOM_STRING_SEPERATOR).map((str, index) =>
                                            <span>{index ? <br /> : null}{str}</span>) : null}
                                    </div>
                                    <Divider style={{margin: 0}} />
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    <h3>Investigations</h3>
                                </Col>
                                <Col span={18} style={{borderLeft: '1px solid #ccc', padding: 4}}>
                                    <div style={{minHeight: 30}}>
                                        {clinicNote.investigations ? clinicNote.investigations.split(CUSTOM_STRING_SEPERATOR).map((str, index) =>
                                            <span>{index ? <br /> : null}{str}</span>) : null}
                                    </div>
                                    <Divider style={{margin: 0}} />
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    <h3>Diagnoses</h3>
                                </Col>
                                <Col span={18} style={{borderLeft: '1px solid #ccc', padding: 4}}>
                                    <div style={{minHeight: 30}}>
                                        {clinicNote.diagnosis ? clinicNote.diagnosis.split(CUSTOM_STRING_SEPERATOR).map((str, index) =>
                                            <span>{index ? <br /> : null}{str}</span>) : null}
                                    </div>
                                    <Divider style={{margin: 0}} />
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    <h3>Notes</h3>
                                </Col>
                                <Col span={18} style={{borderLeft: '1px solid #ccc', padding: 4}}>
                                    <div style={{minHeight: 30}}>
                                        {clinicNote.notes ? clinicNote.notes.split(CUSTOM_STRING_SEPERATOR).map((str, index) =>
                                            <span>{index ? <br /> : null}{str}</span>) : null}
                                    </div>
                                    <Divider style={{margin: 0}} />
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    <h3>Recent Medications</h3>
                                </Col>
                                <Col span={18} style={{borderLeft: '1px solid #ccc', padding: 4}}>
                                    <div style={{minHeight: 30}}>
                                        {clinicNote.medication ? clinicNote.medication.split(CUSTOM_STRING_SEPERATOR).map((str, index) =>
                                            <span>{index ? <br /> : null}{str}</span>) : null}
                                    </div>
                                    <Divider style={{margin: 0}} />
                                </Col>
                            </Row>
                            <div>
                                {clinicNote.doctor ? (
                                    <Tag color={clinicNote.doctor ? clinicNote.doctor.calendar_colour : null}>
                                        <b>{`prescribed by  ${  clinicNote.doctor.user.first_name}`} </b>
                                    </Tag>
                                  ) : null}
                                {clinicNote.practice ? (
<Tag style={{float: 'right'}}>
                                    <Tooltip title="Practice Name">
                                        <b>{clinicNote.practice.name} </b>
                                    </Tooltip>
</Tag>
) : null}
                            </div>
</Card>
))}
                        <Spin spinning={this.state.loading}>
                            <Row />
                        </Spin>
                        <InfiniteFeedLoaderButton
                          loaderFunction={() => this.loadClinicNotes(that.state.next)}
                          loading={this.state.loading}
                          hidden={!this.state.next}
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
                  bodyStyle={{padding: 0}}
                  title={this.state.currentPatient ? `${this.state.currentPatient.user.first_name  } Clinic Notes` : "Clinic Notes"}
                  extra={(
<Button.Group>
                          <Button type="primary" onClick={() => this.props.togglePatientListModal(true)}>
                              <Icon type="plus" />Add
                          </Button>
</Button.Group>
)}
                />
                {this.state.clinicNotes.map(clinicNote => (
<Card
  style={{marginTop: 10}}
  key={clinicNote.id}
  extra={(
<Dropdown.Button
  size="small"
  overlay={(
<Menu>
                            <Menu.Item
                              key="1"
                              onClick={() => that.editClinicNotesData(clinicNote)}
                              disabled={(clinicNote.practice && clinicNote.practice.id != this.props.active_practiceId)}
                            >
                                <Icon type="edit" />
                                Edit
                            </Menu.Item>
                            <Menu.Item
                              key="2"
                              onClick={() => that.deleteClinicNote(clinicNote)}
                              disabled={(clinicNote.practice && clinicNote.practice.id != this.props.active_practiceId)}
                            >
                                <Icon type="delete" />
                                Delete
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item key="3">
                                <Link
                                  to={`/erp/patient/${  clinicNote.patient  }/emr/timeline`}
                                >
                                    <Icon type="clock-circle" />
                                    &nbsp;
                                    Patient Timeline
                                </Link>
                            </Menu.Item>

                            <Menu.Divider />
                            <Menu.Item key="4">
                                <a onClick={() => this.sendPatientMail(clinicNote)}><Icon
                                  type="mail"
                                /> Send mail to patient
                                </a>
                            </Menu.Item>
</Menu>
)}
>
                        <a onClick={() => this.loadPDF(clinicNote.id)}><Icon
                          type="printer"
                        />
                        </a>
</Dropdown.Button>
)}
  title={(
<div>
                        <small>{clinicNote.date ? moment(clinicNote.date).format('ll') : null}
                            <Link to={`/erp/patient/${  clinicNote.patient.id  }/emr/clinicnotes`}>
                                &nbsp;&nbsp; {clinicNote.patient.user ? clinicNote.patient.user.first_name : null} (ID: {clinicNote.patient.custom_id?clinicNote.patient.custom_id:clinicNote.patient.id})&nbsp;
                            </Link>
                            <span>, {clinicNote.patient.gender}</span>
                        </small>
</div>
)}
>


                    <Row>
                        <Col span={6}>
                            <h3>Complaints</h3>
                        </Col>
                        <Col span={18} style={{borderLeft: '1px solid #ccc', padding: 4}}>
                            <div style={{minHeight: 30}}>
                                {clinicNote.chief_complaints ? clinicNote.chief_complaints.split(CUSTOM_STRING_SEPERATOR).map((str, index) =>
                                    <span key={str}>{index ? <br /> : null}{str}</span>) : null}
                            </div>
                            <Divider style={{margin: 0}} />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>
                            <h3>Observations</h3>
                        </Col>
                        <Col span={18} style={{borderLeft: '1px solid #ccc', padding: 4}}>
                            <div style={{minHeight: 30}}>
                                {clinicNote.observations ? clinicNote.observations.split(CUSTOM_STRING_SEPERATOR).map((str, index) =>
                                    <span key={str}>{index ? <br /> : null}{str}</span>) : null}
                            </div>
                            <Divider style={{margin: 0}} />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>
                            <h3>Investigations</h3>
                        </Col>
                        <Col span={18} style={{borderLeft: '1px solid #ccc', padding: 4}}>
                            <div style={{minHeight: 30}}>
                                {clinicNote.investigations ? clinicNote.investigations.split(CUSTOM_STRING_SEPERATOR).map((str, index) =>
                                    <span key={str}>{index ? <br /> : null}{str}</span>) : null}
                            </div>
                            <Divider style={{margin: 0}} />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>
                            <h3>Diagnoses</h3>
                        </Col>
                        <Col span={18} style={{borderLeft: '1px solid #ccc', padding: 4}}>
                            <div style={{minHeight: 30}}>
                                {clinicNote.diagnosis ? clinicNote.diagnosis.split(CUSTOM_STRING_SEPERATOR).map((str, index) =>
                                    <span key={str}>{index ? <br /> : null}{str}</span>) : null}
                            </div>
                            <Divider style={{margin: 0}} />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>
                            <h3>Notes</h3>
                        </Col>
                        <Col span={18} style={{borderLeft: '1px solid #ccc', padding: 4}}>
                            <div style={{minHeight: 30}}>
                                {clinicNote.notes ? clinicNote.notes.split(CUSTOM_STRING_SEPERATOR).map((str, index) =>
                                    <span key={str}>{index ? <br /> : null}{str}</span>) : null}
                            </div>
                            <Divider style={{margin: 0}} />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>
                            <h3>Recent Medications</h3>
                        </Col>
                        <Col span={18} style={{borderLeft: '1px solid #ccc', padding: 4}}>
                            <div style={{minHeight: 30}}>
                                {clinicNote.medication ? clinicNote.medication.split(CUSTOM_STRING_SEPERATOR).map((str, index) =>
                                    <span>{index ? <br /> : null}{str}</span>) : null}
                            </div>
                            <Divider style={{margin: 0}} />
                        </Col>
                    </Row>
                    <div>
                        {clinicNote.doctor ? (
                            <Tag color={clinicNote.doctor ? clinicNote.doctor.calendar_colour : null}>
                                <b>{`prescribed by  ${  clinicNote.doctor.user.first_name}`} </b>
                            </Tag>
                          ) : null}
                        {clinicNote.practice ? (
<Tag style={{float: 'right'}}>
                            <Tooltip title="Practice Name">
                                <b>{clinicNote.practice.name} </b>
                            </Tooltip>
</Tag>
) : null}
                    </div>

</Card>
))}
                <Spin spinning={this.state.loading}>
                    <Row />
                </Spin>
                <InfiniteFeedLoaderButton
                  loaderFunction={() => this.loadClinicNotes(that.state.next)}
                  loading={this.state.loading}
                  hidden={!this.state.next}
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
                    <p>Send Clinical Notes To {that.state.patientName} ?</p>
                    <Input
                      value={this.state.mail_to}
                      placeholder="Email"
                      onChange={(e)=>that.updateFormValue('mail_to',e.target.value)}
                    />
                </Modal>
</div>
)
        

    }
}

export default PatientClinicNotes;
