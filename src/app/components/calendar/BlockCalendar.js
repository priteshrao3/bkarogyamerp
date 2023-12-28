import React from "react";
import moment from "moment";
import {Form, Card, Row, Col,Popover, List,Button, DatePicker,TimePicker,Input,Select,Divider} from "antd";
import { tag } from "postcss-selector-parser";
import {
    DATE_PICKER,
    DATE_TIME_PICKER, DOCTORS_ROLE,
    ERROR_MSG_TYPE,
    INPUT_FIELD,
    SELECT_FIELD,
    TIME_PICKER
} from "../../constants/dataKeys";
import DynamicFieldsForm from "../common/DynamicFieldsForm";
import {APPOINTMENT_PERPRACTICE_API, BLOCK_CALENDAR, PRACTICESTAFF} from "../../constants/api";
import {displayMessage, getAPI, interpolate,postAPI} from "../../utils/common";
import { loadDoctors } from "../../utils/clinicUtils";
import {
    CANCELLED_STATUS,
    CHECKOUT_STATUS,
    ENGAGED_STATUS,
    SCHEDULE_STATUS,
    WAITING_STATUS
} from "../../constants/hardData";
import EventPatientPopover from "./EventPatientPopover";
import {REQUIRED_FIELD_MESSAGE} from "../../constants/messages";

