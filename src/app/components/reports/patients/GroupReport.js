import React from 'react';
import {getAPI} from "../../../utils/common";
import {GROUP_DATA_REPORT} from "../../../constants/api";
import {Select, Table} from "antd";
import { sendReportMail} from "../../../utils/clinicUtils";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";

export default class GroupReport extends React.Component {
     constructor(props) {
         super(props)
         this.state = {
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            Groupreport:[],
            loading:false,
            mailingUsersList: this.props.mailingUsersList,
         }
         this.GroupData=this.GroupData.bind(this);
     }
     componentDidMount(){
         this.GroupData();
     }
     
     
 componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate || this.props.groupvalue != newProps.groupvalue)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate,
                groupvalue: newProps.groupvalue
            }, function () {
                that.GroupData();
            })
    } 

     GroupData=(page = 1)=>{
         const that=this;
         that.setState({
             loading:true
         })
         const successFn = function (data) {
             console.log(data)
             if (data.current == 1) {
             that.setState({
                 Groupreport:data.results,
                 loading:false,
                 loadMoreReport: data.next
             })
         }
         else {
            that.setState(function (prevState) {
                return {
                    Groupreport: [...prevState.Groupreport, ...data.results],
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
            page
        };
      if(this.props.groupvalue=="over30m"){
           apiParams.gender="male";
           apiParams.age="30";
           apiParams.type="gt";
        }
        if(this.props.groupvalue=="over30f"){
            apiParams.gender="female";
            apiParams.age="30";
            apiParams.type="gt";
         }
         if(this.props.groupvalue=="under30m"){
            apiParams.gender="male";
            apiParams.age="30";
            apiParams.type="lt";
         }
         if(this.props.groupvalue=="under30f"){
            apiParams.gender="female";
            apiParams.age="30";
            apiParams.type="lt";
         }
         if(this.props.groupvalue=="male"){
            apiParams.gender="male";
         }
         if(this.props.groupvalue=="female"){
            apiParams.gender="female";
         }

getAPI(GROUP_DATA_REPORT, successFn, errorFn,apiParams);
}
sendMail = (mailTo) => {
    const apiParams = {
        mail_to : mailTo
    };
    if(this.props.groupvalue=="over30m"){
        apiParams.gender="male";
        apiParams.age="30";
        apiParams.type="gt";
     }
     if(this.props.groupvalue=="over30f"){
         apiParams.gender="female";
         apiParams.age="30";
         apiParams.type="gt";
      }
      if(this.props.groupvalue=="under30m"){
         apiParams.gender="male";
         apiParams.age="30";
         apiParams.type="lt";
      }
      if(this.props.groupvalue=="under30f"){
         apiParams.gender="female";
         apiParams.age="30";
         apiParams.type="lt";
      }
      if(this.props.groupvalue=="male"){
         apiParams.gender="male";
      }
      if(this.props.groupvalue=="female"){
         apiParams.gender="female";
      }
    const successFn = function (data) {
    }
    const errorFn = function (error) {
    }
    sendReportMail(GROUP_DATA_REPORT, apiParams, successFn, errorFn);
}
     
    render() {
        const {Groupreport}=this.state;
        const reportData = [];
        for (let i = 1; i <=Groupreport.length; i++) {
            reportData.push({s_no: i, ...Groupreport[i - 1]});
        }
        console.log(reportData);
        const columns = [
      {
        title: 'S. No',
        key: 's_no',
        dataIndex: 's_no',
        width: 50
        },{
            title: 'Patient Name',
            dataIndex: 'user.first_name',
            key: 'first_name',
        },{
            title:'Patient Number',
            key:'id',
            dataIndex:'custom_id'
        }, {
            title: 'Mobile Number',
            key: 'mobile',
            dataIndex:'user.mobile',
        },{
            title:'Email',
            key:'email',
            dataIndex:'user.email',
        }, {
            title: 'Gender',
            key: 'gender',
            dataIndex: 'gender',
        }
    ];
        return (
            <div>
                 <h2>Group Data
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
                  pagination={false}
                  loading={this.state.loading}
                  columns={columns}
                  dataSource={reportData}
                />
                 <InfiniteFeedLoaderButton
                  loaderFunction={() => this.GroupData(this.state.loadMoreReport)}
                  loading={this.state.loading}
                  hidden={!this.state.loadMoreReport}
                />
            </div>
        )
    }
}


