import React from "react";
import {Form, Popconfirm, Row, Divider} from 'antd';
import {displayMessage, getAPI, interpolate, postAPI} from "../../../utils/common";
import {PATIENT_GROUPS} from "../../../constants/api";
import CustomizedTable from "../../common/CustomizedTable";
import {INPUT_FIELD, SUCCESS_MSG_TYPE} from "../../../constants/dataKeys";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";

export default class PatientGroups extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            patientGroup: [],
            loading: true
        }
    }

    componentDidMount() {
        this.getPatientGroup();
    }

    getPatientGroup = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                patientGroup: data,
                loading: false
            });
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })

        };
        getAPI(interpolate(PATIENT_GROUPS, [this.props.active_practiceId]), successFn, errorFn);
    }

    deleteObject(record) {
        const that = this;
        const reqData = record;
        reqData.is_active = false;
        const successFn = function () {
            that.getPatientGroup();
        }
        const errorFn = function () {
        }
        postAPI(interpolate(PATIENT_GROUPS, [this.props.active_practiceId]), reqData, successFn, errorFn);
    }

    render() {
        const that = this;
        const coloumns = [{
            title: 'Group Name',
            dataIndex: 'name',
            key: 'name'
        }, {
            title: 'Patient Count',
            dataIndex: 'patient_count',
            key: 'patient_count'
        }, {
            title: 'Action',
            key: 'id',
            dataIndex:'id',
            render: (text, record) => (
                <Popconfirm
                  title="Are you sure delete this prescription?"
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
            label: "Group Name",
            key: "name",
            required: true,
            type: INPUT_FIELD
        }]
        const formProp = {
            successFn(data) {
                console.log(data);
                displayMessage(SUCCESS_MSG_TYPE, "Group created successfully!!")
                that.getPatientGroup()

            },
            errorFn() {

            },
            action: interpolate(PATIENT_GROUPS, [this.props.active_practiceId]),
            method: "post"
        }
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        return (
            <Row>
                <TestFormLayout

                  formProp={formProp}
                  title="Patient Groups"
                  fields={fields}

                />
                <Divider />
                <CustomizedTable dataSource={this.state.patientGroup} loading={this.state.loading} columns={coloumns} />
            </Row>
        )
    }
}
