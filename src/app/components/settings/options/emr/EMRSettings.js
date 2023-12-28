import React from "react";
import {Form, Button, Card, Icon, Tabs, Divider, Tag, Row, Table} from "antd";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {CHECKBOX_FIELD, INPUT_FIELD, RADIO_FIELD, SELECT_FIELD} from "../../../../constants/dataKeys";
import TableData from "./TableData";
import {
    EMR_DIAGNOSES,
    EMR_FILETAGS,
    EMR_COMPLAINTS,
    EMR_OBSERVATIONS,
    EMR_INVESTIGATIONS,
    EMR_TREATMENTNOTES,
    EMR_VITAL_SIGNS, EMR_MEDICATION
} from "../../../../constants/api"
import VITALSINGS from "./VitalSigns";

const {TabPane} = Tabs;


class EMRSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            defaultActiveKey: this.props.location.hash
        }
    }

    render() {
        console.log("propss",this.props)
        return (
<div>
            <Row>
                <h2>EMR Settings</h2>
                <Card>
                    <Tabs defaultActiveKey={this.state.defaultActiveKey}>
                        <TabPane tab={<span><Icon type="sound" />Complaints</span>} key="#complaints">
                            <TableData {...this.props} id={EMR_COMPLAINTS} name="Complaints" />
                        </TabPane>
                        <TabPane tab={<span><Icon type="eye" />Observations</span>} key="#observations">
                            <TableData {...this.props} id={EMR_OBSERVATIONS} name="Observations" />
                        </TabPane>
                        <TabPane tab={<span><Icon type="plus-square" />Diagnoses</span>} key="#diagnoses">
                            <TableData {...this.props} id={EMR_DIAGNOSES} name="Diagnoses" />
                        </TabPane>
                        <TabPane tab={<span><Icon type="laptop" />Investigations</span>} key="#investigations">
                            <TableData {...this.props} id={EMR_INVESTIGATIONS} name="Investigations" />
                        </TabPane>
                        <TabPane tab={<span><Icon type="solution" />Notes</span>} key="#treatmentnotes">
                            <TableData {...this.props} id={EMR_TREATMENTNOTES} name="Treatment Notes" />
                        </TabPane>
                        <TabPane tab={<span><Icon type="medicine-box" />Medication</span>} key="#medication">
                            <TableData {...this.props} id={EMR_MEDICATION} name="Medication" />
                        </TabPane>
                        <TabPane tab={<span><Icon type="file" />File Labels</span>} key="#filetags">
                            <TableData {...this.props} id={EMR_FILETAGS} name="File Labels" />
                        </TabPane>
                        <TabPane tab={<span><Icon type="heart" />Vital Signs</span>} key="#vitalsigns">
                            <VITALSINGS {...this.props} />
                        </TabPane>
                    </Tabs>

                </Card>
            </Row>
</div>
)
    }
}

export default EMRSettings;
