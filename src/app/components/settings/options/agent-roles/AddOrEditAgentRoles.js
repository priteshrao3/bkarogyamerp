import React from "react";
import {Card, Form} from "antd";
import {Route} from "react-router";
import {Redirect} from "react-router-dom";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import { INPUT_FIELD, SUCCESS_MSG_TYPE} from "../../../../constants/dataKeys";
import {displayMessage,  interpolate} from "../../../../utils/common";
import {AGENT_ROLES} from "../../../../constants/api";


export default class AddOrEditAgentRoles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editRole: this.props.editRole ? this.props.editRole : null
        }
    }



    render() {
        console.log(this.state);
        console.log("prop",this.props);

        const that = this;
        const AgentRolesForm = Form.create()(DynamicFieldsForm);
        const fields = [{
            label: "Role Name",
            key: 'name',
            required: true,
            initialValue: this.state.editRole ? this.state.editRole.name : null,
            type: INPUT_FIELD
        }];

        const formProp = {
            method: "post",
            action: interpolate(AGENT_ROLES, [that.props.active_practiceId]),
            successFn () {
                displayMessage(SUCCESS_MSG_TYPE, "Roles Saved Successfully");
                if (that.props.loadData)
                    that.props.loadData();
                that.props.history.push('/erp/settings/agent-roles-roles');
            }, errorFn () {

            }
        }

        let editformProp;
        if (this.state.editRole) {
            editformProp = {
                successFn (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "success");
                    console.log(data);
                    that.props.loadData();
                    that.changeRedirect();
                },
                errorFn () {

                },
                action: interpolate(AGENT_ROLES, [this.props.match.params.id]),
                method: "put",

            }
        }


        const defaultValues = [];
        if (that.props.editRole) {
            defaultValues.push({key: 'id', value: that.props.editRole.id})
        }


        return (
<div>
            <Card>
                <Route
                  exact
                  path="/erp/settings/agent-roles/:id/edit"
                  render={(route) => (this.props.match.params.id ?
                            <AgentRolesForm title="Edit Adviser Roles" fields={fields} formProp={formProp} defaultValues={defaultValues} {...this.props} {...route} changeRedirect={this.changeRedirect} />:
                            <Redirect to="/erp/settings/agent-roles-roles" />
                        )}
                />

                <Route
                  exact
                  path='/erp/settings/agent-roles/add'
                  render={(route) => (
<AgentRolesForm
  defaultValues={defaultValues}
  title="Add Adviser Roles"
  changeRedirect={this.changeRedirect}
  formProp={formProp}
  fields={fields}
/>
)}
                />
            </Card>
            {this.state.redirect && <Redirect to="/erp/settings/agent-roles-roles" />}
</div>
)
    }
}
