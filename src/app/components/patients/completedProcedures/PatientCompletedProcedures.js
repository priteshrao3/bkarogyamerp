import React from "react";
import {Button, Card, Checkbox, Divider, Icon, Table, Popconfirm, Menu, Dropdown, Tag, Tooltip, Input,Modal} from "antd";
import moment from "moment";
import {Link, Redirect, Route, Switch} from "react-router-dom";
import * as _ from "lodash";
import {getAPI, interpolate, putAPI, postAPI, displayMessage} from "../../../utils/common";
import {
    PROCEDURE_CATEGORY,
    PRODUCT_MARGIN,
    TREATMENTPLANS_API,
    SINGLE_REATMENTPLANS_API,
    TREATMENTPLANS_PDF
} from "../../../constants/api";
import {SELECT_FIELD, SUCCESS_MSG_TYPE} from "../../../constants/dataKeys";
import AddorEditDynamicCompletedTreatmentPlans from "./AddorEditDynamicCompletedTreatmentPlans";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import {BACKEND_BASE_URL} from "../../../config/connect";

import {sendMail} from "../../../utils/clinicUtils";

const {confirm} = Modal;

class PatientCompletedProcedures extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPatient: this.props.currentPatient,
            active_practiceId: this.props.active_practiceId,
            treatmentPlans: [],
            procedure_category: null,
            completedTreatmentPlans: [],
            incompletedTreatmentPlans: [],
            productMargin: [],
            loading: true
        }
        this.loadTreatmentPlans = this.loadTreatmentPlans.bind(this);
        this.editTreatmentPlanData = this.editTreatmentPlanData.bind(this);
    }

    componentDidMount() {
        this.loadTreatmentPlans();
        this.loadProductMargin();
    }

    loadProductMargin() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                productMargin: data,
                loading: false
            })
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })
        }
        getAPI(PRODUCT_MARGIN, successFn, errorFn);
    }

    loadTreatmentPlans(page = 1) {
        const incompleted = [];
        const that = this;
        const successFn = function (data) {
            that.setState(function (prevState) {
                if (data.current == 1)
                    return {
                        treatmentPlans: [...data.results],
                        next: data.next,
                        loading: false
                    }
                return {
                    treatmentPlans: [...prevState.treatmentPlans, ...data.results],
                    next: data.next,
                    loading: false
                }
            })
            data.results.forEach(function (treatmentplan) {
                if (!treatmentplan.is_completed) {
                    incompleted.push(treatmentplan)
                }
            })
            that.setState(function (prevState) {
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

        }
        const apiParams = {
            page,
            practice: this.props.active_practiceId,
            complete: true
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
        this.setState({
            editTreatmentPlan: record,
        });
        // console.log("props history",this.props);
        const {id} = this.props.match.params;
        this.props.history.push(`/erp/patient/${  id  }/emr/workdone/edit`);

    }

    deleteTreatmentPlans(record) {
        const that = this;
        confirm({
            title: 'Are you sure to delete this item?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                const obj = {
                    id: record.id,
                    patient: record.patient.id,
                    is_active: false
                }


                const successFn = function (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "Completed Procedure Deleted Successfully!");
                    that.loadTreatmentPlans();
                }
                const errorFn = function () {

                };
                postAPI(interpolate(TREATMENTPLANS_API, [that.props.match.params.id], null), obj, successFn, errorFn);
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
                <Icon type="check-circle" theme="twoTone" style={{marginLeft: '8px', fontSize: '20px'}} /> :
                null)
        }, {
            title: 'Procedure',
            key: 'procedure.name',
            dataIndex: 'procedure.name',

        }, {
            title: 'Quantity',
            dataIndex: 'quantity',
            initialValue: (this.state.editFields ? this.state.editFields.quantity : null),
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
<div>
                <Switch>
                    <Route
                      exact
                      path='/erp/patient/:id/emr/workdone/add'
                      render={(route) => <AddorEditDynamicCompletedTreatmentPlans {...this.state} {...that.props} {...route} loadData={this.loadTreatmentPlans} />}
                    />
                    <Route
                      exact
                      path='/erp/patient/:id/emr/workdone/edit'
                      render={(route) => (this.state.editTreatmentPlan ? (
                               <AddorEditDynamicCompletedTreatmentPlans
                                 {...this.state}
                                 {...route}
                                 {...that.props}
                                 editId={this.state.editTreatmentPlan.id}
                                 loadData={this.loadTreatmentPlans}
                               />
                             ) :
                               <Redirect to={`/erp/patient/${  this.props.match.params.id  }/emr/workdone`} />)}
                    />
                    <Route>

                        <div>
                            <Card
                              bodyStyle={{padding: 0}}
                              title={this.state.currentPatient ? `${this.state.currentPatient.user.first_name  } Completed Procedures` : "Completed Procedures "}
                              extra={(
<Button.Group>
                                    <Link
                                      to={`/erp/patient/${  this.props.match.params.id  }/emr/workdone/add`}
                                    ><Button><Icon
                                      type="plus"
                                    />Add
                                     </Button>
                                    </Link>
</Button.Group>
)}
                            />

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
                                <p>Send complete procedure To {this.state.patientName} ?</p>
                                <Input
                                  value={this.state.mail_to}
                                  placeholder="Email"
                                  onChange={(e)=>that.updateFormValue('mail_to',e.target.value)}
                                />
                            </Modal>
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
                  title={this.state.currentPatient ? `${this.state.currentPatient.user.first_name  } Completed Procedures` : "Completed Procedures "}
                  extra={(
<Button.Group>
                        <Button onClick={() => this.props.togglePatientListModal(true)}>
                            <Icon
                              type="plus"
                            />Add
                        </Button>
</Button.Group>
)}
                />
                {this.state.treatmentPlans.map((treatment) => (
<Card
  bodyStyle={{padding: 0}}
  key={treatment.id}
  style={{marginTop: 15}}
>
                        <div style={{padding: 16}}>
                            <h4>{treatment.date ? moment(treatment.date).format('ll') : null}
                            <Link to={`/erp/patient/${  treatment.patient.id  }/emr/workdone`}>
                             &nbsp;&nbsp; {treatment.patient.user?treatment.patient.user.first_name:null} (ID: {treatment.patient.custom_id?treatment.patient.custom_id:treatment.patient.id})&nbsp;
                            </Link>
                            <span>, {treatment.patient.gender}</span>
                                <Dropdown.Button
                                  size="small"
                                  style={{float: 'right'}}
                                  overlay={(
<Menu>
                                        <Menu.Item key="1" disabled={(treatment.practice && treatment.practice.id != this.props.active_practiceId)}>
                                            <Link to={`/erp/patient/${  treatment.patient.id  }/emr/workdone/edit`}>
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
                                            <Link to={`/erp/patient/${  treatment.patient.id  }/emr/timeline`}>
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
                    <p>Send Treatment Notes To {this.state.patientName} ?</p>
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

export default PatientCompletedProcedures;

function treatmentFooter(presc) {
    if (presc) {

        return (
<div>
            {presc.doctor ? (
<Tag color={presc.doctor ? presc.doctor.calendar_colour : null}>
                <b>{`Completed by  ${  presc.doctor.user.first_name}`} </b>
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
