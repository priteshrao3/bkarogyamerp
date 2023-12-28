import React from "react";
import { Divider, Empty, Select, Spin, Statistic } from "antd";
import moment from "moment";
import { Bar, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { PATIENT_APPOINTMENTS_REPORTS } from "../../../constants/api";
import { getAPI } from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import {sendReportMail } from "../../../utils/clinicUtils";



export default class DailyAppointmentCount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appointmentDaily: [],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            mailingUsersList: this.props.mailingUsersList
        }
        this.loadAppointmentDaily = this.loadAppointmentDaily.bind(this);
    }

    componentDidMount() {
        this.loadAppointmentDaily();
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
                that.loadAppointmentDaily();
            })

    }

    loadAppointmentDaily = () => {
        const that = this;
        that.setState({
            loading: true,
        });
        const successFn = function (data) {
            that.setState({
                appointmentDaily: data.data,
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
    }

    render() {

        const { appointmentDaily } = this.state;
        const appointmentDailyData = [];
        for (let i = 1; i <= appointmentDaily.length; i++) {
            appointmentDailyData.push({ s_no: i, ...appointmentDaily[i - 1] });
        };

        const columns = [{
            title: 'S. No',
            key: 's_no',
            dataIndex: 's_no',
            width: 50
        }, {
            title: 'Day',
            key: 'date',
            dataIndex: 'date',
            render: (text, record) => (
                <span>
                    {moment(record.date).format('DD MMM ')}
                </span>
            ),
            export: (item, record) => (moment(record.date).format('DD MMM ')),
        }, {
            title: 'Total Appointments',
            key: 'count',
            dataIndex: 'count'
        }];




        const renderCustomBarLabel = ({ payload, x, y, width, height, value }) => {
            return <text x={x + width / 2} y={y} fill="#666" textAnchor="middle" dy={-6}>{value}</text>;
        };

        const CustomizedLabel = ({ x, y, stroke, value }) => {
            return <text x={x} y={y} dy={-4} fill="#666" fontSize={18} textAnchor="middle">{value}</text>
        };

        return (
            <div>
                <h2>Daily Appointment Count
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
                <Spin size="large" spinning={this.state.loading}>
                    {appointmentDailyData.length > 0 ? (
                        <LineChart
                            width={1000}
                            height={300}
                            data={[...appointmentDailyData].reverse()}
                            margin={{ top: 5, right: 30, left: 20, bottom: 55 }}
                        >

                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => {
                                    return moment(value).format('DD MMM')
                                }}
                                label={{ value: "Data Range", offset: 0, margin: { top: 10 }, position: "insideBottom" }}
                            />
                            {/* </XAxis> */}

                            <YAxis label={{ value: 'Appointments', angle: -90, position: 'insideLeft' }} />

                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#1DA57A" strokeWidth={4} label={<CustomizedLabel />} />
                        </LineChart>
                    ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data to Show" />}
                </Spin>

                <Divider><Statistic title="Total" value={this.state.total} /></Divider>
                <CustomizedTable hideReport loading={this.state.loading} columns={columns} dataSource={appointmentDailyData} />

            </div>
        )
    }
}
