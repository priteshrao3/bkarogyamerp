import React from "react";
import {Empty, Select, Spin} from "antd"
import {XAxis, YAxis,Bar,Tooltip, ComposedChart} from 'recharts';
import moment from "moment";
import {INCOME_REPORTS} from "../../../constants/api";
import {getAPI} from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import { sendReportMail} from "../../../utils/clinicUtils";

export default class MonthlyInvoicedIncome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            report: [],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            mailingUsersList: this.props.mailingUsersList

        }
        this.loadDailyIncome = this.loadDailyIncome.bind(this);
    }

    componentDidMount() {
        this.loadDailyIncome();
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
                that.loadDailyIncome();
            })
    }

    loadDailyIncome() {
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
        const that=this;
        let i = 1;
        const columns = [{
            title: 'S. No',
            key: 'sno',
            render: (item, record) => <span> {i++}</span>,
            export: (item, record, index) => index + 1,
            width: 50
        },{
            title: 'Day',
            key: 'date',
            dataIndex:'date',
            render:((item, record) => <span>{moment(record.date).format('MM YYYY')}</span>),
            export:(item,record)=>(moment(record.date).format('MM YYYY')),
        },{
            title:'Cost(INR)',
            key:'cost',
            dataIndex:'cost',
            render:(value,record)=><span>{record.cost.toFixed(2)}</span>
        },{
            title:"Discount(INR)",
            key:'discount',
            dataIndex:'discount',
            render:(value,record)=><span>{record.discount.toFixed(2)}</span>
        },{
            title:'Income after Discount(INR)',
            key:'income_after_discount',
            render:(text ,record)=>(
                <span>{(record.cost - record.discount ).toFixed(2)}</span>
            )
        },{
            title:'Tax(INR)',
            key:'tax',
            dataIndex:'tax',
            render:(value,record)=><span>{record.tax.toFixed(2)}</span>
        },{
            title:'Income Amount(INR)',
            key:'income_amount',
            // dataIndex:'amount',
            render:(text ,record)=>(
                <span>{(record.cost - (record.discount + record.tax)).toFixed(2)}</span>
            )
        }];



        const renderCustomBarLabel = ({ payload, x, y, width, height, value }) => {
            return <text x={x + width / 2} y={y} fill="#666" textAnchor="middle" dy={-6}>{value.toFixed(2)}</text>;
        };
        return (
<div>
            <h2>Monthly Invoiced Income
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
            <Spin size="large" spinning={this.state.loading}>
                {this.state.report.length>0? (
                    <ComposedChart
                      width={1000}
                      height={400}
                      data={this.state.report}
                      margin={{top: 20, right: 20, bottom: 20, left: 20}}
                    >


                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => {
                            return moment(value).format('MM YYYY')
                        }}
                        />
                        <YAxis label={{ value: 'Income(INR)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        {/* <Legend /> */}
                        <Bar dataKey='cost' barSize={35} fill='#0059b3' stroke="#0059b3" label={renderCustomBarLabel} />
                    </ComposedChart>
                  ):<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data to Show" />}
            </Spin>

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
