import {Card, Form, Row} from "antd";
import React from "react";
import {Route, Redirect} from "react-router-dom";
import {
    INPUT_FIELD,
    SUCCESS_MSG_TYPE,
} from "../../../constants/dataKeys";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";
import {displayMessage, getAPI, interpolate} from "../../../utils/common";
import {
    SINGLE_VENDOR_API, VENDOR_API
} from "../../../constants/api";


export default class AddVendor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editData: this.props.editData ? this.props.editData : null
        }
    }

    changeRedirect = () => {
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
        getAPI(interpolate(SINGLE_VENDOR_API, [this.props.match.params.id]), successFn, errorFn);


    }


    render() {
        const that = this;
        const fields = [{
            label: "Name",
            key: "name",
            initialValue: this.state.editData ? this.state.editData.name : null,
            type: INPUT_FIELD,
            required: true
        }, {
            label: "Description",
            key: "description",
            initialValue: this.state.editData ? this.state.editData.description : null,
            type: INPUT_FIELD
        }];


        let editformProp;
        if (this.state.editData) {
            editformProp = {
                successFn (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "success");
                    that.props.loadData();
                },
                errorFn () {

                },
                action: interpolate(SINGLE_VENDOR_API, [this.props.match.params.id]),
                method: "put",
            }
        }
        const TestFormLayout = Form.create()(DynamicFieldsForm);

        const formProp = {
            successFn (data) {
                displayMessage(SUCCESS_MSG_TYPE, "success");
                that.props.loadData();
                if (that.props.history){
                    that.props.history.replace("/erp/inventory/vendor");
                }
            },
            errorFn () {

            },
            action: interpolate(VENDOR_API, [that.props.active_practiceId]),
            method: "post",
        }
        const defaultValues = [{"key": "practice", "value": this.props.active_practiceId}];
        return (
<Row>
            <Card>
                <Route
                  exact
                  path='/erp/inventory/vendor/edit/:id'
                  render={(route) => (this.props.match.params.id ? (
                           <TestFormLayout
                             defaultValues={defaultValues}
                             title="Edit Vendor"
                             changeRedirect={this.changeRedirect}
                             formProp={editformProp}
                             {...route}
                             fields={fields}
                           />
                         ) : <Redirect to="/erp/inventory/vendor" />)}
                />
                <Route
                  exact
                  path='/erp/inventory/vendor/add'
                  render={(route) => (
<TestFormLayout
  title="Add Vendor"
  changeRedirect={this.changeRedirect}
  {...route}
  formProp={formProp}
  fields={fields}
/>
)}
                />
            </Card>
            {this.state.redirect && <Redirect to="/erp/inventory/vendor" />}
</Row>
)

    }
}
