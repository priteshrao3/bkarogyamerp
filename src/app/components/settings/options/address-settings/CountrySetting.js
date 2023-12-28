import React, {Component} from "react";
import {Card, Form, Divider, Popconfirm, Modal} from "antd";
import {INPUT_FIELD, SUCCESS_MSG_TYPE} from "../../../../constants/dataKeys";
import {displayMessage, getAPI, postAPI} from "../../../../utils/common";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import CustomizedTable from "../../../common/CustomizedTable";
import {COUNTRY} from "../../../../constants/api";

class CountrySetting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            country: [],
            editObj: {},
            visible: false
        }
    }

    componentDidMount() {
        this.loadCountry();
    }


    loadCountry = () => {
        const that = this;
        that.setState({
            loading: true
        })
        const successFn = function (data) {
            that.setState({
                country: data,
                loading: false
            })
        }

        const errorFn = function (data) {
            that.setState({
                loading: false
            })
        }
        getAPI(COUNTRY, successFn, errorFn);
    }


    deleteObject(record, type) {
        const that = this;
        const reqData = record;
        reqData.is_active = type;
        that.setState({
            loading: true,
        })
        const successFn = function (data) {
            that.loadCountry();
            that.setState({
                loading: false,
            })
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };

        postAPI(COUNTRY, reqData, successFn, errorFn)
    }


    editCountry(value) {
        this.setState({
            editObj: value,
            visible: true
        })
    }

    handleCancel = () => {
        this.setState({visible: false});
    }

    render() {
        const that = this;
        const {country, loading} = this.state;


        const columns = [{
            title: 'S. No.',
            key: 'name',
            render: (text, record, index) => <span>{index + 1}</span>
        }, {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (item, record) => <span>{item}</span>
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={() => this.editCountry(record)}>  Edit</a>
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

            ),
        }];


        const fields = [{
            label: "Country Name",
            key: "name",
            required: true,
            type: INPUT_FIELD
        }];

        const editfields = [{
            label: "Country Name",
            key: "name",
            required: true,
            initialValue: this.state.editObj.name,
            type: INPUT_FIELD
        }];


        const formProp = {
            successFn(data) {
                that.handleCancel();
                that.loadCountry();
                displayMessage(SUCCESS_MSG_TYPE, "Country Saved Successfully!!");
            },
            errorFn() {

            },
            action: COUNTRY,
            method: "post",
        }

        const defaultValues = [];
        const editFormDefaultValues = [{
            "key": "id",
            "value": this.state.editObj.id
        }];
        const TestFormLayout = Form.create()(DynamicFieldsForm);


        return (
            <div>
                <h2>Country</h2>
                <TestFormLayout defaultValues={defaultValues} formProp={formProp} fields={fields} />
                <Divider />
                <CustomizedTable
                  rowKey={record => record.id}
                  hideReport
                  loading={loading}
                  columns={columns}
                  dataSource={country}
                  pagination={false}
                />

                <Modal
                  visible={this.state.visible}
                  footer={null}
                  onCancel={this.handleCancel}
                >
                    <TestFormLayout
                      title="Edit Country"
                      defaultValues={editFormDefaultValues}
                      formProp={formProp}
                      fields={editfields}
                    />
                </Modal>
            </div>
        );
    }

}

export default CountrySetting
