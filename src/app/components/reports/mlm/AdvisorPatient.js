import React ,{Component} from "react";
import {PATIENTS_LIST} from "../../../constants/api";
import {getAPI} from "../../../utils/common";
import {hideEmail, hideMobile} from "../../../utils/permissionUtils";
import { sendReportMail} from "../../../utils/clinicUtils";
import { Table,Select} from 'antd';
import moment from "moment";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";

export default class AdvisorPatient extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advisorList:[],
            loading:false,
            searchText: '',
            mailingUsersList: this.props.mailingUsersList,
        };
        this.getAdvisorPatient = this.getAdvisorPatient.bind(this); 
        this.search=this.search.bind(this);
    }
    componentDidMount() {
       this.getAdvisorPatient();
       this.search();    
}
componentWillReceiveProps(newProps) {
    const that = this;
    if (
        this.props.startDate != newProps.startDate ||
        this.props.endDate !=newProps.endDate ||
        this.props.agents != newProps.agents
    )
        this.setState(
            {
                startDate: newProps.startDate,
                endDate: newProps.endDate,
                agents:newProps.agents
            },
            function() {
                that.search();
            },
        );
}
    getAdvisorPatient(page = 1){
        const that = this;
      that.setState({
          loading:true
      });
      const params = {
        page
    }
    if (this.state.searchString) {
        params.name = this.state.searchString
    }
        const successFn = function (data) {
            if (data.current == 1 && that.state.searchString == params.name)
            that.setState({
                advisorList: data.results,
                next:data.next,
                loading: false
            });
            else
            that.setState(function (prevState) {
                return {
                    advisorList: [...prevState.advisorList, ...data.results],
                    next: data.next,
                    loading: false
                }
            })
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        getAPI(PATIENTS_LIST, successFn, errorFn,params);
    }

    search(){
        const that = this;
      that.setState({
          loading:true
      });
        const successFn = function (data) {
            that.setState({
                advisorList: data.results,
                next:data.next,
                loading: false
            });
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        let apiParams={
            start:moment(this.state.startDate).format('YYYY-MM-DD'),
            end: moment(this.state.endDate).format('YYYY-MM-DD'),
            referred_by:this.props.agents?this.props.agents:'',
        }
        getAPI(PATIENTS_LIST, successFn, errorFn,apiParams);
}

    sendMail = (mailTo) => {
        const apiParams = {
            pd_doctor: 1,
        }
        apiParams. mail_to = mailTo;
        const successFn = function (data) {

        }
        const errorFn = function (error) {

        }
        sendReportMail(PATIENTS_LIST, apiParams, successFn, errorFn);
    }
    render(){
      const that = this;
      const{ advisorList }=this.state;
      const advisorListData=[];
      console.log({advisorList});
      for (let i = 1; i <= advisorList.length; i++) {
        advisorListData.push({ s_no: i, ...advisorList[i - 1] });
    }
    const columns = [{
        title: 'S. No',
        key: 's_no',
        dataIndex: 's_no',
        width: 50
    }, {
        title: 'Patient Name',
        dataIndex: 'user.first_name',
        key: 'first_name',
      
    },
    {
        title: 'Referred By',
        dataIndex: 'user.referer',
        key: 'referer',
    },
     {
        title: 'Patient Number',
        key: 'id',
        render: (item, record) => <span>{record.custom_id ? record.custom_id : record.id}</span>,
        exports: (item, record) => (record.custom_id ? record.custom_id : record.id),
    }, 
    {
        
        title: 'Added On',
        key: 'created at',
        render: (item, record) => <span>{moment(record.created_at).format('LL')}</span>,
        exports: (item, record) => (moment(record.created_at).format('LL')),
    },{
        title: 'Mobile Number',
        key: 'user.mobile',
        dataIndex: 'user.mobile',
        render: (value) => that.props.activePracticePermissions.PatientPhoneNumber ? value : hideMobile(value),
        exports: (value) => (value),
    }, {
        title: 'Email',
        key: 'user.email',
        dataIndex: 'user.email',
        render: (value) => that.props.activePracticePermissions.PatientEmailId ? value : hideEmail(value),
        exports: (value) => (value),
    }, {
        title: 'Gender',
        key: 'gender',
        dataIndex: 'gender',
    }
    ];
        return(
            <div>
                <h2>
                    Adivsor Patient
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
                  dataSource={advisorListData}
                   pagination={false}/>
                   
                    <InfiniteFeedLoaderButton
                          loading={this.state.loading}
                          hidden={!this.state.next}
                          loaderFunction={() => this.getAdvisorPatient(this.state.next)}
                        />
                  
            </div>
        );
}
};
