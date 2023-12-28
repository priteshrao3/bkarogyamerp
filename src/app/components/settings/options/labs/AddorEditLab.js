import React from "react";
import {Card, Divider, Row,Form} from "antd";
import {Redirect, Route} from "react-router-dom";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";

import {
    INPUT_FIELD,
    NUMBER_FIELD,
    SELECT_FIELD,
    SUCCESS_MSG_TYPE, TEXT_FIELD
} from "../../../../constants/dataKeys";
import {displayMessage, getAPI, interpolate} from "../../../../utils/common";
import {LABTEST_API, PRODUCT_MARGIN} from "../../../../constants/api";

export default class AddorEditLab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            editFields: (this.props.editTest ? this.props.editTest : null),
            productMargin: []
        }
        this.changeRedirect = this.changeRedirect.bind(this);
        this.loadProductMargin();
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
            editFields: {},
        });
    }

    loadProductMargin() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                productMargin: data
            })
        }
        const errorFn = function () {

        }
        getAPI(PRODUCT_MARGIN, successFn, errorFn);
    }

    render() {
        const that = this;
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        const fields = [{
            label: "Test Name",
            key: "name",
            placeholder:"Test Name",
            type: INPUT_FIELD,
            initialValue: (this.state.editFields ? this.state.editFields.name : null),
            required: true
        }, {
            label: "Cost",
            key: "cost",
            type: NUMBER_FIELD,
            initialValue: (this.state.editFields ? this.state.editFields.cost : null),
            required: true,
            follow: 'INR',
            min: 1
        }, {
            label: 'MLM Margin Type',
            type: SELECT_FIELD,
            initialValue: (this.state.editFields ? this.state.editFields.margin : null),
            key: 'margin',
            required: true,
            options: that.state.productMargin.map(margin => ({label: margin.name, value: margin.id}))
        }, {
            label: "Instructions",
            key: "instruction",
            placeholder:"Test Instructions",
            initialValue: (this.state.editFields ? this.state.editFields.instruction : null),
            type: TEXT_FIELD,
        }];
        const formProp = {
            successFn (data) {
                displayMessage(SUCCESS_MSG_TYPE, "success")
                that.props.loadData();
                if (that.props.history){
                    that.props.history.replace("/erp/settings/labs");
                }
            },
            errorFn () {

            },
            action: interpolate(LABTEST_API, [that.props.active_practiceId]),
            method: "post",
        };
        const defaultValues = [];
        if (this.state.editFields)
            defaultValues.push({'key': 'id', 'value': this.state.editFields.id});
        return (
<Row>
            <Route
              exact
              path='/erp/settings/labs/add'
              render={(route) => (
<TestFormLayout
  title="Add Lab"
  changeRedirect={this.changeRedirect}
  formProp={formProp}
  fields={fields}
  {...route}
/>
)}
            />
            <Route
              exact
              path='/erp/settings/labs/edit'
              render={(route) => (this.state.editFields ? (
                       <TestFormLayout
                         title="Add Lab"
                         defaultValues={defaultValues}
                         changeRedirect={this.changeRedirect}
                         {...route}
                         formProp={formProp}
                         fields={fields}
                       />
                     ) : <Redirect to="/erp/settings/labs" />)}
            />
            <Divider />
            {this.state.redirect && <Redirect to="/erp/settings/labs" />}
</Row>
)
    }
}
