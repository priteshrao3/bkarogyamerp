import React from "react";
import {Card, Button, Table, Icon} from "antd";
import {Link} from "react-router-dom";
import PatientCommunicationSetting from "./PatientCommunicationSetting";
import PatientNotes from "../patient/PatientNotes";

class PatientCommunication extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
<>
            <PatientCommunicationSetting {...this.state} {...this.props} />
            {this.props.currentPatient ? <Card><PatientNotes {...this.props} patientId={this.props.currentPatient.id} /> </Card>: null}
</>
)
    }
}

export default PatientCommunication;
