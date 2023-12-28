import React from "react";
import {Col, Row, Select, Statistic} from "antd";
import moment from "moment"
import {EMR_REPORTS} from "../../../constants/api";
import {getAPI,  interpolate} from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import { sendReportMail} from "../../../utils/clinicUtils";

export default class AllTreatmentPerformed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            treatmentPerformed:[],
            mailingUsersList: this.props.mailingUsersList
        }
        this.loadTreatmentsReport = this.loadTreatmentsReport.bind(this);
    }

    componentDidMount() {
        this.loadTreatmentsReport();
        
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate ||this.props.doctors!=newProps.doctors ||this.props.is_complete!=newProps.is_complete)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            },function(){
                that.loadTreatmentsReport();
            })

    }

    loadTreatmentsReport = () => {
        const that = this;
        that.setState({
            loading:true,
        });
        const successFn = function (data) {
           that.setState({
               treatmentPerformed:data,
               loading: false,
           })
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
        const that=this;
        let i=1;
        const columns = [{
            title: 'S. No',
            key: 'sno',
            render: (item, record) => <span> {i++}</span>,
            export:(item,record,index)=>index+1,
            width: 50
        },{
            title: 'Performed On',
            key: 'date',
            render: (text, record) => (
                <span>
                {moment(record.schedule_at).format('DD MMM YYYY')}
                </span>
            ),
            export:(item,record)=>(moment(record.schedule_at).format('DD MMM YYYY')),
        },{
            title: 'Name',
            dataIndex: 'procedure_name',
            key: 'procedure_name',
        },{
            title:'Performed by',
            key:'doctor',
            dataIndex:'doctor',
        },{
            title:'Total Treatments',
            key:'quantity',
            dataIndex:'quantity',
        }];
        const totalTreatments = this.state.treatmentPerformed.reduce(function(prev, cur) {
                 return prev + cur.quantity;
             }, 0);
        return (
            <div>
                <h2>All Treatments Performed
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
                    <Col span={12} offset={6} style={{textAlign:"center"}}>
                        <Statistic title="Total Treatments" value={totalTreatments} />
                        <br />
                    </Col>
                </Row>

                <CustomizedTable
                  loading={this.state.loading}
                  columns={columns}
                  dataSource={this.state.treatmentPerformed}
                />

            </div>
)
    }
}
