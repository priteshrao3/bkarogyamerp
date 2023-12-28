import CustomizedTable from '../../common/CustomizedTable';
import React from 'react';
import {Col, DatePicker, Form, Modal, Progress, Row , Tag ,Table, Button} from 'antd';
import moment from 'moment';
import {displayMessage, getAPI} from '../../../utils/common';

import {
    TARGET_HEADS,
    TASK_MONTHLY_TARGET,
    TASK_USER_DAILY_TARGET,
    TASK_USER_DAILY_TARGET_STATUS,
} from '../../../constants/api';
import DynamicFieldsForm from '../../common/DynamicFieldsForm';
import {LABEL_FIELD, NUMBER_FIELD, SUCCESS_MSG_TYPE, TEXT_FIELD} from '../../../constants/dataKeys';
import {loadConfigParameters} from "../../../utils/clinicUtils";
import {TODAY_DATE_CONFIG_PARAM} from "../../../constants/hardData";
import { values } from 'lodash';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
export default class MyReccuringTragetsProgress extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            targets: [],
            loading:false,
            currentDate: moment(),
            filterStrings: {
                date: moment().format('YYYY-MM-DD'),
                firstdate: moment().startOf('month').format('YYYY-MM-DD'),
                lastdate:moment().endOf('month').add(1,'day').format('YYYY-MM-DD')
            },
        };
    }

    componentDidMount() {
        this.loadData2();
        loadConfigParameters(this, [TODAY_DATE_CONFIG_PARAM]);
    }

    loadData = () => {
        const that = this;
        that.setState({
            loading:true
        })
        const successFn = function (data) {
            that.setState({
                targets: data.results,
                loading: false,
            });
        };
        const errorFn = function () {
            that.setState({
                loading: false,
            });
        };
        const apiParams = {
            ...this.state.filterStrings,
            department: this.props.user.staff.department,
            designation: this.props.user.staff.designation,
            user: this.props.user.id,

            
        };
        getAPI(TASK_USER_DAILY_TARGET_STATUS, successFn, errorFn, apiParams);
    };

    loadData2 = () => {
        const that = this;
        that.setState({
            loading:true
        })
        const successFn = function (data) {
            console.log(data);
            that.setState({
                targets: data.results,
                loading: false,
            });
        };
        const errorFn = function () {
            that.setState({
                loading: false,
            });
        };
        const apiParams = {
           
            department: this.props.user.staff.department,
            designation: this.props.user.staff.designation,
            assignee: this.props.user.id,
            deadline_gte : this.state.filterStrings.firstdate,
            deadline_lte : this.state.filterStrings.lastdate

        };
        getAPI('tasks/', successFn, errorFn, apiParams);
    };


    chagnedate = (date)=>{
        const that = this;

       let firstdtime = moment(date).startOf('month').format('YYYY-MM-DD')

       let lastdtime = moment(date).endOf('month').add(1,'day').format("YYYY-MM-DD")

        this.setState(function(prev){
            return {
                filterStrings: {
                    ...prev.filterStrings, 
                    firstdate : firstdtime,
                    lastdate : lastdtime
                }
            };
        }, function(){
            that.loadData2();
        });

    }

    applyFilter = (type, value) => {
        const that = this;
        this.setState(function (prevState) {
            return {
                filterStrings: {...prevState.filterStrings, [type]: value},
            };
        }, function () {
            that.loadData();
        });
    };

    editTarget = (record) => {
        this.setState({
            editRecord: record,
            visible: true,
        });
    };

    editCancel = () => {
        this.setState({
            editRecord: null,
            visible: false,
        });
    };

    render() {
        const that = this;
        console.log(this.state.targets);
        const {filterStrings, currentDate, editRecord, visible,loading, modalrecord} = this.state;
        const columns = [{
            title: 'Target Name',
            dataIndex: 'name',
            key: 'name',
            render: (val,record)=>{
                return <div  onClick={()=>this.setState({visible: true , modalrecord : record})}  style={{ width: "auto" , cursor : "pointer", color: "blue"}} >
                    {val}
                </div>
            }
        }, {
            title: 'Assignee ',
            dataIndex: 'assignee_data.first_name',
            key: 'assignee_data.first_name',
        }, {
            title: 'Reporting Person ',
            dataIndex: 'reporter_data.first_name',
            key: 'reporter_data.first_name',
        }, {
            title: 'Deadline Date ',
            dataIndex: "deadline",
            key: 'deadline',
            render: (value, record)=>{
              return  <Row>
                    <Col span={12} className='bg-red'>
                    <Tag color={'red'} key={record.id}>
              {record.deadline.split('T')[0]}
            </Tag>
                    </Col>
                </Row>
            }
        }, {
            width: 150,
            title: 'Effert Progress ',
            dataIndex: 'effert_target',
            key: 'effert_target',
            render: (value, record) => {
                console.log(value);

                let sumtarget = record.reccuringtarget_data.reduce((accu, currval)=>{
                    return accu+currval.effert_score
                },0)
                
                let percent = (record.reccuringtarget_data && record.effert_target ? (100 *(  sumtarget / value  )).toFixed(0) : 0) || 0;
                return <span>
                <Progress
                    percent={percent}
                    strokeColor={percent>90?"#87d068":(percent>50?"#d0c268":"#f50")}/>
                    
                </span>

            },
            export:(value,record)=>
            {
                let sumtarget = record.reccuringtarget_data.reduce((accu, currval)=>{
                    return accu+currval.effert_score
                },0)

               return (record.reccuringtarget_data && record.effert_target ? ( 100 * (sumtarget / value ? value : 0 )).toFixed(0) : 0) || 0 +"%"
            }

        },
        {
            width: 150,
            title: 'Result Progress ',
            dataIndex: 'result_target',
            key: 'result_target',
            render: (value, record) => {
                let sumresulttarget = record.reccuringtarget_data.reduce((accu, currval)=>{
                    return accu+currval.result_score
                },0)
                let percent = (record.reccuringtarget_data && record.result_target && sumresulttarget ? (  100 *(sumresulttarget / value || 0)).toFixed(0) : 0) || 0;
                return <span>
               

                
                <Progress
                    percent={percent}
                    strokeColor={percent>90?"#87d068":(percent>50?"#d0c268":"#f50")}/>
                
               

                
                </span>

            },export:(value,record)=> (record.month_target && record.month_target.target && record.month_target.working_days ? ((value || 0) * 100 / (record.month_target.target / record.month_target.working_days)).toFixed(0) : 0) || 0 +"%"

        },
        
        {
            title: 'Effert Achieved',
            dataIndex: 'reccuringtarget_data',
            key: 'reccuringtarget_data',
            render: (value,record)=>{
                let sum = value.reduce((accu, currval)=>accu + currval.effert_score, 0 )
                return `${sum} of ${record.effert_target? record.effert_target : 0}`;
            }
        }, {
            title: 'Status',
            dataIndex: 'task_status',
            key: 'task_status',
            render : (value, record)=>{
              return  <Tag color={ value === 'Open' ? 'red' : value === 'Paused' ? 'blue' : 'green' } key={record.id}>
              {value}
            </Tag>
            }
            

        }, 
        // {
        //     title: 'Actions',
        //     key: 'action',
        //     render: (text, record) => (
        //         <span>
        //            <a onClick={() => this.editTarget(record)}
        //               disabled={!this.state[TODAY_DATE_CONFIG_PARAM] || moment(this.state[TODAY_DATE_CONFIG_PARAM]).format('YYYY-MM-DD') != this.state.filterStrings.date}>Edit Target</a>
        //         </span>
        //     ),
        // }
    ];

        const DailyTargetEditForm = Form.create()(DynamicFieldsForm);
        const fields = [{
            label: 'Target Name',
            follow: editRecord ? editRecord.name : null,
            type: LABEL_FIELD,
            key: 'name',
        }, {
            label: 'Achived Target Count',
            initialValue: editRecord && editRecord.date_target ? editRecord.date_target.target : null,
            type: NUMBER_FIELD,
            key: 'achivedtarget',
            required: true,
        }, {
            label: 'Remark',
            initialValue: editRecord && editRecord.date_target ? editRecord.date_target.remarks : null,
            type: TEXT_FIELD,
            key: 'remarks',
            row: 3
        }];
        const formProp = {
            method: 'post',
            action: TASK_USER_DAILY_TARGET,
            beforeSend: function (values) {
                return [{
                    ...values,
                    id: editRecord && editRecord.date_target ? editRecord.date_target.id : null,
                }];
            },
            successFn: function (data) {
                displayMessage(SUCCESS_MSG_TYPE, 'Monthly Target Recorded Successfully!!');
                that.editCancel();
                that.loadData();
            },
            errorFn: function () {

            },
        };
        const defaultFields = [{key: 'date', value: filterStrings.date},
            {key: 'head', value: editRecord ? editRecord.id : null},{key:"user",value:this.props.user.id}];
        return <>
            <Row gutter={16}>
                {/* <Col span={6}>
                    <h4>Date</h4>
                    <DatePicker 
                    picker="month"
                    allowClear={false}
                                defaultValue={currentDate}
                                style={{width: '100%', marginBottom: 10}}
                                onChange={(value) => this.applyFilter('date', moment(value).format('YYYY-MM-DD'))}/>
                </Col> */}
                <Col span={6}>
                    <h4>Month</h4>
                    <MonthPicker defaultValue={currentDate} onChange={(value)=> this.chagnedate( moment(value).format("YYYY-MM-DD"))} placeholder="Select month" />
                </Col>
                
                
            </Row>
            <div>
                <br/>
            </div>
            <CustomizedTable loading={this.state.loading} columns={columns} dataSource={this.state.targets}
                             hideReports={true}/>
            <Modal visible={visible} footer={null} title="Daily Target Progress List" onCancel={() => this.editCancel()}>
               <DailyTaskResult modalrecord={modalrecord}  />
               <DailyTaskpoint modalrecord={modalrecord} />
            </Modal>
        </>;
    }
}


