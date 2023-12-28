import {Button, Card, Divider, Icon, Popconfirm, Row, Col, Select, DatePicker, Table} from "antd";
import React from "react";
import {Route, Switch} from "react-router";
import {Link} from "react-router-dom";
import moment from "moment";
import {getAPI, interpolate, postAPI, putAPI} from "../../../utils/common";
import {EXPENSE_TYPE, EXPENSES_API, PAYMENT_MODES, SINGLE_EXPENSES_API} from "../../../constants/api";
import AddExpenses from "./AddExpenses";
import PermissionDenied from "../../common/errors/PermissionDenied";

export default class ExpensesList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active_practiceId: this.props.active_practiceId,
            expenses: null,
            expenseTypes: [],
            loading: true,
            paymentModes: [],
            selectedExpenseType: null,
            selectedPaymentMode: null,
            selectedStartDate: moment().subtract(1, 'month'),
            selectedEndDate: moment()
        };
        this.loadData = this.loadData.bind(this);
    }

    componentDidMount() {
        this.loadExpenseTypes();
        this.loadPaymentModes();
        this.loadData();
    }

    loadExpenseTypes(deleted = false) {
        const that = this;
        const successFn = function (data) {
            console.log("get table");
            if (deleted) {
                that.setState({
                    deletedExpenses: data,
                    deletedLoading: false
                })
            } else {
                that.setState({
                    expenseTypes: data,
                })
            }
        };
        const errorFn = function () {
        };
        if (deleted) {
            getAPI(interpolate(EXPENSE_TYPE, [this.props.active_practiceId]), successFn, errorFn, {deleted: true});
        } else {
            getAPI(interpolate(EXPENSE_TYPE, [this.props.active_practiceId]), successFn, errorFn);
        }
    }

    loadPaymentModes() {
        const that = this;
        const successFn = function (data) {
            console.log("get table");
            that.setState({
                paymentModes: data,
            })
        };
        const errorFn = function () {
        };
        getAPI(interpolate(PAYMENT_MODES, [this.props.active_practiceId]), successFn, errorFn);
    }

    changeExpenseFilters = (type, value) => {
        const that = this;
        this.setState({
            [type]: value
        }, function () {
            that.loadData();
        })
    }

    loadData = () => {
        const that = this;
        that.setState({
            loading: true
        })
        const successFn = function (data) {
            that.setState({
                expenses: data,
                loading: false
            })
            console.log("log data", that.state.expenses)
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })

        }
        getAPI(EXPENSES_API, successFn, errorFn, {
            practice:that.props.active_practiceId,
            payment_mode: that.state.selectedPaymentMode,
            expense_type: that.state.selectedExpenseType,
            start: that.state.selectedStartDate.format(),
            end: that.state.selectedEndDate.format(),
        });
    }

    deleteObject(record, type) {
        const that = this;
        const reqData = {};
        reqData.id = record.id;
        reqData.is_active = type;
        const successFn = function (data) {
            that.loadData();
            if (that.state.showDeleted) {
                that.loadData(true);
            }
        }
        const errorFn = function () {
        };
        putAPI(interpolate(SINGLE_EXPENSES_API, [record.id]), reqData, successFn, errorFn)
    }

    render() {
        const that = this;
        const expenseColoumns = [{
            title: 'Expense Date',
            key: 'expense_date',
            dataIndex: 'expense_date',
            export (text) {
                return moment(text).format('lll');
            },
            render (text) {
                return moment(text).format('lll');
            }
        }, {
            title: 'Expense Type',
            key: 'expense_type',
            dataIndex: 'expense_type.name',
        }, {
            title: 'Vendor',
            key: 'vendor',
            dataIndex: 'vendor.name'
        }, {
            title: 'Payment Mode',
            key: 'payment_mode',
            dataIndex: 'payment_mode.mode'
        }, {
            title: 'Amount',
            key: 'amount',
            dataIndex: 'amount'
        }, {
            title: 'Bank Name',
            key: 'bank_name',
            dataIndex: 'bank_name'
        }, {
            title: 'Remark',
            key: 'remark',
            dataIndex: 'remark'
        }, {
            title: 'Action',
            render (record) {
                return (
<div>
                    {that.props.activePracticePermissions.EditExpenses || that.props.allowAllPermissions ?
                        <Link to={`/erp/inventory/expenses/edit/${  record.id}`}>Edit</Link> : null}
                    <Divider type="vertical" />
                    {that.props.activePracticePermissions.DeleteExpenses || that.props.allowAllPermissions ? (
                        <Popconfirm
                          title="Are you sure to delete this?"
                          onConfirm={() => that.deleteObject(record, false)}
                          okText="Yes"
                          cancelText="No"
                        >
                            <a>Delete</a>
                        </Popconfirm>
                      ) : null}
</div>
)
            }
        }]
        return (
<div>
            <Switch>
                <Route
                  exact
                  path='/erp/inventory/expenses/add'
                  render={(route) => (that.props.activePracticePermissions.EditExpenses || that.props.allowAllPermissions ?
                           <AddExpenses {...this.state} {...route} loadData={this.loadData} /> : <PermissionDenied />)}
                />
                <Route
                  exact
                  path='/erp/inventory/expenses/edit/:id'
                  render={(route) => (that.props.activePracticePermissions.EditExpenses || that.props.allowAllPermissions ?
                           <AddExpenses {...this.state} {...route} loadData={this.loadData} /> : <PermissionDenied />)}
                />
                <Card
                  title="Expenses"
                  extra={(that.props.activePracticePermissions.EditExpenses || that.props.allowAllPermissions ? (
                          <Link to="/erp/inventory/expenses/add"> <Button type="primary"><Icon
                            type="plus"
                          /> Add
                                                              </Button>
                          </Link>
                        ) : <PermissionDenied />)}
                >
                    <Row gutter={16} style={{marginBottom: 10}}>
                        <Col span={2} style={{textAlign: "right"}}>
                            <b> Expense Types</b>
                        </Col>
                        <Col span={4}>
                            <Select
                              style={{width: '100%'}}
                              value={this.state.selectedExpenseType}
                              disabled={this.state.loading}
                              onChange={(value) => this.changeExpenseFilters('selectedExpenseType', value)}
                            >
                                <Select.Option value={null}>--ALL EXPENSES--</Select.Option>
                                {this.state.expenseTypes.map(item => (
<Select.Option
  value={item.id}
>{item.name}
</Select.Option>
))}
                            </Select>
                        </Col>
                        <Col span={2} style={{textAlign: "right"}}>
                            <b> Payment Modes</b>
                        </Col>
                        <Col span={4}>
                            <Select
                              style={{width: '100%'}}
                              value={this.state.selectedPaymentMode}
                              disabled={this.state.loading}
                              onChange={(value) => this.changeExpenseFilters('selectedPaymentMode', value)}
                            >
                                <Select.Option value={null}>--ALL PAYMENT MODE--</Select.Option>
                                {this.state.paymentModes.map(item => (
<Select.Option
  value={item.id}
>{item.mode}
</Select.Option>
))}
                            </Select>
                        </Col>

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
                    <Table
                      loading={this.state.loading}
                      dataSource={this.state.expenses}
                      columns={expenseColoumns}
                    />
                </Card>
            </Switch>
</div>
)
    }
}
