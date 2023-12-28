import React from "react";
import {Form, Card, message} from "antd";
import {Redirect} from "react-router-dom";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {
    CHECKBOX_FIELD,
    SUCCESS_MSG_TYPE,
    INPUT_FIELD,
    RADIO_FIELD,
    SELECT_FIELD,
    NUMBER_FIELD
} from "../../../../constants/dataKeys";
import {PROCEDURE_CATEGORY, PRODUCT_MARGIN, TAXES} from "../../../../constants/api"
import {getAPI, displayMessage, interpolate} from "../../../../utils/common";

class AddProcedure extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            taxes: [],
            procedure_category: [],
            redirect: false,
            productMargin: []
        }
        this.loadTaxes = this.loadTaxes.bind(this);
        this.loadProcedures = this.loadProcedures.bind(this)

    }

    componentDidMount(){
        this.loadTaxes();
        this.loadProcedures();
        this.loadProductMargin();
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
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

    loadProcedures() {
        const that = this;
        const successFn = function (data) {
            console.log("get table");
            that.setState({
                procedure_category: data,
            })
        };
        const errorFn = function () {
        };
        getAPI(interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId]), successFn, errorFn);
    }

    loadTaxes() {
        const that = this;
        const successFn = function (data) {
            console.log(data.map(tax => Object.create({
                    label: tax.name,
                    value: tax.id
                })
            ));
            that.setState({
                taxes: data
            })
        }
        const errorFn = function () {
        }
        getAPI(interpolate(TAXES, [this.props.active_practiceId]), successFn, errorFn);
    }

    render() {
        const that = this;
        const formFields = [{
            label: "Procedure Name",
            key: "name",
            placeholder:"Procedure Name",
            required: true,
            type: INPUT_FIELD
        }, {
            label: "Procedure Cost",
            key: "cost",
            follow: "INR",
            required: true,
            type: NUMBER_FIELD,
        }, {
            label: "Applicable Taxes",
            key: "taxes",
            type: CHECKBOX_FIELD,
            options: this.state.taxes.map(tax => Object.create({
                    label: tax.name + (tax.tax_value ? `(${  tax.tax_value  }%)` : ''),
                    value: tax.id
                })
            )
        },
        //     {
        //     label: 'MLM Margin Type',
        //     type: SELECT_FIELD,
        //     initialValue: (this.state.editFields ? this.state.editFields.margin : null),
        //     key: 'margin',
        //     required: true,
        //     options: that.state.productMargin.map(margin => ({label: margin.name, value: margin.id}))
        // },
            {
            label: "Add Under",
            key: "under",
            type: SELECT_FIELD,
            options: [{
                label: "None",
                value: null
            }].concat(this.state.procedure_category.map(procedure => Object.create({
                label: procedure.name,
                value: procedure.id
            }))),
            initialValue: null
        }, {
            label: "Default Note",
            key: "default_notes",
            type: INPUT_FIELD
        },];
        const formProp = {
            successFn (data) {
                displayMessage(SUCCESS_MSG_TYPE, 'success');
                that.changeRedirect();
                if (that.props.history){
                    that.props.history.replace("/erp/settings/procedures");
                }
            },
            errorFn () {

            },
            action: interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId]),
            method: "post",
        }

        const TestFormLayout = Form.create()(DynamicFieldsForm);
        return (
<div>
            <Card>
                <TestFormLayout
                  title="Add Procedure"
                  changeRedirect={this.changeRedirect}
                  formProp={formProp}
                  {...this.props}
                  fields={formFields}
                />
                {this.state.redirect && <Redirect to='/erp/settings/procedures' />}
            </Card>
</div>
)
    }
}

export default AddProcedure;
