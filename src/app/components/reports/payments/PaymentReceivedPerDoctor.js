import React from "react";
import {Col, Divider, Row, Select, Statistic, Table, Spin, Empty} from "antd";
import moment from "moment";
import {Sector, PieChart, Pie, Cell} from 'recharts';
import {PAYMENT_REPORTS} from "../../../constants/api";
import {getAPI, interpolate} from "../../../utils/common";
import { sendReportMail} from "../../../utils/clinicUtils";


export default class PaymentReceivedPerDoctor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            report: [],
            mailingUsersList: this.props.mailingUsersList,
            activeIndex:0,
        };
        this.loadPaymentsReport = this.loadPaymentsReport.bind(this);
    }

    componentDidMount() {
        this.loadPaymentsReport();
       
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate || this.props.patient_groups != newProps.patient_groups ||this.props.taxes!=newProps.taxes
            || this.props.doctors != newProps.doctors ||this.props.payment_mode !=newProps.payment_mode||this.props.discount != newProps.discount||this.props.treatments!=newProps.treatments||
            this.props.consume!=newProps.consume || this.props.exclude_cancelled != newProps.exclude_cancelled)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            }, function () {
                that.loadPaymentsReport();
            })

    }

    loadPaymentsReport = () => {
        const that = this;
        that.setState({
            loading:true,
        });
        const successFn = function (data) {
            that.setState({
                report: data,
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
        };
        if(this.props.exclude_cancelled){
            apiParams.is_cancelled= false;
        }
        if (this.props.taxes){
            apiParams.taxes=this.props.taxes.toString();
        }
        if (this.props.patient_groups) {
            apiParams.patient_groups = this.props.patient_groups.toString();
        }
        if (this.props.payment_mode) {
            apiParams.payment_mode = this.props.payment_mode.toString();
        }
        if (this.props.doctors) {
            apiParams.doctors = this.props.doctors.toString();
        }
        if (this.props.consume) {
            apiParams.consume = this.props.consume.toString();
        }
        if (this.props.discount) {
            apiParams.discount = this.props.discount;
        }
        if (this.props.treatments) {
            apiParams.treatments = this.props.treatments.toString();
        }
        getAPI(interpolate(PAYMENT_REPORTS, [that.props.active_practiceId]), successFn, errorFn, apiParams);
    };

    sendMail = (mailTo) => {
        const that = this
        const {startDate, endDate} = this.state;
        const {active_practiceId, type} = this.props;
        const apiParams = {
            type: that.props.type,
            practice: that.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
        };
        if(this.props.exclude_cancelled){
            apiParams.is_cancelled= false;
        }
        if (this.props.taxes){
            apiParams.taxes=this.props.taxes.toString();
        }
        if (this.props.patient_groups) {
            apiParams.patient_groups = this.props.patient_groups.toString();
        }
        if (this.props.payment_mode) {
            apiParams.payment_mode = this.props.payment_mode.toString();
        }
        if (this.props.doctors) {
            apiParams.doctors = this.props.doctors.toString();
        }
        if (this.props.consume) {
            apiParams.consume = this.props.consume.toString();
        }
        if (this.props.discount) {
            apiParams.discount = this.props.discount;
        }
        if (this.props.treatments) {
            apiParams.treatments = this.props.treatments.toString();
        }


        apiParams.mail_to = mailTo;
        sendReportMail(interpolate(PAYMENT_REPORTS, [that.props.active_practiceId]), apiParams);
    };

    onPieEnter=(data, index)=>{
        this.setState({
            activeIndex: index,
        });
    };


    render() {
        const that = this;
        let i = 1;
        const columns = [{
            title: 'S. No',
            key: 'sno',
            dataIndex:'sno',
            render: (item, record) => <span> {i++}</span>,
            export:(item,record,index)=>index+1,
            width: 50
        },{
            title:"Doctor Name",
            key:"doctor_name",
            dataIndex:"doctor_name",
        },{
            title:"Amount",
            key:"amount",
            dataIndex:"amount",
            render:(item, record) =><span>{record.amount?record.amount.toFixed(2):'--'}</span>,
            export:(text,record)=> (record.amount?record.amount.toFixed(2):'--')
        }];


        const totalAmount = this.state.report.reduce(function(prev, cur) {
            return prev + cur.amount;
        }, 0);



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
                    <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${payload.doctor_name},${ payload.amount.toFixed(2)}`}</text>
                    <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                    {`(Rate ${(percent * 100).toFixed(2)}%)`}
                    </text>
                </g>
            );
        };

        return (
<div>
            <h2>Payment Received Per Doctor
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
                        {this.state.report.length>0? (
                            <PieChart width={800} height={400}>
                                <Pie
                                  activeIndex={this.state.activeIndex}
                                  activeShape={renderActiveShape}
                                  data={this.state.report}
                                  cx={300}
                                  dataKey="amount"
                                  cy={200}
                                  innerRadius={60}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  onMouseEnter={this.onPieEnter}
                                >
                                    {
                                        this.state.report.map((entry, index) => <Cell fill={COLORS[index % COLORS.length]} />)
                                    }
                                </Pie>
                                {/* <Tooltip/> */}
                            </PieChart>
                          ):<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data to Show" />}
                    </Spin>
                </Col>
            </Row>
            <Divider><Statistic title="Total" value={totalAmount.toFixed(2)} /></Divider>

            <Table
              loading={this.state.loading}
              columns={columns}
              pagination={false}
              dataSource={this.state.report}
            />

</div>
)
    }
}
