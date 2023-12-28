import React, {Component} from "react";
import {Link} from "react-router-dom";
import {Table, Button, Divider, Tag, Row, Col, DatePicker} from "antd";
import moment from "moment";
import {getAPI, interpolate} from "../../../utils/common";
import {TASK} from "../../../constants/api";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import CommentTaskModal from "../common/CommentTaskModal";

const {RangePicker} = DatePicker;
const dateFormat = 'YYYY/MM/DD';

class CompletedTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            deadline_gte: moment().startOf('month').format(),
            deadline_lte: moment().endOf('month').format(),
        }
    }


    componentDidMount() {
        this.loadTask();
    }

    setFilters = (filters = {}) => {
        const that = this;
        this.setState(filters, function () {
            that.loadTask();
        })
    }

    loadTask = (page = 1) => {
        const that = this;
        that.setState({
            loading: true
        })
        const successFn = function (data) {
            that.setState({
                currentTask: data.results,
                nextTaskPage: data.next,
                loading: false,
                taskCount: data.count,
            })
        }

        const errorFn = function (error) {
            that.setState({
                loading: false
            })

        }
        const params = {
            page,
            assignee: that.props.user.id,
            incomplete: false
        }
        if (this.state.deadline_gte) {
            params.deadline_gte = this.state.deadline_gte;
        }
        if (this.state.deadline_lte) {
            params.deadline_lte = this.state.deadline_lte;
        }
        getAPI(TASK, successFn, errorFn, params)
    }

    toggleCommentTask = (option) => {
        this.setState({
            commentTaskModalOpen: option
        })
    }

    render() {
        const {currentTask, completeTaskModalOpen, commentTaskModalOpen, deadline_gte, deadline_lte} = this.state;

        const columns = [

            {
                title: 'Task Name',
                dataIndex: 'name',
                key: 'name',
                render: (item, record) => (
                    <Link to={`/erp/tasktracker/task/${record.id}/view`}>
                        <a>{record.name}</a>
                    </Link>
                )
            }, {
                title: 'Assigner',
                dataIndex: 'reporter',
                key: 'reporter',
                render: (item, record) => (
                    <span>{record.reporter && record.reporter_data ? record.reporter_data.first_name : ''}</span>)
            }, {
                title: 'Priority',
                dataIndex: 'priority',
                key: 'priority',
                render: (item, record) => (
                    <span>{record.priority && record.priority_data ? record.priority_data.value : ''}</span>)
            }, {
                title: 'Status',
                dataIndex: 'task_status',
                key: 'task_status',
            }, {
                title: 'DeadLine',
                dataIndex: 'deadline',
                key: 'deadline',
                render: (item, record) => (
                    <span>{record.deadline ? moment(record.deadline).format('LLL') : null}</span>)

            }, {
                title: 'Delayed',
                dataIndex: 'delayed',
                key: 'delayed',
                render: (item, record) => (record.completed_on && moment(record.deadline) < moment(record.completed_on)) || moment(record.deadline) < moment() ?
                    <Tag color="red">Delayed</Tag> : null
            }, {
                title: "Action",
                key: "action",
                render: (text, record) => (
                    <span>
                        <Button.Group size="small">
                            <Button
                                type="link"
                                icon="message"
                                onClick={() => this.toggleCommentTask(record.id)}
                            >Comments
                            </Button>
                        </Button.Group>
                    </span>
                )
            }
        ];
        return (
            <div>
                <CommentTaskModal
                    open={!!commentTaskModalOpen}
                    key={commentTaskModalOpen}
                    cancelFn={() => this.toggleCommentTask(false)}
                    taskId={commentTaskModalOpen}
                />
                <Row gutter={16} style={{textAlign: 'center'}}>
                    <Col span={24}>
                        <p>Deadline</p>
                        <RangePicker
                            value={[moment(deadline_gte), moment(deadline_lte)]}
                            format={dateFormat}
                            onChange={(value) => this.setFilters({
                                deadline_gte: moment(value[0]).startOf('day').format(),
                                deadline_lte: moment(value[1]).endOf('day').format()
                            })}
                        />
                    </Col>
                </Row>
                <Divider/>
                <Table
                    loading={this.state.loading}
                    dataSource={currentTask}
                    columns={columns}
                    pagination={false}
                />
                <InfiniteFeedLoaderButton
                    loaderFunction={() => this.loadData(this.state.nextTaskPage)}
                    loading={this.state.loading}
                    hidden={!this.state.nextTaskPage}
                />
            </div>
        );
    }
}


export default CompletedTask;
