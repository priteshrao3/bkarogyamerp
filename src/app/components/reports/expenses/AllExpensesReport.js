import React from "react";
import {Col, Row, Select, Statistic} from "antd";
import moment from "moment"
import {EXPENSE_PAYMENT_MODE_API} from "../../../constants/api";
import {getAPI} from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import { sendReportMail} from "../../../utils/clinicUtils";

export default class ExpensesReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            report: [],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            mailingUsersList: this.props.mailingUsersList
        }
        this.ExpenseReport = this.ExpenseReport.bind(this);
    }

    componentDidMount =async ()=>{
        await this.ExpenseReport();
        
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate ||this.props.expense_type!=newProps.expense_type
            ||this.props.payment_mode!=newProps.payment_mode)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            }, function () {
                that.ExpenseReport();
            })

    }

    ExpenseReport =async ()=> {
        const that = this;
        this.setState({
            loading: true
        })
        const successFn = function (data) {
            that.setState({
                report: data,
                loading: false
            });
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        const apiParams={
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            practice:that.props.active_practiceId,
        };
        if(this.props.payment_mode){
            apiParams.payment_mode=this.props.payment_mode.toString();
        }
        if(this.props.expense_type){
            apiParams.expense_type=this.props.expense_type.toString();
        }
        getAPI(EXPENSE_PAYMENT_MODE_API , successFn, errorFn, apiParams);
    }


    sendMail = (mailTo) => {
        const that = this;
        const errorMsg =true;
        const successMsg =true;
        const apiParams = {
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            practice:that.props.active_practiceId,
        };

        if(this.props.payment_mode){
            apiParams.payment_mode=this.props.payment_mode.toString();
        }
        if(this.props.expense_type){
            apiParams.expense_type=this.props.expense_type.toString();
        }
        apiParams.mail_to = mailTo;
        sendReportMail(EXPENSE_PAYMENT_MODE_API, apiParams, successMsg, errorMsg)
    };


    render() {
        let i=1;
        const columns = [{
            title: 'S. No',
            key: 'sno',
            dataIndex:'sno',
            render: (item, record) => <span> {i++}</span>,
            export:(item,record,index)=>index+1,
            width: 50
        },{
            title: 'Date',
            key: 'date',
            dataIndex:'date',
            render: (text, record) => (
                <span>
                {moment(record.expense_date).format('DD MMM YYYY')}
                </span>
            ),
            export:(item,record)=>(moment(record.expense_date).format('ll')),
        }, {
            title: '	Expense Type',
            dataIndex: 'expense_type.name',
            key: 'name',
            export:(item,record)=>(record.expense_type.name),
        }, {
            title: 'Expense Amount (INR)',
            dataIndex: 'amount',
            key: 'amount',
        }, {
            title: 'Mode Of Payment',
            dataIndex: 'payment_mode.mode',
            key: 'payment_mode',
            export:(item,record)=>(record.payment_mode.mode),
        }, {
            title: 'Vendor',
            dataIndex: 'vendor.name',
            key: 'vendor.name',
            export:(item,record)=>(record.vendor.name),
        }, {
            title: 'Notes',
            dataIndex: 'remark',
            key: 'remark',
        }];
        const totalAmount = this.state.report.reduce(function(prev, cur) {
            return prev + cur.amount;
        }, 0);
        return (
<div>
            <h2>Expenses Report
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
                    <Statistic title="Total Expense (INR)" value={totalAmount} />
                    <br />
                </Col>
            </Row>

            <CustomizedTable
              loading={this.state.loading}
              columns={columns}
              dataSource={this.state.report}
            />
</div>
)
    }
}
