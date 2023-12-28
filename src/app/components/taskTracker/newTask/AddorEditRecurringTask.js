import React, {Component} from "react";
import {Card, Form, Row, Col, Input, Spin, Button, Select, DatePicker, InputNumber} from "antd";
import * as _ from "lodash";
import {Editor} from 'react-draft-wysiwyg';
import {Route} from "react-router";
import {Redirect} from "react-router-dom";
import moment from "moment";
import {ContentState, convertToRaw, EditorState} from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import {ERROR_MSG_TYPE, SUCCESS_MSG_TYPE} from "../../../constants/dataKeys";
import {TASK, HR_SETTINGS, SINGLE_TASK, TASK_ASSIGNEE, TASK_REPORTER, RECURRING_TASK} from "../../../constants/api";
import {postAPI, getAPI, displayMessage, interpolate, putAPI} from "../../../utils/common";
const {TextArea} = Input;
class AddOrEditTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            priorityData: [],
            editTask: null,
            editorState: {},
            departmentList: [],
            designationList: []
        }
    }

    componentDidMount() {
        this.loadDepartment();
        this.loadPriority();
        this.loadDesignation();
        const {match} = this.props;
        if (_.get(match, 'params.id')) {
            this.loadEditTask(_.get(match, 'params.id'));
        }
    }

    loadDepartment = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                departmentList: data
            })
        }
        const errorFn = function () {

        }
        getAPI(HR_SETTINGS, successFn, errorFn, {name: 'Department'});
    }

    loadDesignation = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                designationList: data
            })
        }
        const errorFn = function () {
        }
        getAPI(HR_SETTINGS, successFn, errorFn, {name: 'Designation'});
    }

    loadPriority = () => {
        const that = this;
        const successFn = function (result) {
            that.setState({
                priorityData: result,
                loading: false
            })
        }

        const errorFn = function (error) {
            that.setState({
                loading: false
            })
        }
        const apiParams = {
            name: "Task Priority"
        }
        getAPI(HR_SETTINGS, successFn, errorFn, apiParams)
    }

    loadEditTask = (taskId) => {
        const that = this;
        that.setState({
            loading: true
        })
        const successFn = function (data) {
            if (data.results.length) {
                that.setState({
                    editTask: data.results[0],
                    loading: false
                })
            } else {
                displayMessage(ERROR_MSG_TYPE, "Task not found.!!");
            }
        }

        const errorFn = function (error) {
            that.setState({
                loading: false
            })

        }

        getAPI(RECURRING_TASK, successFn, errorFn, {id: taskId})
    }

    handleSubmit = e => {
        const that = this;
        const {editTask} = that.state;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    loading: true
                })
                const reqData = {
                    ...values,
                }
                // reqData.description = that.state.editorState.description ? draftToHtml(convertToRaw(that.state.editorState.description.getCurrentContent())) : '';

                const successFn = function (result) {
                    that.setState({
                        loading: false
                    });
                    if(editTask){
                        displayMessage(SUCCESS_MSG_TYPE, "Task Modified Successfully")
                    }else {
                        displayMessage(SUCCESS_MSG_TYPE, "Task Created Successfully")
                    }
                    that.props.history.replace('/tasktracker/departmenttask');
                }

                const errorFn = function (error) {
                    that.setState({
                        loading: false
                    })

                }
                if (editTask) {
                    reqData.id = editTask.id;
                }
                postAPI(RECURRING_TASK, reqData, successFn, errorFn);

            }
        });


    };

    onEditorStateChange = (key, editorState) => {
        console.log("key", key, editorState)
        this.setState(function (prevState) {
            return {
                editorState: {...prevState.editorState, [key]: editorState}

            }
        });
    };

    render() {
        const {loading, priorityData, editTask, designationList, departmentList} = this.state;
        const {title} = this.props;
        const {getFieldDecorator} = this.props.form;
        const formItemLayoutLeft = ({
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        });

        const formItemLayoutRight = ({
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        });

        const formItemLayout = ({
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        });
        const data = [];

        return (
            <Row>
                <Card title={title}>
                    <Spin tip="Loading..." spinning={loading}>
                        <Form onSubmit={this.handleSubmit} className="login-form">
                            <Row>
                                <Col span={12}>
                                    <Form.Item key="department" {...formItemLayoutLeft} label="Department">
                                        {getFieldDecorator("department", {
                                            initialValue: editTask ? editTask.department : null,
                                            rules: [{required: true, message: 'This field is required!'}],

                                        })(
                                            <Select
                                              placeholder="Select Department"
                                              showSearch
                                                // mode="multiple"
                                              optionFilterProp="children"
                                            >

                                                {departmentList.map((option) => (
                                                    <Select.Option
                                                      key={option.id}
                                                      value={option.id}
                                                    >{option.value}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item key="designation" {...formItemLayoutRight} label="Designation">
                                        {getFieldDecorator("designation", {
                                            initialValue: editTask ? editTask.designation : null,
                                            rules: [{required: true, message: 'This field is required!'}],

                                        })(
                                            <Select
                                              placeholder="Select Designation"
                                              showSearch
                                                // mode="multiple"
                                              optionFilterProp="children"
                                            >

                                                {designationList.map((option) => (
                                                    <Select.Option
                                                      key={option.id}
                                                      value={option.id}
                                                    >{option.value}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    <Form.Item key="priority" {...formItemLayoutLeft} label="Priority">
                                        {getFieldDecorator("priority", {
                                            initialValue: editTask ? editTask.priority : [],
                                            rules: [{required: true, message: 'This field is required!'}],

                                        })(
                                            <Select
                                              placeholder="Select Priority"
                                              showSearch
                                              optionFilterProp="children"
                                            >

                                                {priorityData.map((option) => (
                                                    <Select.Option
                                                      key={option.id}
                                                      value={option.id}
                                                    >{option.value}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item key="days" {...formItemLayoutRight} label="Days">
                                        {getFieldDecorator("days", {
                                            initialValue: editTask ? editTask.days : '',
                                            rules: [{required: true, message: 'This field is required!'}],

                                        })(
                                            <InputNumber />
                                        )}
                                    </Form.Item>
                                </Col>

                            </Row>
                            <Row>
                                <Col span={12}>
                                    <Form.Item key="name" {...formItemLayoutLeft} label="Task Name">
                                        {getFieldDecorator("name", {
                                            initialValue: editTask ? editTask.name : '',
                                            rules: [{required: true, message: 'This field is required!'}],

                                        })(
                                            <Input placeholder="Task Name" />
                                        )}
                                    </Form.Item>
                                </Col>


                                <Col span={12}>
                                    <Form.Item key="remark" {...formItemLayoutRight} label="Remarks">
                                        {getFieldDecorator("remark", {
                                            initialValue: editTask ? editTask.remark : '',
                                            rules: [{required: true, message: 'This field is required!'}],

                                        })(
                                            <Input placeholder="Remarks" />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                <Form.Item key="description" {...formItemLayout} label="Description">
                                        {getFieldDecorator("description", {
                                            initialValue: editTask ? editTask.description : '',
                                            rules: [{required: true, message: 'This field is required!'}],

                                        })
                                        (
                                            <TextArea rows={4}/>    
                                        )}
                                    </Form.Item>
                                </Col>

                            </Row>


                            <Form.Item>
                                {this.props.history ? (
                                    <Button style={{margin: 5}} onClick={() => this.props.history.goBack()}>
                                        Cancel
                                    </Button>
                                ) : null}
                                <Button
                                  style={{margin: 5}}
                                  type="primary"
                                  htmlType="submit"
                                  loading={this.state.loading}
                                >
                                    Save
                                </Button>

                            </Form.Item>
                        </Form>
                    </Spin>

                </Card>
            </Row>
        );
    }

}

export default Form.create()(AddOrEditTask)
