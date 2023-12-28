import React from 'react';
import {Card, Form} from "antd";
import DynamicFieldsForm from "../common/DynamicFieldsForm";

export default class AddOrEditMedicine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        const MedicineForm = Form.create()(DynamicFieldsForm);
        return (
<Card title={this.props.editId ? "Edit Medicine" : "Add New Medicine"}>
            <MedicineForm />
</Card>
)
    }
}