import React from "react";
import {Statistic, Divider, Table, Spin, Empty, Select, Row, Col} from "antd"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Label,
    Legend,
    ComposedChart,
    PieChart,
    Pie, Cell, Sector
} from 'recharts';
import moment from "moment";
import {PATIENT_APPOINTMENTS_REPORTS, PATIENTS_REPORTS} from "../../../constants/api";
import {getAPI, displayMessage, interpolate} from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import {sendReportMail} from "../../../utils/clinicUtils";

export default class SourceWisePatientReport extends React.Component {
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
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate || this.props.patient_groups != newProps.patient_groups
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
        getAPI(PATIENTS_REPORTS, successFn, errorFn, apiParams);
    }

    sendMail = (mailTo) => {
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
        apiParams.mail_to = mailTo;
        sendReportMail(PATIENTS_REPORTS, apiParams)
    }

    render() {
        const {report} = this.state;
        const reportData = [];
        for (let i = 1; i <= report.length; i++) {
            reportData.push({s_no: i, ...report[i - 1]});
        }
        ;

        const renderActiveShape = (props) => {
            const RADIAN = Math.PI / 180;
            const {
                cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
                fill, payload, percent, value
            } = props;
            const sin = Math.sin(-RADIAN * midAngle);
            const cos = Math.cos(-RADIAN * midAngle);
            const sx = cx + (outerRadius + 10) * cos;
            const sy = cy + (outerRadius + 10) * sin;
            const mx = cx + (outerRadius + 30) * cos;
            const my = cy + (outerRadius + 30) * sin;
            const ex = mx + (cos >= 0 ? 1 : -1) * 22;
            const ey = my;
            const textAnchor = cos >= 0 ? 'start' : 'end';

            return (
                <g>

                    <Sector
                      cx={cx}
                      cy={cy}
                      innerRadius={innerRadius}
                      outerRadius={outerRadius}
                      startAngle={startAngle}
                      endAngle={endAngle}
                      fill={fill}
                    />

                    <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                    <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                    <text
                      x={ex + (cos >= 0 ? 1 : -1) * 12}
                      y={ey}
                      textAnchor={textAnchor}
                      fill="#333"
                    >{`${payload.source__name},${payload.count}`}
                    </text>
                    <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                        {`(Rate ${(percent * 100).toFixed(2)}%)`}
                    </text>
                </g>
            );
        };
        const columns = [{
            title: 'S. No',
            key: 's_no',
            dataIndex: 's_no',
            width: 50
        }, {
            title: 'Source',
            key: 'source__name',
            dataIndex: 'source__name',
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
        const COLORS = ['#FFBB28', '#FF8042'];
        return (
            <div>
                <h2>Source Wise New Patients Report
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
                    <Col span={12} offset={6}>
                        <Spin size="large" spinning={this.state.loading}>
                            {reportData.length > 0 ? (
                                <PieChart width={800} height={400}>
                                    <Pie
                                      label={renderActiveShape}
                                      data={reportData}
                                      cx={300}
                                      dataKey="count"
                                      cy={200}
                                      innerRadius={60}
                                      outerRadius={80}
                                      fill="#8884d8"
                                    >
                                        {
                                            reportData.map((entry, index) => (
<Cell
  fill={COLORS[index % COLORS.length]}
/>
))
                                        }
                                    </Pie>
                                    {/* <Tooltip/> */}
                                </PieChart>
                            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data to Show" />}
                        </Spin>
                    </Col>
                </Row>
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
