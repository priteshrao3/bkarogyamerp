import React from "react";
import {Select, Table} from "antd";
import {APPOINTMENT_REPORTS} from "../../../constants/api";
import {getAPI, interpolate} from "../../../utils/common";
import {sendReportMail} from "../../../utils/clinicUtils";

export default class TotalAmountDue extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: true,
            appointmentCategory: [],
            activeIndex: 0,
            appointmentReports: [],
            mailingUsersList: this.props.mailingUsersList
        }
        this.loadAppointmentReport = this.loadAppointmentReport.bind(this);
    }

    componentDidMount() {
        this.loadAppointmentReport();
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate || this.props.patient_groups != newProps.patient_groups)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            }, function () {
                that.loadAppointmentReport();
            })

    }

    loadAppointmentReport = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                appointmentReports: data.data,
                total: data.total,
                loading: false
            });
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        const apiParams = {
            practice: this.props.active_practiceId,
            type: that.props.type,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
        };
        if (this.props.patient_groups) {
            apiParams.groups = this.props.patient_groups.toString();
        }
        getAPI(interpolate(APPOINTMENT_REPORTS, [that.props.active_practiceId]), successFn, errorFn, apiParams);
    };

    onPieEnter = (data, index) => {
        this.setState({
            activeIndex: index,
        });
    };

    sendMail = (mailTo) => {
        const apiParams = {
            practice: this.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            type: this.props.type,
        }
        if (this.props.patient_groups) {
            apiParams.groups = this.props.patient_groups.toString();
        }
        apiParams.mail_to = mailTo;
        sendReportMail(interpolate(APPOINTMENT_REPORTS, [this.props.active_practiceId]), apiParams)
    }

    render() {
        const {appointmentReports} = this.state;
        const appointmentReportsData = [];
        for (let i = 1; i <= appointmentReports.length; i++) {
            appointmentReportsData.push({s_no: i, ...appointmentReports[i - 1]});
        }
        ;

        const columns = [{
            title: 'S. No',
            key: 's_no',
            dataIndex: 's_no',
            width: 50
        }, {
            title: 'Name',
            key: 'name',
            dataIndex: 'user.first_name',
        }, {
            title: 'Unsettled Invoice Amount(INR)',
            key: 'invoice_amount',
            dataIndex: '',
        }, {
            title: 'Amount Due(INR)',
            dataIndex: 'amount_due',
            key: 'amount_due',
        }, {
            title: 'Last Invoice(INR)',
            dataIndex: 'last_invoice_amount',
            key: 'last_invoice_amount',
        }, {
            title: 'Last Payment(INR)',
            key: 'last_payed_amount',
            dataIndex: 'last_payed_amount',
        }];

        return (
<div>
            <h2>Unsettled Invoices
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
              dataSource={appointmentReportsData}
            />


</div>
)
    }
}
