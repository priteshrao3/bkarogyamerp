import React from 'react';
import { Col, Empty, Row, Select, Spin } from 'antd';
import { Cell, Pie, PieChart, Sector } from 'recharts';
import { MLM_REPORTS } from '../../../constants/api';
import { getAPI } from '../../../utils/common';
import CustomizedTable from '../../common/CustomizedTable';
import {  sendReportMail } from '../../../utils/clinicUtils';

export default class MarginTypewiseReport extends React.Component {
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
            type: this.props.type,
        };
        if (this.props.agents) {
            apiParams.agents = this.props.agents.toString();
        }
        getAPI(MLM_REPORTS, successFn, errorFn, apiParams);
    }

    sendMail = mailTo => {
        const that = this;
        const apiParams = {
            practice: that.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            type: this.props.type,
        };
        if (this.props.agents) {
            apiParams.agents = this.props.agents.toString();
        }
        apiParams.mail_to = mailTo;
        sendReportMail(MLM_REPORTS, apiParams);
    };

    render() {
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
                title: 'Name',
                key: 'name',
                dataIndex: 'margin',
            },
            {
                title: 'Total Amount',
                key: 'amount',
                dataIndex: 'total',
            },
        ];
        const totalAmount = reportData.reduce(function(prev, cur) {
            return prev + cur.total;
        }, 0);

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

                    <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                    <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                    <text
                      x={ex + (cos >= 0 ? 1 : -1) * 12}
                      y={ey}
                      textAnchor={textAnchor}
                      fill="#333"
                    >
                        {`${payload.margin},${payload.total}`}
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
                    Margin Type wise
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
                            {reportData.length > 0 && totalAmount ? (
                                <PieChart width={800} height={400}>
                                    <Pie
                                      label={renderActiveShape}
                                      data={reportData}
                                      cx={300}
                                      dataKey="total"
                                      cy={200}
                                      innerRadius={60}
                                      outerRadius={80}
                                      fill="#8884d8"
                                    >
                                        {reportData.map((entry, index) => (
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
                {/*        <Statistic title="Non Refundable Amount(INR)" value={totalAmount?totalAmount.toFixed(2):'0.00'} /> */}
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
