import React from "react";
import { Statistic, Divider, Table, Spin, Empty, Select } from "antd"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Label, Legend, ComposedChart } from 'recharts';
import moment from "moment";
import { PATIENT_APPOINTMENTS_REPORTS, PATIENTS_REPORTS } from "../../../constants/api";
import { getAPI, displayMessage, interpolate } from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import { sendReportMail } from "../../../utils/clinicUtils";

export default class DailyNewPatientReports extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            report: [],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            mailingUsersList: this.props.mailingUsersList
        }
        this.loadDailyNewPatients = this.loadDailyNewPatients.bind(this);
    }

    componentDidMount() {
        this.loadDailyNewPatients();

    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.showAllClinic != newProps.showAllClinic ||
            this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate || this.props.patient_groups != newProps.patient_groups
            || this.props.blood_group != newProps.blood_group)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            }, function () {
                that.loadDailyNewPatients();
            })
    }

    loadDailyNewPatients() {
        const that = this;
        let { showAllClinic } = that.props;
        that.setState({
            loading: true
        })
        const successFn = function (data) {
            that.setState({
                report: data.data,
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
            from_date: this.props.startDate.format('YYYY-MM-DD'),
            to_date: this.props.endDate.format('YYYY-MM-DD'),
            type: this.props.type,
        }
        if (this.props.patient_groups) {
            apiParams.groups = this.props.patient_groups.toString();
        }
        if (this.props.blood_group) {
            apiParams.blood_group = this.props.blood_group;
        }
        if (!showAllClinic) {
            apiParams.practice = this.props.active_practiceId;
        }
        getAPI(PATIENTS_REPORTS, successFn, errorFn, apiParams);
    }

    sendMail = (mailTo) => {
        let { showAllClinic } = this.props;
        const apiParams = {
            from_date: this.props.startDate.format('YYYY-MM-DD'),
            to_date: this.props.endDate.format('YYYY-MM-DD'),
            type: this.props.type,
        }
        if (this.props.patient_groups) {
            apiParams.groups = this.props.patient_groups.toString();
        }
        if (this.props.blood_group) {
            apiParams.blood_group = this.props.blood_group;
        }
        if (!showAllClinic) {
            apiParams.practice = this.props.active_practiceId;
        }
        apiParams.mail_to = mailTo;
        sendReportMail(PATIENTS_REPORTS, apiParams)
    }

    render() {
        const { report } = this.state;
        const reportData = [];
        for (let i = 1; i <= report.length; i++) {
            reportData.push({ s_no: i, ...report[i - 1] });
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
            render: ((item, record) => <span>{moment(record.date).format('ll')}</span>),
            export: (item, record) => (moment(record.date).format('ll')),
        }, {
            title: 'Patients',
            key: 'count',
            dataIndex: 'count',
        }];
        const CustomizedAxisTick = (x, y, value) => ({
            render() {
                // const {x, y, stroke, payload} = this.props;

                return (
                    <g transform={`translate(${x},${y})`}>
                        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">{value}</text>
                    </g>
                );
            }
        });

        return (
            <div>
                <h2>Daily New Patients Report
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
                    {reportData.length > 0 ? (
                        <LineChart
                            width={1000}
                            height={300}
                            data={[...reportData].reverse()}
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

                            <YAxis label={{ value: 'Total Patients', angle: -90, position: 'insideLeft' }} />

                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={4} />
                        </LineChart>
                    ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data to Show" />}
                </Spin>

                <Divider><Statistic title="Total Patients" value={this.state.total} /></Divider>
                <CustomizedTable
                    hideReport
                    loading={this.state.loading}
                    columns={columns}
                    dataSource={reportData}
                />
            </div>
        )
    }
}
