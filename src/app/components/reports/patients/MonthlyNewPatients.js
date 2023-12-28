import React from "react";
import {Divider, Statistic, Spin, Empty, Select} from "antd";
import moment, {relativeTimeThreshold} from "moment"
import {ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend}  from 'recharts';
import {PATIENTS_REPORTS} from "../../../constants/api";
import {getAPI, displayMessage, interpolate} from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import { sendReportMail} from "../../../utils/clinicUtils";

export default class MonthlyNewPatients extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            report: [],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            mailingUsersList: this.props.mailingUsersList
        }
        this.loadMonthlyPatients = this.loadMonthlyPatients.bind(this);
    }

    componentDidMount() {
        this.loadMonthlyPatients();
      
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate ||this.props.patient_groups !=newProps.patient_groups
            ||this.props.blood_group !=newProps.blood_group || this.props.offer !=newProps.offer)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            }, function () {
                that.loadMonthlyPatients();
            })
    }

    loadMonthlyPatients() {
        const that = this;
        that.setState({
            loading: true
        })
        const successFn = function (data) {
            that.setState({
                report:data.data,
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
            from_date: this.props.startDate.format('YYYY-MM-DD'),
            to_date: this.props.endDate.format('YYYY-MM-DD'),
            type:this.props.type,
        };
        if (this.props.patient_groups){
            apiParams.groups=this.props.patient_groups.toString();
        };
        getAPI(PATIENTS_REPORTS,  successFn, errorFn,apiParams);
    }

    sendMail = (mailTo) => {
        const apiParams={
            from_date: this.props.startDate.format('YYYY-MM-DD'),
            to_date: this.props.endDate.format('YYYY-MM-DD'),
            type:this.props.type,
        }
        if (this.props.patient_groups){
            apiParams.groups=this.props.patient_groups.toString();
        }
        apiParams.mail_to = mailTo;
        sendReportMail(PATIENTS_REPORTS, apiParams)
    }

    render() {
        const {report} =this.state;
        const reportData = [];
        for (let i = 1; i <= report.length; i++) {
            reportData.push({s_no: i,...report[i-1]});
        };


        const columns = [{
            title: 'S. No',
            key: 's_no',
            dataIndex:'s_no',
            width: 50
        },{
            title: "Month",
            key:'month',
            render:((item, record) => <span>{moment(record.month).format('MMM')} &nbsp;{moment(record.year).format('YYYY')}</span>),
            export:(item,record)=> (moment(record.month).format('MMM YYYY')),
        },{
            title:'Patients',
            key:'count',
            dataIndex:'count'
        }];
        const CustomizedAxisTick = (x, y, value)=>({
            render () {
                // const {x, y, stroke, payload} = this.props;

                return (
                    <g transform={`translate(${x},${y})`}>
                        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">{moment(value).format('MMM')}</text>
                    </g>
                );
            }
        });
        const renderCustomBarLabel = ({ payload, x, y, width, height, value }) => {
            return <text x={x + width / 2} y={y} fill="#666" textAnchor="middle" dy={-6}>{value}</text>;
        };
        return (
<div>
            <h2>Monthly New Patients Report
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
                {reportData.length>0? (
                <ComposedChart
                  width={1000}
                  height={400}
                  data={[...reportData].reverse()}
                  margin={{top: 20, right: 20, bottom: 20, left: 20}}
                >


                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        return moment(value).format('MMM YYYY')
                    }}
                    />
                    <YAxis />
                    <Tooltip />
                    {/* <Legend /> */}
                    <Bar dataKey='count' barSize={35} fill='#413ea0' label={renderCustomBarLabel} />
                </ComposedChart>
              ):<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data to Show" />}
            </Spin>

            <Divider><Statistic title="Total Patients" value={this.state.total} /></Divider>
            <CustomizedTable
              hideReport
              loading={this.state.loading}
              columns={columns}
              dataSource={reportData}
            />


</div>
)
    }
}