class BlockCalendar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            practiceDoctors: [],
            blockedAppointmentParams: {
                block_from:moment(),
                block_to:moment(),
            }
        };
        loadDoctors(this);
    }

    // componentDidMount() {
    //
    // }
    changeParamsForBlockedAppointments = (type, value) => {
        const that = this;
        this.setState(function (prevState) {
            return {
                blockedAppointmentParams: {
                    ...prevState.blockedAppointmentParams,
                    [type]: value
                }
            }
        }, function () {
            // if (valueObj.block_from && valueObj.block_to)
            that.retrieveBlockingAppointments();
        })
    }

    retrieveBlockingAppointments = () => {
        const that = this;
        that.setState({
            loading: true
        });
        const successFn = function (data) {
            that.setState(function (prevState) {
                return {
                    blockingAppointments: data,
                    loading: false
                }
            });
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })
        }
        if (this.state.blockedAppointmentParams.block_from && this.state.blockedAppointmentParams.block_to)
            getAPI(interpolate(APPOINTMENT_PERPRACTICE_API, [this.props.active_practiceId]), successFn, errorFn, {
                start: moment(that.state.blockedAppointmentParams.block_from).format('YYYY-MM-DD'),
                end: moment(that.state.blockedAppointmentParams.block_to).format('YYYY-MM-DD'),
                doctor:that.state.blockedAppointmentParams.doctor,
            });
    }

    handleSubmit =(e)=>{
        const that=this;
        e.preventDefault();
        let reqData={}
        this.props.form.validateFields((err, values) => {
            if (!err) {
                reqData = {...values,
                    practice:this.props.active_practiceId,
                    // block_from:moment(that.state.blockedAppointmentParams.block_from).format('YYYY-MM-DD'),
                    // block_to:moment(that.state.blockedAppointmentParams.block_to).format('YYYY-MM-DD'),

                };

            }
        });

        const successFn =function(data){
            if (that.props.history){
                that.props.history.replace('/erp/calendar');
            }
        };
        const errorFn=function(){

        };
        postAPI(BLOCK_CALENDAR,reqData,successFn,errorFn)
    };

    render(){
        const that = this;
        const {getFieldDecorator} = this.props.form;

        const formItemLayout = ({
            labelCol: {span: 6},
            wrapperCol: {span: 4},
        });
        //
        // let doctorArray=this.state.practiceDoctors;
        // let loginUser =that.props.user;
        // const doctorId={};
        // let flag=true;
        // doctorArray.forEach(function (items) {
        //     if (items.user.id == loginUser.id){
        //         doctorId.id=that.loginUser.id;
        //         flag=false;
        //         return false;
        //     }
        // },function () {
        //     doctorId.id=doctorArray[0].user.id
        // });

        return(
<Card title="Block Calendar">
                <Row>
                    <Col span={18}>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Item label="Block From" {...formItemLayout}>
                                {getFieldDecorator('block_from',{initialValue:moment(),rules: [{ required: true, message: REQUIRED_FIELD_MESSAGE }]})
                                (<DatePicker showTime={{use12Hours: true}} format="YYYY-MM-DD hh:mm a" allowClear={false} onChange={(value)=>this.changeParamsForBlockedAppointments('block_from',value)} />)}
                            </Form.Item>

                            <Form.Item label="Block To" {...formItemLayout}>
                                {getFieldDecorator('block_to',{initialValue:moment(),rules: [{ required: true, message: REQUIRED_FIELD_MESSAGE }],})
                                (<DatePicker showTime={{ use12Hours: true }} format="YYYY-MM-DD hh:mm a" allowClear={false} onChange={(value)=>this.changeParamsForBlockedAppointments('block_to',value)} />)}
                            </Form.Item>

                            <Form.Item label="Event Name" {...formItemLayout}>
                                {getFieldDecorator('event', {})
                                (<Input placeholder="Event Name" />)}
                            </Form.Item>

                            <Form.Item label="Doctor" {...formItemLayout}>
                                {getFieldDecorator('doctor', {initialValue:6})
                                (<Select placeholder="Doctor List" onChange={(value) => this.changeParamsForBlockedAppointments("doctor", value)}>
                                    {this.state.practiceDoctors.map((option) => (
<Select.Option
  value={option.id}
  key={option.id}
>{option.user.first_name}
</Select.Option>
))}
                                 </Select>)}
                            </Form.Item>

                            <Form.Item>
                                <Button style={{margin: 5}} type="primary" htmlType="submit">
                                    Submit
                                </Button>
                                {that.props.history ? (
                                    <Button style={{margin: 5}} onClick={() => that.props.history.goBack()}>
                                        Cancel
                                    </Button>
                                  ) : null}
                            </Form.Item>

                        </Form>
                    </Col>

                    <Col span={6}>
                        <List
                          size="small"
                          dataSource={this.state.blockingAppointments}
                          renderItem={(apppointment) => (apppointment.status == CANCELLED_STATUS ? <div /> : (
<List.Item
  color="transparent"
  style={{padding: 0}}
>
                                <div
                                  style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '5px',
                                        textDecoration: (apppointment.status == CANCELLED_STATUS ? 'line-through' : 'inherit'),
                                        backgroundColor: (apppointment.status == CANCELLED_STATUS ? '#aaa' : '#eee'),
                                        width: '100%',
                                        marginTop: '2px',
                                        borderLeft: `5px solid${  apppointment.doctor && that.state.practice_doctors && that.state.practice_doctors[apppointment.doctor] ? that.props.doctors_object[apppointment.doctor].calendar_colour : 'transparent'}`
                                    }}
                                >
                                    <AppointmentCard
                                      {...apppointment}
                                      changeAppointmentStatus={this.changeAppointmentStatus}
                                      {...this.props}
                                    />
                                </div>
</List.Item>
))}
                        />
                    </Col>
                </Row>

</Card>

        )
    }
}
export default Form.create()(BlockCalendar);

function AppointmentCard(appointment) {
    return (
<div style={{width: '100%'}}>

        <p style={{marginBottom: 0}}>
        <Divider type="vertical" />
            <Popover
              placement="right"
              content={(
<EventPatientPopover
  appointmentId={appointment.id}
  key={appointment.id}
  {...appointment}
/>
)}
            >
            <span
              style={{width: 'calc(100% - 60px)'}}
            ><b>{moment(appointment.schedule_at).format("LLL")}</b>&nbsp;
                {appointment.patient.user.first_name}
            </span>
            <p style={{color:appointment.doctor_data ?appointment.doctor_data.calendar_colour:null}}><Divider type="vertical" /><span>{appointment.doctor_data ? appointment.doctor_data.user.first_name:null}</span></p>
            </Popover>
        </p>
</div>
);
}
