import React from "react";
import {Route} from "react-router";

import {Card, Form, Row} from "antd";
import {Redirect} from 'react-router-dom'
import moment from "moment";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";
import {DATE_PICKER, NUMBER_FIELD, SELECT_FIELD, SUCCESS_MSG_TYPE, TEXT_FIELD} from "../../../constants/dataKeys";
import {VITAL_SIGNS_API} from "../../../constants/api";
import {displayMessage, interpolate} from "../../../utils/common";


class AddorEditPatientVitalSigns extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            vitalSign: null,
            editVitalSign: this.props.editVitalSign ? this.props.editVitalSign : null,

        }
        this.changeRedirect = this.changeRedirect.bind(this);

    }


    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    render() {
        const fields = [{
            label: "Pulse",
            key: "pulse",
            // required: true,
            initialValue: this.props.editVitalSign ? this.props.editVitalSign.pulse : null,
            type: NUMBER_FIELD,
            follow: 'BPM'
        }, {
            label: "Temperature",
            key: "temperature",
            initialValue: this.props.editVitalSign ? this.props.editVitalSign.temperature : null,
            type: NUMBER_FIELD,
            follow: 'Fahrenheit'
        }, {
            label: "Temperature Part",
            key: "temperature_part",
            type: SELECT_FIELD,
            initialValue: this.props.editVitalSign ? this.props.editVitalSign.temperature_part : null,
            options: [{label: "forehead", value: "forehead"}, {label: "armpit", value: "armpit"}, {
                label: "oral ",
                value: "oral"
            }]
        }, {
            label: "Blood Pressure Up",
            key: "blood_pressure_up",
            initialValue: this.props.editVitalSign ? this.props.editVitalSign.blood_pressure_up : null,
            type: NUMBER_FIELD,
            follow: 'mmhg'
        }, {
            label: "Blood Pressure Down",
            key: "blood_pressure_down",
            initialValue: this.props.editVitalSign ? this.props.editVitalSign.blood_pressure_down : null,
            type: NUMBER_FIELD,
            follow: 'mmhg'
        }, {
            label: "Position",
            key: "position",
            type: SELECT_FIELD,
            initialValue: this.props.editVitalSign ? this.props.editVitalSign.position : null,
            options: [{label: "standing", value: "standing"}, {label: "sitting", value: "sitting"}]
        }, {
            label: "Weight",
            key: "weight",
            initialValue: this.props.editVitalSign ? this.props.editVitalSign.weight : null,
            type: NUMBER_FIELD,
            follow: 'kg.'
        }, {
            label: "Resp Rate",
            key: "resp_rate",
            initialValue: this.props.editVitalSign ? this.props.editVitalSign.resp_rate : null,
            type: NUMBER_FIELD,
            follow: 'breaths/min'
        }, {
            label: "Creatinine Level",
            key: "creatinine",
            initialValue: this.props.editVitalSign ? this.props.editVitalSign.creatinine : null,
            type: NUMBER_FIELD,
        }, {
            label: "Haemoglobin Level",
            key: "haemoglobin",
            initialValue: this.props.editVitalSign ? this.props.editVitalSign.haemoglobin : null,
            type: NUMBER_FIELD,
        }, {
            label: "Urea Level",
            key: "urea",
            initialValue: this.props.editVitalSign ? this.props.editVitalSign.urea : null,
            type: NUMBER_FIELD,
        }, {
            label: "Uric Acid Level",
            key: "uric_acid",
            initialValue: this.props.editVitalSign ? this.props.editVitalSign.uric_acid : null,
            type: NUMBER_FIELD,
        },{
            label: "Remarks",
            key: "remarks",
            initialValue: this.props.editVitalSign ? this.props.editVitalSign.remarks : null,
            type: TEXT_FIELD,
        },{
            label:'Date',
            key:'date',
            initialValue:this.props.editVitalSign && this.props.editVitalSign.date ?this.props.editVitalSign.date:moment(),
            type:DATE_PICKER,
            required:true,
        }];


        let editformProp;
        const defaultValues = [{key: 'patient', value: this.props.match.params.id}, {
            key: 'practice',
            value: this.props.active_practiceId
        }];
        const that = this;
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        if (this.state.editVitalSign) {
            editformProp = {
                successFn (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "success")
                    if (that.props.loadData){
                        that.props.loadData();
                    }
                    if (that.props.history){
                        that.props.history.replace(`/patient/${ that.props.match.params.id }/emr/vitalsigns`)
                    }

                },
                errorFn () {

                },
                action: interpolate(VITAL_SIGNS_API, [this.props.match.params.id]),
                method: "post",
            }
            defaultValues.push({"key": "id", "value": this.state.editVitalSign.id})
        }
        const formProp = {
            successFn (data) {
                displayMessage(SUCCESS_MSG_TYPE, "success")
                if (that.props.loadData) {
                    that.props.loadData();
                }
                if (that.props.history){
                    that.props.history.replace(`/patient/${ that.props.match.params.id }/emr/vitalsigns`)
                }
            },
            errorFn () {

            },
            action: interpolate(VITAL_SIGNS_API, [this.props.match.params.id]),
            method: "post",
        }


        return (
<Row>
            <Card>
                <Route
                  exact
                  path='/erp/patient/:id/emr/vitalsigns/edit'
                  render={() => (this.state.editVitalSign ? (
                           <TestFormLayout
                             defaultValues={defaultValues}
                             title="Edit Report Manual"
                             changeRedirect={this.changeRedirect}
                             formProp={editformProp}
                             fields={fields}
                           />
                         ) :
                           <Redirect to='/erp/patients/profile' />)}
                />
                <Route
                  exact
                  path='/erp/patient/:id/emr/vitalsigns/add'
                  render={() => (
<TestFormLayout
  title="Add Report Manual"
  defaultValues={defaultValues}
  changeRedirect={this.changeRedirect}
  formProp={formProp}
  fields={fields}
/>
)}
                />


            </Card>
            {this.state.redirect && <Redirect to={`/erp/patient/${  this.props.match.params.id  }/emr/vitalsigns`} />}
</Row>
)

    }
}

export default AddorEditPatientVitalSigns;
