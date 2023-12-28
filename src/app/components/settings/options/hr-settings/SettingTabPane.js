import React from "react";
import {Button, Modal, Card, Form, Icon, Row, Table, Divider, Popconfirm} from "antd";
import {Link} from "react-router-dom";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {
    CHECKBOX_FIELD,
    SUCCESS_MSG_TYPE,
    INPUT_FIELD,
    RADIO_FIELD,
    NUMBER_FIELD,
    SELECT_FIELD
} from "../../../../constants/dataKeys";
import {getAPI, displayMessage, interpolate, postAPI, putAPI} from "../../../../utils/common";
import CustomizedTable from "../../../common/CustomizedTable";

class SettingTabPane extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            visible: false,
            data: null,
            loading: true
        }
        this.loadData = this.loadData.bind(this);
        this.deleteObject = this.deleteObject.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                data,
                loading: false
            })
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };

        getAPI(this.props.item.api, successFn, errorFn, {name: this.props.item.label});
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    editFunction(value) {
        this.setState({
            editingId: value.id,
            editingName: value.value,
            visible: true,
            loading: false
        })
    }

    handleCancel = () => {
        this.setState({visible: false});
    }

    deleteObject(record) {
        const that = this;
        const reqData = record;
        reqData.is_active = false;
        const successFn = function (data) {
            displayMessage(SUCCESS_MSG_TYPE,`${that.props.item.label} deleted successfully!`)
            that.loadData();
        }
        const errorFn = function () {
        };
        putAPI(`${this.props.item.api + reqData.id  }/`, reqData, successFn, errorFn)
    }

    render() {
        const that = this;
        const columns = [{
            title: 'Name',
            dataIndex: 'value',
            key: 'value',
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span>
              <a onClick={() => this.editFunction(record)}>  Edit</a>
                <Divider type="vertical" />
                    <Popconfirm
                      title="Are you sure delete this item?"
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
            label: this.props.item.label,
            key: "value",
            required: true,
            type: INPUT_FIELD
        },];
        const editfields = [{
            label: this.props.item.label,
            key: "value",
            required: true,
            initialValue: this.state.editingName,
            type: INPUT_FIELD
        },];
        const formProp = {
            successFn(data) {
                that.handleCancel();
                that.loadData();
                displayMessage(SUCCESS_MSG_TYPE, `${that.props.item.label} Successfully Recorded!!`)

            },
            errorFn() {

            },
            action: this.props.item.api,
            method: "post",
        };
        const defaultValues = [{"key": "practice", "value": this.props.active_practiceId}, {
            "key": "name",
            value: this.props.item.label
        }]
        const editFormDefaultValues = [{"key": "practice", "value": this.props.active_practiceId},
            {"key": "name", value: this.props.item.label}, {
                "key": "id",
                "value": this.state.editingId
            }]

        const TestFormLayout = Form.create()(DynamicFieldsForm);
        return (
            <div>
                <TestFormLayout defaultValues={defaultValues} formProp={formProp} fields={fields} />
                <Divider />
                <CustomizedTable
                  loading={this.state.loading}
                  columns={columns}
                  dataSource={this.state.data}
                  hideReport
                  expandedRowRender={undefined}

                />
                <Modal
                  title={`Edit ${this.props.item.label}`}
                  visible={this.state.visible}
                  footer={null}
                  onCancel={this.handleCancel}
                >
                    <TestFormLayout
                      defaultValues={editFormDefaultValues}
                      formProp={{...formProp, action: `${this.props.item.api + this.state.editingId  }/`,method:"put"}}
                      fields={editfields}
                    />
                    <Button key="back" onClick={this.handleCancel}>Return</Button>,

                </Modal>
            </div>
        )
    }
}

export default SettingTabPane;
