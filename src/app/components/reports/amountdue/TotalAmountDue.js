import React from "react";
import {Col, Row, Select, Statistic, Table} from "antd";
import moment from "moment"
import {AMOUNT_DUE_REPORTS} from "../../../constants/api";
import {getAPI} from "../../../utils/common";
import { sendReportMail} from "../../../utils/clinicUtils";

export default class TotalAmountDue extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: true,
            report:[],
            mailingUsersList: this.props.mailingUsersList
        };
    }

    componentDidMount() {
        this.loadReport();
       
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate ||this.props.patient_groups !=newProps.patient_groups || this.props.doctors != newProps.doctors)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            },function(){
                that.loadReport();
            })

    }

    loadReport =()=>{
      const that =this;
      that.setState({
          loading:true,
      });

        const successFn = function (data) {
            that.setState({
                report:data,
                loading:false,
            })
        };
        const errorFn = function () {
            that.setState({
                loading:false
            })
        };
        const apiParams={
            practice:this.props.active_practiceId,
            type: that.props.type,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
        };
        if (this.props.patient_groups){
            apiParams.groups=this.props.patient_groups.toString();
        }
        if (this.props.doctors) {
            apiParams.doctors = this.props.doctors.toString();
        }

        getAPI(AMOUNT_DUE_REPORTS, successFn ,errorFn,apiParams);
    };

    sendMail = (mailTo) => {
        const apiParams={
            practice:this.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            type:this.props.type,
        }
        if (this.props.patient_groups){
            apiParams.groups=this.props.patient_groups.toString();
        }
        if (this.props.doctors) {
            apiParams.doctors = this.props.doctors.toString();
        }
        apiParams.mail_to = mailTo;
        sendReportMail(AMOUNT_DUE_REPORTS, apiParams)
    }



    render() {
        const {report,loading} =this.state;

        const columns = [{
            title: 'S. No',
            key: 's_no',
            dataIndex:'s_no',
            render:(text, record, index) =><span>{index+1}</span>,
            width: 50
        },{
            title: 'Invoice Date',
            key: 'date',
            render: (text, record) => (
                <span>
                {moment(record.date).format('DD MMM YYYY')}
                </span>
            ),
        },{
            title:'Invoice Number',
            key:'invoice_id',
            dataIndex:'invoice_id',
        },{
            title: 'Patient',
            dataIndex: 'first_name',
            key: 'first_name',
        },{
            title: 'Patient ID',
            dataIndex: 'custom_id',
            key: 'custom_id',
        },{
            title:'Doctor Name',
            dataIndex:'doctor_name',
            key:'doctor_name'
        },{
            title:'Invoice Amount(INR)',
            key:'total',
            dataIndex:'total',
            render:(item)=>(item.toFixed(2))
        }, {
            title: 'Amount Due(INR)',
            dataIndex: 'amount_due',
            key: 'amount_due',
            render:(item)=>(item.toFixed(2))
        }];



        const totalAmount = report.reduce(function(prev, cur) {
            return prev + cur.amount_due;
        }, 0);
        return (
<div>
            <h2>Total Amount Due <span style={{float: 'right'}}>
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
                    <Statistic title="Amount Due For Listed Invoices(INR)" value={totalAmount.toFixed(2)} />
                    <br />
                    <p>*Advance payments are not considered here. Amounts may vary slightly.</p>
                </Col>
            </Row>

            <Table loading={loading} columns={columns} pagination={false} dataSource={report} />


</div>
)
    }
}
