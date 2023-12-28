import React, { Component } from 'react'
import {BANK_DETAILS_DATA,PATIENTS_LIST} from '../../../constants/api';
import {getAPI} from "../../../utils/common";
import { Card ,Table,Row,Col,Select} from 'antd'
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";

export class BankDetails extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
        loading:false,     
        selectedAdvisor:null,
        }
        this.bankDetailsData=this.bankDetailsData.bind(this);
        this.loadAgentlist=this.loadAgentlist.bind(this);
    }
    componentDidMount(){
        this.bankDetailsData();
       this.loadAgentlist();
    }

    changeStaff = (value) => {
        const that = this;
        this.setState({
            selectedAdvisor: value,
        }, function() {
            that.bankDetailsData();
        });
    };

    bankDetailsData=(page=1)=>{
        let{selectedAdvisor}=this.state;
        let that=this;
        that.setState({
            loading:true,
        })
        const successFn = function (data) {
            if (data.current == 1) {
            that.setState({
                advisorBankDetails:data.results,
                loading: false,
                loadMoreReport: data.next
            })
        }
        else {
            that.setState(function (prevState) {
                return {
                    advisorBankDetails: [...prevState.advisorBankDetails, ...data.results],
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
    let apiParams={
        page
    };
    if(selectedAdvisor){
        apiParams.patient=selectedAdvisor;
    }
    getAPI(BANK_DETAILS_DATA, successFn, errorFn,apiParams);
    }

    loadAgentlist=()=>{
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
    
    render() {
        const{advisorList,advisorBankDetails}=this.state;
        console.log(advisorList);
        let i = 1;
        const columns = [{
            title: 'S. No',
            key: 'sno',
            dataIndex: 'sno',
            render: (item, record) => <span> {i++}</span>,
            export: (item, record, index) => index + 1,
        }, {
            title: 'Name',
            dataIndex: 'patient.user.first_name',
            key: 'name',
        }, 
        {
            title: 'EMP ID',
            dataIndex: 'patient.custom_id',
            key: 'id',
        },{
            title: 'Mobile',
            dataIndex: 'patient.user.mobile',
            key: 'mobile',
            export: (item, record) => (record.user.mobile),
        }, {
            title: 'Account Name',
            dataIndex: 'account_name',
            key: 'accountname',
        },
        {
            title: 'Account No',
            dataIndex: 'account_number',
            key: 'accountnumber',
        },
        {
            title: 'IFSC Code',
            dataIndex: 'ifsc_code',
            key: 'ifsccode',
        },
        {
            title: 'Bank Name',
            dataIndex: 'bank_name',
            key: 'bankname',
        },{
            title: 'Bank Branch',
            dataIndex: 'bank_branch',
            key: 'branch',
        }];
        return (
            <div>
                <Card 
                title="Banks Details">
                     <Row gutter={16}>
                    <Col sm={24} md={12} lg={5} style={{ marginBottom: 20 }}>
                    {advisorList?
                    <div>
                        <h4>Advisor</h4>
                           <Select style={{ width: '100%' }}
                                    onChange={(e) => this.changeStaff(e)}
                                    placeholder="Select the Advisor"
                                    allowClear>
                              {advisorList.map(item => <Select.Option
                                    value={item.id}>{item.user?item.user.first_name:" "} {item?(item.custom_id):" "}</Select.Option>)}
                            </Select>
                            </div>
                             : null}
                     
                    </Col>
                </Row> 
                <br/>
                <br/>
                <Table
              pagination={false}
              dataSource={advisorBankDetails}
              columns={columns}
              loading={this.state.loading}
            />
           <InfiniteFeedLoaderButton
                  loaderFunction={() => this.bankDetailsData(this.state.loadMoreReport)}
                  loading={this.state.loading}
                  hidden={!this.state.lbankDetailsData}/>
                </Card>
                
            </div>
        )
    }
}

export default BankDetails
