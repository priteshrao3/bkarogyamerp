import React from 'react';
import {PATIENT_CALL_DATA} from "../../../constants/api";
import {getAPI} from "../../../utils/common";
import {Col, Row, Select, Statistic, Table} from "antd";
import { sendReportMail} from "../../../utils/clinicUtils";
import InfiniteFeedLoaderButton from '../../common/InfiniteFeedLoaderButton';

export default class PatientCallReport extends React.Component {
    constructor(props) {
        super(props)
    
        this.state = {
             patientCall:[],
             loading:false,
             startDate: this.props.startDate,
            endDate: this.props.endDate,
            mailingUsersList: this.props.mailingUsersList,
        }
        this.patientCallData=this.patientCallData.bind(this);
    }

    componentDidMount(){
        this.patientCallData();
    }
    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate|| 
            this.props.staff!=newProps.practice_staff||this.props.patient_name!=newProps.patient_name
             || this.props.practice_name!=newProps.practice_name || this.props.call_type!=newProps.call_type
             || this.state.response_type!=this.state.response_type)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate,
                practice_staff:newProps.practice_staff,
                patient_name:newProps.patient_name,
                practice_name:newProps.practice_name,
                call_type:newProps.call_type,
                response_type:newProps.response_type
            }, function () {
                that.patientCallData();
            })
    } 


    patientCallData=(page=1)=>{
        const that=this;
        that.setState({
            loading:true
        })
        const successFn = function (data) {
            if (data.current == 1) {
            that.setState({
                patientCall:data.results,
                loading:false,
                loadMoreReport: data.next
            })
        }
        else {
           that.setState(function (prevState) {
               return {
                patientCall: [...prevState.patientCall, ...data.results],
                   loading: false,
                   loadMoreReport: data.next
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
        start: this.props.startDate.format('YYYY-MM-DD'),
        end: this.props.endDate.format('YYYY-MM-DD'),
           page
       };
       if(this.state.practice_staff){
           apiParams.practice_staff=this.state.practice_staff;
       }
       if(this.state.patient_name){
           apiParams.patient=this.state.patient_name;
       }
       if(this.state.practice_name){
           apiParams.practice=this.state.practice_name;
       }
       if(this.state.call_type){
           apiParams.type=this.state.call_type;
       }
       if(this.state.response_type){
           apiParams.response=this.state.response_type;
       }
       getAPI(PATIENT_CALL_DATA, successFn, errorFn,apiParams);
    }
    sendMail = (mailTo) => {
        const apiParams = {
            mail_to : mailTo
        };
        if(this.state.practice_staff){
            apiParams.practice_staff=this.state.practice_staff;
        }
        if(this.state.patient_name){
            apiParams.patient=this.state.patient_name;
        }
        if(this.state.practice_name){
            apiParams.practice=this.state.practice_name;
        }
        if(this.state.call_type){
            apiParams.call_type=this.state.call_type;
        }
        if(this.state.response_type){
            apiParams.response=this.state.response_type;
        }
        const successFn = function (data) {
        }
        const errorFn = function (error) {
        }
        sendReportMail(PATIENT_CALL_DATA, apiParams, successFn, errorFn);
    }
         
    
    render() {
        const {patientCall}=this.state;
        const reportData = [];
        for (let i = 1; i <=patientCall.length; i++) {
            reportData.push({s_no: i, ...patientCall[i - 1]});
        }
        const columns = [
      {
        title: 'S. No',
        key: 's_no',
        dataIndex: 's_no',
        width: 50
        },{
            title: 'Patient Name',
            dataIndex: 'patient.user.first_name',
            key: 'first_name',
        },{
            title:'Patient ID',
            key:'id',
            dataIndex:'patient.custom_id'
        }, {
            title: 'Mobile Number',
            key: 'mobile',
            dataIndex:'patient.user.mobile',
        },{
            title:'Staff',
            key:'staff',
            dataIndex:'staff',
        }, {
            title: 'Staff ID',
            key: 'Staff_id',
            dataIndex: 'staff_id',
        },
        {
            title: 'Type',
            key: 'type',
            dataIndex: 'type',
        },
        {
            title: 'Response',
            key: 'resonse',
            dataIndex: 'response',
        },
        {
            title: 'Remark',
            key: 'remark',
            dataIndex: 'remarks',
        }
    ];
        return (
            <div>
                 <h2>New Patients Report
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
            <Row>
                <Col span={12} offset={6} style={{textAlign:"center"}}>
                    <Statistic title="Total Patients" value={this.state.patientCall.length} />
                    <br />
                </Col>
            </Row>

            <Table
              loading={this.state.loading}
              columns={columns}
              dataSource={reportData}
              pagination={false}
            />
            </div>
        )
    }
}


