import React from "react";
import {Button, Card, Checkbox, Col, Icon, Radio, Row, Select} from "antd";
import {BLOOD_GROUPS, MLM_RELATED_REPORT} from "../../../constants/hardData";
import {
    ACTIVE_PATIENTS,
    AGENT_TREE_VIEW,
    ALL, ALL_TREATMENTS, DAILY_NEW_PATIENTS,
    MARGIN_TYPE_WISE, MONTHLY_NEW_PATIENTS, NEW_PATIENTS,
    PRODUCT_WISE,
    TRANSFERED_AMOUNT,
    WALLET_BALANCE_AMOUNT,
    SEARCH_PATIENT_VALUE
} from "../../../constants/dataKeys";
import MarginTypewiseReport from "./MarginTypewiseReport";
import {getAPI} from "../../../utils/common";
import {PATIENTS_LIST, SEARCH_PATIENT} from "../../../constants/api";
import TransferredAmountReport from "./TransferredAmountReport";
import WalletBalanceAmountReport from "./WalletBalanceAmountReport";
import ProductWiseReport from "./ProductWiseReport";
import AllTreatmentPerformed from "../emr/AllTreatmentPerformed";
import AgentTreeReport from "./AgentTreeReport";
import AdvisorPatient from "./AdvisorPatient";

export default class MlmReportHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: 'ALL',
            sidePanelColSpan: 4,
            advancedOptionShow: true,
            agentsOption: [],
            loading: false,
            advisorList: [],
        };
        this.loadAgents = this.loadAgents.bind(this);
        this.loadAdvisor = this.loadAdvisor.bind(this);
    }

    componentDidMount() {
        this.loadAgents();
        this.loadAdvisor();
    }

    loadAdvisor() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                advisorList: data.results,
            });
        };
        const errorFn = function () {
        }
        getAPI(PATIENTS_LIST, successFn, errorFn)
    }

    loadAgents(searchString) {
        const that = this;
        const successFn = function (data) {
            that.setState({
                agentsOption: data.results,
                loading: false
            })
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        const apiParams = {
            agent: true,
            practice: this.props.active_practiceId,
            type: this.props.type,
            name: searchString
        };
        getAPI(PATIENTS_LIST, successFn, errorFn, apiParams);
    }

    onChangeHandle = (type, value) => {
        const that = this;
        this.setState({
            [type]: value.target.value,
        })
    };

    advancedOption(value) {
        this.setState({
            advancedOptionShow: value,
        })
    }

    changeSidePanelSize = (sidePanel) => {
        this.setState({
            sidePanelColSpan: sidePanel ? 0 : 4
        })
    };

    handleChangeOption = (type, value) => {
        const that = this;
        this.setState({
            [type]: value,
        })
    };

    render() {
        return (
            <div>
                <h2>MLM Report <Button
                    type="primary"
                    shape="round"
                    icon={this.state.sidePanelColSpan ? "double-right" : "double-left"}
                    style={{float: "right"}}
                    onClick={() => this.changeSidePanelSize(this.state.sidePanelColSpan)}
                >Panel
                </Button>
                </h2>
                <Card>
                    <Row gutter={16}>

                        <Col span={(24 - this.state.sidePanelColSpan)}>
                            {this.state.type == ALL ?
                                <TransferredAmountReport {...this.state} {...this.props} /> : null}

                            {this.state.type == MARGIN_TYPE_WISE ?
                                <MarginTypewiseReport {...this.props} {...this.state} /> : null}

                            {this.state.type == AGENT_TREE_VIEW ?
                                <AgentTreeReport {...this.props} {...this.state} /> : null}
                            {/* {this.state.type ==PRODUCT_WISE? */}
                            {/*    <ProductWiseReport {...this.props} {...this.state}/>:null} */}

                            {this.state.type == WALLET_BALANCE_AMOUNT ?
                                <WalletBalanceAmountReport {...this.props} {...this.state} /> : null}

                            {this.state.type == SEARCH_PATIENT_VALUE ?
                                <AdvisorPatient {...this.props} {...this.state}/> : null}
                        </Col>

                        <Col span={this.state.sidePanelColSpan}>
                            <Radio.Group buttonStyle="solid" defaultValue={ALL}
                                         onChange={(value) => this.onChangeHandle('type', value)}>
                                <h2>MLM</h2>
                                <Radio.Button
                                    style={{width: '100%', backgroundColor: 'transparent', border: '0px'}}
                                    value={ALL}
                                >
                                    All MLM
                                </Radio.Button>
                                <p><br/></p>
                                <h2>Related Reports</h2>
                                {MLM_RELATED_REPORT.map((item) => (
                                    <Radio.Button
                                        style={{width: '100%', backgroundColor: 'transparent'}}
                                        value={item.value}
                                    >
                                        {item.name}
                                    </Radio.Button>
                                ))}
                            </Radio.Group>
                            <br/>
                            <br/>
                            {this.state.advancedOptionShow ? (
                                <>
                                    <Button type="link" onClick={(value) => this.advancedOption(false)}>Hide
                                        Advanced Options
                                    </Button>
                                    {this.state.type == AGENT_TREE_VIEW || this.state.type == WALLET_BALANCE_AMOUNT || this.state.type == PRODUCT_WISE || this.state.type == MARGIN_TYPE_WISE || this.state.type == ALL || this.state.type == SEARCH_PATIENT_VALUE ? (
                                        <Col> <br/>
                                            <h4>Advisor</h4>
                                            <Select
                                                style={{minWidth: '200px'}}
                                                placeholder="Select Advisor"
                                                showSearch
                                                optionFilterProp="children"
                                                onSearch={(value)=>this.loadAgents(value)}
                                                onChange={(value) => this.handleChangeOption('agents', value)}
                                                allowClear
                                            >
                                                {this.state.agentsOption.map((item) => (
                                                    <Select.Option value={item.id}>
                                                        {item.user.first_name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Col>
                                    ) : null}
                                </>
                            ) : (<Button type="link" onClick={(value) => this.advancedOption(true)}>Show Advanced
                                    Options
                                </Button>
                            )}
                        </Col>
                    </Row>
                </Card>
            </div>
        )
    }
}
