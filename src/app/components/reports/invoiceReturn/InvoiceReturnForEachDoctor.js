import React from "react";
import {Col, Divider, Empty, Row, Select, Spin, Statistic} from "antd";
import {Cell, Pie, PieChart, Sector} from "recharts";
import * as _ from "lodash";
import {getAPI} from "../../../utils/common";
import {RETURN_INVOICE_REPORTS} from "../../../constants/api";
import CustomizedTable from "../../common/CustomizedTable";
import {loadDoctors,  sendReportMail} from "../../../utils/clinicUtils";

export default class InvoiceReturnForEachDoctor extends React.Component{
    constructor(props){
        super(props);
        this.state={
            report: [],
            practiceDoctors:[],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            activeIndex:0,
            mailingUsersList: this.props.mailingUsersList
        }
        this.loadEachDoctorInvoiceReturn = this.loadEachDoctorInvoiceReturn.bind(this);
        loadDoctors(this);
    }

    componentDidMount() {
        this.loadEachDoctorInvoiceReturn();
      

    }

    componentWillReceiveProps (newProps) {
        const that = this;
        const {startDate, endDate, patient_groups, doctors, income_type, taxes, discount, products, treatments, exclude_cancelled} =this.props;
        if (startDate != newProps.startDate ||
            endDate != newProps.endDate ||
            patient_groups != newProps.patient_groups ||
            doctors != newProps.doctors ||
            income_type != newProps.income_type ||
            taxes != newProps.taxes ||
            discount != newProps.discount ||
            products != newProps.products ||
            treatments != newProps.treatments ||
            exclude_cancelled != newProps.exclude_cancelled

        )
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            },function(){
                that.loadEachDoctorInvoiceReturn();
            })

    }


    startLoading = () =>{
        this.setState({
            loading:true
        })
    };

    stopLoading = () =>{
        this.setState({
            loading:false
        })
    };



    loadEachDoctorInvoiceReturn = () =>{
        const that = this;
        this.startLoading();
        const {startDate, endDate} = this.state;
        const {active_practiceId, type, exclude_cancelled, patient_groups, doctors, income_type, taxes, discount, products, treatments} = this.props;

        const apiParams = {
            practice:active_practiceId,
            type,
            start: startDate.format('YYYY-MM-DD'),
            end: endDate.format('YYYY-MM-DD'),
            // start:"2019-01-01",
            is_cancelled: !!exclude_cancelled,
        };

        if (patient_groups){
            apiParams.groups = patient_groups.toString()
        }

        if (doctors){
            apiParams.doctors = doctors.toString();
        }

        if (income_type) {
            apiParams.income_type = income_type;
        }

        if (treatments){
            apiParams.treatments = treatments.toString()
        }

        if (discount){
            apiParams.discount = discount
        }
        if (taxes){
            apiParams.taxes = taxes.toString()
        }

        if (products){
            apiParams.products = products.toString()
        }

        const successFn =function (data) {
            that.setState({
                report:data,
            })
            that.stopLoading();
        };
        const errorFn = function (data) {
            that.stopLoading();
        };

        getAPI(RETURN_INVOICE_REPORTS ,successFn, errorFn, apiParams)
    };


    onPieEnter=(data, index)=>{
        this.setState({
            activeIndex: index,
        });
    };


    sendMail = (mailTo) => {
        const {startDate, endDate} = this.state;
        const {active_practiceId, type, exclude_cancelled, patient_groups, doctors, income_type, taxes, discount, products, treatments} = this.props;
        const apiParams = {
            practice:active_practiceId,
            type,
            start: startDate.format('YYYY-MM-DD'),
            end: endDate.format('YYYY-MM-DD'),
            is_cancelled: !!exclude_cancelled,
        };

        if (patient_groups){
            apiParams.groups = patient_groups.toString()
        }

        if (doctors){
            apiParams.doctors = doctors.toString();
        }

        if (income_type) {
            apiParams.income_type = income_type;
        }

        if (treatments){
            apiParams.treatments = treatments.toString()
        }

        if (discount){
            apiParams.discount = discount
        }
        if (taxes){
            apiParams.taxes = taxes.toString()
        }

        if (products){
            apiParams.products = products.toString()
        }

        apiParams.mail_to = mailTo;
        sendReportMail(RETURN_INVOICE_REPORTS, apiParams)
    }


    render() {
        const {report, loading, activeIndex, practiceDoctors} =this.state;

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
                    <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{
                        payload.doctor=='NA'?"No Doctor assigned":(
<>
                            {practiceDoctors.map((item)=>(item.id == payload.doctor?(
<>
                                    {item.user.first_name}
</>
)
                                :null)
                            )}
</>
)
}
                    </text>

                    <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                        {`(Rate ${(percent * 100).toFixed(2)}%)`}
                    </text>
                </g>
            );
        };


        const totalAmount = report.reduce(function(prev, cur) {
            return prev + cur.cost;
        }, 0);


        const columns = [
            {
                title:'Doctor',
                key:'doctor',
                dataIndex:'doctor',
                render:(value,record)=>(
<span>{record.doctor=='NA'?<span>No Doctor assigned</span>:(
<>
                        {practiceDoctors.map((item)=>(item.id == record.doctor?
                            <span>{item.user.first_name}</span>
                            :null)
                        )}
</>
)}
</span>
)
            },{
                title: 'Discount',
                key: 'discount_value',
                dataIndex: 'discount_value',
                render:(item,record)=><span>{_.get(record,'discount_value',0).toFixed(2)}</span>
            },{
                title:'Tax',
                key:'tax_value',
                dataIndex:'tax_value',
                render:(item, record)=><span>{_.get(record,'tax_value',0).toFixed(2)}</span>
            },{
                title:'Cost',
                key:'cost',
                dataIndex:'cost',
                render:(item, record)=><span>{_.get(record,'cost',0).toFixed(2)}</span>
            }
        ];

        return(
            <div>
                <h2>Return Invoice For Each Doctors
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
                            {report.length>0? (
                                <PieChart width={800} height={400}>
                                    <Pie
                                      activeIndex={activeIndex}
                                      activeShape={renderActiveShape}
                                      data={report}
                                      cx={300}
                                      dataKey="cost"
                                      cy={200}
                                      innerRadius={60}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      onMouseEnter={this.onPieEnter}
                                    >
                                        {
                                            report.map((entry, index) => <Cell fill={COLORS[index % COLORS.length]} />)
                                        }
                                    </Pie>
                                    {/* <Tooltip/> */}
                                </PieChart>
                              )
                                :<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data to Show" />}

                        </Spin>
                    </Col>
                </Row>

                <Divider><Statistic title="Total" value={totalAmount.toFixed(2)} /></Divider>
                <CustomizedTable loading={this.state.loading} columns={columns} dataSource={report} />
            </div>


        )
    }

}
