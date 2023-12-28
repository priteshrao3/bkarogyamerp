import React from "react";
import {
    Button,
    Card,
    Icon,
    Steps,
    Timeline,
    Row,
    Col,
    Checkbox,
    Spin,
    Tag,
    Table,
    Affix,
    Tooltip,
    Input,
    Modal
} from "antd";
import moment from "moment";
import * as _ from "lodash";
import {
    getAPI,
    interpolate,
    makeFileURL,
    postAPI,
    startLoadingMessage,
    stopLoadingMessage
} from "../../../utils/common";
import {PATIENT_TIMELINE_API, PATIENT_TIMELINE_PDF, TREATMENTPLANS_PDF} from "../../../constants/api";
import {CUSTOM_STRING_SEPERATOR} from "../../../constants/hardData";
import {BACKEND_BASE_URL} from "../../../config/connect";
import {ERROR_MSG_TYPE, SUCCESS_MSG_TYPE} from "../../../constants/dataKeys";
import {sendMail} from "../../../utils/clinicUtils";

const {Step} = Steps;

const checkboxOption = [{
    label: <span style={{width: '100%'}}>Appointment</span>,
    value: 'appointments'
}, {
    label: <span style={{width: '100%'}}>Report Manual</span>,
    value: 'vital_signs'
}, {
    label: <span style={{width: '100%'}}>Clinic Notes</span>,
    value: 'clinic_notes'
}, {
    label: <span style={{width: '100%'}}>Treatment Plans</span>,
    value: 'treatment_plans'
}, {
    label: <span style={{width: '100%'}}>Procedures</span>,
    value: 'procedures'
}, {
    label: <span style={{width: '100%'}}>Files</span>,
    value: 'files'
}, {
    label: <span style={{width: '100%'}}>Prescriptions</span>,
    value: 'prescriptions'
}, {
    label: <span style={{width: '100%'}}>Invoices</span>,
    value: 'invoices'
}, {
    label: <span style={{width: '100%'}}>Payments</span>,
    value: 'payments'
}];

