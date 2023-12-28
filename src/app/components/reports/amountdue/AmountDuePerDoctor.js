import React from "react";
import {Col, Empty,  Row, Select, Spin, Table} from "antd";
import {Pie, PieChart, Sector,Cell} from "recharts";
import {AMOUNT_DUE_REPORTS} from "../../../constants/api";
import {getAPI} from "../../../utils/common";
import {sendReportMail} from "../../../utils/clinicUtils";

export default class AmountDuePerDoctor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reportEachDoctor: [],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: true,
            activeIndex:0,
            mailingUsersList: this.props.mailingUsersList
        };
        this.loadReport = this.loadReport.bind(this);

    }

    componentDidMount() {
        this.loadReport();
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            },function(){
                that.loadReport();
            })

    }

    loadReport(){
        const that =this;
        that.setState({
            loading:true,
        });

        const successFn = function (data) {
            that.setState({
                reportEachDoctor:data,
                loading:false,
            })
        };
        const errorFn = function () {
            that.setState({
                loading:false
            })
        };
        const apiParams={
            practice:this.props.active_practiceId,
            type: that.props.type,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
        };

        getAPI(AMOUNT_DUE_REPORTS, successFn ,errorFn,apiParams);
    };

    onPieEnter=(data, index)=>{
        this.setState({
            activeIndex: index,
        });
    };

    sendMail = (mailTo) => {
        const apiParams={
            practice:this.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            type:this.props.type,
        }
        apiParams.mail_to = mailTo;
        sendReportMail(AMOUNT_DUE_REPORTS, apiParams)
    };

    render() {
        const {reportEachDoctor,loading} = this.state;
        const columns = [{
            title: 'S. No',
            key: 's_no',
            dataIndex:'s_no',
            width: 50,
            render:(item,record,index)=><span>{index+1}</span>
        },{
            title: 'Doctor',
            key:'doctor',
            dataIndex:'doctor_name',
        },{
            title:'Invoiced (INR)',
            key:'invoiced',
            dataIndex:'invoiced',
            render:(item)=>(item.toFixed(2))
        },{
            title:'Received (INR)',
            key:'received_amount',
            dataIndex:'received_amount',
            render:(item ,record)=><span>{(record.invoiced - record.amount_due).toFixed(2) }</span>
        },{
            title:'Total Amount Due (INR)',
            key:'amount_due',
            dataIndex:'amount_due',
            render:(item)=>(item.toFixed(2))

        }];
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
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
                    <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${payload.doctor_name}, `+ `INR ${  payload.invoiced.toFixed(2)}`}</text>
                    <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                        {`(Rate ${(percent * 100).toFixed(2)}%)`}
                    </text>
                </g>
            );
        };
        return (
<div>
            <h2>Amount Due Per Doctor
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
                    <Spin size="large" spinning={loading}>
                        {reportEachDoctor.length>0? (
                            <PieChart width={800} height={400}>
                                <Pie
                                  activeIndex={this.state.activeIndex}
                                  activeShape={renderActiveShape}
                                  data={reportEachDoctor}
                                  cx={300}
                                  dataKey="amount_due"
                                  cy={200}
                                  innerRadius={60}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  onMouseEnter={this.onPieEnter}
                                >
                                    {
                                        reportEachDoctor.map((entry, index) => <Cell fill={COLORS[index % COLORS.length]} />)
                                    }
                                </Pie>
                                {/* <Tooltip/> */}
                            </PieChart>
                          ):<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data to Show" />}
                    </Spin>
                </Col>
            </Row>
            <Table loading={loading} columns={columns} pagination={false} dataSource={reportEachDoctor} />


</div>
)
    }
}
