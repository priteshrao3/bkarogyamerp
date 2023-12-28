import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Divider } from 'antd';
import * as _ from 'lodash';
import moment from 'moment';
import CommentModal from './CommentModal';
import { getAPI, interpolate } from '../../../utils/common';
import { TASK } from '../../../constants/api';
import InfiniteFeedLoaderButton from '../../common/InfiniteFeedLoaderButton';
import { startTask, stopTask } from '../../../utils/taskTracker';
import CompleteTaskModal from '../common/CompleteTaskModal';
import CommentTaskModal from '../common/CommentTaskModal';
import {
    TASK_COMPLETE_STATUS,
    TASK_OPEN_STATUS,
    TASK_PAUSED_STATUS,
    TASK_PROGRESS_STATUS,
} from '../../../constants/hardData';

class BacklogTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visibleCommentModal: false,
            loading: false,
            commentData: null,
        };
    }


    componentDidMount() {
        this.loadTask();
    }


    loadTask = (page = 1) => {
        const that = this;
        that.setState({
            loading: true,
        });
        const successFn = function(data) {
            that.setState({
                currentTask: data.results,
                nextTaskPage: data.next,
                loading: false,
            });
        };

        const errorFn = function(error) {
            that.setState({
                loading: false,
            });

        };
        const params = {
            page,
            incomplete: true,
            assignee: that.props.user.id,
            deadline_lte: moment().format(),
        };
        getAPI(TASK, successFn, errorFn, params);
    };

    openCommentModal = (item) => {
        const { visibleCommentModal } = this.state;
        this.setState({
            visibleCommentModal: !visibleCommentModal,
            commentData: item,
        });
    };

    startTask = (id) => {
        const that = this;
        const successCallback = function() {
            that.loadTask(id);
        };
        const errorCallback = function() {
        };
        startTask(id, successCallback, errorCallback);
    };

    stopTask = (id) => {
        const that = this;
        const successCallback = function() {
            that.loadTask(id);
        };
        const errorCallback = function() {
        };
        stopTask(id, successCallback, errorCallback);
    };

    toggleCompleteTask = (option) => {
        this.setState({
            completeTaskModalOpen: option,
        });
    };

    toggleCommentTask = (option) => {
        this.setState({
            commentTaskModalOpen: option,
        });
    };

    render() {
        const { visibleCommentModal, currentTask, commentData, completeTaskModalOpen, commentTaskModalOpen } = this.state;

        const createMarkup = (content) => {
            return {
                __html: content,
            };
        };

        const columns = [

            {
                title: 'Task Name',
                dataIndex: 'name',
                key: 'name',
                render: (item, record) => (
                    <Link to={`/erp/tasktracker/task/${record.id}/view`}>
                        <a>{record.name}</a>
                    </Link>
                ),
            }, {
                title: 'Assigner',
                dataIndex: 'reporter',
                key: 'reporter',
                render: (item, record) => (
                    <span>{record.reporter && record.reporter_data ? record.reporter_data.first_name : ''}</span>),
            }, {
                title: 'Priority',
                dataIndex: 'priority',
                key: 'priority',
                render: (item, record) => (
                    <span>{record.priority && record.priority_data ? record.priority_data.value : ''}</span>),
            }, {
                title: 'Status',
                dataIndex: 'task_status',
                key: 'task_status',
            }, {
                title: 'DeadLine',
                dataIndex: 'deadline',
                key: 'deadline',
                render: (item, record) => (
                    <span>{record.deadline ? moment(record.deadline).format('LLL') : null}</span>),

            }, {
                title: 'Action',
                key: 'action',
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
                ),
            },
        ];
        return (
            <div>
                <CompleteTaskModal
                    open={!!completeTaskModalOpen}
                    key={completeTaskModalOpen}
                    cancelFn={() => this.toggleCompleteTask(false)}
                    taskId={completeTaskModalOpen}
                    callback={() => this.loadTask()}
                />
                <CommentTaskModal
                    open={!!commentTaskModalOpen}
                    key={commentTaskModalOpen}
                    cancelFn={() => this.toggleCommentTask(false)}
                    taskId={commentTaskModalOpen}
                />
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


export default BacklogTask;
