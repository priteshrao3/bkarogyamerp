import React from "react";
import { Col, Divider, Empty, Row, Select, Spin, Statistic } from "antd";
import { Cell, Pie, PieChart, Sector } from "recharts";
import { PATIENT_APPOINTMENTS_REPORTS } from "../../../constants/api";
import { getAPI } from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import { sendReportMail } from "../../../utils/clinicUtils";

export default class CancellationsNumbers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appointmentCancel: [],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            activeIndex: 0,
            mailingUsersList: this.props.mailingUsersList
        }
        this.loadAppointmentCancellation = this.loadAppointmentCancellation.bind(this);
    }

    componentDidMount() {
        this.loadAppointmentCancellation();
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
                that.loadAppointmentCancellation();
            })

    }

    loadAppointmentCancellation = () => {
        const that = this;
        that.setState({
            loading: true,
        });
        const successFn = function (data) {
            console.log(Object.entries(data));
            that.setState({
                appointmentCancel: data,
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


    onPieEnter = (data, index) => {
        this.setState({
            activeIndex: index,
        });
    };

    render() {
        const { appointmentCancel } = this.state;
        const appointmentCancelData = [];
        for (let i = 1; i <= appointmentCancel.length; i++) {
            appointmentCancelData.push({ s_no: i, ...appointmentCancel[i - 1] });
        };

        const columns = [{
            title: 'S. No',
            key: 's_no',
            dataIndex: 's_no',
            width: 50
        }, {
            title: 'Appointment Status',
            key: 'type',
            dataIndex: 'type',
        }, {
            title: 'Total Appointments',
            key: 'count',
            dataIndex: 'count',
        }];
        const COLORS = ['#FFBB28', '#FF8042'];
        const renderActiveShape = (props) => {
            const RADIAN = Math.PI / 180;
            const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
                fill, payload, percent, value } = props;
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
                    <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${payload.type},${payload.count}`}</text>
                    <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                        {`(Rate ${(percent * 100).toFixed(2)}%)`}
                    </text>
                </g>
            );
        };

        const appointmentTotal = appointmentCancelData.reduce(function (prev, cur) {
            return prev + cur.count;
        }, 0);

        return (
            <div>
                <h2>Cancellations Numbers
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
                    <Col span={12} offset={6}>
                        <Spin size="large" spinning={this.state.loading}>
                            {appointmentCancelData.length > 0 && appointmentTotal ? (
                                <PieChart width={800} height={400}>
                                    <Pie
                                      label={renderActiveShape}
                                      data={appointmentCancelData}
                                      cx={300}
                                      dataKey="count"
                                      cy={200}
                                      innerRadius={60}
                                      outerRadius={80}
                                      fill="#8884d8"
                                    >
                                        {
                                            appointmentCancelData.map((entry, index) => <Cell fill={COLORS[index % COLORS.length]} />)
                                        }
                                    </Pie>
                                    {/* <Tooltip/> */}
                                </PieChart>
                            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data to Show" />}
                        </Spin>
                    </Col>
                </Row>
                <Divider><Statistic title="Total" value={appointmentTotal} /></Divider>

                <CustomizedTable
                  hideReport
                  loading={this.state.loading}
                  columns={columns}
                  dataSource={appointmentCancelData}
                />

            </div>
        )
    }
}
