import React from "react";
import {RATING_REPORT} from "../../../constants/api";
import {getAPI} from "../../../utils/common";
import { Table,Select} from 'antd';
import { sendReportMail} from "../../../utils/clinicUtils";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";

export default class AvgRatingReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            RatingList:[],
            loading:false,
            startDate: this.props.startDate,
            endDate: this.props.endDate,
           mailingUsersList: this.props.mailingUsersList
        };
        this.RatingView=this.RatingView.bind(this);
    }
componentDidMount(){
    this.RatingView();
}
componentWillReceiveProps(newProps) {
    const that = this;
    if (
        this.props.employee != newProps.employee
        || this.props.dept!=newProps.dept||
        this.props.designation!=newProps.designation
        || this.props.startDate!=newProps.startDate
        || this.props.endDate!=newProps.endDate
    )
        this.setState(
            {
                employee:newProps.employee,
                dept:newProps.dept,
                designation:newProps.designation,
                startDate:newProps.startDate,
                endDate:newProps.endDate
            },
            function() {
                that.RatingView();
            },
        );
}

    RatingView=()=>{
        const that = this;
        that.setState({
            loading:true
        }); 
        const successFn = function (data) {
            that.setState({
                RatingList:data,
                loading: false,
            });
    }
    const errorFn = function () {
        that.setState({
            loading: false
        })
    };
     let apiParams={
        type : 'AVERAGE',
        start: this.state.startDate.format('YYYY-MM-DD'),
        end: this.state.endDate.format('YYYY-MM-DD')
     }
     if(this.state.dept){
         apiParams.department=this.state.dept
     }
     if(this.state.designation){
        apiParams.designation=this.state.designation
     }
     if(this.state.employee)
     apiParams.user=this.state.employee
    getAPI(RATING_REPORT,successFn, errorFn,apiParams);
 }   

    sendMail = (mailTo) => {
        const that = this;
        const { startDate, endDate } = this.state;
        let apiParams = {
            type:"AVERAGE",
            start: startDate.format('YYYY-MM-DD'),
            end: endDate.format('YYYY-MM-DD'),
        }
        if(this.state.dept){
            apiParams.department=this.state.dept
        }
        if(this.state.designation){
           apiParams.designation=this.state.designation
        }
        if(this.state.employee){
            apiParams.user=this.state.employee
        }
     
        apiParams.mail_to = mailTo;
        sendReportMail(RATING_REPORT,apiParams);
    }

    render (){
        console.log(this.props);
        const{ RatingList }=this.state;
        console.log({RatingList});
        const RatingListData=[];
         
        for (let i = 1; i <= RatingList.length; i++) {
            RatingListData.push({ s_no: i, ...RatingList[i - 1] });
        }
        const columns = [{
            title: 'S. No',
            key: 's_no',
            dataIndex: 's_no',
            width: 50
        }, {
            title: 'Employee Name',
            dataIndex: 'user.first_name',
            key: 'first_name',
          
        },
        {
            title: 'EMP-ID',
            dataIndex: 'user.id',
            key: 'id',
        },
        {
            title: 'Department',
            key: 'department',
            dataIndex:'user.details.department'
        },{
            title:'Designation',
            key:'designation',
            dataIndex:'user.details.designation'
        },{
            title:'Rating',
            key:'rating',
            dataIndex:'avg_rating'
        }
        ];
        return(
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
                  dataSource={RatingListData}
                   pagination={false}/>
                  < InfiniteFeedLoaderButton
                          loading={this.state.loading}
                          hidden={!this.state.next}
                          loaderFunction={() => this.getAdvisorPatient(this.state.next)}
                        />
            </div>
        )
    }
}