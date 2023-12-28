import React from 'react';
import { APPOINTMENT_CANCELATION_REPORT } from "../../../constants/api";
import { getAPI,interpolate } from "../../../utils/common";
import { Table,Select} from 'antd';
import moment from "moment";
import { sendReportMail } from "../../../utils/clinicUtils";

 class AppointmentCancel extends React.Component {
     constructor(props) {
         super(props)
     
         this.state = {
              cancelReport:[],
              startDate: this.props.startDate,
             endDate: this.props.endDate,
             loading: false,
             mailingUsersList: this.props.mailingUsersList
         }
         this.appointmentReportCancel=this.appointmentReportCancel.bind(this);
     }

     componentDidMount(){
         this.appointmentReportCancel();
     }
     componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate || this.props.categories != newProps.categories ||
            this.props.country != newProps.country || this.props.state != newProps.state || this.props.city != newProps.city
            || this.props.doctors != newProps.doctors)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            }, function () {
                that.appointmentReportCancel();
            })

    }

      appointmentReportCancel=()=>{
      const that=this;
      that.setState({
          loading:true
      })
      const successFn = function (data) {
        that.setState({
            cancelReport: data,
            loading: false
        });
    };
    const errorFn = function () {
        that.setState({
            loading: false
        })
    }
    const apiParams = {
        type:"CANCELLATION",
        practice: that.props.active_practiceId,
        start: this.state.startDate.format('YYYY-MM-DD'),
        end: this.state.endDate.format('YYYY-MM-DD'),
        exclude_cancelled:false
    };
    if (this.props.categories) {
        apiParams.categories = this.props.categories.toString();
    }
    if (this.props.doctors) {
        apiParams.doctors = this.props.doctors.toString();
    }
    if (this.props.country) {
        apiParams.country = this.props.country;
    }
    if (this.props.state) {
        apiParams.state = this.props.state;
    }
    if (this.props.city) {
        apiParams.city = this.props.city;
    }
    getAPI(APPOINTMENT_CANCELATION_REPORT, successFn, errorFn, apiParams);
    };

    sendMail = (mailTo) => {
        const that = this;
        const apiParams = {
            type: that.props.type,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            exclude_cancelled:false
        };
        if (this.props.categories) {
            apiParams.categories = this.props.categories.toString();
        }
        if (this.props.doctors) {
            apiParams.doctors = this.props.doctors.toString();
        }
        if (this.props.country) {
            apiParams.country = this.props.country;
        }
        if (this.props.state) {
            apiParams.state = this.props.state;
        }
        if (this.props.city) {
            apiParams.city = this.props.city;
        }
        apiParams.mail_to = mailTo;
        sendReportMail(interpolate(APPOINTMENT_CANCELATION_REPORT, [that.props.active_practiceId]), apiParams)
    };

     
    render() {
        const {cancelReport}=this.state;
       console.log(cancelReport);
       const AppointmentCancelData = [];
       for (let i = 1; i <= cancelReport.length; i++) {
        AppointmentCancelData.push({ s_no: i, ...cancelReport[i - 1] });
       }
       const columns = [{
        title: 'S. No',
        key: 's_no',
        dataIndex: 's_no',
        width: 50
    }, {
        title: 'Patient Name',
        dataIndex: 'patient.user.first_name',
        key: 'first_name',
      
    },
    {
        title: 'Patient-ID',
        dataIndex: 'patient.custom_id',
        key: 'id',
    },{
        title:'Docter Name',
        dataIndex: 'doctor_data.user.first_name',
        key: 'doctor_name',
    },{
        title: 'Appointment Date',
        dataIndex: 'modified_at',
        key: 'date',
        render: (item, record) => <span>{moment(record.schedule_at).format('LLL')}</span>,
        exports: (item, record) => (moment(record.schedule_at).format('LLL')),
    },{
        title:'Category',
       dataIndex:'category_data.name',
       key:'Category'
    },
    {
        title: 'Reason',
        dataIndex: 'cancel_reason',
        key: 'reason',
    },
    {
        title: 'Cancel By',
        dataIndex: 'cancel_by',
        key: 'cancelby',
    }


];
        return (
            <div>
            <h2>
               Rating List
                <span style={{float: 'right'}}>
                    <p><small>E-Mail To:&nbsp;</small>
                        <Select onChange={(e) => this.sendMail(e)} style={{width: 200}}>
                            {this.state.mailingUsersList.map(item => (
                                <Select.Option
                                  value={item.email}
                                >{item.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </p>
                </span>
            </h2>
            <Table
             loading={this.state.loading}
             columns={columns}
              dataSource={AppointmentCancelData}
               pagination={false}/>
        </div>
        )
    }
}

export default AppointmentCancel
