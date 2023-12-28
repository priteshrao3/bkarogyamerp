import React from "react";
import CustomizedTable from "../../common/CustomizedTable";
import {getAPI, interpolate} from "../../../../utils/common";
import {AGENT_WALLET, MY_AGENTS, WALLET_LEDGER, WALLET_LEDGER_SUM} from "../../../../constants/api";
import {Card, Col, DatePicker, Icon, Row, Select, Statistic, Typography} from "antd";
import moment from "moment";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";

const {Text} = Typography;
export default class PatientWalletLedger extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ledger: [],
            loading: false,
            walletAmount: null,
            selectedStartDate: moment().subtract(1, 'month'),
            selectedEndDate: moment(),
            agents: [],
            selectedAgents: [],
            ledgerDetails: {}
        }
    }

    componentDidMount() {
        this.loadData();
        this.loadPatientWallet();
        this.loadAgents();
        this.loadSumData()
    }

    loadPatientWallet = () => {
        let that = this;
        if (this.props.currentPatient && this.props.currentPatient.id) {
            let successFn = function (data) {
                if (data.length)
                    that.setState({
                        walletAmount: data[0]
                    })
            }
            let errorFn = function () {

            }
            getAPI(interpolate(AGENT_WALLET, [this.props.currentPatient.id]), successFn, errorFn);
        } else {
            this.setState({
                pendingAmount: null
            })
        }
    }
    loadData = (page = 1) => {
        let that = this;
        this.setState({
            loading: true
        })
        let successFn = function (data) {
            if (data.current == 1) {
                that.setState({
                    ledger: data.results,
                    loading: false,
                    nextPage: data.next
                })
            } else {
                that.setState(function (prevState) {
                    return {
                        ledger: [...prevState.ledger, ...data.results],
                        loading: false,
                        nextPage: data.next
                    }
                })
            }
        }
        let errorFn = function () {
            that.setState({
                loading: false
            })
        }
        let params = {
            page,
            start: this.state.selectedStartDate.format(),
            end: this.state.selectedEndDate.format(),
            agents: this.state.selectedAgents.join(',')
        }
        if (this.state.selectedAgents)
            params.agents = this.state.selectedAgents.join(',');
        getAPI(interpolate(WALLET_LEDGER, [this.props.currentPatient.id]), successFn, errorFn, params);
    }
    loadSumData = (page = 1) => {
        let that = this;

        let successFn = function (data) {
            that.setState({
                ledgerDetails: data,
                nextPage: data.next
            })

        }
        let errorFn = function () {
        }
        let params = {
            page,
            start: this.state.selectedStartDate.format(),
            end: this.state.selectedEndDate.format(),
            agents: this.state.selectedAgents.join(',')
        }
        if (this.state.selectedAgents)
            params.agents = this.state.selectedAgents.join(',');
        getAPI(interpolate(WALLET_LEDGER_SUM, [this.props.currentPatient.id]), successFn, errorFn, params);
    }

    loadAgents() {
        var that = this;
        let successFn = function (data) {
            that.setState({
                agents: data,
            })
        };
        let errorFn = function () {
        };
        let apiParams = {
            // agent: true,
            pagination: false
        }
        getAPI(interpolate(MY_AGENTS, [this.props.currentPatient.id]), successFn, errorFn, apiParams);
    }

    changeExpenseFilters = (type, value) => {
        let that = this;
        this.setState({
            [type]: value
        }, function () {
            that.loadData(1);
        })
    }

    render() {
        let columns = [{
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (value) => moment(value).format('LLL')
        }, {
            title: 'Patient',
            dataIndex: 'received_from',
            key: 'received_from',
            render: (value, record) => value ? <Text>{value.user.first_name} ({value.custom_id})</Text> : '--'
        }, , {
            title: 'Refered By',
            dataIndex: 'received_from.user.referer_data',
            key: 'received_from.user.referer_data',
            render: (value, record) => value && value.referer ? <Text>{value.referer.first_name} ({value.custom_id})</Text> : '--'
        }, {
            title: 'Ledger Comment',
            dataIndex: 'comments',
            key: 'comments',
            render: (value, record) => record.is_cancelled ? <Text delete>{value}</Text> : value
        },
            //     {
            //     title: 'Amount Type',
            //     dataIndex: 'amount_type',
            //     key: 'amount_type',
            //     render: (value, record) => record.is_cancelled ? <Text delete>{value}</Text> : value
            // },
            {
                title: 'Cr/Dr',
                dataIndex: 'ledger_type',
                key: 'ledger_type',
                render: (value, record) => record.is_cancelled ? <Text delete>{value}</Text> : value
            }, {
                title: 'Amount',
                dataIndex: 'amount',
                key: 'amount',
                render: (value, record) => record.is_cancelled ?
                    <Text delete>{value.toFixed(2)}</Text> : value.toFixed(2)
            }];
        return <div>
            <Card title={"Wallet Ledger"}>
                <Row gutter={16} style={{marginBottom: 10}}>
                    <Col xs={8} sm={8} md={2} lg={2} style={{textAlign: "right"}}>
                        <b> Agents</b>
                    </Col>
                    <Col xs={16} sm={16} md={4} lg={4}>
                        <Select style={{width: '100%'}} value={this.state.selectedAgents}
                                mode="multiple"
                                disabled={this.state.loading}
                                onChange={(value) => this.changeExpenseFilters('selectedAgents', value)}>
                            {this.state.agents.map(item => <Select.Option
                                value={item.id}>{item.user.first_name}</Select.Option>)}
                        </Select>
                    </Col>
                    {/*<Col span={2} style={{textAlign: "right"}}>*/}
                    {/*    <b> Payment Modes</b>*/}
                    {/*</Col>*/}
                    {/*<Col span={4}>*/}
                    {/*    <Select style={{width: '100%'}} value={this.state.selectedPaymentMode}*/}
                    {/*            disabled={this.state.loading}*/}
                    {/*            onChange={(value) => this.changeExpenseFilters('selectedPaymentMode', value)}>*/}
                    {/*        <Select.Option value={null}>--ALL PAYMENT MODE--</Select.Option>*/}
                    {/*        {this.state.paymentModes.map(item => <Select.Option*/}
                    {/*            value={item.id}>{item.mode}</Select.Option>)}*/}
                    {/*    </Select>*/}
                    {/*</Col>*/}

                    <Col xs={8} sm={8} md={2} lg={2} style={{textAlign: "right"}}>
                        <b> From</b>
                    </Col>
                    <Col xs={16} sm={16} md={4} lg={4}>
                        <DatePicker value={this.state.selectedStartDate}
                                    disabled={this.state.loading}
                                    onChange={(value) => this.changeExpenseFilters('selectedStartDate', value)}/>
                    </Col>
                    <Col xs={8} sm={8} md={2} lg={2} style={{textAlign: "right"}}>
                        <b> To</b>
                    </Col>
                    <Col xs={16} sm={16} md={4} lg={4}>
                        <DatePicker value={this.state.selectedEndDate}
                                    disabled={this.state.loading}
                                    onChange={(value) => this.changeExpenseFilters('selectedEndDate', value)}/>
                    </Col>
                </Row>
                {this.state.walletAmount ?
                    <Row style={{textAlign: 'center', marginBottom: 10}}>
                        {/*<Col span={12}>*/}
                        {/*    <Statistic title={""} prefix={<Icon type={"wallet"}/>}*/}
                        {/*               value={this.state.walletAmount.refundable_amount}/>*/}
                        {/*</Col>*/}
                        <Col span={24}>
                            <Statistic title={"Wallet Total"} prefix={<Icon type={"wallet"}/>}
                                       value={this.state.walletAmount.non_refundable} precision={2}/>
                        </Col>
                    </Row> : null}
                <CustomizedTable dataSource={this.state.ledger} loading={this.state.loading} columns={columns}
                                 hideReport
                                 pagination={false}/>
                <InfiniteFeedLoaderButton loading={this.state.loading}
                                          hidden={!this.state.nextPage}
                                          loaderFunction={() => this.loadData(this.state.nextPage)}/>
                <Row style={{textAlign: 'center', marginBottom: 10}}>
                    <Col span={8}>
                        <Statistic title={"Credit"} value={this.state.ledgerDetails.credit} precision={2}/>
                    </Col>
                    <Col span={8}>
                        <Statistic title={"Debit"} value={this.state.ledgerDetails.debit} precision={2}/>
                    </Col>
                    <Col span={8}>
                        <Statistic title={"Profit"}
                                   value={this.state.ledgerDetails.credit - this.state.ledgerDetails.debit}
                                   precision={2}/>
                    </Col>
                </Row>
            </Card>
        </div>
    }
}