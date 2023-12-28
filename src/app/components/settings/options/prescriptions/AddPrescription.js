import React from "react";
import {Form, Card, message} from "antd";
import {Redirect, Route} from 'react-router-dom'
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {
    CHECKBOX_FIELD,
    SUCCESS_MSG_TYPE,
    INPUT_FIELD,
    RADIO_FIELD,
    NUMBER_FIELD,
    SELECT_FIELD
} from "../../../../constants/dataKeys";
import {DRUG_CATALOG, DRUG_TYPE_API, INVENTORY_ITEM_API, OFFERS, SINGLE_DRUG_CATALOG} from "../../../../constants/api";
import {getAPI, displayMessage, deleteAPI, interpolate} from "../../../../utils/common";
import {DRUG} from "../../../../constants/hardData";
import AddorEditPrescriptionForm from "./AddorEditPrescriptionForm";


class AddPrescription extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            editPrescreption: this.props.editCatalog ? this.props.editCatalog : null,
            drugTypeList: []

        }
        this.changeRedirect = this.changeRedirect.bind(this);
        this.setFormParams = this.setFormParams.bind(this);
        this.loadDrugType = this.loadDrugType.bind(this);
    }

    componentWillMount() {
        this.loadDrugType();
        const that = this;
        if (this.props.match.params.drugId) {
            const successFn = function (data) {
                that.setState({
                    editPrescreption: data
                })
            };
            const errorFn = function () {
            };
            getAPI(interpolate(SINGLE_DRUG_CATALOG, [this.props.active_practiceId, this.props.match.params.drugId]), successFn, errorFn);
        }
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    loadDrugType() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                drugTypeList: data
            })
        }
        const errorFn = function () {
        }
        getAPI(DRUG_TYPE_API, successFn, errorFn);
    }

    setFormParams(type, value) {
        this.setState({
            [type]: value
        })
    }

    render() {
        const drugTypeOptions = []
        if (this.state.drugType) {
            this.state.drugType.forEach(function (drug) {
                drugTypeOptions.push({label: (drug.name), value: drug.id});
            })
        }
        const that = this;
        const drugTypeField = (this.state.drugType && this.state.drugType == INPUT_FIELD ?
            {
                label: "Drug Type",
                key: "drug_type_extra",
                required: true,
                initialValue: this.state.editPrescreption ? this.state.editPrescreption.drug_type_extra : null,
                type: INPUT_FIELD,
                follow: <a onClick={() => that.setFormParams('drugType', SELECT_FIELD)}>Choose Drug Type</a>
            } : {
                label: "Drug Type",
                key: "drug_type",
                required: true,
                initialValue: this.state.editPrescreption ? this.state.editPrescreption.drug_type : null,
                type: SELECT_FIELD,
                options: that.state.drugTypeList.map(drug => ({label: drug.name, value: drug.id})),
                follow: <a onClick={() => that.setFormParams('drugType', INPUT_FIELD)}>Add New Drug Type</a>
            });
        const drugUnitField = (this.state.drugUnit && this.state.drugUnit == INPUT_FIELD ?
            {
                label: "Dosage Unit",
                key: "unit_type_extra",
                required: true,
                initialValue: this.state.editPrescreption ? this.state.editPrescreption.unit_type_extra : null,
                type: INPUT_FIELD,
                follow: <a onClick={() => that.setFormParams('drugUnit', SELECT_FIELD)}>Choose Drug Type</a>
            } : {
                label: "Dosage Unit",
                key: "stength_unit",
                required: true,
                initialValue: this.state.editPrescreption ? this.state.editPrescreption.stength_unit : null,
                type: SELECT_FIELD,
                options: that.state.drugTypeList.map(drug => ({label: drug.name, value: drug.id})),
                follow: <a onClick={() => that.setFormParams('drugUnit', INPUT_FIELD)}>Add New Drug Unit</a>
            });
        const fields = [{
            label: "Name",
            key: "name",
            initialValue: this.state.editPrescreption ? this.state.editPrescreption.name : null,
            required: true,
            type: INPUT_FIELD
        }, drugTypeField, {
            label: "Dosage",
            key: "strength",
            required: true,
            initialValue: this.state.editPrescreption ? this.state.editPrescreption.strength : null,
            type: NUMBER_FIELD
        }, drugUnitField, {
            label: "Instructions ",
            key: "instructions",
            required: true,
            initialValue: this.state.editPrescreption ? this.state.editPrescreption.instructions : null,
            type: INPUT_FIELD
        },];
        // const formProp={
        //   successFn:function(data){
        //     console.log(data);
        //     displayMessage(SUCCESS_MSG_TYPE, "success")
        //
        //   },
        //   errorFn:function(){
        //
        //   },
        //   action: interpolate(OFFERS,[this.props.active_practiceId]),
        //   method: "post",
        // }
        const formProp = {
            successFn (data) {
                // console.log(data);
                displayMessage(SUCCESS_MSG_TYPE, "success")
                that.props.loadData();
                if (that.props.history){
                    that.props.history.replace("/erp/settings/prescriptions");
                }
            },
            errorFn () {

            },
            // onFieldsDataChange:
            // },
            action: INVENTORY_ITEM_API,
            method: "post",
        }
        const TestFormLayout = Form.create({
            onValuesChange (props, changedValues, allValues) {
                // console.log(changedValues, allValues);
                that.setState(function (prevState) {
                    return {editPrescreption: {...prevState.editPrescreption, ...changedValues}}
                });
            }
        })(DynamicFieldsForm);
        const defaultValues = [{key: 'practice', value: this.props.active_practiceId}, {key: 'item_type', value: DRUG}];
        if (this.state.editPrescreption) {
            defaultValues.push({key: 'id', value: this.state.editPrescreption.id})
        }
        return (
<div>
            <Card>
                <Route
                  exact
                  path="/erp/settings/prescriptions/add"
                  render={() => (
<AddorEditPrescriptionForm
  key="Add Prescriptions"
  title="Add Prescriptions"
  formProp={formProp}
  changeRedirect={this.changeRedirect}
  fields={fields}
/>
)}
                />
                <Route
                  exact
                  path="/erp/settings/prescriptions/edit"
                  render={(route) => this.state.editPrescreption && this.state.editPrescreption.id ? (
                           <TestFormLayout
                             key="Edit Prescriptions"
                             title="Edit Prescriptions"
                             defaultValues={defaultValues}
                             formProp={formProp}
                             changeRedirect={this.changeRedirect}
                             fields={fields}
                           />
                         ) : null}
                />

                {this.state.redirect && <Redirect to='/erp/settings/prescriptions' />}

            </Card>
</div>
)
    }
}

export default AddPrescription;
