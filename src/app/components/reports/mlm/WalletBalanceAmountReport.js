import React from 'react';
import { Col, Row, Select, Statistic } from 'antd';
import { MLM_AGENT_WALLET } from '../../../constants/api';
import { getAPI } from '../../../utils/common';
import CustomizedTable from '../../common/CustomizedTable';
import { hideEmail, hideMobile } from '../../../utils/permissionUtils';
import {  sendReportMail } from '../../../utils/clinicUtils';

export default class WalletBalanceAmountReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            report: [],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            mailingUsersList: this.props.mailingUsersList
        };
        this.loadMlmReport = this.loadMlmReport.bind(this);
    }

    componentDidMount() {
        this.loadMlmReport();
      
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        const that = this;
        if (
            this.props.startDate !== newProps.startDate ||
            this.props.endDate !== newProps.endDate ||
            this.props.agents !== newProps.agents
        )
            this.setState(
                {
                    startDate: newProps.startDate,
                    endDate: newProps.endDate,
                },
                function() {
                    that.loadMlmReport();
                },
            );
    }

    loadMlmReport() {
        const that = this;
        this.setState({
            loading: true,
        });
        const successFn = function(data) {
            that.setState({
                report: data,
                loading: false,
            });
        };
        const errorFn = function() {
            that.setState({
                loading: false,
            });
        };
        const apiParams = {
            practice: that.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
        };
        if (this.props.agents) {
            apiParams.agents = this.props.agents.toString();
        }
        getAPI(MLM_AGENT_WALLET, successFn, errorFn, apiParams);
    }

    sendMail = mailTo => {
        const that = this;
        const apiParams = {
            practice: that.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
        };
        if (this.props.agents) {
            apiParams.agents = this.props.agents.toString();
        }
        apiParams.mail_to = mailTo;
        sendReportMail(MLM_AGENT_WALLET, apiParams);
    };

    render() {
        const that = this;
        const { report } = this.state;
        const reportData = [];
        console.log({report})
        for (let i = 1; i <= report.length; i++) {
            reportData.push({ s_no: i, ...report[i - 1] });
        }
        const columns = [
            {
                title: 'S. No',
                key: 's_no',
                dataIndex: 's_no',
                width: 50,
            },
            {
                title: 'Advisor Name',
                dataIndex: 'patient.user.first_name',
                key: 'name',
                export: (item, record) => record.patient.user.first_name,
            },
            {
                title: 'Mobile Number',
                key: 'patient.user.mobile',
                dataIndex: 'patient.user.mobile',
                render: value =>
                    that.props.activePracticePermissions.PatientPhoneNumber
                        ? value
                        : hideMobile(value),
                export: (item, record) => record.patient.user.mobile,
            },
            {
                title: 'Email',
                key: 'patient.user.email',
                dataIndex: 'patient.user.email',
                render: value =>
                    that.props.activePracticePermissions.PatientEmailId ? value : hideEmail(value),
                export: (item, record) => record.patient.user.email,
            },
            {
                title: 'Gender',
                key: 'gender',
                dataIndex: 'patient.gender',
                export: (item, record) => record.patient.gender,
            },
            {
                title: 'Refundable Amount',
                dataIndex: 'refundable_amount',
                key: 'refundable_amount',
                render: (item, record) => (
                    <span>
                        {record.refundable_amount ? record.refundable_amount.toFixed(2) : '0.00'}
                    </span>
                ),
            },
            {
                title: 'Non Refundable Amount',
                dataIndex: 'non_refundable',
                key: 'non_refundable',
                render: (item, record) => (
                    <span>{record.non_refundable ? record.non_refundable.toFixed(2) : '0.00'}</span>
                ),
            },
        ];
        const totalRefundableAmount = this.state.report.reduce(function(prev, cur) {
            return prev + cur.refundable_amount;
        }, 0);

        const totalNonRefundableAmount = this.state.report.reduce(function(prev, cur) {
            return prev + cur.non_refundable;
        }, 0);
        return (
            <div>
                <h2>
                    Wallet Balance Amount
                    <span style={{ float: 'right' }}>
                        <p>
                            <small>E-Mail To:&nbsp;</small>
                            <Select onChange={e => this.sendMail(e)} style={{ width: 200 }}>
                                {this.state.mailingUsersList.map(item => (
                                    <Select.Option value={item.email}>{item.name}</Select.Option>
                                ))}
                            </Select>
                        </p>
                    </span>
                </h2>
                <Row>
                    <Col span={12} offset={6} style={{ textAlign: 'center' }}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic
                                  title="Total Refundable Amount(INR)"
                                  value={
                                        totalRefundableAmount
                                            ? totalRefundableAmount.toFixed(2)
                                            : '0.00'
                                    }
                                />
                            </Col>

                            <Col span={12}>
                                <Statistic
                                  title="Total Non Refundable Amount(INR)"
                                  value={
                                        totalNonRefundableAmount
                                            ? totalNonRefundableAmount.toFixed(2)
                                            : '0.00'
                                    }
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <CustomizedTable
                  loading={this.state.loading}
                  columns={columns}
                  dataSource={reportData}
                />
            </div>
        );
    }
}
