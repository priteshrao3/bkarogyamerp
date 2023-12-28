import React from 'react';
import { Select, Table } from 'antd';
import { REGISTRATION_REPORTS, PATIENTS_REPORTS } from '../../../constants/api';
import { getAPI, displayMessage, interpolate } from '../../../utils/common';
import { hideEmail, hideMobile } from '../../../utils/permissionUtils';
import CustomizedTable from '../../common/CustomizedTable';
import { sendReportMail } from '../../../utils/clinicUtils';
import moment from 'moment';

export default class ExpiringRegistration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            report: [],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            mailingUsersList: this.props.mailingUsersList,
        };
        this.loadExpireMembership = this.loadExpireMembership.bind(this);
    }

    componentDidMount() {
        this.loadExpireMembership();

    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate,
            }, function() {
                that.loadExpireMembership();
            });
    }

    loadExpireMembership() {
        const that = this;
        that.setState({
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
            from_date: this.props.startDate.format('YYYY-MM-DD'),
            to_date: this.props.endDate.format('YYYY-MM-DD'),
            // type: this.props.type,
            type:"EXPIRED"
        };
        getAPI(REGISTRATION_REPORTS, successFn, errorFn, apiParams);
    }

    sendMail = (mailTo) => {
        const apiParams = {
            from_date: this.props.startDate.format('YYYY-MM-DD'),
            to_date: this.props.endDate.format('YYYY-MM-DD'),
            type:"EXPIRED"
            // type: this.props.type,
        };
        apiParams.mail_to = mailTo;
        sendReportMail(REGISTRATION_REPORTS, apiParams);
    };

    render() {
        const that = this;
        const { report } = this.state;
        const reportData = [];
        for (let i = 1; i <= report.length; i++) {
            reportData.push({ s_no: i, ...report[i - 1] });
        }
        ;
        const columns = [{
            title: 'S. No',
            key: 's_no',
            dataIndex: 's_no',
            width: 50,
        }, {
            title: 'Name',
            dataIndex: 'patient.user.first_name',
            key: 'patient.user.first_name',
            export: (item, record) => (record.patient.user.first_name),
        }, {
            title: 'Mobile Number',
            key: 'patient.user.mobile',
            dataIndex: 'patient.user.mobile',
            render: (value) => that.props.activePracticePermissions.PatientPhoneNumber ? value : hideMobile(value),
            export: (item, record) => (record.patient.user.mobile),
        }, {
            title: 'Email',
            key: 'patient.user.email',
            dataIndex: 'patient.user.email',
            render: (value) => that.props.activePracticePermissions.PatientEmailId ? value : hideEmail(value),
            export: (item, record) => (record.patient.user.email),
        }, {
            title: 'Gender',
            key: 'gender',
            dataIndex: 'patient.gender',
            export: (item, record) => (record.patient.gender),
        }, {
            title: 'Start Date',
            dataIndex: 'medical_from',
            render: (item, record) => <span>{moment(record.registration_from).format('LL')}</span>,
            exports: (item, record) => (moment(record.registration_from).format('LL')),
        }, {
            title: 'Valid Till',
            dataIndex: 'medical_to',
            render: (item, record) => <span>{moment(record.registration_to).format('LL')}</span>,
            exports: (item, record) => (moment(record.registration_to).format('LL')),
        }];

        return (
            <div>
                <h2>Expiring Registration
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
                <CustomizedTable
                    loading={this.state.loading}
                    columns={columns}
                    hideReport
                    dataSource={reportData}
                />


            </div>
        );
    }
}
