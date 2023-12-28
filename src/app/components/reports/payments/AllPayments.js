import React from "react";
import { Col, Divider, Row, Select, Tag, Table, Statistic } from "antd";
import moment from "moment";
import * as _ from "lodash";
import { PAYMENT_REPORTS } from "../../../constants/api";
import { getAPI, interpolate } from "../../../utils/common";
import {  sendReportMail } from "../../../utils/clinicUtils";

export default class AllPayments extends React.Component {
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
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate || this.props.patient_groups != newProps.patient_groups || this.props.taxes != newProps.taxes
            || this.props.doctors != newProps.doctors || this.props.payment_mode != newProps.payment_mode || this.props.discount != newProps.discount || this.props.treatments != newProps.treatments ||
            this.props.consume != newProps.consume || this.props.exclude_cancelled != newProps.exclude_cancelled)
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
            loading: true
        })
        const successFn = function (data) {
            that.setState({
                report: data,
                loading: false
            });
        };
        const errorFn = function (data) {
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
            apiParams.is_cancelled=false;
        }
        if (this.props.taxes) {
            apiParams.taxes = this.props.taxes.toString();
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

    onPieEnter = (data, index) => {
        this.setState({
            activeIndex: index,
        });
    };

    sendMail = (mailTo) => {
        const that = this
        const { startDate, endDate } = this.state;
        const { active_practiceId, type } = this.props;
        const apiParams = {
            practice: active_practiceId,
            type,
            start: startDate.format('YYYY-MM-DD'),
            end: endDate.format('YYYY-MM-DD'),
        };
        if(this.props.exclude_cancelled){
            apiParams.is_cancelled= false;
        }
        if (this.props.taxes) {
            apiParams.taxes = this.props.taxes.toString();
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

        const columns = [{
            title: 'Date',
            key: 'date',
            render: (text, record) => (
                <span>
                    {moment(record.date).format('LL')}
                </span>
            ),
        }, {
            title: 'Scheduled At	',
            key: 'time',
            render: (text, record) => (
                <span>
                    {moment(record.shedule_at).format('HH:mm')}

                </span>
            ),
            export: (text, record) => { moment(record.shedule_at).format('HH:mm') }
        }, {
            title: 'Patient',
            dataIndex: 'patient.user.first_name',
            key: 'patient_name',
        }, {
            title: 'Receipt Number',
            dataIndex: 'payment_id',
            key: 'payment_id',
        }, {
            title: 'Invoice(s)',
            dataIndex: 'invoice_id',
            key: 'invoice_id',
            render: (text, record) => (
<span>{record.invoices.map((item) =>
                <Tag>{item.invoice}</Tag>
            )}
</span>
),
            export: (text, record) => (record.invoices.map((item) => (`${item.invoice  },`)))
        }, {
            title: 'Treatments & Products',
            dataIndex: 'treatement',
            key: 'treatement',
            render: (text, record) => (
<span>{record.invoices.map((item) =>
                <Tag>{item.invoice_items}</Tag>
            )}
</span>
),
            export: (text, record) => (record.invoices.map((item) => (`${item.invoice_items  },`)))
        }, {
            title: 'Amount Paid (INR)	',
            dataIndex: 'total',
            key: 'total',
            render: (text, record) => <span>{record.total.toFixed(2)}</span>,
            export: (text, record) => (record.total.toFixed(2))
        }, {
            title: 'Advance Amount (INR)',
            dataIndex: 'advance_value',
            key: 'advance_value',
            render: (item, record) => <span>{record.advance_value ? record.advance_value.toFixed(2) : '--'}</span>,
            export: (text, record) => (record.advance_value ? record.advance_value.toFixed(2) : '--')
        }, {
            title: 'Payment Info',
            dataIndex: 'payment_mode_data.mode',
            key: 'payment_mode_data.mode',
        }, {
            title: 'Vendor Fees (INR)',
            key: 'vendor_fee',
            render: (item, record) => (
<span>{record.total ?
                ((record.total / 100) * (record.payment_mode_data ? record.payment_mode_data.fee:0)).toFixed(2)
                : 0.00}
</span>
),
            export: (text, record) => (record.total ?
                ((record.total / 100) * (record.payment_mode_data ? record.payment_mode_data.fee:0)).toFixed(2)
                : 0.00)
        }];

        const totalAmount = this.state.report.reduce(function (prev, cur) {
            return prev + cur.total;
        }, 0);

        const totalAdvanceAmount = this.state.report.reduce(function (prev, cur) {
            return prev + cur.advance_value;
        }, 0);

        return (
<div>
            <h2>All Payments Report
                <span style={{ float: 'right' }}>
                    <p><small>E-Mail To:&nbsp;</small>
                        <Select onChange={(e) => this.sendMail(e)} style={{ width: 200 }}>
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
                <Divider><h2>Summary</h2></Divider>
                <Col span={12} style={{textAlign:"center"}}>
                    <Statistic title="Total Payment (INR)" value={totalAmount.toFixed(2)} />
                </Col>

                <Col span={12} style={{textAlign:"center"}}>
                    <Statistic title="Total Advance Payment (INR)" value={totalAdvanceAmount.toFixed(2)} />
                </Col>
                <Divider />
            </Row>
            <Table
              rowKey={(record) => record.id}
              loading={this.state.loading}
              columns={columns}
              dataSource={this.state.report}
            />


</div>
)
    }
}
