import React from "react";
import {Col, Empty, Row, Select, Spin} from "antd";
import {Cell, Pie, PieChart, Sector} from "recharts";
import {EMR_REPORTS} from "../../../constants/api";
import {getAPI, interpolate} from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import { sendReportMail} from "../../../utils/clinicUtils";

export default class TreatmentForEachCategory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            treatmentCategory:[],
            activeIndex:0,
            mailingUsersList: this.props.mailingUsersList
        }
        this.loadTreatmentWithCategory = this.loadTreatmentWithCategory.bind(this);
    }

    componentDidMount() {
        this.loadTreatmentWithCategory();
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate ||this.props.doctors!=newProps.doctors ||this.props.is_complete!=newProps.is_complete)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            },function(){
                that.loadTreatmentWithCategory();
            })

    }

    loadTreatmentWithCategory = () => {
        const that = this;
        this.setState({
            loading:true
        });
        const successFn = function (data) {
            that.setState({
                treatmentCategory: data,
                loading: false
            });

        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        const apiParams={
            type:that.props.type,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            is_complete:!!this.props.is_complete,
        };
        if(this.props.doctors){
            apiParams.doctors=this.props.doctors.toString();
        }
        getAPI(interpolate(EMR_REPORTS, [that.props.active_practiceId]), successFn, errorFn, apiParams);
    };

    onPieEnter=(data, index)=>{
        this.setState({
            activeIndex: index,
        });
    };

    sendMail = (mailTo) => {
        const that = this;
        const apiParams = {
            type: that.props.type,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
        };

        if (this.props.payment_status) {
            apiParams.payment_status = this.props.payment_status
        }
        if (this.props.type) {
            apiParams.type = this.props.type
        }
        if (this.props.bed_packages) {
            apiParams.bed_packages = this.props.bed_packages.join(',');
        }
        apiParams.mail_to = mailTo;
        sendReportMail(interpolate(EMR_REPORTS, [that.props.active_practiceId]), apiParams)
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
            title: 'Treatment Category',
            key:'procedure_name',
            dataIndex:'procedure_name',
        },{
            title:'Total Treatments',
            key:'count',
            dataIndex:'count',

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
                    <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${payload.procedure_name},${ payload.count}`}</text>
                    <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                        {`(Rate ${(percent * 100).toFixed(2)}%)`}
                    </text>
                </g>
            );
        };



        return (
<div>
            <h2>Treatments By Category
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
                        {this.state.treatmentCategory.length>0? (
                        <PieChart width={800} height={400}>
                            <Pie
                              activeIndex={this.state.activeIndex}
                              activeShape={renderActiveShape}
                              data={[...this.state.treatmentCategory].reverse()}
                              cx={300}
                              dataKey="count"
                              cy={200}
                              innerRadius={60}
                              outerRadius={80}
                              fill="#8884d8"
                              onMouseEnter={this.onPieEnter}
                            >
                                {
                                    this.state.treatmentCategory.map((entry, index) => <Cell fill={COLORS[index % COLORS.length]} />)
                                }
                            </Pie>
                            {/* <Tooltip/> */}
                        </PieChart>
                      ):<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data to Show" />}
                    </Spin>
                </Col>
            </Row>
            <CustomizedTable loading={this.state.loading} columns={columns} dataSource={this.state.treatmentCategory} />

</div>
)
    }
}
