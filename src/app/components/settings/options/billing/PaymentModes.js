import React from "react";
import {Button, Modal, Form, Table, Divider, Popconfirm} from "antd";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {
    SUCCESS_MSG_TYPE,
    INPUT_FIELD,
    NUMBER_FIELD,
    SELECT_FIELD
} from "../../../../constants/dataKeys";
import {PAYMENT_MODES} from "../../../../constants/api"
import {getAPI, displayMessage, interpolate, postAPI} from "../../../../utils/common";
import {PAYMENT_TYPES} from "../../../../constants/hardData";
import CustomizedTable from "../../../common/CustomizedTable";

class PaymentModes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            visible: false,
            modes: null,
        }
        this.loadData = this.loadData.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        const that = this;
        const successFn = function (data) {
            console.log("get table");
            that.setState({
                modes: data,
            })
        };
        const errorFn = function () {
        };
        getAPI(interpolate(PAYMENT_MODES, [this.props.active_practiceId]), successFn, errorFn);
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    editPayment(value) {
        this.setState({
            editingId: value.id,
            editingmode: value.mode,
            editingType: value.payment_type,
            editingFee: value.fee,
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
        postAPI(interpolate(PAYMENT_MODES, [this.props.active_practiceId]), reqData, successFn, errorFn)
    }

    render() {
        const that = this;
        const columns = [{
            title: 'Mode of Payment',
            placeholder:"",
            dataIndex: 'mode',
            key: 'mode',
        }, {
            title: 'Payment Type',
            dataIndex: 'payment_type',
            key: 'payment_type',
        }, {
            title: 'Fees',
            dataIndex: 'fee',
            key: 'fee',
            render: (text, record) => (<span>{text} %</span>)
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span>
              <a onClick={() => this.editPayment(record)}>Edit</a>
                    <Divider type="vertical" />
                    <Popconfirm
                      title="Are you sure delete this payment mode?"
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
            label: "Mode of payment",
            key: "mode",
            required: true,
            type: INPUT_FIELD
        }, {
            label: "Payment Type",
            key: "payment_type",
            required: true,
            type: SELECT_FIELD,
            options: PAYMENT_TYPES
        }, {
            label: "Vendor Fee",
            key: "fee",
            required: true,
            type: NUMBER_FIELD,
            min: 0,
            follow: '%'
        },];
        const editfields = [{
            label: "Mode of payment",
            key: "mode",
            required: true,
            initialValue: this.state.editingmode,
            type: INPUT_FIELD
        }, {
            label: "Payment Type",
            key: "payment_type",
            required: true,
            initialValue: this.state.editingType,
            type: SELECT_FIELD,
            options: PAYMENT_TYPES
        }, {
            label: "Vendor Fee",
            key: "fee",
            required: true,
            initialValue: this.state.editingFee,
            type: NUMBER_FIELD,
            min: 0,
            follow: '%'
        },];
        const formProp = {
            successFn (data) {
                that.handleCancel();
                that.loadData();
                console.log(data);
                console.log("sucess");
                displayMessage(SUCCESS_MSG_TYPE, "sucess")
            },
            errorFn () {

            },
            action: interpolate(PAYMENT_MODES, [this.props.active_practiceId]),
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
            <CustomizedTable columns={columns} dataSource={this.state.modes} />
            <Modal
              title="Edit Payment Mode"
              visible={this.state.visible}
              footer={null}
              onCancel={this.handleCancel}
            >
                <TestFormLayout defaultValues={editFormDefaultValues} formProp={formProp} fields={editfields} />
                <Button key="back" onClick={this.handleCancel}>Return</Button>
            </Modal>
</div>
)
    }
}

export default PaymentModes;
