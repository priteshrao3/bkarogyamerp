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

class EditProcedure extends React.Component {
    constructor(props) {

        super(props);
        this.state = {
            taxes: [],
            procedure_category: [],
            redirect: false,
            productMargin: [],
            editingProcedureData: this.props.editingProcedureData,
            loading: true
        }
        this.loadTaxes = this.loadTaxes.bind(this);
        this.loadProcedures = this.loadProcedures.bind(this)
        this.loadTaxes();
        this.loadProductMargin();
    }

    loadProductMargin() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                productMargin: data,
                loading: false
            })
        }
        const errorFn = function () {

        }
        getAPI(PRODUCT_MARGIN, successFn, errorFn);
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    componentDidMount() {
        this.setState({
            procedure_category: this.props.procedure_category,

        })
        if (this.props.match.params.id != null) {


            //     this.loadProcedures(this.props.match.params.id);

        }
    }

    loadProcedures(id) {
        const that = this;
        const url = `${interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId])}`;

        const successFn = function (data) {
            console.log("get table", data);
            that.setState({
                procedure_category: data,
                loading: false
            })
        };
        const errorFn = function () {
            this.setState({
                loading: false
            })
        };

        getAPI(url, successFn, errorFn);
    }

    loadTaxes() {
        const that = this;
        const successFn = function (data) {
            console.log(data.map(tax => Object.create({
                    label: tax.name + (tax.tax_value ? `(${  tax.tax_value  }%)` : ''),
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
            required: true,
            initialValue: this.state.editingProcedureData ? this.state.editingProcedureData.name : null,
            type: INPUT_FIELD
        }, {
            label: "Procedure Cost",
            key: "cost",
            follow: "INR",
            initialValue: this.state.editingProcedureData ? this.state.editingProcedureData.cost : null,
            required: true,
            type: NUMBER_FIELD,
        }, {
            label: "Applicable Taxes",
            key: "taxes",
            initialValue: this.state.editingProcedureData ? this.state.editingProcedureData.taxes : null,
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
            initialValue: this.state.editingProcedureData ? this.state.editingProcedureData.under : null,
        }, {
            label: "Default Note",
            key: "default_notes",
            initialValue: this.state.editingProcedureData ? this.state.editingProcedureData.default_notes : null,
            type: INPUT_FIELD
        },];
        const formProp = {
            successFn (data) {
                displayMessage(SUCCESS_MSG_TYPE, 'success');
                that.changeRedirect();
                that.props.loadProcedures();
                if (that.props.history){
                    that.props.history.replace("/erp/settings/procedures");
                }
            },
            errorFn () {

            },
            action: interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId]),
            method: "post",
        }
        let defaultValues;
        if (this.props.editingProcedureData) {
            defaultValues = [{"key": "id", "value": this.props.editingProcedureData.id}];
        }
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        return (
<div>{that.props.editingProcedureData ? (
<Card loading={that.state.loading}>
            <TestFormLayout
              {...this.props}
              title="Edit Procedure"
              defaultValues={defaultValues}
              changeRedirect={this.changeRedirect}
              formProp={formProp}
              fields={formFields}
            />
            {this.state.redirect && <Redirect to='/erp/settings/procedures' />}
</Card>
) : <Redirect to='/erp/settings/procedures' />}
</div>
)
    }
}

export default EditProcedure;
