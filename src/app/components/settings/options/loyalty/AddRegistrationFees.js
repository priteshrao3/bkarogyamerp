import React from "react";
import { Divider, Popconfirm, Row, Form } from 'antd';
import CustomizedTable from "../../../common/CustomizedTable";
import { getAPI, interpolate, postAPI, displayMessage } from "../../../../utils/common";
import { REGISTRATION } from "../../../../constants/api";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import { INPUT_FIELD, NUMBER_FIELD, SUCCESS_MSG_TYPE } from "../../../../constants/dataKeys";

export default class AddRegistrationFees extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            registrationData: []
        }
    }

    componentDidMount() {
        this.loadData();
    }

    loadData = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                registrationData: data
            })
        }
        const errorFn = function (error) {

        }
        getAPI(REGISTRATION, successFn, errorFn);
    }

    deleteObject(record) {
        const that = this;
        const reqData = {
            is_active: false,
            id: record.id,
        };
        const successFn = function (data) {
            that.loadData();
        }
        const errorFn = function () {
        }
        postAPI(REGISTRATION, reqData, successFn, errorFn);
    }

    render() {
        const that = this;
        let { registrationData } = that.state;
        const columns = [{
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'Fee (INR)',
            dataIndex: 'fee',
            key: 'fee',
        }, {
            title: 'Validity (Days)',
            dataIndex: 'validity',
            key: 'validity'
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Popconfirm
                    title="Are you sure delete this item?"
                    onConfirm={() => that.deleteObject(record)}
                    okText="Yes"
                    cancelText="No"
                >
                    <a>
                        Delete
                    </a>
                </Popconfirm>
            ),
        }];

        const fields = [{
            label: "Name ",
            key: "name",
            placeholder: "Name",
            required: true,
            type: INPUT_FIELD
        }, {
            label: "Fee",
            key: "fee",
            required: true,
            type: NUMBER_FIELD,
            follow: 'INR'
        }, {
            label: "Validity",
            key: 'validity',
            required: true,
            type: NUMBER_FIELD,
            follow: 'Days',

        }];
        const formProp = {
            successFn(data) {
                displayMessage(SUCCESS_MSG_TYPE, "Registration fees successfully created.")
                that.loadData();
            },
            errorFn(error) {

            },
            action: interpolate(REGISTRATION, [this.props.active_practiceId]),
            method: "post",
        };
        const formDefaultValues = [{ "key": "practice", "value": this.state.active_practiceId }];
        const AddForm = Form.create()(DynamicFieldsForm);

        return (
            <Row>
                <AddForm fields={fields} formProp={formProp} defaultValues={formDefaultValues} {...this.props} />
                <Divider />
                <CustomizedTable loading={this.state.loading} columns={columns} dataSource={registrationData} />
            </Row>
        )
    }
}
