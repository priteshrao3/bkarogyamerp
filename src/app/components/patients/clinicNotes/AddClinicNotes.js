import React from "react";
import {Route} from "react-router";

import {Button, Card, Form, Icon, Row} from "antd";
import {Redirect} from 'react-router-dom'
import moment from 'moment';
import DynamicFieldsForm from "../../common/DynamicFieldsForm";
import {
    CHECKBOX_FIELD,
    DATE_PICKER,
    SINGLE_CHECKBOX_FIELD,
    NUMBER_FIELD,
    SUCCESS_MSG_TYPE,
    INPUT_FIELD,
    RADIO_FIELD,
    SELECT_FIELD
} from "../../../constants/dataKeys";
import {
    PRESCRIPTIONS_API,
    DRUG_CATALOG,
    ALL_PRESCRIPTIONS_API,
    INVOICES_API,
    PROCEDURE_CATEGORY, TAXES, PATIENT_CLINIC_NOTES_API
} from "../../../constants/api";
import {getAPI, interpolate, displayMessage} from "../../../utils/common";


class AddClinicNotes extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            drug_catalog: this.props.drug_catalog ? this.props.drug_catalog : null,
            procedure_category: this.props.procedure_category ? this.props.procedure_category : null,
            taxes_list: this.props.taxes_list ? this.props.taxes_list : null,
            editClinicNotes: this.props.editClinicNotes ? this.props.editClinicNotes : null,

        }
        this.changeRedirect = this.changeRedirect.bind(this);
        console.log("Working or not");

    }

    componentDidMount() {

    }

    loadDrugCatalog() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                drug_catalog: data
            })

        }
        const errorFn = function () {

        }
        getAPI(interpolate(DRUG_CATALOG, [this.props.active_practiceId]), successFn, errorFn)
    }

    loadProcedureCategory() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                procedure_category: data
            })

        }
        const errorFn = function () {

        }
        getAPI(interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId]), successFn, errorFn);
    }

    loadTaxes() {
        const that = this;
        const successFn = function (data) {
            console.log("get table");
            that.setState({
                taxes_list: data,
            })
        };
        const errorFn = function () {
        };
        getAPI(interpolate(TAXES, [this.props.active_practiceId]), successFn, errorFn);

    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    render() {

        const fields = [{
            label: "Name",
            key: "name",
            required: true,
            initialValue: this.state.editClinicNotes ? this.state.editClinicNotes.name : null,
            type: INPUT_FIELD
        }, {
            label: "Chief Complaints",
            key: "chief_complaints",
            initialValue: this.state.editClinicNotes ? this.state.editClinicNotes.chief_complaints : null,
            type: INPUT_FIELD
        }, {
            label: "Investigations",
            key: "investigations",
            initialValue: this.state.editClinicNotes ? this.state.editClinicNotes.investigations : null,
            type: INPUT_FIELD,
        }, {
            label: "Diagnosis",
            key: "diagnosis",
            initialValue: this.state.editClinicNotes ? this.state.editClinicNotes.diagnosis : null,
            type: INPUT_FIELD,
        }, {
            label: "Notes",
            key: "notes",
            initialValue: this.state.editClinicNotes ? this.state.editClinicNotes.notes : null,
            type: INPUT_FIELD,
        }, {
            label: "Observations",
            key: "observations",
            initialValue: this.state.editClinicNotes ? this.state.editClinicNotes.observations : null,
            type: INPUT_FIELD,
        }];


        let editformProp;
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        const that = this;
        const formProp = {
            successFn (data) {
                displayMessage(SUCCESS_MSG_TYPE, "success")
                if (that.props.loadData)
                    that.props.loadData()
                console.log(data);
            },
            errorFn () {

            },
            action: interpolate(PATIENT_CLINIC_NOTES_API, [this.props.match.params.id]),
            method: "post",
        }
        let defaultValues = [{key: 'is_active', value: true}]
        if (this.state.editClinicNotes) {
            defaultValues = [{key: 'is_active', value: true}, {"key": "id", "value": this.state.editClinicNotes.id}];
        }
        return (
<Row>
            <Card>
                <Route
                  exact
                  path='/erp/patient/:id/emr/clinicnotes/edit'
                  render={() => (this.state.editClinicNotes ? (
                           <TestFormLayout
                             defaultValues={defaultValues}
                             title="Edit Clinic notes"
                             changeRedirect={this.changeRedirect}
                             formProp={formProp}
                             fields={fields}
                           />
                         ) :
                           <Redirect to={`/patient/${  this.props.match.params.id  }/billing/invoices`} />)}
                />
                <Route
                  exact
                  path='/erp/patient/:id/emr/clinicnotes/add'
                  render={() => (
<TestFormLayout
  title="Add Clinic Notes"
  changeRedirect={this.changeRedirect}
  formProp={formProp}
  fields={fields}
/>
)}
                />


            </Card>
            {this.state.redirect && <Redirect to={`/erp/patient/${  this.props.match.params.id  }/emr/clinicnotes`} />}
</Row>
)

    }
}

export default AddClinicNotes;