function DailyTaskResult(props) {

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            
        },

        {
            title: 'Effert Score / Day',
            dataIndex: 'effert_score',
            key: 'effert_score',
            render: (value , record)=>{
                return  `${value} / ${(props.modalrecord.effert_target/ (moment(props.modalrecord.deadline).diff(moment(props.modalrecord.created_at), 'days')+1)).toFixed(1)}`;
            }
            
        },
         {
            title: 'Result Score / Day',
            dataIndex: 'result_score',
            key: 'result_score',

            render: (value , record)=>{
                return  `${value} / ${(props.modalrecord.result_target/ (moment(props.modalrecord.deadline).diff(moment(props.modalrecord.created_at), 'days')+1)).toFixed(1)}`;
            }
        },

       
       
    
    
    ]



    return (
        <div>
            <h2>Daily Tasks Report</h2>
            <Table
                dataSource={props.modalrecord.reccuringtarget_data}
                
                columns={columns}
                pagination={false}
                
            />
            
        </div>
    );
}



function DailyTaskpoint(props) {

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            
        },

       

        {
            title: 'Effert point / Day',
            dataIndex: 'effert_point',
            key: 'effert_point',

            render: (value , record)=>{
                return  `${value !== undefined && value !== NaN ? value : 0}  `;
            }
        },
        {
            title: 'Result point / Day',
            dataIndex: 'result_point',
            key: 'result_point',

            render: (value , record)=>{
                return  `${value !== undefined && value !== NaN ? value : 0}  `;
            }
        },
       
    
    
    ]



    return (
        <div>
            <h2>Daily Tasks Point</h2>
            <Table
                dataSource={props.modalrecord.point_data}
                
                columns={columns}
                pagination={false}
                
            />
            
        </div>
    );
}