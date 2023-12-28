import {Card, Form, Row} from "antd";
import React from "react";
import {Route} from "react-router";
import {Redirect} from "react-router-dom";
import {
    INPUT_FIELD,
    SUCCESS_MSG_TYPE,
    TEXT_FIELD,
} from "../../../constants/dataKeys";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";
import {displayMessage, getAPI, interpolate} from "../../../utils/common";
import {
    MANUFACTURER_API, SINGLE_MANUFACTURER_API, SINGLE_VENDOR_API
} from "../../../constants/api";
import PermissionDenied from "../../common/errors/PermissionDenied";


export default class AddManufacture extends React.Component {
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
        getAPI(interpolate(SINGLE_MANUFACTURER_API, [this.props.match.params.id]), successFn, errorFn);


    }


    render() {

        const that = this;
        const fields = [{
            label: "Name",
            key: "name",
            initialValue: this.state.editData ? this.state.editData.name : null,
            type: INPUT_FIELD
        },{
            label: 'Details',
            key: 'description',
            initialValue:this.state.editData?this.state.editData.description:null,
            type:TEXT_FIELD
        },
        ];


        let editformProp;
        if (this.state.editData) {
            editformProp = {
                successFn (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "success");
                    that.props.loadData();
                    if (that.props.history){
                        that.props.history.replace("/erp/inventory/manufacture");
                    }
                },
                errorFn () {

                },
                action: interpolate(SINGLE_MANUFACTURER_API, [this.props.match.params.id]),
                method: "put",

            }
        }
        const TestFormLayout = Form.create()(DynamicFieldsForm);

        const formProp = {
            successFn (data) {
                displayMessage(SUCCESS_MSG_TYPE, "success");
                that.props.loadData();
                if (that.props.history){
                    that.props.history.replace("/erp/inventory/manufacture");
                }
            },
            errorFn () {

            },
            action: MANUFACTURER_API,
            method: "post",
        }
        const defaultValues = [{"key": "practice", "value": this.props.active_practiceId}];
        return (
<Row>
            <Card>
                <Route
                  path='/erp/inventory/manufacture/edit/:id'
                  render={(route) => (this.props.match.params.id ? (
                           <TestFormLayout
                             defaultValues={defaultValues}
                             title="Edit Manufacturer"
                             changeRedirect={this.changeRedirect}
                             formProp={editformProp}
                             {...route}
                             fields={fields}
                           />
                         ) : <Redirect to="/erp/inventory/manufacture" />)}
                />
                <Route
                  exact
                  path='/erp/inventory/manufacture/add'
                  render={(route) => (that.props.activePracticePermissions.EditManufacturer || that.props.allowAllPermissions ? (
                            <TestFormLayout
                              title="Add Manufacturer"
                              changeRedirect={this.changeRedirect}
                              {...route}
                              formProp={formProp}
                              fields={fields}
                            />
                          ):<PermissionDenied />)}
                />


            </Card>
            {this.state.redirect && <Redirect to="/erp/inventory/manufacture" />}
</Row>
)

    }
}