class PatientTimeline extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filterParams: ['appointments', 'vital_signs', 'clinic_notes', 'treatment_plans', 'procedures', 'files', 'prescriptions', 'invoices', 'payments'],
            checkAllFilters: true,
            selectedFiltersIntermediate: false,
            timelineData: [],
            checkedTimelineCards: []
        }
    }

    componentDidMount() {
        this.loadTimeline();
    }

    changeFilters = (value) => {
        const that = this;
        this.setState({
            filterParams: value,
            selectedFiltersIntermediate: !!value.length && value.length < checkboxOption.length,
            checkAllFilters: value.length === checkboxOption.length,
        }, function () {
            that.loadTimeline()
        })
    }

    onCheckAllFiltersChange = e => {
        const that = this;
        this.setState({
            filterParams: e.target.checked ? checkboxOption.map(item => item.value) : [],
            selectedFiltersIntermediate: false,
            checkAllFilters: e.target.checked,
        }, function () {
            that.loadTimeline()
        });
    };

    loadTimeline = () => {
        const that = this;
        const queryParams = {
            practice_id: this.props.active_practiceId
        };
        that.setState({
            loading: true
        })
        this.state.filterParams.forEach(function (value) {
            queryParams[value] = 1
        });
        const successFn = function (data) {
            let lastDate = moment().add(5, 'year');
            that.setState(function () {
                const timelineData = [];
                const checkList = {};
                data.forEach(function (item) {
                    if (lastDate.format('YMD') != moment(item.sort_date).format('YMD')) {
                        lastDate = moment(item.sort_date);
                        timelineData.push({type: 'Time', date: item.sort_date})
                    }
                    timelineData.push(item);
                    if (item.type != 'Appointments') {
                        if (checkList[item.type]) {
                            checkList[item.type][item.id] = true;
                        } else {
                            checkList[item.type] = {[item.id]: true}
                        }
                    }
                });
                return {
                    timelineData,
                    loading: false,
                    allCheckList: checkList
                }
            })
        }

        const errorFn = function () {
            that.setState({
                loading: false
            })
        }
        if (this.props.showAllClinic && this.props.match.params.id) {
            delete (queryParams.practice_id)
        }
        getAPI(interpolate(PATIENT_TIMELINE_API, [this.props.match.params.id]), successFn, errorFn, queryParams);
    }

    onCheckAllTimelineCard = (e) => {
        this.setState(function (prevState) {
            return {
                checkedTimelineCards: e.target.checked ? {...prevState.allCheckList} : {},
                indeterminate: false,
                checkAll: e.target.checked,
            }
        });
    }

    toggleTimelineCheckbox = (type, id, checked) => {
        this.setState(function (prevState) {
            const returnObj = {};
            const checkedList = prevState.checkedTimelineCards;
            if (checkedList[type]) {
                checkedList[type][id] = !!checked
            } else {
                checkedList[type] = {[id]: !!checked}
            }
            if (!checked) {
                returnObj.checkAll = false;
                returnObj.indeterminate = true;
                delete checkedList[type][id]
                if (Object.keys(checkedList[type]).length) {

                } else {
                    delete checkedList[type]
                    if (!Object.keys(checkedList).length) {
                        returnObj.indeterminate = false;
                    }
                }

            } else {
                returnObj.indeterminate = true;
                if (Object.keys(prevState.allCheckList).length == Object.keys(checkedList).length) {
                    const keysList = Object.keys(prevState.allCheckList);
                    let flag = false
                    for (let i = 0; i < keysList.length; i++) {
                        if (Object.keys(prevState.allCheckList[keysList[i]]).length != Object.keys(checkedList[keysList[i]]).length) {
                            flag = true;
                            returnObj.checkAll = false;
                            break;
                        }
                    }
                    if (!flag) {
                        returnObj.indeterminate = false;
                        returnObj.checkAll = true
                    }
                }
            }
            returnObj.checkedTimelineCards = checkedList;
            return returnObj;
        });
    };

    printCaseSheet = () => {
        const that = this;
        const msg = startLoadingMessage("Starting print case sheet...");
        const reqObj = {
            practice: that.props.active_practiceId,
            timeline: []
        }
        const keys = Object.keys(this.state.checkedTimelineCards);
        keys.forEach(function (key) {
            reqObj.timeline.push({
                type: key,
                id: Object.keys(that.state.checkedTimelineCards[key])
            })
        });
        const successFn = function (data) {
            stopLoadingMessage(msg, SUCCESS_MSG_TYPE, "Fetched report successfully!!");
            window.open(BACKEND_BASE_URL + data.report);
        }
        const errorFn = function () {
            stopLoadingMessage(msg, ERROR_MSG_TYPE, "Case sheet printing failed!!");
        }
        postAPI(interpolate(PATIENT_TIMELINE_PDF, [this.props.match.params.id]), reqObj, successFn, errorFn);
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


    sendCaseSheet =()=>{
        this.mailModalOpen()
        this.setState({
            mail_to:_.get(this.props.currentPatient,'user.email')
        })

    };

    sendMailToPatient =()=>{
        const that =this;
        const {mail_to  } = this.state;

        const reqObj = {
            mail_to,
            practice: that.props.active_practiceId,
            timeline: []
        }
        const keys = Object.keys(this.state.checkedTimelineCards);
        keys.forEach(function (key) {
            reqObj.timeline.push({
                type: key,
                id: Object.keys(that.state.checkedTimelineCards[key])
            })
        });

        const successFn =function(data){

        }
        const errorFn = function(data){

        }
        postAPI(interpolate(PATIENT_TIMELINE_PDF,[this.props.match.params.id]),reqObj, successFn ,errorFn)
        this.mailModalClose();
    }

    render() {
        const that = this;
        const {timelineData} =this.state


        return (
<Card
  title="Timeline"
  extra={(
<Button.Group>
                         <Button onClick={() => this.sendCaseSheet(this.state.timelineData)}><Icon type="mail" /> Case Sheet</Button>
                         <Button type="primary" onClick={() => this.printCaseSheet()}>Print Case Sheet</Button>
</Button.Group>
)}
>
            <Spin spinning={this.state.loading}>
                <Row>
                    <Col span={4}>
                        <Checkbox
                          indeterminate={this.state.selectedFiltersIntermediate}
                          onChange={this.onCheckAllFiltersChange}
                          checked={this.state.checkAllFilters}
                        >
                            <b>Select all</b>
                        </Checkbox>
                        <br />
                        <Checkbox.Group
                          size="large"
                          value={this.state.filterParams}
                          options={checkboxOption}
                            // defaultValue={['Apple']}
                          onChange={this.changeFilters}
                        />
                    </Col>
                    <Col span={20}>
                        <Affix top={10}>
                            <h4 style={{
                                textAlign: 'right', padding: '5px',
                                backgroundImage: 'linear-gradient(to left, white , transparent)',
                            }}
                            ><Checkbox
                              indeterminate={this.state.indeterminate}
                              onChange={this.onCheckAllTimelineCard}
                              checked={this.state.checkAll}
                            >Select All
                             </Checkbox>
                            </h4>
                        </Affix>
                        <Timeline progressDot current={1} direction="vertical">
                            {this.state.timelineData.map(item => (
                                <Timeline.Item dot={item.type == 'Time' ? (
<Icon
  type="clock-circle-o"
  style={{fontSize: '25px'}}
/>
) : null}
                                >{timelineItem({
                                    ...item,
                                    checkedTimelineCards: that.state.checkedTimelineCards,
                                    toggleTimelineCheckbox: that.toggleTimelineCheckbox
                                })}
                                </Timeline.Item>
                              ))}
                        </Timeline>

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
                            <p>Send Timeline To {_.get(this.props.currentPatient,'user.first_name')} ?</p>
                            <Input
                              value={this.state.mail_to}
                              placeholder="Email"
                              onChange={(e)=>that.updateFormValue('mail_to',e.target.value)}
                            />
                        </Modal>
                    </Col>
                </Row>
            </Spin>

</Card>
)
    }
}

