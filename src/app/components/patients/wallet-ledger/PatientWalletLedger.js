import React from "react";
import {Card, Col, DatePicker, Divider, Icon, Row, Select, Statistic, Typography,Button} from "antd";
import moment from "moment";
import CustomizedTable from "../../common/CustomizedTable";
import {getAPI, interpolate} from "../../../utils/common";
import {AGENT_WALLET, MY_AGENTS,WALLET_LEDGER_REPORT, WALLET_LEDGER_SUM,WALLET_LEDGER} from "../../../constants/api";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import {BACKEND_BASE_URL} from "../../../config/connect";

const {Text} = Typography;
export default class PatientWalletLedger extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ledger: [],
            ledgerDetails: {},
            loading: false,
            walletAmount: null,
            selectedStartDate: moment().subtract(1, 'month'),
            selectedEndDate: moment(),
            agents: [],
            selectedAgents: [],
            loadings:false,
        }
    }

    componentDidMount() {
        this.loadData();
        this.loadPatientWallet();
        this.loadAgents();
        this.loadSumData();
    }

    loadPatientWallet = () => {
        const that = this;
        if (this.props.currentPatient && this.props.currentPatient.id) {
            const successFn = function (data) {
                if (data.length)
                    that.setState({
                        walletAmount: data[0]
                    })
            }
            const errorFn = function () {

            }
            getAPI(interpolate(AGENT_WALLET, [this.props.currentPatient.id]), successFn, errorFn);
        } else {
            this.setState({
                pendingAmount: null
            })
        }
    }

    loadData = (page = 1) => {
        const that = this;
        this.setState({
            loading: true
        })
        const successFn = function (data) {
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
        const errorFn = function () {
            that.setState({
                loading: false
            })
        }
        const params = {
            page,
            start: this.state.selectedStartDate.startOf('day').format(),
            end: this.state.selectedEndDate.endOf('day').format(),
            agents: this.state.selectedAgents.join(',')
        }
        if (this.state.selectedAgents)
            params.agents = this.state.selectedAgents.join(',');
        getAPI(interpolate(WALLET_LEDGER, [this.props.currentPatient.id]), successFn, errorFn, params);
    }

    loadSumData = (page = 1) => {
        const that = this;

        const successFn = function (data) {
            that.setState({
                ledgerDetails: data,
                nextPage: data.next
            })

        }
        const errorFn = function () {
        }
        const params = {
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
        const that = this;
        const successFn = function (data) {
            that.setState({
                agents: data,
            })
        };
        const errorFn = function () {
        };
        const apiParams = {
            agent: true,
            pagination: false
        }
        getAPI(interpolate(MY_AGENTS, [this.props.currentPatient.id]), successFn, errorFn, apiParams);
    }

    changeExpenseFilters = (type, value) => {
        const that = this;
        this.setState({
            [type]: value
        }, function () {
            that.loadData(1);
            that.loadSumData(1);
        })
    }
    loadPDF() {
        const that = this;
        that.setState({
            loadings:true
        }); 
        const successFn = function (data) {
            that.setState({
                loadings:false
            }); 
            if (data.report_pdf){
                window.open(BACKEND_BASE_URL + data.report_pdf);
            }
              

        }
        const errorFn = function () {
            that.setState({
                loadings:false
            }); 
        }
        const apiParams={
            patient:this.props.currentPatient.id,
            start: this.state.selectedStartDate.startOf('day').format(),
            end: this.state.selectedEndDate.endOf('day').format(),
        }
        getAPI(WALLET_LEDGER_REPORT, successFn, errorFn,apiParams);
    }
    render() {
        const{loadings}=this.state;
        const columns = [{
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
            render: (value, record) => value && value.referer ?
                <Text>{value.referer.first_name} ({value.custom_id})</Text> : '--'
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
        return (
            <div>
                <Card title="Wallet Ledger" extra={[this.state.walletAmount ? (
                    <Statistic
                        prefix={<Icon type="wallet"/>}
                        value={this.state.walletAmount.non_refundable}
                        precision={2}
                    />
                ) : null]}>
                    <Row gutter={16} style={{marginBottom: 10}}>
                        <Col span={2} style={{textAlign: "right"}}>
                            <b> Agents</b>
                        </Col>
                        <Col span={4}>
                            <Select
                                style={{width: '100%'}}
                                value={this.state.selectedAgents}
                                mode="multiple"
                                disabled={this.state.loading}
                                onChange={(value) => this.changeExpenseFilters('selectedAgents', value)}
                            >
                                {this.state.agents.map(item => (
                                    <Select.Option
                                        value={item.id}
                                    >{item.user.first_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Col>
                        {/* <Col span={2} style={{textAlign: "right"}}> */}
                        {/*    <b> Payment Modes</b> */}
                        {/* </Col> */}
                        {/* <Col span={4}> */}
                        {/*    <Select style={{width: '100%'}} value={this.state.selectedPaymentMode} */}
                        {/*            disabled={this.state.loading} */}
                        {/*            onChange={(value) => this.changeExpenseFilters('selectedPaymentMode', value)}> */}
                        {/*        <Select.Option value={null}>--ALL PAYMENT MODE--</Select.Option> */}
                        {/*        {this.state.paymentModes.map(item => <Select.Option */}
                        {/*            value={item.id}>{item.mode}</Select.Option>)} */}
                        {/*    </Select> */}
                        {/* </Col> */}

                        <Col span={2} style={{textAlign: "right"}}>
                            <b> From</b>
                        </Col>
                        <Col span={4}>
                            <DatePicker
                                value={this.state.selectedStartDate}
                                disabled={this.state.loading}
                                allowClear={false}
                                onChange={(value) => this.changeExpenseFilters('selectedStartDate', value)}
                            />
                        </Col>
                        <Col span={2} style={{textAlign: "right"}}>
                            <b> To</b>
                        </Col>
                        <Col span={4}>
                            <DatePicker
                                value={this.state.selectedEndDate}
                                disabled={this.state.loading}
                                allowClear={false}
                                onChange={(value) => this.changeExpenseFilters('selectedEndDate', value)}
                            />
                        </Col>
                    </Row>
                    <Row style={{textAlign: 'center', marginBottom: 10}}>
                        <Col span={6}>
                            <Statistic title="Credit" value={this.state.ledgerDetails.credit} precision={2}/>
                        </Col>
                        <Col span={6}>
                            <Statistic title="Debit" value={this.state.ledgerDetails.debit} precision={2}/>
                        </Col>
                        <Col span={6}>
                            <Statistic title="Payout" value={this.state.ledgerDetails.payout} precision={2}/>
                        </Col>
                        <Col span={6}>
                            <Statistic title="Profit"
                                       value={this.state.ledgerDetails.credit - this.state.ledgerDetails.debit}
                                       precision={2}/>
                        </Col>
                    </Row>
                    <a onClick={() => this.loadPDF()}>
                        <Button type="primary" size="small" icon='file-pdf' loading={this.state.loadings}>PDF</Button>
                        </a>
                    <CustomizedTable
                        dataSource={this.state.ledger}
                        loading={this.state.loading}
                        columns={columns}
                        hideReport
                        pagination={false}
                    />
                    <InfiniteFeedLoaderButton
                        loading={this.state.loading}
                        hidden={!this.state.nextPage}
                        loaderFunction={() => this.loadData(this.state.nextPage)}
                    />

                </Card>
            </div>
        )
    }
}
