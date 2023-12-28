import React from "react";
import {Statistic, Divider, Empty, Spin, Select} from "antd"
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip} from 'recharts';
import moment from "moment";
import {EMR_REPORTS, } from "../../../constants/api";
import {getAPI, interpolate} from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import { sendReportMail} from "../../../utils/clinicUtils";


export default class DailyTreatmentsCount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            report: [],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            mailingUsersList: this.props.mailingUsersList

        }
        this.loadDailyTreatments = this.loadDailyTreatments.bind(this);
    }

    componentDidMount() {
        this.loadDailyTreatments();
    
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate ||this.props.doctors!=newProps.doctors ||this.props.is_complete!=newProps.is_complete )
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            }, function () {
                that.loadDailyTreatments();
            })
    }

    loadDailyTreatments() {
        const that = this;
        that.setState({
            loading: true
        });
        const successFn = function (data) {
            that.setState({
                report: data.data,
                total:data.total,
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
    }


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
        const that=this;
        let i = 1;
        const columns = [{
            title: 'S. No',
            key: 'sno',
            dataIndex:'abcd',
            render: (item, record) => <span> {i++}</span>,
            export:(item,record,index)=>index+1,
            width: 50
        },{
            title: 'Day',
            key: 'date',
            dataIndex:'date',
            render:((item, record) => <span>{moment(record.date).format('ll')}</span>),
            export:(item,record)=>(moment(record.date).format('ll')),
        },{
            title:'Total Treatments',
            key:'count',
            dataIndex:'count',
        }];
        const CustomizedAxisTick = (x,y,value)=>({
            render () {
                // const {x, y, stroke, payload} = this.props;

                return (
                    <g transform={`translate(${x},${y})`}>
                        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">{value}</text>
                    </g>
                );
            }
        });

        return (
<div>
            <h2>Daily Treatments Count
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
                <LineChart
                  width={1000}
                  height={300}
                  data={[...this.state.report].reverse()}
                  margin={{top: 5, right: 30, left: 20, bottom: 55}}
                >

                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        return moment(value).format('DD MMM')
                    }}
                      label={{value:"Data Range", offset:0, margin:{top:10}, position:"insideBottom"}}
                    />
                    {/* </XAxis> */}

                    <YAxis label={{ value: 'Total Treatments', angle: -90, position: 'insideLeft' }} />

                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={4} />
                </LineChart>
              ):<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data to Show" />}
            </Spin>

            <Divider><Statistic title="Total Patients" value={this.state.total} /></Divider>
            <CustomizedTable
              loading={this.state.loading}
              columns={columns}
              dataSource={this.state.report}
            />
</div>
)
    }
}