export default PatientTimeline;

function

dateTimeStamp(item) {
    return (
<span><Affix top={20} offsetTop={30}><h2 style={{
        marginLeft: '10px',
        padding: '5px',
        backgroundImage: 'linear-gradient(to right, #ddd , white)',
        borderRadius: '4px'
    }}
>{moment(item.date).format('LL')}
                                     </h2>
      </Affix>
</span>
)
}

function timelineItem(item) {
    switch (item.type) {
        case 'Clinical Notes':
            return timelineClinicalNote(item);
        case 'Appointments':
            return timelineAppointmentCard(item);
        case 'Files':
            return timelineFilesCard(item);
        case 'Invoices':
            return timelineInvoiceCard(item);
        case 'Vital Signs':
            return timelineVitalSignCard(item);
        case 'Prescriptions':
            return timelinePrescriptionCard(item);
        case 'Payments':
            return timelinePaymentCard(item);
        case 'Time':
            return dateTimeStamp(item);
        case 'Procedures':
            return timelineProcedureCard(item);
        case 'Treatment Plans':
            return timelineTreatmentPlanCard(item);
        default:
            return item.type
    }
}

function

timelineAppointmentCard(item) {
    return (
<Card
  hoverable
  bodyStyle={{backgroundColor: (item.checkedTimelineCards[item.type] && item.checkedTimelineCards[item.type][item.id] ? '#B5EEFF' : 'initial')}}
>
        <h2><Icon type="calendar" /> Appointment
            {item.practice_data ? (
<Tag style={{float: 'right'}}>
                <Tooltip title="Practice Name">
                    <b>{item.practice_data.name} </b>
                </Tooltip>
</Tag>
) : null}
        </h2>
        {item.doctor_data ? (
            <p style={{
                borderLeft: `5px solid ${  item.doctor_data.calendar_colour}`,
                paddingLeft: '5px'
            }}
            >{item.doctor_data.user.first_name}
            </p>
          ) : null}

        {moment(item.schedule_at).format('hh:mm A')} to {moment(item.schedule_at).add(item.slot, 'mins').format('HH:mm A')}
</Card>
);
}

