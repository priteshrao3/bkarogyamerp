import React from "react";
import {Col, Divider, Row, Select, Statistic, Table} from "antd";
import moment from "moment"
import {PAYMENT_REPORTS} from "../../../constants/api";
import {getAPI, interpolate} from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import { sendReportMail} from "../../../utils/clinicUtils";

export default class PatientsWithUnsettledAdvance extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            report: [],
            mailingUsersList: this.props.mailingUsersList
        };
        this.loadPaymentsReport = this.loadPaymentsReport.bind(this);
    }

    componentDidMount() {
        this.loadPaymentsReport();
       
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate || this.props.patient_groups != newProps.patient_groups ||this.props.taxes!=newProps.taxes
            || this.props.doctors != newProps.doctors ||this.props.payment_mode !=newProps.payment_mode||this.props.discount != newProps.discount||this.props.treatments!=newProps.treatments||
            this.props.consume!=newProps.consume || this.props.exclude_cancelled != newProps.exclude_cancelled)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            }, function () {
                that.loadPaymentsReport();
            })

    }

    loadPaymentsReport = () => {
        const that = this;
        that.setState({
            loading:true,
        });
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
        const apiParams = {
            type: that.props.type,
            practice: that.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
        };
        if(this.props.exclude_cancelled){
            apiParams.is_cancelled= false;
        }
        if (this.props.taxes){
            apiParams.taxes=this.props.taxes.toString();
        }
        if (this.props.patient_groups) {
            apiParams.patient_groups = this.props.patient_groups.toString();
        }
        if (this.props.payment_mode) {
            apiParams.payment_mode = this.props.payment_mode.toString();
        }
        if (this.props.doctors) {
            apiParams.doctors = this.props.doctors.toString();
        }
        if (this.props.consume) {
            apiParams.consume = this.props.consume.toString();
        }
        if (this.props.discount) {
            apiParams.discount = this.props.discount;
        }
        if (this.props.treatments) {
            apiParams.treatments = this.props.treatments.toString();
        }
        getAPI(interpolate(PAYMENT_REPORTS, [that.props.active_practiceId]), successFn, errorFn, apiParams);
    };

    sendMail = (mailTo) => {
        const that = this
        const {startDate, endDate} = this.state;
        const {active_practiceId, type} = this.props;
        const apiParams = {
            type: that.props.type,
            practice: that.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
        };
        if(this.props.exclude_cancelled){
            apiParams.is_cancelled= false;
        }
        if (this.props.taxes){
            apiParams.taxes=this.props.taxes.toString();
        }
        if (this.props.patient_groups) {
            apiParams.patient_groups = this.props.patient_groups.toString();
        }
        if (this.props.payment_mode) {
            apiParams.payment_mode = this.props.payment_mode.toString();
        }
        if (this.props.doctors) {
            apiParams.doctors = this.props.doctors.toString();
        }
        if (this.props.consume) {
            apiParams.consume = this.props.consume.toString();
        }
        if (this.props.discount) {
            apiParams.discount = this.props.discount;
        }
        if (this.props.treatments) {
            apiParams.treatments = this.props.treatments.toString();
        }


        apiParams.mail_to = mailTo;
        sendReportMail(interpolate(PAYMENT_REPORTS, [that.props.active_practiceId]), apiParams);
    };

    render() {
        const that = this;
        let i = 1;
        const columns = [{
            title: 'S. No',
            key: 'sno',
            dataIndex:'sno',
            render: (item, record) => <span> {i++}</span>,
            export:(item,record,index)=>index+1,
            width: 50
        },{
            title:"Date",
            key:"date",
            dataIndex:"date",
            render: (text, record) => (
                <span>
                {moment(record.date).format('LL')}
                </span>
            ),
            export:(text,record)=> {moment(record.date).format('LL')}
        },{
            title:"Patient Name",
            key:"name",
            dataIndex:"name",
        },{
            title:"Patient Id",
            key:"patient_id",
            dataIndex:"custom_id"
        },{
            title:"Unsettled Advance(INR)",
            key:"advance",
            dataIndex:"advance",
            render:(item, record) =><span>{record.advance?record.advance.toFixed(2):'--'}</span>,
            export:(text,record)=> (record.advance?record.advance.toFixed(2):'--')
        },{
            title:"Net Advance/Due (INR)",
            key:'net',
            dataIndex:"net",
            render:(item, record) =><span>{record.net?record.net.toFixed(2):'--'}</span>,
            export:(text,record)=> (record.net?record.net.toFixed(2):'--')

        },{
            title:"Last Payment",
            key:"last_payment",
            dataIndex:"last_payment"
        }];

        return (
<div>
            <h2>Patients With Unsettled Advance
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
              pagination={false}
              dataSource={this.state.report}
            />

</div>
)
    }
}
