import React from "react";
import {Col, Divider, Empty, Row, Select, Spin, Statistic} from "antd"
import {Sector, PieChart, Pie, Cell} from 'recharts';
import {INCOME_REPORTS} from "../../../constants/api";
import {getAPI} from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import { sendReportMail} from "../../../utils/clinicUtils";

export default class TaxedInvoicedIncome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            report: [],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            activeIndex:0,
            mailingUsersList: this.props.mailingUsersList

        }
        this.loadTaxedIncome = this.loadTaxedIncome.bind(this);
    }

    componentDidMount() {
        this.loadTaxedIncome();
       
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate ||this.props.products!=newProps.products || this.props.income_type!=newProps.income_type
            ||this.props.is_cancelled!=newProps.is_cancelled ||this.props.discount!=newProps.discount || this.props.treatments!=newProps.treatments
            ||this.props.doctors!=newProps.doctors ||this.props.taxes!=newProps.taxes ||this.props.patient_groups!=newProps.patient_groups)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            }, function () {
                that.loadTaxedIncome();
            })
    }

    loadTaxedIncome() {
        const that = this;
        that.setState({
            loading: true
        })
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
        const apiParams={
            practice:that.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            type:that.props.type,
            is_cancelled:!!this.props.is_cancelled,
        };
        if (that.props.income_type){
            apiParams.income_type= that.props.income_type;
        }
        if(that.props.discount){
            apiParams.discount=that.props.discount;
        }
        if(this.props.patient_groups){
            apiParams.groups=this.props.patient_groups.toString();
        }
        if(this.props.products){
            apiParams.products=this.props.products.toString();
        }
        if(this.props.doctors){
            apiParams.doctors=this.props.doctors.toString();
        }
        if(this.props.taxes){
            apiParams.taxes=this.props.taxes.toString();
        }
        if(this.props.treatments){
            apiParams.treatments=this.props.treatments.toString();
        }
        getAPI(INCOME_REPORTS , successFn, errorFn, apiParams);
    }


    sendMail = (mailTo) => {
        const that = this;
        const apiParams = {
            practice:that.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            type:that.props.type,
            is_cancelled:!!this.props.is_cancelled,
        };

        if (that.props.income_type){
            apiParams.income_type= that.props.income_type;
        }
        if(that.props.discount){
            apiParams.discount=that.props.discount;
        }
        if(this.props.patient_groups){
            apiParams.groups=this.props.patient_groups.toString();
        }
        if(this.props.products){
            apiParams.products=this.props.products.toString();
        }
        if(this.props.doctors){
            apiParams.doctors=this.props.doctors.toString();
        }
        if(this.props.taxes){
            apiParams.taxes=this.props.taxes.toString();
        }
        if(this.props.treatments){
            apiParams.treatments=this.props.treatments.toString();
        }
        apiParams.mail_to = mailTo;
        sendReportMail(INCOME_REPORTS, apiParams)
    };

    render() {
        let i=1;
        const columns = [{
            title: 'S. No',
            key: 'sno',
            dataIndex:'sno',
            render: (item, record) => <span> {i++}</span>,
            export:(item,record,index)=>index+1,
            width: 50
        },{
            title: 'Tax Name',
            key:'name',
            dataIndex:'name',
            render:(value,record)=><span>{record.name} @ {record.tax_value}%</span>
        },{
            title:'Tax (INR)',
            key:'tax',
            dataIndex:'total',
            render:(value,record)=><span>{record.total.toFixed(2)}</span>
        }];
        const COLORS = ['#FFBB28', '#FF8042','#1DA57A'];
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
                    <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${payload.name}@${payload.tax_value}% ,${ payload.total.toFixed(2)}`}</text>
                    <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                        {`(Rate ${(percent * 100).toFixed(2)}%)`}
                    </text>
                </g>
            );
        };

        const taxesTotal = this.state.report.reduce(function(prev, cur) {
            return prev + cur.total;
        }, 0);

        return (
<div>
            <h2>Taxed Invoiced Income
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
                        {this.state.report.length>0 && taxesTotal? (
                            <PieChart width={800} height={400}>
                                <Pie
                                  label={renderActiveShape}
                                  data={this.state.report}
                                  cx={300}
                                  dataKey="total"
                                  cy={200}
                                  innerRadius={60}
                                  outerRadius={80}
                                  fill="#8884d8"
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
            <Divider><Statistic title="Total" value={taxesTotal.toFixed(2)} /></Divider>

            <CustomizedTable
              loading={this.state.loading}
              columns={columns}
              dataSource={this.state.report}
              hideReport
            />

</div>
)
    }
}
