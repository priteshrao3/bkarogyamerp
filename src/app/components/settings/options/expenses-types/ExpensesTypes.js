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
import {EXPENSE_TYPE} from "../../../../constants/api"
import {getAPI, displayMessage, interpolate, postAPI} from "../../../../utils/common";
import CustomizedTable from "../../../common/CustomizedTable";

class ExpensesTypes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            visible: false,
            expenses: null,
            loading: true,
            showDeleted: false,
            deletedLoading: false,
            deletedExpenses: []
        };
        this.loadData = this.loadData.bind(this);
        this.deleteObject = this.deleteObject.bind(this);

    }

    componentDidMount() {
        this.loadData();
    }

    loadData(deleted = false) {
        const that = this;
        const successFn = function (data) {
            console.log("get table");
            if (deleted) {
                that.setState({
                    deletedExpenses: data,
                    deletedLoading: false
                })
            } else {
                that.setState({
                    expenses: data,
                    loading: false
                })
            }
        };
        const errorFn = function () {
        };
        if (deleted) {
            getAPI(interpolate(EXPENSE_TYPE, [this.props.active_practiceId]), successFn, errorFn, {deleted: true});
        } else {
            getAPI(interpolate(EXPENSE_TYPE, [this.props.active_practiceId]), successFn, errorFn);
        }
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
            loading: false,
            visible: true,
        })
    }

    handleCancel = () => {
        this.setState({visible: false});
    }

    deleteObject(record, type) {
        const that = this;
        const reqData = record;
        reqData.is_active = type;
        const successFn = function (data) {
            that.loadData();
            if (that.state.showDeleted) {
                that.loadData(true);
            }
        }
        const errorFn = function () {
        };
        postAPI(interpolate(EXPENSE_TYPE, [this.props.active_practiceId]), reqData, successFn, errorFn)
    }

    showDeletedExpenses = () => {
        this.setState({
            showDeleted: true,
            deletedLoading: true
        });
        this.loadData(true)
    }

    render() {
        const that = this;
        const columns = [{
            title: 'Expense Type',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                record.is_active ? (
<span>

              <a onClick={() => this.editTax(record)}>  Edit</a>
                <Divider type="vertical" />
                <Popconfirm
                  title="Are you sure to delete this?"
                  onConfirm={() => that.deleteObject(record, false)}
                  okText="Yes"
                  cancelText="No"
                >
                  <a>Delete</a>
                </Popconfirm>
</span>
) : (
<span>
                    <Popconfirm
                      title="Are you sure to show this?"
                      onConfirm={() => that.deleteObject(record, true)}
                      okText="Yes"
                      cancelText="No"
                    >
                  <a>Show</a>
                    </Popconfirm>
</span>
)
            ),
        }];
        const fields = [{
            label: "Expense Type",
            key: "name",
            placeholder: 'Expense Type',
            required: true,
            type: INPUT_FIELD
        },];
        const editfields = [{
            label: "Expense Type",
            key: "name",
            required: true,
            initialValue: this.state.editingName,
            type: INPUT_FIELD
        },];
        const formProp = {
            successFn (data) {
                that.handleCancel();
                that.loadData();
                displayMessage(SUCCESS_MSG_TYPE, "success")
            },
            errorFn () {

            },
            action: interpolate(EXPENSE_TYPE, [this.props.active_practiceId]),
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
            <h2>Expense Types</h2>
            <Card>
                <TestFormLayout defaultValues={defaultValues} formProp={formProp} fields={fields} />
                <Divider />
                <CustomizedTable loading={this.state.loading} columns={columns} dataSource={this.state.expenses} />
                {this.state.showDeleted ? (
                    <div>
                        <CustomizedTable
                          loading={this.state.deletedLoading}
                          columns={columns}
                          dataSource={this.state.deletedExpenses}
                        />
                    </div>
                  ) :
                    <h4><a onClick={() => this.showDeletedExpenses()}>Show Deleted Expense Types</a></h4>}
            </Card>
            <Modal
              title="Edit Expense Type"
              visible={this.state.visible}
              footer={null}
              onCancel={this.handleCancel}
            >
                <TestFormLayout
                  defaultValues={editFormDefaultValues}
                  formProp={formProp}
                  fields={editfields}
                />
                <Button key="back" onClick={this.handleCancel}>Return</Button>
            </Modal>
</div>
)
    }
}

export default ExpensesTypes;
