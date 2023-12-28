import React from "react";
import {Divider, Statistic, Empty, Spin, Select} from "antd";
import moment from "moment";
import {ComposedChart, Bar, XAxis, YAxis, Tooltip} from 'recharts';
import {EMR_REPORTS} from "../../../constants/api";
import {getAPI, interpolate} from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import {sendReportMail} from "../../../utils/clinicUtils";

export default class MonthlyTreatmentCount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            treatmentMonthly: [],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            mailingUsersList: this.props.mailingUsersList
        }
        this.loadTreatmentMonthly = this.loadTreatmentMonthly.bind(this);
    }

    componentDidMount() {
        this.loadTreatmentMonthly();
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate ||this.props.doctors!=newProps.doctors ||this.props.is_complete!=newProps.is_complete)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            },function(){
                that.loadTreatmentMonthly();
            })

    }

    loadTreatmentMonthly = () => {
        const that = this;
        that.setState({
            loading:true,
        });
        const successFn = function (data) {
            that.setState({
                treatmentMonthly: data.data,
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
            dataIndex:'date',
            render: (item, record) => <span> {i++}</span>,
            export:(item,record,index)=>index+1,
            width: 50
        },{
            title: 'Month',
            key: 'date',
            dataIndex:'date',
            render: (text, record) => (
                <span>
                {moment(record.date).format('MMMM YYYY')}
                </span>
            ),
            export:(item,record)=>{moment(record.date).format('ll')},
        },{
            title:'Total Treatments',
            key:'count',
            dataIndex:'count'
        }];

        const renderCustomBarLabel = ({ payload, x, y, width, height, value }) => {
            return <text x={x + width / 2} y={y} fill="#666" textAnchor="middle" dy={-6}>{value}</text>;
        };
        return (
<div>
            <h2>Monthly Treatments Count
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
                {this.state.treatmentMonthly.length>0? (
                <ComposedChart
                  width={1000}
                  height={400}
                  data={[...this.state.treatmentMonthly].reverse()}
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

            <Divider><Statistic title="Total" value={this.state.total} /></Divider>
            <CustomizedTable loading={this.state.loading} columns={columns} dataSource={this.state.treatmentMonthly} />

</div>
)
    }
}
