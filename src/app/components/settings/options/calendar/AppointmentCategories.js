import React from "react";
import {Button, Modal, Card, Form, Icon, Row, Table, Divider, Popconfirm, Tag} from "antd";
import {Link} from "react-router-dom";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {
    SUCCESS_MSG_TYPE,
    CHECKBOX_FIELD,
    INPUT_FIELD,
    RADIO_FIELD,
    NUMBER_FIELD,
    SELECT_FIELD
} from "../../../../constants/dataKeys";
import {APPOINTMENT_CATEGORIES} from "../../../../constants/api"
import {getAPI, displayMessage, interpolate, postAPI} from "../../../../utils/common";
import CustomizedTable from "../../../common/CustomizedTable";
import {hashCode, intToRGB} from "../../../../utils/clinicUtils";

class AppointmentCategories extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            visible: false,
            appointmentCategories: null,
            loading: true
        };
        this.loadAppointmentCategories = this.loadAppointmentCategories.bind(this);
        this.deleteObject = this.deleteObject.bind(this);

    }

    componentDidMount() {
        this.loadAppointmentCategories();
    }

    loadAppointmentCategories() {
        const that = this;
        const successFn = function (data) {
            that.setState(function (prevState) {
                data.forEach(function (obj) {
                    obj.color = intToRGB(hashCode(obj.name))
                });
                return {
                    appointmentCategories: data,
                    loading: false
                }
            })
        }
        const errorFn = function () {

        }
        getAPI(interpolate(APPOINTMENT_CATEGORIES, [this.props.active_practiceId]), successFn, errorFn)
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    editCategory(value) {
        this.setState({
            editingId: value.id,
            editingName: value.name,
            visible: true,
            loading: false
        })
    }

    deleteObject(record) {
        const that = this;
        const reqData = record;
        reqData.is_active = false;
        const successFn = function (data) {
            that.loadAppointmentCategories();
        }
        const errorFn = function () {
        };
        postAPI(interpolate(APPOINTMENT_CATEGORIES, [this.props.active_practiceId]), reqData, successFn, errorFn)
    }

    handleCancel = () => {
        this.setState({visible: false});
    }


    render() {
        const that = this;
        const columns = [{
            // title: 'Name',
            dataIndex: 'color',
            key: 'color',
            render: (color) => <Tag color={`#${  color}`}>#</Tag>
        }, {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span>
              <a onClick={() => this.editCategory(record)}>  Edit</a>
                <Divider type="vertical" />
                <Popconfirm
                  title="Are you sure delete this?"
                  onConfirm={() => that.deleteObject(record)}
                  okText="Yes"
                  cancelText="No"
                >
                  <a>Delete</a>
                </Popconfirm>
                </span>
            ),
        }];
        const fields = [{
            label: "Category name",
            key: "name",
            placeholder:"Category Name",
            required: true,
            type: INPUT_FIELD
        },];
        const editfields = [{
            label: "Category name",
            key: "name",
            required: true,
            initialValue: this.state.editingName,
            type: INPUT_FIELD
        },];
        const formProp = {
            successFn (data) {
                that.handleCancel();
                that.loadAppointmentCategories();
                console.log(data);
                console.log("sucess");
                displayMessage(SUCCESS_MSG_TYPE, "success")
            },
            errorFn () {

            },
            action: interpolate(APPOINTMENT_CATEGORIES, [this.props.active_practiceId]),
            method: "post",
        }
        const defaultValues = [];
        const editFormDefaultValues = [{"key": "id", "value": this.state.editingId}];
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        return (
<div>
            <TestFormLayout defaultValues={defaultValues} formProp={formProp} fields={fields} {...this.props} />
            <Divider />
            <CustomizedTable
              loading={this.state.loading}
              columns={columns}
              dataSource={this.state.appointmentCategories}
            />
            <Modal
              title="Edit Appointment Category"
              visible={this.state.visible}
              footer={null}
              onCancel={this.handleCancel}
            >
                <TestFormLayout defaultValues={editFormDefaultValues} formProp={formProp} fields={editfields} />
                <Button key="back" onClick={this.handleCancel}>Return</Button>,

            </Modal>
</div>
)
    }
}

export default AppointmentCategories;
