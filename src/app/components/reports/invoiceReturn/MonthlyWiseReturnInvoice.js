import React from "react";
import {Bar, ComposedChart, Tooltip, XAxis, YAxis} from "recharts";
import moment from "moment";
import {Empty, Select, Spin} from "antd";
import * as _ from 'lodash';
import CustomizedTable from "../../common/CustomizedTable";
import {getAPI} from "../../../utils/common";
import {RETURN_INVOICE_REPORTS} from "../../../constants/api";
import { sendReportMail} from "../../../utils/clinicUtils";

export default class MonthlyWiseReturnInvoice extends React.Component{
    constructor(props){
        super(props);
        this.state={
            report: [],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            mailingUsersList: this.props.mailingUsersList
        }

        this.loadMonthlyInvoiceReturn = this.loadMonthlyInvoiceReturn.bind(this);
    }


    componentDidMount() {
        this.loadMonthlyInvoiceReturn();
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
                that.loadMonthlyInvoiceReturn();
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



    loadMonthlyInvoiceReturn = () =>{
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

        const {report, loading} =this.state;


        const reportData = [];
        for (let i = 1; i <= report.length; i++) {
            reportData.push({s_no: i, ...report[i - 1]});
        };

        const columns = [{
            title: 'S. No',
            key: 's_no',
            dataIndex: 's_no',
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
            title:'Tax(INR)',
            key:'tax',
            dataIndex:'tax',
            render:(value,record)=><span>{record.tax.toFixed(2)}</span>
        }];





        return (
            <div>
                <h2>Monthly wise Return Invoice
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

                <Spin size="large" spinning={loading}>
                    {reportData.length>0? (
                        <ComposedChart
                          width={1000}
                          height={400}
                          data={reportData}
                          margin={{top: 20, right: 20, bottom: 20, left: 20}}
                        >


                            <XAxis
                              dataKey="date"
                              tickFormatter={(value) => {
                                return moment(value).format('MM YYYY')
                            }}
                            />
                            <YAxis label={{ value: 'Return Invoice(INR)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            {/* <Legend /> */}
                            <Bar dataKey='cost' barSize={35} fill='#0059b3' stroke="#0059b3" />
                        </ComposedChart>
                      ):<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data to Show" />}
                </Spin>

                <CustomizedTable loading={loading} columns={columns} dataSource={reportData} />
            </div>
        );
    }
}
