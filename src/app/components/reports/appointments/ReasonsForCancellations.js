import React from "react";
import moment from "moment";
import { Modal, Select } from "antd";
import { PATIENT_APPOINTMENTS_REPORTS } from "../../../constants/api";
import { getAPI } from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import { sendReportMail } from "../../../utils/clinicUtils";

export default class ReasonsForCancellations extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appointmentReports: [],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: true,
            mailingUsersList: this.props.mailingUsersList
        }
        this.loadAppointmentReport = this.loadAppointmentReport.bind(this);
    }

    componentDidMount() {
        this.loadAppointmentReport();
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate || this.props.categories != newProps.categories ||
            this.props.country != newProps.country || this.props.state != newProps.state || this.props.city != newProps.city
            || this.props.doctors != newProps.doctors || this.props.exclude_cancelled != newProps.exclude_cancelled)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            }, function () {
                that.loadAppointmentReport();
            })

    }

    loadAppointmentReport = () => {
        const that = this;
        this.setState({
            loading: true
        })
        const successFn = function (data) {
            console.log(data);
            that.setState({
                appointmentReports: data.data,
                loading: false
            });
            console.log(that.state.appointmentReports);
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
            exclude_cancelled: !!this.props.exclude_cancelled,
        };
        // if (this.props.exclude_cancelled){
        //     apiParams.exclude_cancelled=this.props.exclude_cancelled;
        // }
        if (this.props.categories) {
            apiParams.categories = this.props.categories.toString();
        }
        if (this.props.doctors) {
            apiParams.doctors = this.props.doctors.toString();
        }

        if (this.props.country) {
            apiParams.country = this.props.country;
        }
        if (this.props.state) {
            apiParams.state = this.props.state;
        }
        if (this.props.city) {
            apiParams.city = this.props.city;
        }

        getAPI(PATIENT_APPOINTMENTS_REPORTS, successFn, errorFn, apiParams);
    }

    sendMail = (mailTo) => {
        const apiParams = {
            type: this.props.type,
            practice: this.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            exclude_cancelled: !!this.props.exclude_cancelled,
        };
        // if (this.props.exclude_cancelled){
        //     apiParams.exclude_cancelled=this.props.exclude_cancelled;
        // }
        if (this.props.categories) {
            apiParams.categories = this.props.categories.toString();
        }
        if (this.props.doctors) {
            apiParams.doctors = this.props.doctors.toString();
        }
        if (this.props.country) {
            apiParams.country = this.props.country;
        }
        if (this.props.state) {
            apiParams.state = this.props.state;
        }
        if (this.props.city) {
            apiParams.city = this.props.city;
        }
        apiParams.mail_to = mailTo;
        sendReportMail(PATIENT_APPOINTMENTS_REPORTS, apiParams)
    }

    render() {

        const { appointmentReports } = this.state;
        // const appointmentReportsData = [];
        // for (let i = 1; i <= appointmentReports.length; i++) {
        //     appointmentReportsData.push({s_no: i,...appointmentReports[i-1]});
        // };


        const columns = [{
            title: 'Date',
            key: 'date',
            render: (text, record) => (
                <span>
                    {moment(record.schedule_at).format('LL')}
                </span>
            ),
        }, {
            title: 'Scheduled At	',
            key: 'time',
            render: (text, record) => (
                <span>
                    {moment(record.schedule_at).format('HH:mm')}

                </span>
            ),
        }, {
            title: 'Check-in At',
            dataIndex: 'waiting',
            key: 'waiting',
            render: (text, record) => (
                <span>
                    {record.waiting ? moment(record.waiting).format('lll') : ''}
                </span>
            ),
        }, {
            title: 'Waited For (hh:mm:ss)',
            dataIndex: 'age',
            key: 'age',
            render: (age, record) => (
                <span>
                    {record.engaged ? moment(record.engaged).from(moment(record.waiting))
                        : ''}
                </span>
            )
        }, {
            title: 'Engaged At',
            dataIndex: 'engaged',
            key: 'engaged',
            render: (text, record) => (
                <span>
                    {record.engaged ? moment(record.engaged).format('lll') : ''}
                </span>
            ),
        }, {
            title: 'Checkout At',
            dataIndex: 'checkout',
            key: 'checkout',
            render: (text, record) => (
                <span>
                    {record.checkout ? moment(record.checkout).format('lll') : ''}
                </span>
            ),
        }, {
            title: 'Patient',
            dataIndex: 'patient',
            key: 'patient_name',
            render: (item, record) => <span>{item.user.first_name}</span>
        }, {
            title: 'Doctor',
            dataIndex: 'doctor',
            key: 'address',
            render: (text, record) => <span>{record.doctor_data ? record.doctor_data.user.first_name : null}</span>
        }, {
            title: 'Category',
            dataIndex: 'category',
            key: 'address',
            render: (text, record) => <span>{record.category_data ? record.category_data.name : null}</span>
        }];





        return (
            <div>
                <h2>Reasons For Cancellations
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
                    hideReport
                    loading={this.state.loading}
                    columns={columns}
                    size="small"
                    dataSource={appointmentReports}
                />

            </div>
        )
    }
}
