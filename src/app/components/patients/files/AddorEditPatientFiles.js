import React from "react";
import {Form} from "antd";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";

export default class AddorEditPatientFiles extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const PatientFilesForm = Form.create()(DynamicFieldsForm);

        return (
            <div>
                <PatientFilesForm title="Add Files" />
            </div>
        )
    }
}
