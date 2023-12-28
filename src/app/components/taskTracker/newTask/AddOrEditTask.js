import React, {Component} from "react";
import {Card, Form, Row, Col, Input, Spin, Button, Select, DatePicker} from "antd";
import * as _ from "lodash";
import {Editor} from 'react-draft-wysiwyg';
import {Route} from "react-router";
import {Redirect} from "react-router-dom";
import moment from "moment";
import {ContentState, convertToRaw, EditorState} from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import {SUCCESS_MSG_TYPE} from "../../../constants/dataKeys";
import {TASK, HR_SETTINGS, SINGLE_TASK, TASK_ASSIGNEE, TASK_REPORTER} from "../../../constants/api";
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
            assigneeList: [],
            reporterList: []
        }
    }

    componentDidMount() {
        this.loadAssignee();
        this.loadPriority();
        const {match} = this.props;
        if (_.get(match, 'params.id')) {
            this.loadEditTask(_.get(match, 'params.id'));
        }
    }

    loadAssignee = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                assigneeList: data
            })
        }
        const errorFn = function () {

        }
        getAPI(TASK_ASSIGNEE, successFn, errorFn);
    }

    loadReporter = (assigneeId) => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                reporterList: data
            })
        }
        const errorFn = function () {

        }
        getAPI(TASK_REPORTER, successFn, errorFn, {user: assigneeId});
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
        const successFn = function (result) {
            that.setState({
                editTask: result,
                loading: false
            }, function () {
                that.loadReporter(result.assignee)
            })
        }

        const errorFn = function (error) {
            that.setState({
                loading: false
            })

        }

        getAPI(interpolate(SINGLE_TASK, [taskId]), successFn, errorFn)
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
                        loading: false,
                        editorState: {}
                    })
                    that.props.form.resetFields()
                    displayMessage(SUCCESS_MSG_TYPE, "Task Created Successfully")
                    window.location.reload()
                }

                const errorFn = function (error) {
                    that.setState({
                        loading: false
                    })

                }
                if (editTask) {
                    reqData.id = editTask.id
                    putAPI(interpolate(SINGLE_TASK, [editTask.id]), reqData, successFn, errorFn)
                } else {
                    postAPI(TASK, reqData, successFn, errorFn);
                }
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
        const {loading, priorityData, editTask, assigneeList, reporterList,editorState} = this.state;
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

        return (
            <Row>
                <Card title={title}>
                    <Spin tip="Loading..." spinning={loading}>
                        <Form onSubmit={this.handleSubmit} className="login-form">
                            <Row>
                                <Col span={12}>
                                    <Form.Item key="assignee" {...formItemLayoutLeft} label="Assignee">
                                        {getFieldDecorator("assignee", {
                                            initialValue: editTask ? editTask.assignee : null,
                                            rules: [{required: true, message: 'This field is required!'}],

                                        })(
                                            <Select
                                                placeholder="Select Assignee"
                                                showSearch
                                                // mode="multiple"
                                                optionFilterProp="children"
                                                onChange={(value) => this.loadReporter(value)}
                                            >

                                                {assigneeList.map((option) => (
                                                    <Select.Option
                                                        key={option.id}
                                                        value={option.id}
                                                    >{option.first_name}&nbsp;({option.emp_id})
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item key="reporter" {...formItemLayoutRight} label="Reporter">
                                        {getFieldDecorator("reporter", {
                                            initialValue: editTask ? editTask.reporter : null,
                                            rules: [{required: true, message: 'This field is required!'}],

                                        })(
                                            <Select
                                                placeholder="Select Reporter"
                                                showSearch
                                                // mode="multiple"
                                                optionFilterProp="children"
                                            >

                                                {reporterList.map((option) => (
                                                    <Select.Option
                                                        key={option.id}
                                                        value={option.id}
                                                    >{option.first_name}&nbsp;({option.emp_id})
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
                                    <Form.Item key="deadline" {...formItemLayoutRight} label="DeadLine">
                                        {getFieldDecorator("deadline", {
                                            initialValue: editTask ? moment(editTask.deadline) : moment(),
                                            rules: [{required: true, message: 'This field is required!'}],

                                        })(
                                            <DatePicker
                                                format="YYYY/MM/DD hh:mm a"
                                                style={{width: '100%'}}
                                                showTime
                                                placeholder="Select DeadLine"
                                            />
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
                                            <Input placeholder="Task Name"/>
                                        )}
                                    </Form.Item>
                                </Col>


                                <Col span={12}>
                                    <Form.Item key="supportpersion" {...formItemLayoutRight} label="Support Person">
                                        {getFieldDecorator("supportpersion", {
                                            initialValue: editTask ? editTask.supportpersion : '',
                                            rules: [{required: true, message: 'This field is required!'}],

                                        })(
                                            <Input placeholder="Support Person"/>
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
                            <Row>
                                <Col span={12}>
                                        <Form.Item key="effert_target" {...formItemLayoutRight} label="Effert Target">
                                            {getFieldDecorator("effert_target", {
                                                initialValue: editTask ? editTask.effert_target : '',
                                                rules: [{required: true, message: 'This field is required!'}],

                                            })(
                                                <Input placeholder="Effert Target" type='number'/>
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                    <Form.Item key="result_target" {...formItemLayoutRight} label="Result Target">
                                            {getFieldDecorator("result_target", {
                                                initialValue: editTask ? editTask.result_target : '',
                                                rules: [{required: true, message: 'This field is required!'}],

                                            })(
                                                <Input placeholder="result target" type='number'/>
                                            )}
                                        </Form.Item>
                                    </Col>
                                    
                                </Row>
                                <Row>
                                    <Col span={12}>
                                    <Form.Item key="effert_point" {...formItemLayoutRight} label="Effert Point">
                                            {getFieldDecorator("effert_point", {
                                                initialValue: editTask ? editTask.effert_point : '',
                                                rules: [{required: true, message: 'This field is required!'}],

                                            })(
                                                <Input placeholder="totalpoint" type='number'/>
                                            )}
                                    </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                    <Form.Item key="result_point" {...formItemLayoutRight} label="Target Point">
                                            {getFieldDecorator("result_point", {
                                                initialValue: editTask ? editTask.result_point : '',
                                                rules: [{required: true, message: 'This field is required!'}],

                                            })(
                                                <Input placeholder="Enter Taget Point" type='number'/>
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
