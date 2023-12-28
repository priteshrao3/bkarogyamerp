import { Button, Card, Col, Divider, Modal, Row, Table, Typography } from "antd";
import React from "react";
import * as _ from "lodash";
import { Link } from "react-router-dom";
import { RECURRING_TASK } from "../../../constants/api";
import { getAPI } from "../../../utils/common";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import RecurringTaskAssignModal from "./RecurringTaskAssignModal";
import { loadConfigParameters } from "../../../utils/clinicUtils";
import { ADVISOR_DEPARTMENT_CONFIG_PARAMS, ADVISOR_DESIGNATION_CONFIG_PARAMS } from "../../../constants/hardData";
import moment from "moment";

const { Text } = Typography;
export default class RecurringTaskList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            taskList: [],
            showTaskDetails: null,
            selectedRowKeys: [],
            loading:false,
            month : moment().month() + 1
        };
    }

    componentDidMount() {
        let that = this;
        let waitFn = function() {
            that.loadTaskList2();
        };
        that.loadTaskList();
        loadConfigParameters(this, [ADVISOR_DEPARTMENT_CONFIG_PARAMS, ADVISOR_DESIGNATION_CONFIG_PARAMS], waitFn);

    }

    loadTaskList = (page) => {
        const that = this;
        this.setState({
            loading: true
        });
        const successFn = function(data) {
            if (data.current == 1) {
                that.setState({
                    taskList: data.results,
                    nextTaskPage: data.next,
                    loading: false
                });
            } else {
                that.setState(function(prevState) {
                    return {
                        taskList: [...prevState.taskList, ...data.results],
                        nextTaskPage: data.next,
                        loading: false
                    };
                });

            }
        };
       
        const errorFn = function() {
            that.setState({
                loading: false
            });
        };
        const apiParams = {
            department: this.props.user.staff.department || this.state[ADVISOR_DEPARTMENT_CONFIG_PARAMS],
            designation: this.props.user.staff.designation || this.state[ADVISOR_DESIGNATION_CONFIG_PARAMS],
            page_size:50,
            page,
            month: this.state.month
        };
        getAPI(RECURRING_TASK, successFn, errorFn, apiParams);
       
    };

    loadTaskList2 = (page) => {
        const that = this;
        this.setState({
            loading: true
        });
        
        const successFn2 = function(data) {
            if (data.current == 1) {
                that.setState(function(prevState) {
                   return {
                    taskList: [...prevState.taskList, ...data.results],
                    nextTaskPage: data.next,
                    loading: false
                    }
                });
            } else {
                that.setState(function(prevState) {
                    return {
                        taskList: [...prevState.taskList, ...data.results],
                        nextTaskPage: data.next,
                        loading: false
                    };
                });

            }
        };
        const errorFn = function() {
            that.setState({
                loading: false
            });
        };
        const apiParams = {
            department: this.props.user.staff.department || this.state[ADVISOR_DEPARTMENT_CONFIG_PARAMS],
            designation: this.props.user.staff.designation || this.state[ADVISOR_DESIGNATION_CONFIG_PARAMS],
            page_size:50,
            page,
            month: this.state.month
        };
       
        getAPI('tasks/templatesUser/', successFn2, errorFn, {assignee:this.props.user.id,});
    };

    assignToSelf = (recordId) => {
        this.setState({
            assignTaskModalId: recordId
        });
    };

    showDetails = (record) => {
        this.setState({
            showTaskDetails: record
        });
    };

    render() {
        // console.log(this.state.taskList)
        let that = this;
        const tableColomns = [{
            title: "Task",
            dataIndex: "name",
            key: "name",
            render: (item, record) => <Button type="link" onClick={() => this.showDetails(record)}>{item}</Button>
        }, {
            title: "Priority",
            dataIndex: "priority",
            key: "priority",
            render: (item, record) => (
                <span>{record.priority && record.priority_data ? record.priority_data.value : ""}</span>)
        }, {
            title: "Days",
            dataIndex: "days",
            key: "days"
        }, {
            title: "Department",
            dataIndex: "department",
            key: "department",
            render: (item, record) => (
                <span>{record.department && record.department_data ? record.department_data.value : ""}</span>)
        }, {
            title: "Designation",
            dataIndex: "designation",
            key: "designation",
            render: (item, record) => (
                <span>{record.designation && record.designation_data ? record.designation_data.value : ""}</span>)
        }, {
            title: "Action",
            dataIndex: "action",
            key: "action",
            render: (item, record) => (
                <span>
                <Button type="link" onClick={() => this.assignToSelf(record.id)}>Assign to Self</Button>

                </span>
            )
        }];

        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRowKeys
                });
            }
        };
        const { taskList, nextTaskPage, loading, assignTaskModalId, showTaskDetails, selectedRowKeys } = this.state;
        return (
            <div>
                <Row>
                    <Button onClick={() => this.assignToSelf(selectedRowKeys)}
                            style={{ float: "right", marginBottom: 10 }} type={"primary"} disabled={!selectedRowKeys.length}>Assign
                        Selected Tasks to Self</Button>
                </Row>
                <Table rowSelection={rowSelection} pagination={false} dataSource={taskList} columns={tableColomns}
                       rowKey={(record => record.id)}    loading={loading} />
                <InfiniteFeedLoaderButton
                    loaderFunction={() => this.loadTaskList(nextTaskPage)}
                    loading={loading}
                    hidden={!nextTaskPage}
                />
                <RecurringTaskAssignModal
                    open={!!assignTaskModalId}
                    key={assignTaskModalId}
                    taskId={assignTaskModalId}
                    assignee={this.props.user.id}
                    cancelFn={() => this.assignToSelf(null)}
                />
                <Modal
                    visible={!!showTaskDetails}
                    title={_.get(showTaskDetails, "name")}
                    footer={null}
                    onCancel={() => this.showDetails(null)}
                >
                    {showTaskDetails ? (
                            <>
                                <DetailRow label="Department" value={_.get(showTaskDetails, "department_data.value")}/>
                                <DetailRow label="Designation" value={_.get(showTaskDetails, "designation_data.value")}/>
                                <DetailRow label="Priority" value={_.get(showTaskDetails, "priority_data.value")}/>
                                <DetailRow label="Days" value={_.get(showTaskDetails, "days")}/>
                                <DetailRow label="Effert Target" value={_.get(showTaskDetails, "effert_target",'-----')}/>
                                <DetailRow label="Result Target" value={_.get(showTaskDetails, "result_target", "-----")}/>
                                <DetailRow label="Effert Point" value={_.get(showTaskDetails, "effert_point", "-----")}/>
                                <DetailRow label="Result Point" value={_.get(showTaskDetails, "result_point", "-----")}/>
                                <DetailRow label="Support Person" value={_.get(showTaskDetails, "supportpersion", "-----")}/>
                                <DetailRow label="Remark" value={_.get(showTaskDetails, "remark")}/>
                                <Divider/>
                                <div dangerouslySetInnerHTML={{ __html: showTaskDetails.description }}/>
                            </>
                        )
                        : null}
                    <Button onClick={() => this.showDetails(null)}>Close</Button>
                </Modal>
            </div>
        );
    }
}

function DetailRow(props) {
    return (
        <Row gutter={16}>
            <Col span={8} style={{ textAlign: "right" }}>
                <Text type="secondary">{props.label}:</Text>
            </Col>
            <Col span={16}>
                <Text>{props.value}</Text>
            </Col>
        </Row>
    );
}
