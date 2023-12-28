import React, { Component } from 'react'
import { Card ,Table,Row,Col} from 'antd'
import {DatePicker, Layout, Select,Result} from "antd";
import moment from "moment";
import {getAPI, interpolate} from "../../../utils/common";
import { TEAM_ANALYSIS_DATA ,PATIENTS_LIST} from '../../../constants/api';
import CustomizedTable from "../../common/CustomizedTable";

const {RangePicker} = DatePicker;
const dateFormat = 'DD/MM/YYYY';

export class TeamAnalysis extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            loading:false,  
            selectedAdvisor:null,
            advisorList:[],
            sortOrder:null,
            startDate: moment(),
            endDate: moment(),
        }
        this.loadAgentlist=this.loadAgentlist.bind(this);
        this.reportsDateRange = this.reportsDateRange.bind(this);
    }
    componentDidMount(){
        this.loadAgentlist();
    }
  
    loadAgentlist(){
        const that = this;   
        const successFn = function (data) {
                that.setState({
                    advisorList:data,
                    loading: false
                })
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        const apiParams = {
            agent: true,
            pagination:false
        }
        getAPI(PATIENTS_LIST, successFn, errorFn, apiParams);
    }
    
    teamAnalysisData(){
        const that=this;
        const{sortOrder,startDate,endDate}=that.state;
        that.setState({
            loading:true,
        })
            const successFn = function (data) {
                that.setState({
                    teamdata: data,
                    loading:false
                })
            }
            const errorFn = function () {
                that.setState({
                    loading:false,
                });
            };
            let apiParams={};
            if(sortOrder){
                apiParams.sort=sortOrder
            }
            if(startDate){
                apiParams.start= that.state.startDate.format('YYYY-MM-DD')
            }
            if(endDate){
                apiParams.end= that.state.endDate.format('YYYY-MM-DD')
            }
            getAPI(interpolate(TEAM_ANALYSIS_DATA,[that.state.selectedAdvisor]), successFn, errorFn,apiParams);
        }
        changeStaff = (value) => {
            const that = this;
            this.setState({
                selectedAdvisor: value,
            }, function() {
                that.teamAnalysisData();
            });
        };
        changeSort = (value) => {
            const that = this;
            this.setState({
                sortOrder: value,
            }, function() {
                that.teamAnalysisData();
            });
        };
        reportsDateRange=(dateString)=> {
            const that=this;
            that.setState({
                startDate: moment(dateString[0], 'DD/MM/YYYY'),
                endDate: moment(dateString[1], 'DD/MM/YYYY'),
            }, function() {
                that.teamAnalysisData();
            });
        }
    
    
    render() {
        const that=this;
        const{teamdata,loading,advisorList,selectedAdvisor,sortOrder,startDate,endDate}=this.state;
        let i = 1;
        const columns = [{
            title: 'S. No',
            key: 'sno',
            dataIndex: 'sno',
            render: (item, record) => <span> {i++}</span>,
            export: (item, record, index) => index + 1,
        }, {
            title: 'Name',
            dataIndex: 'user.first_name',
            key: 'name',
        }, 
        {
            title: 'EMP ID',
            dataIndex: 'custom_id',
            key: 'id',
        },{
            title: 'Email',
            dataIndex: 'user.email',
            key: 'email',
            // export: (item, record) => (record.user.email),
        }, {
            title: 'Mobile',
            dataIndex: 'user.mobile',
            key: 'mobile',
            // export: (item, record) => (record.user.mobile),
        }, {
            title: 'Referal',
            dataIndex: 'user.referer_data.referer.first_name',
            key: '',
        },{
            title: 'Sales',
            dataIndex: 'sale',
            key: 'sale',
        },
        {
            title: 'Status',
            dataIndex: 'is_approved',
            key: 'status',
            render: (value, record) => (record.is_approved ? "Approved" : 'Not Approved'),
            export: (item, record) => (record.is_approved ? "Approved" : 'Not Approved'),
        }];
        return (
            <div>
                <Card 
                title="Team Analysis">
                    <Row gutter={16}>
                    <Col sm={24} md={12} lg={5} style={{ marginBottom: 20 }}>
                        <h4>Advisor</h4>
                      <Select value={selectedAdvisor} style={{ width: '100%' }}
                                    onChange={(e) => this.changeStaff(e)}
                                    placeholder="Select the Advisor">
                                {advisorList.map(item => <Select.Option
                                    value={item.id}>{item.user?item.user.first_name:" "} {item?(item.custom_id):" "}</Select.Option>)}
                            </Select> 
                    </Col>
                    <Col sm={24} md={12} lg={5} style={{ marginBottom: 20 }}>
                        <h4>Sales</h4>
                      <Select value={sortOrder} style={{ width: '100%' }}
                                    onChange={(e) => this.changeSort(e)}
                                    allowClear
                                   >
                     <Select.Option value="asc">Low-High</Select.Option>
                     <Select.Option value="desc">High-Low</Select.Option>
                            </Select> 
                    </Col>
               
                <Col sm={24} md={12} lg={5} style={{ width: '50%',marginBottom: 20}}>
                    <h4>Date</h4>
                    <RangePicker
                      allowClear={false}
                      onChange={(date, dateString) => that.reportsDateRange(dateString)}
                      defaultValue={[startDate, endDate]}
                      format={dateFormat}
                    />
                </Col>
                </Row>
                <br/>
                <br/>
                {selectedAdvisor ?<CustomizedTable
              pagination={false}
              dataSource={teamdata}
              columns={columns}
              loading={this.state.loading}
            /> : <Result title={'Select Advisor  to see Team Analysis'} status="info"/>}
                

                </Card>
                
            </div>
        )
    }
}

export default TeamAnalysis
