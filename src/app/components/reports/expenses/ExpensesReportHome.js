import React from 'react';
import { Button, Card, Col, Icon, Radio, Row, Table, Divider, Select } from 'antd';
import { PAYMENT_MODES, EXPENSE_TYPE } from '../../../constants/api';
import { EXPENSE_RELATED_REPORT } from '../../../constants/hardData';
import {
    ALL_EXPENSES,
    DAILY_EXPENSES,
    EXPENSES_EACH_TYPE,
    MONTHLY_EXPENSES,
} from '../../../constants/dataKeys';
import { getAPI, interpolate } from '../../../utils/common';
import AllExpensesReport from './AllExpensesReport';
import DailyExpenses from './DailyExpenses';
import MonthlyExpenses from './MonthlyExpenses';
import ExpensesForEachType from './ExpensesForEachType';

export default class ExpensesReportHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advancedOptionShow: true,
            expenseTypeOption: [],
            paymentModeOption: [],
            sidePanelColSpan: 4,
            type: 'ALL',
        };
        this.loadExpenseType = this.loadExpenseType.bind(this);
        this.loadPaymentMode = this.loadPaymentMode.bind(this);
    }

    componentDidMount() {
        this.loadExpenseType();
        this.loadPaymentMode();
    }

    loadExpenseType() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                expenseTypeOption: data,
            });
        };
        const errorFn = function() {};
        getAPI(interpolate(EXPENSE_TYPE, [this.props.active_practiceId]), successFn, errorFn);
    }

    loadPaymentMode() {
        const that = this;
        const successFun = function(data) {
            that.setState({
                paymentModeOption: data,
            });
        };
        const errorFn = function() {};
        getAPI(interpolate(PAYMENT_MODES, [this.props.active_practiceId]), successFun, errorFn);
    }

    onChangeHandle = (type, value) => {
        const that = this;
        this.setState({
            [type]: value.target.value,
        });
    };

    advancedOption(value) {
        this.setState({
            advancedOptionShow: value,
        });
    }

    changeSidePanelSize = sidePanel => {
        this.setState({
            sidePanelColSpan: sidePanel ? 0 : 4,
        });
    };

    handleChangeOption = (type, value) => {
        const that = this;
        this.setState({
            [type]: value,
        });
    };

    render() {
        return (
            <div>
                <h2>
                    Expenses Report{' '}
                    <Button
                        type="primary"
                        shape="round"
                        icon={this.state.sidePanelColSpan ? 'double-right' : 'double-left'}
                        style={{ float: 'right' }}
                        onClick={() => this.changeSidePanelSize(this.state.sidePanelColSpan)}
                    >
                        Panel
                    </Button>
                </h2>
                <Card>
                    <Row gutter={16}>
                        <Col span={24 - this.state.sidePanelColSpan}>
                            {this.state.type == ALL_EXPENSES ? (
                                <AllExpensesReport {...this.props} {...this.state} />
                            ) : null}

                            {this.state.type == DAILY_EXPENSES ? (
                                <DailyExpenses {...this.props} {...this.state} />
                            ) : null}

                            {this.state.type == MONTHLY_EXPENSES ? (
                                <MonthlyExpenses {...this.props} {...this.state} />
                            ) : null}
                            {this.state.type == EXPENSES_EACH_TYPE ? (
                                <ExpensesForEachType {...this.props} {...this.state} />
                            ) : null}
                        </Col>

                        <Col span={this.state.sidePanelColSpan}>
                            <Radio.Group
                                buttonStyle="solid"
                                defaultValue={ALL_EXPENSES}
                                onChange={value => this.onChangeHandle('type', value)}
                            >
                                <h2>Expenses</h2>
                                <Radio.Button
                                    style={{
                                        width: '100%',
                                        backgroundColor: 'transparent',
                                        border: '0px',
                                    }}
                                    value={ALL_EXPENSES}
                                >
                                    All Expenses
                                </Radio.Button>
                                <p>
                                    <br />
                                </p>
                                <h2>Related Reports</h2>
                                {EXPENSE_RELATED_REPORT.map(item => (
                                    <Radio.Button
                                        style={{ width: '100%', backgroundColor: 'transparent' }}
                                        value={item.value}
                                    >
                                        {item.name}
                                    </Radio.Button>
                                ))}
                            </Radio.Group>

                            <br />
                            <br />
                            {this.state.advancedOptionShow ? (
                                <>
                                    <Button
                                        type="link"
                                        onClick={value => this.advancedOption(false)}
                                    >
                                        Hide Advanced Options{' '}
                                    </Button>
                                    <Col>
                                        {' '}
                                        <br />
                                        <h4>Expense Type</h4>
                                        <Select
                                            style={{ minWidth: '200px' }}
                                            mode="multiple"
                                            placeholder="Select Expense Type"
                                            onChange={value =>
                                                this.handleChangeOption('expense_type', value)
                                            }
                                        >
                                            {this.state.expenseTypeOption.map(item => (
                                                <Select.Option value={item.id}>
                                                    {item.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        <br />
                                        <br />
                                        <h4>Payment Modes</h4>
                                        <Select
                                            style={{ minWidth: '200px' }}
                                            mode="multiple"
                                            placeholder="Select Payment Modes"
                                            onChange={value =>
                                                this.handleChangeOption('payment_mode', value)
                                            }
                                        >
                                            {this.state.paymentModeOption.map(item => (
                                                <Select.Option value={item.id}>
                                                    {item.mode}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Col>
                                </>
                            ) : (
                                <Button type="link" onClick={value => this.advancedOption(true)}>
                                    Show Advanced Options{' '}
                                </Button>
                            )}
                        </Col>
                    </Row>
                </Card>
            </div>
        );
    }
}
