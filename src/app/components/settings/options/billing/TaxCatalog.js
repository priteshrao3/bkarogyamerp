import React from "react";
import {Button, Modal, Card, Form, Icon, Row, Table, Divider, Popconfirm} from "antd";
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
import {PAYMENT_MODES, TAXES} from "../../../../constants/api"
import {getAPI, displayMessage, interpolate, postAPI} from "../../../../utils/common";
import CustomizedTable from "../../../common/CustomizedTable";

class TaxCatalog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            visible: false,
            taxes: null,
            loading:true
        };
        this.loadData = this.loadData.bind(this);
        this.deleteObject = this.deleteObject.bind(this);

    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        const that = this;
        const successFn = function (data) {
            console.log("get table");
            that.setState({
                taxes: data,
                loading:false
            })
        };
        const errorFn = function () {
            that.setState({
                loading:false
            })
        };
        getAPI(interpolate(TAXES, [this.props.active_practiceId]), successFn, errorFn);
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    editTax(value) {
        this.setState({
            editingId: value.id,
            editingName: value.name,
            editingValue: value.tax_value,

            visible: true,
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
            that.loadData();
        }
        const errorFn = function () {
        };
        postAPI(interpolate(TAXES, [this.props.active_practiceId]), reqData, successFn, errorFn)
    }

    render() {
        const that = this;
        const columns = [{
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'Tax Value',
            dataIndex: 'tax_value',
            key: 'tax_value',
            render: (text, record) => (<span>{text} %</span>)
        }, {
            title: 'Actions',
            key: 'action',
            render: (text, record) => (
                <span>
              {/* <a onClick={() => this.editTax(record)}>  Edit</a> */}
                {/* <Divider type="vertical"/> */}
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
            label: "Tax name",
            key: "name",
            placeholder:"Tax Name",
            required: true,
            type: INPUT_FIELD
        }, {
            label: "Tax Value",
            key: "tax_value",
            follow: "%",
            max: 100,
            min: 0,
            required: true,
            type: NUMBER_FIELD
        },];
        const editfields = [{
            label: "Tax name",
            key: "name",
            required: true,
            initialValue: this.state.editingName,
            type: INPUT_FIELD
        }, {
            label: "Tax Value",
            key: "tax_value",
            follow: "%",
            max: 100,
            min: 0,
            required: true,
            initialValue: this.state.editingValue,

            type: NUMBER_FIELD
        },];
        const formProp = {
            successFn (data) {
                that.handleCancel();
                that.loadData();
                console.log(data);
                console.log("sucess");
                displayMessage(SUCCESS_MSG_TYPE, "success")
            },
            errorFn () {

            },
            action: interpolate(TAXES, [this.props.active_practiceId]),
            method: "post",
        }
        const defaultValues = [{"key": "practice", "value": this.props.active_practiceId}];
        const editFormDefaultValues = [{"key": "practice", "value": this.props.active_practiceId}, {
            "key": "id",
            "value": this.state.editingId
        }];
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        return (
<div>
            <TestFormLayout defaultValues={defaultValues} formProp={formProp} fields={fields} {...this.props} />
            <Divider />
            <CustomizedTable loading={this.state.loading} columns={columns} dataSource={this.state.taxes} />
            <Modal
              title="Edit Tax"
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

export default TaxCatalog;
