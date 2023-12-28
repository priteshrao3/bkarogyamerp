import React from "react";
import {Checkbox, Table, Button, Card, Icon, Tag, Menu, Dropdown, Modal, Spin, Tooltip, Input} from "antd";
import {Link} from "react-router-dom";
import moment from "moment";
import {Redirect, Switch, Route} from "react-router";
import * as _ from "lodash";
import {
    CLINIC_NOTES_PDF,
    PROCEDURE_CATEGORY,
    TREATMENTPLANS_API,
    TREATMENTPLANS_MARK_COMPLETE_API,
    TREATMENTPLANS_PDF
} from "../../../constants/api";
import {getAPI, interpolate, displayMessage, postAPI} from "../../../utils/common";
import AddorEditDynamicTreatmentPlans from "./AddorEditDynamicTreatmentPlans";
import {SUCCESS_MSG_TYPE} from "../../../constants/dataKeys";
import {BACKEND_BASE_URL} from "../../../config/connect";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import {sendMail} from "../../../utils/clinicUtils";

const {confirm} = Modal;

class PatientTreatmentPlans extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPatient: this.props.currentPatient,
            active_practiceId: this.props.active_practiceId,
            treatmentPlans: [],
            procedure_category: null,
            incompletedTreatmentPlans: [],
            loading: true,
            selectedTreatments: {}
        }
        this.loadTreatmentPlans = this.loadTreatmentPlans.bind(this);
        this.editTreatmentPlanData = this.editTreatmentPlanData.bind(this);
        this.submitCompleteTreatment = this.submitCompleteTreatment.bind(this);
    }

    componentDidMount() {
        this.loadTreatmentPlans();
    }

    loadTreatmentPlans(page = 1) {
        const incompleted = [];
        const that = this;
        this.setState({
            loading: true
        })
        const successFn = function (data) {
            that.setState(function (prevState) {
                if (data.current == 1) {
                    return {
                        treatmentPlans: [...data.results],
                        next: data.next,
                        loading: false
                    }
                }
                return {
                    treatmentPlans: [...prevState.treatmentPlans, ...data.results],
                    next: data.next,
                    loading: false
                }
            });
            data.results.forEach(function (treatmentplan) {
                if (!treatmentplan.is_completed) {
                    incompleted.push(treatmentplan)
                }
            });
            that.setState(function (prevState) {
                if (data.current == 1) {
                    return {
                        incompletedTreatmentPlans: [...incompleted],
                        loading: false
                    }
                }
                return {
                    incompletedTreatmentPlans: [...prevState.incompletedTreatmentPlans, ...incompleted],
                    loading: false
                }
            })
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })

        };
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
        getAPI(TREATMENTPLANS_API, successFn, errorFn, apiParams)

    }

    editTreatmentPlanData(record) {
        console.log("record",record.id);
        this.setState({
            editTreatmentPlan: record,
            loading: false
        });
        const id = record.patient;
        this.props.history.push(`/erp/patient/${  record.id  }/emr/plans/edit`)

    }


    deleteTreatmentPlans(record) {
        const that = this;
        confirm({
            title: 'Are you sure to delete this item?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                const reqData = {
                    id: record.id,
                    patient: record.patient.id,
                    is_active: false,
                }
                const successFn = function (data) {
                    that.loadTreatmentPlans();
                    displayMessage(SUCCESS_MSG_TYPE, "Treatment Plan Deleted Successfully!");

                }
                const errorFn = function () {

                };
                postAPI(interpolate(TREATMENTPLANS_API, [that.props.match.params.id], null), reqData, successFn, errorFn);
            },
            onCancel() {
                console.log('Cancel');
            },
        });


    }

    treatmentCompleteToggle(id, option) {
        this.setState(function (prevState) {
            return {selectedTreatments: {...prevState.selectedTreatments, [id]: !!option}}
        });
    }

    submitCompleteTreatment() {
        const that = this;
        const {selectedTreatments} = this.state;
        const treatmentKeys = Object.keys(selectedTreatments);
        // let reqTreatmentsArray = [];
        const reqData = {
            treatment: [],
            patient: that.props.match.params.id
        };
        treatmentKeys.forEach(function (item) {
            const treatmentObj = {id: item, is_completed: selectedTreatments[item]};
            reqData.treatment.push(treatmentObj);
        });
        const successFn = function (data) {
            that.loadTreatmentPlans();
            that.setState({
                selectedTreatments: {}
            })
        }
        const errorFn = function () {

        }
        postAPI(interpolate(TREATMENTPLANS_MARK_COMPLETE_API, [this.props.match.params.id]), reqData, successFn, errorFn)
    }

    loadPDF(id) {
        const that = this;
        const successFn = function (data) {
            if (data.report)
                window.open(BACKEND_BASE_URL + data.report);
        }
        const errorFn = function () {

        }
        getAPI(interpolate(TREATMENTPLANS_PDF, [id]), successFn, errorFn);
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

    sendPatientMail =(treatment)=>{
        this.mailModalOpen()
        this.setState({
            patientName:_.get(treatment,'patient.user.first_name'),
            treatmentId:_.get(treatment,'id'),
            mail_to:_.get(treatment,'patient.user.email')
        })

    };

    sendMailToPatient =()=>{
        const {mail_to ,treatmentId } = this.state;
        const apiParams ={
            mail_to,
        }
        sendMail(interpolate(TREATMENTPLANS_PDF,[treatmentId]),apiParams)
        this.mailModalClose();
    }

    render() {
        const that = this;

        const columns = [{
            title: '',
            key: 'is_completed',
            render: (text, record) => (record.is_completed ?
                <Icon type="check-circle" theme="twoTone" style={{marginLeft: '8px', fontSize: '20px'}} /> : (
                <Checkbox
                  key={record.id}
                  onChange={(e) => this.treatmentCompleteToggle(record.id, e.target.checked)}
                  value={this.state.selectedTreatments[record.id]}
                />
              ))
        }, {
            title: 'Procedure',
            dataIndex: 'procedure',
            key: 'procedure',
            render: (text, record) => (
                <span> {text.name}</span>
            )
        }, {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        }, {
            title: 'Discount',
            dataIndex: 'discount',
            key: 'discount',
        }, {
            title: 'Cost per  Unit',
            dataIndex: 'cost',
            key: 'cost',
        }, {
            title: 'Notes',
            dataIndex: 'default_notes',
            key: 'default_notes',
        }];

        if (this.props.match.params.id) {
            return (
<div><Switch>
                <Route
                  exact
                  path='/erp/patient/:id/emr/plans/add'
                  render={(route) => (
<AddorEditDynamicTreatmentPlans
  {...this.state}
  {...route}
  {...that.props}
  loadData={this.loadTreatmentPlans}
/>
)}
                />
                <Route
                  exact
                  path='/erp/patient/:id/emr/plans/edit'
                  render={(route) => (this.state.editTreatmentPlan ? (
                           <AddorEditDynamicTreatmentPlans
                             {...this.state}
                             {...route}
                             {...that.props}
                             loadData={this.loadTreatmentPlans}
                             editId={this.state.editTreatmentPlan.id}
                           />
                         ) :
                           <Redirect to={`/erp/patient/${  this.props.match.params.id  }/emr/plans`} />)}
                />
                <div>
                    <Card
                      bodyStyle={{padding: 0}}
                      title={this.state.currentPatient ? `${this.state.currentPatient.user.first_name  } TreatmentPlans` : "TreatmentPlans"}
                      extra={(
<Button.Group>
                            <Button onClick={this.submitCompleteTreatment}>
                                <Icon type="save" />Save
                            </Button>
                            <Link to={`/erp/patient/${  this.props.match.params.id  }/emr/plans/add`}>
                                <Button type="primary">
                                    <Icon type="plus" />Add
                                </Button>
                            </Link>
</Button.Group>
)}
                    />
                    <Spin spinning={this.state.loading}>
                        {this.state.treatmentPlans.map((treatment) => (
<Card
  bodyStyle={{padding: 0}}
  style={{marginTop: 15}}
>
                                <div style={{padding: 16}}>
                                    <h4>{treatment.date ? moment(treatment.date).format('ll') : null}
                                        <Dropdown.Button
                                          size="small"
                                          style={{float: 'right'}}
                                          overlay={(
<Menu>
                                                <Menu.Item
                                                  key="1"
                                                  onClick={() => that.editTreatmentPlanData(treatment)}
                                                  disabled={(treatment.practice && treatment.practice.id != this.props.active_practiceId)}
                                                >
                                                    <Icon type="edit" />
                                                    Edit
                                                </Menu.Item>
                                                <Menu.Item
                                                  key="2"
                                                  onClick={() => that.deleteTreatmentPlans(treatment)}
                                                  disabled={(treatment.practice && treatment.practice.id != this.props.active_practiceId)}
                                                >
                                                    <Icon type="delete" />
                                                    Delete
                                                </Menu.Item>
                                                <Menu.Divider />
                                                <Menu.Item key="3">
                                                    <Link to={`/erp/patient/${  treatment.patient  }/emr/timeline`}>
                                                        <Icon type="clock-circle" />
                                                        &nbsp;
                                                        Patient Timeline
                                                    </Link>
                                                </Menu.Item>

                                                <Menu.Divider />
                                                <Menu.Item key="4">
                                                    <a onClick={() => this.sendPatientMail(treatment)}><Icon
                                                      type="mail"
                                                    /> Send mail to patient
                                                    </a>
                                                </Menu.Item>
</Menu>
)}
                                        >
                                            <a onClick={() => this.loadPDF(treatment.id)}><Icon type="printer" /></a>
                                        </Dropdown.Button>

                                    </h4>

                                </div>
                                <Table
                                  loading={this.state.loading}
                                  columns={columns}
                                  dataSource={treatment.treatment_plans}
                                  footer={() => treatmentFooter(treatment)}
                                  pagination={false}
                                  key={treatment.id}
                                />

</Card>
)
                        )}
                    </Spin>
                    <InfiniteFeedLoaderButton
                      loaderFunction={() => this.loadTreatmentPlans(that.state.next)}
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
                        <p>Send Treatment  To {this.state.patientName} ?</p>
                        <Input
                          value={this.state.mail_to}
                          placeholder="Email"
                          onChange={(e)=>that.updateFormValue('mail_to',e.target.value)}
                        />
                    </Modal>
                </div>
     </Switch>

</div>
)
        } 
            return (
<div>
                <Card
                  bodyStyle={{padding: 0}}
                  title={this.state.currentPatient ? `${this.state.currentPatient.user.first_name  } TreatmentPlans` : "TreatmentPlans"}
                  extra={(
<Button.Group>
                        <Button onClick={this.submitCompleteTreatment}>
                            <Icon type="save" />Save
                        </Button>
                        <Button type="primary" onClick={() => this.props.togglePatientListModal(true)}>
                            <Icon type="plus" />Add
                        </Button>
</Button.Group>
)}
                />
                <Spin spinning={this.state.loading}>
                    {this.state.treatmentPlans.map((treatment) => (
<Card
  bodyStyle={{padding: 0}}
  key={treatment.id}
  style={{marginTop: 15}}
>
                            <div style={{padding: 16}}>
                                <h4>{treatment.date ? moment(treatment.date).format('ll') : null}
                                <Link to={`/erp/patient/${  treatment.patient.id  }/emr/plans`}>
                                    &nbsp;&nbsp; {treatment.patient.user?treatment.patient.user.first_name:null} (ID: {treatment.patient.custom_id?treatment.patient.custom_id:treatment.patient.id})&nbsp;
                                </Link>
                                <span>, {treatment.patient.gender}</span>

                                    <Dropdown.Button
                                      size="small"
                                      style={{float: 'right'}}
                                      overlay={(
<Menu>
                                            <Menu.Item key="1" disabled={(treatment.practice && treatment.practice.id != this.props.active_practiceId)}>
                                                <Link to={`/erp/patient/${  treatment.patient.id  }/emr/plans/edit`}>
                                                    <Icon type="edit" />
                                                    &nbsp;
                                                    Edit
                                                </Link>
                                            </Menu.Item>
                                            <Menu.Item
                                              key="2"
                                              onClick={() => that.deleteTreatmentPlans(treatment)}
                                              disabled={(treatment.practice && treatment.practice.id != this.props.active_practiceId)}
                                            >
                                                <Icon type="delete" />
                                                Delete
                                            </Menu.Item>
                                            <Menu.Divider />
                                            <Menu.Item key="3">
                                                <Link to={`/erp/patient/${  treatment.patient  }/emr/timeline`}>
                                                    <Icon type="clock-circle" />
                                                    &nbsp;
                                                    Patient Timeline
                                                </Link>
                                            </Menu.Item>

                                            <Menu.Divider />
                                            <Menu.Item key="4">
                                                <a onClick={() => this.sendPatientMail(treatment)}><Icon
                                                  type="mail"
                                                /> Send mail to patient
                                                </a>
                                            </Menu.Item>

</Menu>
)}
                                    >
                                        <a onClick={() => this.loadPDF(treatment.id)}><Icon type="printer" /></a>
                                    </Dropdown.Button>
                                </h4>

                            </div>
                            <Table
                              loading={this.state.loading}
                              columns={columns}
                              dataSource={treatment.treatment_plans}
                              footer={() => treatmentFooter(treatment)}
                              pagination={false}
                              key={treatment.id}
                            />

</Card>
)
                    )}
                </Spin>
                <InfiniteFeedLoaderButton
                  loaderFunction={() => this.loadTreatmentPlans(that.state.next)}
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
                    <p>Send Treatment To {this.state.patientName} ?</p>
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

export default PatientTreatmentPlans;


function treatmentFooter(presc) {
    if (presc) {

        return (
<div>
            {presc.doctor ? (
<Tag color={presc.doctor ? presc.doctor.calendar_colour : null}>
                <b>{`prescribed by  ${  presc.doctor.user.first_name}`} </b>
</Tag>
) : null}
            {presc.practice ? (
<Tag style={{float: 'right'}}>
                <Tooltip title="Practice Name">
                    <b>{presc.practice.name} </b>
                </Tooltip>
</Tag>
) : null}
</div>
)
    }
    return null
}
