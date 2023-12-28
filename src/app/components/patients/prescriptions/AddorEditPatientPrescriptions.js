import React from "react";
import { Route } from "react-router";

import { Button, Card, Form, Icon, Row } from "antd";
import { Redirect } from 'react-router-dom'
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
import { PRESCRIPTIONS_API, DRUG_CATALOG, ALL_PRESCRIPTIONS_API } from "../../../constants/api";
import { getAPI, interpolate, displayMessage } from "../../../utils/common";


class AddorEditPatientPrescriptions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            vitalSign: null,
            drug_catalog: this.props.drug_catalog ? this.props.drug_catalog : null,
            editPrescription: this.props.editPrescription ? this.props.editPrescription : null,
        }
        this.changeRedirect = this.changeRedirect.bind(this);
        this.loadDrugCatalog = this.loadDrugCatalog.bind(this);
    }

    componentDidMount() {
        this.loadDrugCatalog();
    }

    loadDrugCatalog() {
        if (this.state.drug_catalog == null) {
            const that = this;
            const successFn = function (data) {
                that.setState({
                    drug_catalog: data,
                })
            };
            const errorFn = function () {
            }
            getAPI(interpolate(DRUG_CATALOG, [this.props.active_practiceId]), successFn, errorFn)
        }
    }


    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });


    }

    render() {
        console.log(this.state.editPrescription)
        const drugOption = []
        if (this.state.drug_catalog) {
            this.state.drug_catalog.forEach(function (drug) {
                drugOption.push({ label: (`${drug.name}(${drug.strength})`), value: drug.id });
            })
        }
        const fields = [{
            label: "Drug",
            key: "drug",
            type: SELECT_FIELD,
            initialValue: this.state.editPrescription ? this.state.editPrescription.drug : null,
            options: drugOption
        }, {
            label: "Quantity",
            key: "quantity",
            required: true,
            initialValue: this.state.editPrescription ? this.state.editPrescription.quantity : null,
            type: NUMBER_FIELD
        }, {
            label: "cost",
            key: "cost",
            initialValue: this.state.editPrescription ? this.state.editPrescription.cost : null,
            type: INPUT_FIELD
        }, {
            label: "total",
            key: "total",
            initialValue: this.state.editPrescription ? this.state.editPrescription.total : null,
            disabled: true,
            type: INPUT_FIELD,
        }, {
            label: "active",
            key: "is_active",
            initialValue: this.state.editPrescription ? this.state.editPrescription.is_active : false,
            type: SINGLE_CHECKBOX_FIELD,
        }, {
            label: "Completed",
            key: "is_completed",
            initialValue: this.state.editPrescription ? this.state.editPrescription.is_completed : false,
            type: SINGLE_CHECKBOX_FIELD,
        },];


        let editformProp;
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        const formProp = {
            successFn(data) {
                displayMessage(SUCCESS_MSG_TYPE, "success");
                if (this.props.history) {
                    this.props.history.replace(`/erp/patient/${this.props.match.params.id}/emr/prescriptions`)
                }
            },
            errorFn() {
            },
            action: interpolate(PRESCRIPTIONS_API, [this.props.match.params.id]),
            method: "post",
        }


        let defaultValues = []
        if (this.state.editPrescription) {
            defaultValues = [{ "key": "id", "value": this.state.editPrescription.id }];
        }

        return (
            <Row>
                <Card>
                    <Route
                        exact
                        path='/erp/patient/:id/emr/prescriptions/edit'
                        render={() => (this.state.editPrescription ? (
                            <TestFormLayout
                                defaultValues={defaultValues}
                                title="Edit Invoive"
                                changeRedirect={this.changeRedirect}
                                formProp={formProp}
                                fields={fields}
                            />
                        ) :
                            <Redirect to={`/erp/patient/${this.props.match.params.id}/emr/prescriptions`} />)}
                    />

                    <Route
                        exact
                        path='/erp/patient/:id/emr/prescriptions/add'
                        render={() => (
                            <TestFormLayout
                                title="Add Prescriptions"
                                changeRedirect={this.changeRedirect}
                                formProp={formProp}
                                fields={fields}
                            />
                        )}
                    />
                </Card>
                {this.state.redirect && <Redirect to={`/erp/patient/${this.props.match.params.id}/emr/prescriptions`} />}
            </Row>
        )

    }
}

export default AddorEditPatientPrescriptions;