function timelineFilesCard(item) {
    return (
<Card
  hoverable
  bodyStyle={{backgroundColor: (item.checkedTimelineCards[item.type] && item.checkedTimelineCards[item.type][item.id] ? '#B5EEFF' : 'initial')}}
>
        <h2><Icon type="picture" /> File<Checkbox
          size="large"
          style={{float: 'right'}}
          checked={(item.checkedTimelineCards[item.type] ? item.checkedTimelineCards[item.type][item.id] : false)}
          onChange={(e) => item.toggleTimelineCheckbox(item.type, item.id, e.target.checked)}
        />
            {item.practice_data ? (
<Tag style={{float: 'right'}}>
                <Tooltip title="Practice Name">
                    <b>{item.practice_data.name} </b>
                </Tooltip>
</Tag>
) : null}
        </h2>
        <img src={makeFileURL(item.file_type)} alt="" style={{height: 100}} />
</Card>
)
}

function

timelineInvoiceCard(item) {
    return (
<Card
  hoverable
  bodyStyle={{backgroundColor: (item.checkedTimelineCards[item.type] && item.checkedTimelineCards[item.type][item.id] ? '#B5EEFF' : 'initial')}}
>
        <h2><Icon type="audit" /> Invoice<Checkbox
          size="large"
          style={{float: 'right'}}
          checked={(item.checkedTimelineCards[item.type] ? item.checkedTimelineCards[item.type][item.id] : false)}
          onChange={(e) => item.toggleTimelineCheckbox(item.type, item.id, e.target.checked)}
        />
            {item.practice_data ? (
<Tag style={{float: 'right'}}>
                <Tooltip title="Practice Name">
                    <b>{item.practice_data.name} </b>
                </Tooltip>
</Tag>
) : null}
        </h2>
        {item.procedure.map(proc => <Tag>{proc.name}</Tag>)}
        {item.inventory.map(proc => <Tag>{proc.name}</Tag>)}
        <br /><b>{item.invoice_id}</b>
        <br /><b>Invoice Amount: INR {item.total}</b>
        <br /><b>Paid Amount: INR {item.payments_data}</b>
        <br /><b>Due Amount: INR {item.total - item.payments_data}</b>
</Card>
)
}

function

timelineClinicalNote(item) {
    return (
<Card
  hoverable
  bodyStyle={{backgroundColor: (item.checkedTimelineCards[item.type] && item.checkedTimelineCards[item.type][item.id] ? '#B5EEFF' : 'initial')}}
>
        <h2><Icon type="solution" /> Clinical Note Added<Checkbox
          size="large"
          style={{float: 'right'}}
          checked={(item.checkedTimelineCards[item.type] ? item.checkedTimelineCards[item.type][item.id] : false)}
          onChange={(e) => item.toggleTimelineCheckbox(item.type, item.id, e.target.checked)}
        />
            {item.practice ? (
<Tag style={{float: 'right'}}>
                <Tooltip title="Practice Name">
                    <b>{item.practice.name} </b>
                </Tooltip>
</Tag>
) : null}
        </h2>
        {item.chief_complaints ? (
            <p>Chief Complaints
                <ul>
                    {item.chief_complaints.split(CUSTOM_STRING_SEPERATOR).map(item =>
                        item ? <li>{item}</li> : null)}
                </ul>
            </p>
          )
            : null}
        {item.observations ? (
            <p>Observations
                <ul>
                    {item.observations.split(CUSTOM_STRING_SEPERATOR).map(item =>
                        item ? <li>{item}</li> : null)}
                </ul>
            </p>
          )
            : null}
        {item.investigations ? (
            <p>Investigations
                <ul>
                    {item.investigations.split(CUSTOM_STRING_SEPERATOR).map(item =>
                        item ? <li>{item}</li> : null)}
                </ul>
            </p>
          )
            : null}
        {item.diagnosis ? (
            <p>Diagnosis
                <ul>
                    {item.diagnosis.split(CUSTOM_STRING_SEPERATOR).map(item =>
                        item ? <li>{item}</li> : null)}
                </ul>
            </p>
          )
            : null}
        {item.notes ? (
            <p>Notes
                <ul>
                    {item.notes.split(CUSTOM_STRING_SEPERATOR).map(item =>
                        item ? <li>{item}</li> : null)}
                </ul>
            </p>
          )
            : null}
</Card>
);
}

