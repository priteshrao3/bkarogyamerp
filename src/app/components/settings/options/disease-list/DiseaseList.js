import React from "react";
import {Button, Card, Divider, Form, Modal, Popconfirm} from "antd";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {INPUT_FIELD, NUMBER_FIELD, SUCCESS_MSG_TYPE} from "../../../../constants/dataKeys";
import {DISEASE_LIST, ROOM_TYPE} from "../../../../constants/api";
import {displayMessage, getAPI, interpolate, postAPI} from "../../../../utils/common";
import CustomizedTable from "../../../common/CustomizedTable";

class DiseaseList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            visible: false,
            diseases: null,
            loading: true,
            showDeleted: false,
            deletedLoading: false,
            deletedRooms: [],
            editObj: {}
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
                    deletedRooms: data,
                    deletedLoading: false
                })
            } else {
                that.setState({
                    diseases: data,
                    loading: false
                })
            }
        };
        const errorFn = function () {
            if (deleted) {
                that.setState({
                    deletedLoading: false
                })
            } else {
                that.setState({
                    loading: false
                })
            }
        };
        if (deleted) {
            getAPI(interpolate(DISEASE_LIST, [this.props.active_practiceId]), successFn, errorFn, {
                deleted: true,
                practice: this.props.active_practiceId
            });
        } else {
            getAPI(interpolate(DISEASE_LIST, [this.props.active_practiceId]), successFn, errorFn);
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
            editObj: value,
            visible: true
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
        postAPI(interpolate(DISEASE_LIST, [this.props.active_practiceId]), reqData, successFn, errorFn)
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
            title: 'Disease',
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
                      title="Are you sure show this?"
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
            label: "Disease",
            key: "name",
            required: true,
            type: INPUT_FIELD
        },];
        const editfields = [{
            label: "Disease",
            key: "name",
            required: true,
            initialValue: this.state.editObj.name,
            type: INPUT_FIELD
        },];
        const formProp = {
            successFn (data) {
                that.handleCancel();
                that.loadData();
                console.log(data);
                console.log("sucess");
                displayMessage(SUCCESS_MSG_TYPE, "success");
            },
            errorFn () {

            },
            action: interpolate(DISEASE_LIST, [this.props.active_practiceId]),
            method: "post",
        }
        const defaultValues = [{"key": "practice", "value": this.props.active_practiceId}];
        const editFormDefaultValues = [{"key": "practice", "value": this.props.active_practiceId}, {
            "key": "id",
            "value": this.state.editObj.id
        }];
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        return (
<div>
            <h2>Disease List</h2>
            <Card>
                <TestFormLayout defaultValues={defaultValues} formProp={formProp} fields={fields} />
                <Divider />
                <CustomizedTable loading={this.state.loading} columns={columns} dataSource={this.state.diseases} />
                {/* {this.state.showDeleted ? */}
                {/* <div> */}
                {/* <CustomizedTable loading={this.state.deletedLoading} columns={columns} */}
                {/* dataSource={this.state.deletedExpenses}/> */}
                {/* </div> : */}
                {/* <h4><a onClick={() => this.showDeletedExpenses()}>Show Deleted Expenses</a></h4>} */}
            </Card>
            <Modal
              visible={this.state.visible}
              footer={null}
              onCancel={this.handleCancel}
            >

                <TestFormLayout
                  title="Edit Disease"
                  defaultValues={editFormDefaultValues}
                  formProp={formProp}
                  fields={editfields}
                />
                <Button key="back" onClick={this.handleCancel}>Return</Button>,

            </Modal>
</div>
)
    }
}

export default DiseaseList;
