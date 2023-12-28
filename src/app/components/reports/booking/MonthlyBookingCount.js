import React from "react";
import {Divider, Empty, Modal, Select, Spin, Statistic} from "antd";
import moment from "moment";
import {ComposedChart,Bar, Tooltip, XAxis, YAxis} from "recharts";
import {BED_BOOKING_REPORTS} from "../../../constants/api";
import {getAPI, interpolate} from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import {sendReportMail} from "../../../utils/clinicUtils";

const { confirm } = Modal;

export default class MonthlyBookingCount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            bedBookingReports: [],
            packages: [],
            mailingUsersList: this.props.mailingUsersList
        };
        this.loadBedBookingReport = this.loadBedBookingReport.bind(this);
    }

    componentDidMount() {
        this.loadBedBookingReport();
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate ||this.props.bed_packages!=newProps.bed_packages ||this.props.payment_status!=newProps.payment_status
            ||this.props.type!=newProps.type)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            }, function () {
                that.loadBedBookingReport();
            })
    }

    loadBedBookingReport = () => {
        const that = this;
        this.setState({
            loading: true
        })
        const successFn = function (data) {
            that.setState({
                bedBookingReports:data,
                loading:false,
            })
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        const apiParams = {
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            practice: this.props.active_practiceId,
            report_type:this.props.report_type,
        }
        if (this.props.payment_status) {
            apiParams.payment_status = this.props.payment_status
        }
        if (this.props.type) {
            apiParams.type = this.props.type
        }
        if (this.props.bed_packages) {
            apiParams.bed_packages = this.props.bed_packages.join(',');
        }
        getAPI(BED_BOOKING_REPORTS, successFn, errorFn, apiParams);
    }

    sendMail = (mailTo) => {
        const that = this;
        const apiParams = {
            practice: this.props.active_practiceId,
            report_type:this.props.report_type,
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
        sendReportMail(BED_BOOKING_REPORTS,  apiParams)
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
            title: 'Month',
            key: 'date',
            dataIndex:'date',
            render: (text, record) => (
                <span>
                {moment(record.date).format('MMM YYYY')}
                </span>
            ),
            export:(item,record)=> (moment(record.date).format('MMM YYYY')),
        },{
            title:'Total Booking',
            key:'count',
            dataIndex:'count'
        },{
            title:'Amount (INR)',
            key:'amount',
            dataIndex:'total'
        }];

        const renderCustomBarLabel = ({ payload, x, y, width, height, value }) => {
            return <text x={x + width / 2} y={y} fill="#666" textAnchor="middle" dy={-6}>{value}</text>;
        };
        const totalAmount = this.state.bedBookingReports.reduce(function(prev, cur) {
            return prev + cur.total;
        }, 0);
        return (
<div>
            <h2>Monthly Booking Count
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
                {this.state.bedBookingReports.length>0? (
                    <ComposedChart
                      width={1000}
                      height={400}
                      data={[...this.state.bedBookingReports].reverse()}
                      margin={{top: 20, right: 20, bottom: 20, left: 20}}
                    >


                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => {
                            return moment(value).format('MMM YY')
                        }}
                        />
                        <YAxis />
                        <Tooltip />
                        {/* <Legend /> */}
                        <Bar dataKey='count' barSize={35} fill='#0059b3' stroke="#0059b3" label={renderCustomBarLabel} />
                    </ComposedChart>
                  ):<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data to Show" />}
            </Spin>

            <Divider><Statistic title="Total Amounts" value={totalAmount || '0.00'} /></Divider>
            <CustomizedTable loading={this.state.loading} columns={columns} dataSource={this.state.bedBookingReports} />
</div>
)
    }
}