function

timelineVitalSignCard(item) {
    const columns = [{
        title: 'Time',
        dataIndex: 'created_at',
        key: 'name',
        render: created_at => <span>{moment(created_at).format('hh:mm A')}</span>,
    }, {
        title: 'Temp(F)',
        key: 'temperature',
        render: (text, record) => (
            <span> {record.temperature}<br />,{record.temperature_part}</span>
        )
    }, {
        title: 'Pulse (BPM)',
        dataIndex: 'pulse',
        key: 'pulse',
    }, {
        title: 'RR breaths/min',
        dataIndex: 'resp_rate',
        key: 'resp_rate',
    }, {
        title: 'SYS/DIA mmhg',
        key: 'address',
        render: (text, record) => (
<>{record.blood_pressure_up ?
                <span> {record.blood_pressure_up}/{record.blood_pressure_down}<br />,{record.position}</span> : null}
</>
        )
    }, {
        title: 'WEIGHT kg',
        dataIndex: 'weight',
        key: 'weight',
    }, {
        title: "Creatinine Level",
        key: "creatinine",
        dataIndex: "creatinine",
    }, {
        title: "Haemoglobin Level",
        key: "haemoglobin",
        dataIndex: "haemoglobin",
    }, {
        title: "Urea Level",
        key: "urea",
        dataIndex: "urea",

    }, {
        title: "Uric Acid Level",
        key: "uric_acid",
        dataIndex: "uric_acid",
    }];
    return (
<Card
  hoverable
  bodyStyle={{backgroundColor: (item.checkedTimelineCards[item.type] && item.checkedTimelineCards[item.type][item.id] ? '#B5EEFF' : 'initial')}}
>
        <h2><Icon type="heart" /> Report Manual Recorded<Checkbox
          size="large"
          style={{float: 'right'}}
          checked={(item.checkedTimelineCards[item.type] ? item.checkedTimelineCards[item.type][item.id] : false)}
          onChange={(e) => item.toggleTimelineCheckbox(item.type, item.id, e.target.checked)}
        />
            {item.practice_data ? (
<Tag style={{float: 'right'}}>
                <Tooltip title="Practice Name">
                    <b>{item.practice_data.name} </b>
                </Tooltip>
</Tag>
) : null}
        </h2>
        {item.doctor_data ? (
            <p style={{
                borderLeft: `5px solid ${  item.doctor_data.calendar_colour}`,
                paddingLeft: '5px'
            }}
            >{item.doctor_data.user.first_name}
            </p>
          ) : null}
        <Table
          columns={columns}
          size="small"
          pagination={false}
          dataSource={[item]}
        />
</Card>
)
}

function

