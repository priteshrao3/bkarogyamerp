import React from "react";
import {Col, Row, Select, Statistic} from "antd";
import moment from "moment"
import {SUGGESTIONS} from "../../../constants/api";
import {displayMessage, getAPI} from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import { sendReportMail} from "../../../utils/clinicUtils";
import {MAIL_SEND_MSG, SUCCESS} from "../../../constants/messages";

export default class Suggestions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            report:[],
            mailingUsersList: this.props.mailingUsersList
        }
        this.loadSuggestionsReport = this.loadSuggestionsReport.bind(this);
    }

    componentDidMount() {
        this.loadSuggestionsReport();
       
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate ||this.props.status!=newProps.status)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            },function(){
                that.loadSuggestionsReport();
            })

    }

    loadSuggestionsReport = () => {
        const that = this;
        that.setState({
            loading:true,
        });
        const successFn = function (data) {
            that.setState({
                report:data.results,
                loading: false,
            })
        };

        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        const apiParams={
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
        };
        if(this.props.status){
            apiParams.status=this.props.status.toString();
        }
        getAPI(SUGGESTIONS,  successFn, errorFn, apiParams);
    };


    sendMail = (mailTo) => {
        const that = this;
        const errorMsg =true;
        const successMsg =true;
        const apiParams={
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
        };
        if(this.props.status){
            apiParams.status=this.props.status.toString();
        }
        apiParams.mail_to = mailTo;
        sendReportMail(SUGGESTIONS, apiParams, successMsg, errorMsg)
    };


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
            title: 'Date',
            key: 'date',
            render: (text, record) => (
                <span>
                {moment(record.created_at).format('DD MMM YYYY')}
                </span>
            ),
            export:(item,record)=>(moment(record.created_at).format('DD MMM YYYY')),
        },{
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },{
            title:'Email',
            key:'email',
            dataIndex:'email',
        },{
            title:'Mobile',
            ket:'mobile',
            dataIndex:'mobile',
        },{
            title:'Subject',
            key:'subject',
            dataIndex:'subject',
        },{
            title:'Description',
            key:'description',
            dataIndex:'description',
        }];
        return (
            <div>
                <h2>All Suggestions
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
                        <Statistic title="Total Suggestions" value={reportData.length} />
                        <br />
                    </Col>
                </Row>

                <CustomizedTable
                  loading={this.state.loading}
                  columns={columns}
                  dataSource={reportData}
                />

            </div>
)
    }
}
