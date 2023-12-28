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
import {TREATMENTPLANS_API, PROCEDURE_CATEGORY, ALL_TREATMENTPLANS_API, PRODUCT_MARGIN} from "../../../constants/api";
import {getAPI, interpolate, displayMessage} from "../../../utils/common";


class AddorEditPatientTreatmentPlans extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            vitalSign: null,
            productMargin: [],
            procedure_category: this.props.procedure_category ? this.props.procedure_category : null,
            editTreatmentPlan: this.props.editTreatmentPlan ? this.props.editTreatmentPlan : null,
            currentPatient:this.props.match.params.id,
        }
        this.changeRedirect = this.changeRedirect.bind(this);
        this.loadDrugCatalog = this.loadDrugCatalog.bind(this);
        this.loadProductMargin = this.loadProductMargin.bind(this);
        this.loadTreatmentPlans =this.loadTreatmentPlans.bind(this);

    }

    componentDidMount() {
        this.loadProductMargin();
        this.loadDrugCatalog();

    }

    loadTreatmentPlans(){
        const incompleted=[];
      const that = this;
      const successFn =function (data){
        that.setState({
          treatmentPlans:data,
          loading:false
        })
          data.forEach(function (treatmentplan) {
              if(!treatmentplan.is_completed){
                  incompleted.push(treatmentplan)
              }
          })
          that.setState({
              incompletedTreatmentPlans:incompleted,
              loading:false
          })
      }
      const errorFn = function (){
        that.setState({
          loading:false
        })

      }
      getAPI(interpolate(TREATMENTPLANS_API,[this.props.match.params.id,null]), successFn, errorFn)
    }

    loadProductMargin() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                productMargin: data
            })
            // console.log("log", that.state.productMargin);
        }
        const errorFn = function () {

        }
        getAPI(PRODUCT_MARGIN, successFn, errorFn);
    }

    loadDrugCatalog() {
        if (this.state.procedure_category == null) {
            const that = this;
            const successFn = function (data) {
                that.setState({
                    procedure_category: data,

                })
            }
            const errorFn = function () {

            }
            getAPI(interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId]), successFn, errorFn)
        }
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    render() {
        const drugOption = []
        if (this.state.procedure_category) {
            this.state.procedure_category.forEach(function (drug) {
                drugOption.push({label: (drug.name), value: drug.id});
            })
        }
        const fields = [{
            label: "Procedure",
            key: "procedure",
            type: SELECT_FIELD,
            initialValue: this.state.editTreatmentPlan ? this.state.editTreatmentPlan.procedure : null,
            options: drugOption
        }, {
            label: "Quantity",
            key: "quantity",
            required: true,
            initialValue: this.state.editTreatmentPlan ? this.state.editTreatmentPlan.quantity : null,
            type: INPUT_FIELD
        }, {
            label: "cost",
            key: "cost",
            initialValue: this.state.editTreatmentPlan ? this.state.editTreatmentPlan.cost : null,
            type: INPUT_FIELD
        }, {
            label: 'MLM Margin Type',
            type: SELECT_FIELD,
            initialValue: (this.state.editTreatmentPlan ? this.state.editTreatmentPlan.margin : null),
            key: 'margin',
            required: true,
            options: this.state.productMargin.map(margin => ({label: margin.name, value: margin.id}))
        }, {
            label: "total",
            key: "total",
            initialValue: this.state.editTreatmentPlan ? this.state.editTreatmentPlan.total : null,
            type: INPUT_FIELD,
        }, {
            label: "Completed",
            key: "is_completed",
            initialValue: this.state.editTreatmentPlan ? this.state.editTreatmentPlan.is_completed : false,
            type: SINGLE_CHECKBOX_FIELD,
        },];


        const that =this;
        const formProp = {
            successFn (data) {
                displayMessage(SUCCESS_MSG_TYPE, "success")
                that.loadTreatmentPlans();
                // console.log(data);
                if (that.props.history){
                    that.props.history.replace(`/erp/patient/${  that.props.match.params.id  }/emr/plans`);
                }

            },
            errorFn () {

            },
            beforeSend (values){
                const reqData={
                    treatment:[],
                    patient:that.props.match.params.id
                }
                reqData.treatment.push(values);
                return reqData;
            },

            action: interpolate(TREATMENTPLANS_API, [this.props.match.params.id,true]),
            method: "post",
        }

        const TestFormLayout = Form.create()(DynamicFieldsForm);

        const defaultValues = [{"key": "practice", "value": this.props.active_practiceId}];
        if (this.state.editTreatmentPlan)
            defaultValues.push({"key": "id", "value": this.props.editTreatmentPlan.id});
        return (
<Row>
            <Card>
                <Route
                  exact
                  path='/erp/patient/:id/emr/plans/edit'
                  render={() => (this.state.editTreatmentPlan ? (
                           <TestFormLayout
                             defaultValues={defaultValues}
                             title="Edit Invoive"
                             changeRedirect={this.changeRedirect}
                             formProp={formProp}
                             fields={fields}
                           />
                         ) :
                           <Redirect to={`/erp/patient/${  this.props.match.params.id  }/emr/plans`} />)}
                />
                <Route
                  exact
                  path='/erp/patient/:id/emr/plans/add'
                  render={() => (
<TestFormLayout
  title="Add Treatment Plans"
  changeRedirect={this.changeRedirect}
  formProp={formProp}
  fields={fields}
/>
)}
                />


            </Card>
            {this.state.redirect && <Redirect to={`/erp/patient/${  this.props.match.params.id  }/emr/plans`} />}
</Row>
)

    }
}

export default AddorEditPatientTreatmentPlans;
