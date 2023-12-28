import React from "react";
import {Card, Form, Row} from "antd";
import {Route} from "react-router";
import {Redirect} from "react-router-dom";
import {INPUT_FIELD, QUILL_TEXT_FIELD ,SUCCESS_MSG_TYPE, SINGLE_IMAGE_UPLOAD_FIELD} from "../../../../constants/dataKeys";
import {displayMessage, getAPI, interpolate} from "../../../../utils/common";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {MISSION_MANAGE_THERAPY, MISSION_MANAGE_SINGLE_THERAPY} from "../../../../constants/api";


export default class AddManageTherapy extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editTherapyData: this.props.editTherapyData ? this.props.editTherapyData : null
        }
    }

    componentDidMount() {
        if (this.props.match.params.id) {
            if (!this.state.editTherapyData) {
                this.loadData();
            }
        }
    }

    loadData() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                editTherapyData: data,
            })
        }
        const errorFn = function () {

        }
        getAPI(interpolate(MISSION_MANAGE_SINGLE_THERAPY, [this.props.match.params.id]), successFn, errorFn);

    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    render() {
        const that = this;
        const fields = [{
            label: "Therapy Name",
            key: "title",
            required: true,
            initialValue: this.state.editTherapyData ? this.state.editTherapyData.title : null,
            type: INPUT_FIELD
        },{
            label: "Therapy Image",
            key: "image",
            required: true,
            type: SINGLE_IMAGE_UPLOAD_FIELD,
        },{
            label: "Content",
            key: "content",
            // required: true,
            initialValue: this.state.editTherapyData ? this.state.editTherapyData.content : null,
            type: QUILL_TEXT_FIELD,
        },];

        let editformProp;
        if (this.state.editTherapyData) {
            editformProp = {
                successFn (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "success");
                    that.setState({
                        redirect: true
                    });
                    that.props.loadData();
                    if (that.props.history){
                        that.props.history.replace('/mission/managetherapy');
                    };
                },
                errorFn () {

                },
                action: interpolate(MISSION_MANAGE_SINGLE_THERAPY, [this.props.match.params.id]),
                method: "put",

            }
        }
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        const formProp = {
            successFn (data) {
                displayMessage(SUCCESS_MSG_TYPE, "success");
                that.setState({
                    redirect: true
                });
                that.props.loadData();
                if (that.props.history){
                    that.props.history.replace('/mission/managetherapy');
                };
            },
            errorFn () {

            },
            action: MISSION_MANAGE_THERAPY,
            method: "post",
        }
        const defaultValues = [];

        return (
<Row>
            <Card>
                <Route
                  exact
                  path='/mission/managetherapy/edit/:id'
                  render={() => (this.props.match.params.id ? (
                           <TestFormLayout
                             defaultValues={defaultValues}
                             title="Edit Therapy"
                             changeRedirect={this.changeRedirect}
                             formProp={editformProp}
                             fields={fields}
                           />
                         ) : <Redirect to="/mission/managetherapy" />)}
                />
                <Route
                  exact
                  path='/mission/managetherapy/add'
                  render={() => (
<TestFormLayout
  title="Add Therapy"
  defaultValues={defaultValues}
  changeRedirect={this.changeRedirect}
  formProp={formProp}
  fields={fields}
/>
)}
                />
            </Card>
            {this.state.redirect && <Redirect to="/mission/managetherapy" />}
</Row>
)
    }
}
