import React from 'react';
import { Col, Empty, Row, Select, Spin, Typography } from 'antd';
import moment from 'moment';
import { Cell, Pie, PieChart, Sector } from 'recharts';
import { MLM_REPORTS } from '../../../constants/api';
import { getAPI } from '../../../utils/common';
import CustomizedTable from '../../common/CustomizedTable';
import { hideEmail, hideMobile } from '../../../utils/permissionUtils';
import { sendReportMail } from '../../../utils/clinicUtils';

const { Text } = Typography;

export default class TransferredAmountReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            report: [],
            reportSummary: [],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            activeIndex: 0,
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
                report: data.data,
                reportSummary: data.summary,
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
            type: 'TRANSFER',
        };
        if (this.props.agents) {
            apiParams.agents = this.props.agents.toString();
        }
        getAPI(MLM_REPORTS, successFn, errorFn, apiParams);
    }

    onPieEnter = (data, index) => {
        this.setState({
            activeIndex: index,
        });
    };

    sendMail = mailTo => {
        const that = this;
        const apiParams = {
            practice: that.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            type: 'TRANSFER',
        };
        if (this.props.agents) {
            apiParams.agents = this.props.agents.toString();
        }
        apiParams.mail_to = mailTo;
        sendReportMail(MLM_REPORTS, apiParams);
    };

    render() {
        const that = this;
        const { report } = this.state;
        const reportData = [];
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
                title: 'Date',
                dataIndex: 'created_at',
                key: 'created_at',
                render: (text, record) => <span>{moment(record.schedule_at).format('LLL')} </span>,
                export: (item, record) => moment(record.schedule_at).format('LLL'),
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
                title: 'Amount (INR)',
                dataIndex: 'amount',
                key: 'amount',
                render: (value, record) =>
                    record.is_cancelled ? <Text delete>{value}</Text> : value,
            },
            {
                title: 'Amount Type',
                dataIndex: 'amount_type',
                key: 'amount_type',
            },
            {
                title: 'Cr/Dr',
                dataIndex: 'ledger_type',
                key: 'ledger_type',
                render: (value, record) =>
                    record.is_cancelled ? <Text delete>{value}</Text> : value,
            },
            {
                title: 'Margin',
                key: 'mlm',
                dataIndex: 'mlm',
            },
            {
                title: 'Ledger Comment',
                dataIndex: 'comments',
                key: 'comments',
            },
        ];
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
        const renderActiveShape = props => {
            const RADIAN = Math.PI / 180;
            const {
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                startAngle,
                endAngle,
                fill,
                payload,
                percent,
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
                    <Sector
                      cx={cx}
                      cy={cy}
                      startAngle={startAngle}
                      endAngle={endAngle}
                      innerRadius={outerRadius + 6}
                      outerRadius={outerRadius + 10}
                      fill={fill}
                    />
                    <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                    <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                    <text
                      x={ex + (cos >= 0 ? 1 : -1) * 12}
                      y={ey}
                      textAnchor={textAnchor}
                      fill="#333"
                    >
                        {`${payload.ledger_type},${payload.total}`}
                    </text>
                    <text
                      x={ex + (cos >= 0 ? 1 : -1) * 12}
                      y={ey}
                      dy={18}
                      textAnchor={textAnchor}
                      fill="#999"
                    >
                        {`(Rate ${(percent * 100).toFixed(2)}%)`}
                    </text>
                </g>
            );
        };

        return (
            <div>
                <h2>
                    ALl MLM
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
                    <Col span={12} offset={6}>
                        <Spin size="large" spinning={this.state.loading}>
                            {this.state.reportSummary.length > 0 ? (
                                <PieChart width={800} height={400}>
                                    <Pie
                                      activeIndex={this.state.activeIndex}
                                      activeShape={renderActiveShape}
                                      data={this.state.reportSummary}
                                      cx={300}
                                      dataKey="total"
                                      cy={200}
                                      innerRadius={60}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      onMouseEnter={this.onPieEnter}
                                    >
                                        {this.state.reportSummary.map((entry, index) => (
                                            <Cell fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    {/* <Tooltip/> */}
                                </PieChart>
                            ) : (
                                <Empty
                                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                                  description="No Data to Show"
                                />
                            )}
                        </Spin>
                    </Col>
                </Row>

                {/* <Row> */}
                {/*    <Col span={12} offset={6} style={{textAlign:"center"}}> */}
                {/*        <Statistic title="Total Expense (INR)" value={totalAmount?totalAmount.toFixed(2):'0.00'} /> */}
                {/*        <br/> */}
                {/*    </Col> */}
                {/* </Row> */}

                <CustomizedTable
                  loading={this.state.loading}
                  columns={columns}
                  dataSource={reportData}
                />
            </div>
        );
    }
}
