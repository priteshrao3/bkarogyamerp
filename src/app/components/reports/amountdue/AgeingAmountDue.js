import React from "react";
import {Card, Col, Row, Select, Statistic, Table} from "antd";
import {AMOUNT_DUE_REPORTS} from "../../../constants/api";
import {getAPI} from "../../../utils/common";
import {sendReportMail} from "../../../utils/clinicUtils";

export default class AgeingAmountDue extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: true,
            report:[],
            mailingUsersList: this.props.mailingUsersList
        };
        this.loadReport = this.loadReport.bind(this);

    }

    componentDidMount() {
        this.loadReport();
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate || this.props.doctors != newProps.doctors)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            },function(){
                that.loadReport();
            })

    }

    loadReport =() =>{
        const that =this;
        that.setState({
            loading:true,
        });

        const successFn = function (data) {
            that.setState({
                report:data,
                loading:false,
            })
        };
        const errorFn = function () {
            that.setState({
                loading:false
            })
        };
        const apiParams={
            practice:this.props.active_practiceId,
            type: that.props.type,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
        };

        if (this.props.doctors) {
            apiParams.doctors = this.props.doctors.toString();
        }

        getAPI(AMOUNT_DUE_REPORTS, successFn ,errorFn,apiParams);
    };

    sendMail = (mailTo) => {
        const apiParams={
            practice:this.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            type:this.props.type,
        }
        if (this.props.doctors) {
            apiParams.doctors = this.props.doctors.toString();
        }
        apiParams.mail_to = mailTo;
        sendReportMail(AMOUNT_DUE_REPORTS, apiParams)
    };

    render() {
        const {report ,loading} =this.state;
        let zero_twenty_nine=0;
        let thirty_fifty_nine=0;
        let sixty_eighty_nine=0;
        let eighty_nine_three_sixty_four=0;
        let three_sixty_five=0;
        let total_amount=0;
        report.map(function (item) {
            zero_twenty_nine +=item['0_29'];
            thirty_fifty_nine += item['30_59'];
            sixty_eighty_nine += item['60_89'];
            eighty_nine_three_sixty_four += item['89_364'];
            three_sixty_five += item['365'];
            total_amount= zero_twenty_nine + thirty_fifty_nine + sixty_eighty_nine + eighty_nine_three_sixty_four +three_sixty_five;
        });
        const columns = [{
            title: 'S. No',
            key: 's_no',
            dataIndex:'s_no',
            render:(item,record,index)=><span>{index+1}</span>,
            width: 50
        },{
            title: 'Name',
            dataIndex: 'first_name',
            key: 'first_name',
        },{
            title:'for 0-29 days (INR)',
            dataIndex:'0_29',
            key:'0_29',
            render:(item =><span>{item.toFixed(2)}</span> )
        },{
            title:'for 30-59 days (INR)',
            dataIndex:'30_59',
            key:'30_59',
            render:(item =><span>{item.toFixed(2)}</span>)
        },{
            title:'for 60-89 days (INR)',
            dataIndex:'60_89',
            key:'60_89',
            render:(item =><span>{item.toFixed(2)}</span>)
        },{
            title:'for 89-364 days (INR)',
            dataIndex:'89_364',
            key:'89_364',
            render:(item =><span>{item.toFixed(2)}</span>)
        },{
            title:'for more than 364 days (INR)',
            dataIndex:'365',
            key:'365',
            render:(item =><span>{item.toFixed(2)}</span>)
        },{
            title:'Total (INR)',
            key:'total',
            render:(item,record)=><span>{(record['0_29'] + record['30_59'] + record['60_89'] +record['89_364'] + record['365']).toFixed(2)}</span>
        }];

        return (
<div>

                <h2>Ageing Amount Due <span style={{float: 'right'}}>
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
                    <Col span={22} offset={1}>

                        <p style={{textAlign:"center", marginTop:40}}>*Unpaid Invoice Amount.</p>

                        <Card title="Summary" bordered={false} type="inner">
                            <Row>
                                <Col span={4}>
                                    <Statistic title="for 0-29 days (INR)" value={zero_twenty_nine.toFixed(2)} />
                                </Col>
                                <Col span={4}>
                                    <Statistic title="for 30-59 days (INR)" value={thirty_fifty_nine.toFixed(2)} />
                                </Col>
                                <Col span={4}>
                                    <Statistic title="for 60-89 days (INR)" value={sixty_eighty_nine.toFixed(2)} />
                                </Col>
                                <Col span={4}>
                                    <Statistic title="for 89-364 days (INR)" value={eighty_nine_three_sixty_four.toFixed(2)} />
                                </Col>
                                <Col span={4}>
                                    <Statistic title="for more than 364 days (INR)" value={three_sixty_five.toFixed(2)} />
                                </Col>
                                <Col span={4}>
                                    <Statistic title="Total (INR)" value={total_amount.toFixed(2)} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            <Row gutter={16}>
                <p style={{textAlign:"center", marginTop:40}}>*Unpaid Invoice Amount.</p>

                <Card title="Summary" bordered={false} type="inner" bodyStyle={{padding:0}}>
                    <Table loading={loading} columns={columns} pagination={false} dataSource={report} />
                </Card>
            </Row>
</div>
)
    }
}
