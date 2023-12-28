import React from "react";
import {Card, Form, Divider, Row,Popconfirm,Table} from "antd";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {SUCCESS_MSG_TYPE,SELECT_FIELD} from "../../../../constants/dataKeys";
import {VITAL_SIGNS_API, EMR_VITAL_SIGNS} from "../../../../constants/api"
import {getAPI, interpolate, displayMessage} from "../../../../utils/common";
// import CustomizedTable from "../../../common/CustomizedTable";
import {DEFAULT_TEMPERATURE_IN,DEFAULT_BP_METHOD,DEFAULT_TEMPERATURE_METHOD} from "../../../../constants/hardData";

class VitalSigns extends React.Component {  
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            vitalSign: null,
        }
        this.changeRedirect = this.changeRedirect.bind(this);
        this.loadVitalSign =this.loadVitalSign.bind(this);

    }

    componentDidMount() {
        this.loadVitalSign();
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    loadVitalSign(){
        const that=this;
        const successFn =function (data){
            that.setState({
                vitalSign:data[data.length-1]
            })
        }
        const errorFn = function(){
            that.setState({

            })
        }
        getAPI(interpolate(EMR_VITAL_SIGNS, [that.props.active_practiceId]), successFn, errorFn);
    }

    render() {
        const fields = [{
            label: "Default temperature measurement in",
            key: "temperature_unit",
            type: SELECT_FIELD,
            initialValue:this.state.vitalSign ? this.state.vitalSign.temperature_unit:null,
            options: DEFAULT_TEMPERATURE_IN.map(Temp_in => ({label: Temp_in.label, value: Temp_in.value}))
        }, {
            label: "Default temperature measurement method",
            key: "temperature_method",
            type: SELECT_FIELD,
            initialValue:this.state.vitalSign ? this.state.vitalSign.temperature_method:null,
            options: DEFAULT_TEMPERATURE_METHOD.map(TempMethod =>({label:TempMethod.label ,value:TempMethod.value}))
        },{
            label: "Default blood pressure measurement method",
            key: "blood_pressure_method",
            initialValue:this.state.vitalSign ? this.state.vitalSign.blood_pressure_method:null,
            type: SELECT_FIELD,
            options:DEFAULT_BP_METHOD.map(BPMETHOD =>({label:BPMETHOD.label , value:BPMETHOD.value}))
        }];

        const defaultValues = [{ key: 'practice', value: this.props.active_practiceId}, {
            "key": "id",
            "value": this.state.vitalSign ? this.state.vitalSign.id : null,
        }];

        const TestFormLayout = Form.create()(DynamicFieldsForm);
    
        const formProp = {
            successFn (data) {
                displayMessage(SUCCESS_MSG_TYPE, "success")
            },
            errorFn () {

            },
            action: interpolate(EMR_VITAL_SIGNS, [this.props.active_practiceId]),
            method: "post",
        }

        return (
<Row>
                <TestFormLayout defaultValues={defaultValues} formProp={formProp} fields={fields} />
</Row>
)

    }
}

export default VitalSigns;
