import React from "react";
import {Divider,Form} from "antd";
import {displayMessage, getAPI, interpolate} from "../../../utils/common";
import {AGENT_ROLES, PATIENT_PROFILE} from "../../../constants/api"
import {SUCCESS_MSG_TYPE, SELECT_FIELD, SINGLE_IMAGE_UPLOAD_FIELD, INPUT_FIELD} from "../../../constants/dataKeys";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";

export default class AddOrEditAgent extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            redirect:false,
            currentPatient: this.props.currentPatient,
            agentRoles:[],

        }
        this.loadAgentRoles =this.loadAgentRoles.bind(this);
    }

    componentDidMount() {
        this.loadAgentRoles();
    }

    loadAgentRoles(){
        const that=this;
        const successFn =function (data){
            that.setState({
                agentRoles:data,
                loading:false
            })
        };
        const errorFn = function(){
            that.setState({
                loading:false
            })
        };
        getAPI(AGENT_ROLES,successFn,errorFn);

    }

    render(){
        const that = this;
        const fields = [{
            label: "Role Type",
            key: "role",
            type: SELECT_FIELD,
            options: this.state.agentRoles.map(roles => ({label: roles.name, value: roles.id}))
        },{
            label:"Document Upload",
            key:'aadhar_upload',
            type:SINGLE_IMAGE_UPLOAD_FIELD,
            required:true
        }];
            const formProp = {
                successFn (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "Agent Role added");
                    that.props.loadProfile();

                },
                errorFn () {

                },
                action: interpolate(PATIENT_PROFILE, [this.props.patientId]),
                method: "put"
            }
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        const defaultValues = [{key:'is_agent' , value:true}]

        return<TestFormLayout formProp={formProp} defaultValues={defaultValues} fields={fields} />
    }
}