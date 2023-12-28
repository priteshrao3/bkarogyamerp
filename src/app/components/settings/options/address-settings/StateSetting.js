import React, { Component } from "react";
import { Card, Divider, Popconfirm, Form, Select, Modal, Button, Input } from "antd";
import { COUNTRY, STATE } from "../../../../constants/api";
import { getAPI, displayMessage, postAPI } from "../../../../utils/common";
import CustomizedTable from "../../../common/CustomizedTable";
import { INPUT_FIELD, SUCCESS_MSG_TYPE, SELECT_FIELD } from "../../../../constants/dataKeys";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";

class StateSetting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            visible: false,
            editObj: {},
            stateData: [],
            countryData: [],
            country: null
        }
    }

    componentDidMount = () => {
        this.loadCountry();
    }


    loadCountry = async () => {
        const that = this;
        that.setState({
            loading: true
        })
        const successFn = function (data) {
            if (data[0]) {
                that.setState({
                    countryData: data,
                    loading: false
                })
            }
        }

        const errorFn = function (data) {
            that.setState({
                loading: false
            })
        }
        getAPI(COUNTRY, successFn, errorFn);
    }

    loadState = () => {
        const that = this;
        const { country } = that.state;
        that.setState({
            loading: true
        })
        const successFn = function (data) {
            that.setState({
                stateData: data,
                loading: false,
            })
        }

        const errorFn = function (data) {
            that.setState({
                loading: false
            })
        }
        const apiParams = {
            country,
        }
        getAPI(STATE, successFn, errorFn, apiParams);
    }



    editState(value) {
        this.setState({
            editObj: value,
            visible: true
        })
    }

    onChangeValue = (type, value) => {
        const that = this;
        const {setFieldsValue} = this.props.form;
        that.setState({
            [type]: value
        }, function () {
            if (type == 'country') {
                that.loadState();
            }
        })

    }


    deleteObject(record, type) {
        const that = this;
        const reqData = record;
        reqData.is_active = type;
        that.setState({
            loading: true,
        })
        const successFn = function (data) {

            that.setState({
                loading: false,
            })
            that.loadState(that.state.selectedCountry);
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };

        postAPI(STATE, reqData, successFn, errorFn)
    }

    handleCancel = () => {
        this.setState({ visible: false });
    }


    handleSubmit = (e) => {
        const that = this;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const reqData = {
                    ...values,
                }

                const successFn = function (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "State Saved Successfully!!");
                    that.setState({
                        loading: false
                    });
                    that.loadState();
                }
                const errorFn = function () {
                    that.setState({
                        loading: false
                    })
                }
                console.log("reqData", reqData)
                postAPI(STATE, reqData, successFn, errorFn);
            }
        })
    }


    render() {
        const that = this;
        const { countryData, stateData, loading } = this.state;
        const formItemLayout = ({
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        });
        const { getFieldDecorator } = this.props.form;

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
                    <a onClick={() => this.editState(record)}>  Edit</a>
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



        const formProp = {
            successFn(data) {
                that.handleCancel();
                that.loadState(data.country);
                // that.loadCountry();
                displayMessage(SUCCESS_MSG_TYPE, "success");
            },
            errorFn() {

            },
            action: STATE,
            method: "post",
        }

        const editfields = [{
            label: "State Name",
            key: "name",
            required: true,
            initialValue: this.state.editObj.name,
            type: INPUT_FIELD
        }];


        const TestFormLayout = Form.create()(DynamicFieldsForm);

        const editFormDefaultValues = [{
            "key": "id",
            "value": this.state.editObj.id
        }];

        return (
            <div>
                <h2>State </h2>
                    <Form onSubmit={that.handleSubmit}>
                        <Form.Item key="country" {...formItemLayout} label="Country">
                            {getFieldDecorator("country", {rules: [{required: true, message: 'This field is required!'}],

                            })(
                                <Select
                                  placeholder="Select Country"
                                  onChange={(value) => this.onChangeValue("country", value)}
                                  showSearch
                                  optionFilterProp="children"
                                >

                                    {countryData.map((option) => (
                                        <Select.Option
                                          value={option.id}
                                        >{option.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}

                        </Form.Item>

                        <Form.Item label="State Name" {...formItemLayout}>
                            {getFieldDecorator('name', {rules: [{required: true, message: 'This field is required!!'}],
                             initialValue: '' })
                                (<Input placeholder="State Name" />)}
                        </Form.Item>

                        <Form.Item>
                            {that.props.history ? (
                                <Button style={{ margin: 5 }} onClick={() => that.props.history.goBack()}>
                                    Cancel
                                </Button>
                            ) : null}
                            <Button style={{ margin: 5 }} type="primary" htmlType="submit" loading={this.state.loading}>
                                Save
                            </Button>

                        </Form.Item>

                    </Form>

                {/* <h3 style={{ paddingTop: 10 }}><span>Country</span>&nbsp;:&nbsp;
                    <Select
                        defaultValue={that.state.selectedCountry ? that.state.selectedCountry.id : ''}
                        style={{ width: 200 }}
                        onChange={(value) => this.onChangeValue("country", value)}
                    >
                        {countryData.map((option) => (
                            <Select.Option value={option.id} >
                                {option.name}
                            </Select.Option>
                        ))}
                    </Select>

                </h3> */}
                <Divider />
                <CustomizedTable rowKey={record => record.id} hideReport loading={loading} columns={columns} dataSource={stateData} pagination={false} />

                <Modal
                  visible={this.state.visible}
                  footer={null}
                  onCancel={this.handleCancel}
                >
                    <TestFormLayout
                      title="Edit State"
                      defaultValues={editFormDefaultValues}
                      formProp={formProp}
                      fields={editfields}
                    />
                </Modal>

            </div>
        );
    }

}

export default Form.create()(StateSetting)
