import {Card, Form, Row} from "antd";
import React from "react";
import {Route} from "react-router";
import {Redirect} from "react-router-dom";
import moment from "moment";
import {
    DATE_PICKER,
    INPUT_FIELD, NUMBER_FIELD,
    SELECT_FIELD,
    SUCCESS_MSG_TYPE,
    TEXT_FIELD,
} from "../../../constants/dataKeys";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";
import {displayMessage, getAPI, interpolate} from "../../../utils/common";
import {EXPENSE_TYPE, EXPENSES_API, PAYMENT_MODES, SINGLE_EXPENSES_API, VENDOR_API} from "../../../constants/api";


export default class AddExpenses extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editData: this.props.editData ? this.props.editData : null
        }
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });

    }

    componentDidMount() {
        if (this.props.match.params.id) {
            if (!this.state.editData) {
                this.loadData();
            }
        }
        this.loadExpensetypes();
        this.loadPaymentModes();
        this.loadVendors();


    }

    loadPaymentModes() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                paymentModes: data,
            })
        };
        const errorFn = function () {
        };
        getAPI(interpolate(PAYMENT_MODES, [this.props.active_practiceId]), successFn, errorFn);
    }

    loadData() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                editData: data,
            })
        }
        const errorFn = function () {

        }
        getAPI(interpolate(SINGLE_EXPENSES_API, [this.props.match.params.id]), successFn, errorFn);
    }

    loadExpensetypes() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                expense_types: data,
            })
        };
        const errorFn = function () {
        };
        getAPI(interpolate(EXPENSE_TYPE, [this.props.active_practiceId]), successFn, errorFn);
    }

    loadVendors() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                vendors: data,
            })
        };
        const errorFn = function () {
        };
        getAPI(interpolate(VENDOR_API, [this.props.active_practiceId]), successFn, errorFn);
    }


    render() {
        const paymentModesOptions = []
        if (this.state.paymentModes) {
            this.state.paymentModes.forEach(function (drug) {
                paymentModesOptions.push({label: (drug.mode), value: drug.id});
            })
        }
        ;
        const expenseTypesOptions = []
        if (this.state.expense_types) {
            this.state.expense_types.forEach(function (drug) {
                expenseTypesOptions.push({label: (drug.name), value: drug.id});
            })
        }
        const vendorsOptions = []
        if (this.state.vendors) {
            this.state.vendors.forEach(function (drug) {
                vendorsOptions.push({label: (drug.name), value: drug.id});
            })
        }
        const fields = [{
            label: "Expense Date",
            key: "expense_date",
            required: true,
            initialValue: this.state.editData ? this.state.editData.expense_date : moment(),
            type: DATE_PICKER,
            format: "YYYY-MM-DD"
        }, {
            label: "Amount",
            key: "amount",
            required: true,
            initialValue: this.state.editData ? this.state.editData.amount : null,
            type: NUMBER_FIELD,
            follow:"INR"
        }, {
            label: "Vendor",
            key: "vendor",
            type: SELECT_FIELD,
            initialValue: this.state.editData ? this.state.editData.vendors : null,
            options: vendorsOptions
        }, {
            label: "Expense type",
            key: "expense_type",
            type: SELECT_FIELD,
            initialValue: this.state.editData && this.state.editData.expense_type ? this.state.editData.expense_type.id : null,
            options: expenseTypesOptions
        }, {
            label: "Payment Mode",
            key: "payment_mode",
            type: SELECT_FIELD,
            required: true,
            initialValue: this.state.editData && this.state.editData.payment_mode? this.state.editData.payment_mode.id : null,
            options: paymentModesOptions
        }, {
            label: "Bank Name",
            key: 'bank_name',
            type: INPUT_FIELD,
            initialValue: this.state.editData ? this.state.editData.bank_name : null,
        }, {
            label: "Remark",
            key: 'remark',
            type: TEXT_FIELD,
            minRows: 2,
            maxRows: 6,
            initialValue: this.state.editData ? this.state.editData.remark : null,
        },];


        let editformProp;
        const that = this;
        if (this.state.editData) {
            editformProp = {
                successFn (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "success");
                    that.props.loadData();
                    that.changeRedirect();
                    if (that.props.history){
                        that.props.history.replace("/erp/inventory/expenses");
                    }
                },
                errorFn () {

                },
                action: interpolate(SINGLE_EXPENSES_API, [this.props.match.params.id]),
                method: "put",

            }
        }
        const TestFormLayout = Form.create()(DynamicFieldsForm);

        const formProp = {
            successFn (data) {
                displayMessage(SUCCESS_MSG_TYPE, "success");
                that.props.loadData();
                that.changeRedirect();
                if (that.props.history){
                    that.props.history.replace("/erp/inventory/expenses");
                }
            },
            errorFn () {

            },
            action: EXPENSES_API,
            method: "post",
        }
        const defaultValues = [{"key": "practice", "value": this.props.active_practiceId}];
        return (
<Row>
            <Card>
                <Route
                  exact
                  path='/erp/inventory/expenses/edit/:id'
                  render={() => (this.props.match.params.id ? (
                           <TestFormLayout
                             defaultValues={defaultValues}
                             title="Edit Expense"
                             changeRedirect={this.changeRedirect}
                             formProp={editformProp}
                             fields={fields}
                           />
                         ) : <Redirect to="/erp/inventory/expenses" />)}
                />
                <Route
                  exact
                  path='/erp/inventory/expenses/add'
                  render={() => (
<TestFormLayout
  title="Add Expenses"
  changeRedirect={this.changeRedirect}
  formProp={formProp}
  fields={fields}
  defaultValues={defaultValues}
/>
)}
                />
            </Card>
            {this.state.redirect && <Redirect to="/erp/inventory/expenses" />}
</Row>
)

    }
}