timelinePrescriptionCard(item) {
    return (
<Card
  hoverable
  bodyStyle={{backgroundColor: (item.checkedTimelineCards[item.type] && item.checkedTimelineCards[item.type][item.id] ? '#B5EEFF' : 'initial')}}
>
        <h2><Icon type="solution" /> Prescription Added<Checkbox
          size="large"
          style={{float: 'right'}}
          checked={(item.checkedTimelineCards[item.type] ? item.checkedTimelineCards[item.type][item.id] : false)}
          onChange={(e) => item.toggleTimelineCheckbox(item.type, item.id, e.target.checked)}
        />
            {item.practice ? (
<Tag style={{float: 'right'}}>
                <Tooltip title="Practice Name">
                    <b>{item.practice.name} </b>
                </Tooltip>
</Tag>
) : null}
        </h2>
        {item.doctor ? (
            <p style={{
                borderLeft: `5px solid ${  item.doctor.calendar_colour}`,
                paddingLeft: '5px'
            }}
            >{item.doctor.user.first_name}
            </p>
          ) : null}
        {item.drugs.map(drug => <Tag>{drug.name}</Tag>)}

</Card>
)
}

function

timelinePaymentCard(item) {
    return (
<Card
  hoverable
  bodyStyle={{backgroundColor: (item.checkedTimelineCards[item.type] && item.checkedTimelineCards[item.type][item.id] ? '#B5EEFF' : 'initial')}}
>
        <h2><Icon type="dollar" /> Payment<Checkbox
          size="large"
          style={{float: 'right'}}
          checked={(item.checkedTimelineCards[item.type] ? item.checkedTimelineCards[item.type][item.id] : false)}
          onChange={(e) => item.toggleTimelineCheckbox(item.type, item.id, e.target.checked)}
        />
            {item.practice_data ? (
<Tag style={{float: 'right'}}>
                <Tooltip title="Practice Name">
                    <b>{item.practice_data.name} </b>
                </Tooltip>
</Tag>
) : null}
        </h2>
        <b>{item.payment_id}</b>
        <br /><b>Amount Paid: INR {item.total}</b>
</Card>
)
}

function

timelineProcedureCard(item) {
    return (
<Card
  hoverable
  bodyStyle={{backgroundColor: (item.checkedTimelineCards[item.type] && item.checkedTimelineCards[item.type][item.id] ? '#B5EEFF' : 'initial')}}
>
        <h2>Procedure Performed<Checkbox
          size="large"
          style={{float: 'right'}}
          checked={(item.checkedTimelineCards[item.type] ? item.checkedTimelineCards[item.type][item.id] : false)}
          onChange={(e) => item.toggleTimelineCheckbox(item.type, item.id, e.target.checked)}
        />
            {item.practice ? (
<Tag style={{float: 'right'}}>
                <Tooltip title="Practice Name">
                    <b>{item.practice.name} </b>
                </Tooltip>
</Tag>
) : null}
        </h2>
        {item.doctor ? (
            <p style={{
                borderLeft: `5px solid ${  item.doctor.calendar_colour}`,
                paddingLeft: '5px'
            }}
            >{item.doctor.user.first_name}
            </p>
          ) : null}
        {item.treatment_plans.map(item => <Tag>{item.procedure.name}</Tag>)}
</Card>
)
}

function

timelineTreatmentPlanCard(item) {
    return (
<Card
  hoverable
  bodyStyle={{backgroundColor: (item.checkedTimelineCards[item.type] && item.checkedTimelineCards[item.type][item.id] ? '#B5EEFF' : 'initial')}}
>
        <h2>Treatment Plan <Checkbox
          size="large"
          style={{float: 'right'}}
          checked={(item.checkedTimelineCards[item.type] ? item.checkedTimelineCards[item.type][item.id] : false)}
          onChange={(e) => item.toggleTimelineCheckbox(item.type, item.id, e.target.checked)}
        />
            {item.practice ? (
<Tag style={{float: 'right'}}>
                <Tooltip title="Practice Name">
                    <b>{item.practice.name} </b>
                </Tooltip>
</Tag>
) : null}
        </h2>
        {item.doctor ? (
            <p style={{
                borderLeft: `5px solid ${  item.doctor.calendar_colour}`,
                paddingLeft: '5px'
            }}
            >{item.doctor.user.first_name}
            </p>
          ) : null}
        {item.treatment_plans.map(item => <Tag>{item.procedure.name}</Tag>)}
</Card>
)
}
