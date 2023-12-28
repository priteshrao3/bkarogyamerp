import React from 'react';
import {Card, Col, DatePicker, Row, Statistic} from "antd";
import {getAPI, interpolate} from "../../../../utils/common";
import {WALLET_LEDGER_SUM} from "../../../../constants/api";
import moment from 'moment';
import {
    Bar, Cell,
    ComposedChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

const {MonthPicker} = DatePicker;
export default class MonthlyTurnoverDashboardWidget extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ledgerDetails: {},
            selectedStartDate: moment()
        }
    }

    componentDidMount() {
        this.loadSumData()
    }

    loadSumData = (page = 1) => {
        let that = this;
        that.setState({
            loading: true
        })
        let successFn = function (data) {
            that.setState({
                ledgerDetails: data,
                nextPage: data.next,
                loading: false
            })

        }
        let errorFn = function () {
            that.setState({
                loading: false
            })
        }
        let params = {
            page,
            start: this.state.selectedStartDate.startOf('month').format(),
            end: this.state.selectedStartDate.endOf('month').format(),
        }
        getAPI(interpolate(WALLET_LEDGER_SUM, [this.props.currentPatient.id]), successFn, errorFn, params);
    }
    changeExpenseFilters = (type, value) => {
        let that = this;
        this.setState({
            [type]: value
        }, function () {
            that.loadSumData(1);
        })
    }

    render() {
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
        const data = [
            {
                name: 'Credit', value: this.state.ledgerDetails.credit,
            }, {
                name: 'Debit', value: this.state.ledgerDetails.debit,
            }, {
                name: 'Profit', value: this.state.ledgerDetails.credit - this.state.ledgerDetails.debit,
            }, {
                name: 'Payout', value: this.state.ledgerDetails.payout,
            }];
        return <div>
            <Card loading={this.state.loading} style={{marginBottom:20}}>
                <h3>Monthly Turnover
                    <span style={{float: 'right'}}>
                    <MonthPicker size={'small'} placeholder="Select Month"
                                 value={this.state.selectedStartDate}
                                 allowClear={false}
                                 onChange={(e) => this.changeExpenseFilters('selectedStartDate', e)}/>
                </span>
                </h3>
                <Row style={{textAlign: 'center'}}>
                    <Col xs={12} sm={12} md={6} lg={6}>
                        <Statistic title={"Credit"} value={this.state.ledgerDetails.credit} precision={2}
                                   prefix={'Rs.'}/>
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={6}>
                        <Statistic title={"Debit"} value={this.state.ledgerDetails.debit} precision={2} prefix={'Rs.'}/>
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={6}>
                        <Statistic title={"Profit"}
                                   value={this.state.ledgerDetails.credit - this.state.ledgerDetails.debit}
                                   prefix={'Rs.'}
                                   precision={2}/>
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={6}>
                        <Statistic title={"Payout"} value={this.state.ledgerDetails.payout} precision={2}
                                   prefix={'Rs.'}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={24} style={{width: '100%', height: 180}}>
                        <ResponsiveContainer>
                            <ComposedChart
                                layout="vertical"
                                width={500}
                                height={400}
                                data={data}>
                                <XAxis type="number"/>
                                <YAxis dataKey="name" type="category"/>
                                <Tooltip/>
                                <Bar dataKey="value" barSize={20} fill="#413ea0">
                                    {
                                        data.map((entry, index) => <Cell key={`cell-${index}`}
                                                                         fill={COLORS[index % COLORS.length]}/>)
                                    }
                                </Bar>
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Col>
                </Row>
            </Card>
        </div>
    }
}