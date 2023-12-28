import React from "react";
import { Select } from "antd";
import moment from "moment"
import { PATIENT_APPOINTMENTS_REPORTS } from "../../../constants/api";
import { getAPI } from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import { sendReportMail } from "../../../utils/clinicUtils";

export default class AverageWaitingOrEngagedTimeDayWise extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appointmentDayWait: [],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            mailingUsersList: this.props.mailingUsersList
        }
        this.loadAppointmentDayWait = this.loadAppointmentDayWait.bind(this);
    }

    componentDidMount() {
        this.loadAppointmentDayWait();
      
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
                that.loadAppointmentDayWait();
            })

    }

    loadAppointmentDayWait = () => {
        const that = this;
        that.setState({
            loading: true,
        });
        const successFn = function (data) {
            that.setState({
                appointmentDayWait: data,
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
    };

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
    };

    render() {
        const { appointmentDayWait } = this.state;
        const appointmentDayWaitData = [];
        for (let i = 1; i <= appointmentDayWait.length; i++) {
            appointmentDayWaitData.push({ s_no: i, ...appointmentDayWait[i - 1] });
        }
        ;

        const columns = [{
            title: 'S. No',
            key: 's_no',
            dataIndex: 's_no',
            width: 50
        }, {
            title: 'Appointment Time Day',
            key: 'date',
            dataIndex: 'date',
            render: (text, record) => (
                <span>
                    {moment(record.date).format('DD MMM YYYY')}
                </span>
            ),
            export: (item, record) => (moment(record.date).format('DD MMM YYYY')),
        }, {
            title: 'Avg. waiting Time(hh:mm:ss)',
            key: 'wait',
            dataIndex: 'wait',
            render: (text, record) => (
                <span>
                    {record.wait ? moment().add(record.wait, 'second').fromNow() : ''}
                </span>
            ),
            export: (item, record) => (record.wait ? moment().add(record.wait, 'second').fromNow() : ''),
        }, {
            title: 'Avg. engaged Time(hh:mm:ss)',
            key: 'engage',
            dataIndex: 'engage',
            render: (text, record) => (
                <span>
                    {record.engage ? moment().add(record.engage, 'second').fromNow() : ''}
                </span>
            ),
            export: (item, record) => (record.engage ? moment().add(record.engage, 'second').fromNow() : ''),
        }, {
            title: 'Avg. stay Time (hh:mm:ss)',
            key: 'stay',
            dataIndex: 'stay',
            render: (stay, record) => (
                <span>
                    {record.stay ? moment().add(record.stay, 'second').fromNow() : ''}
                </span>
            ),
            export: (item, record) => (record.stay ? moment().add(record.stay, 'second').fromNow() : ''),
        }];


        return (
            <div>
                <h2>Average Waiting/engaged Time Day Wise
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
                    dataSource={appointmentDayWaitData}
                />

            </div>
        )
    }
}
