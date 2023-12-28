import {Button, Table, Tag} from "antd";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import React from "react";
import {getAPI} from "../../../utils/common";
import {TASK} from "../../../constants/api";
import {Link} from "react-router-dom";
import moment from "moment";

export default class AllTaskReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            empolyeeOption:[],
            loading:false
        }
    }

    componentDidMount() {
        this.loadTask();

    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate || this.props.expense_type != newProps.expense_type
            || this.props.payment_mode != newProps.payment_mode)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            }, function () {
                that.loadTask();
            })

    }

    loadTask (page=1) {
        const that = this;
        that.setState({
            loading: true
        })
        const successFn = function (data) {
            if (data.current == 1)
            that.setState({
                currentTask: data.results,
                next: data.next,
                loading:false
            })
            else
            that.setState(function (prevState) {
                return {
                    currentTask: [...prevState.currentTask, ...data.results],
                   next: data.next,
                   loading: false
                }
            })
        }

        const errorFn = function (error) {
            that.setState({
                loading: false
            })

        }
        const params = {
            page,
            deadline_gte: this.state.startDate.format('YYYY-MM-DD'),
            deadline_lte: this.state.endDate.format('YYYY-MM-DD')
        }
        getAPI(TASK, successFn, errorFn, params)
    }

    render() {
        const {currentTask} = this.state;
        const columns = [
            {
                title: 'Task Name',
                dataIndex: 'name',
                key: 'name',
                render: (item, record) => (
                    <Link to={`/erp/tasktracker/task/${record.id}/view`}>
                        {record.name}
                    </Link>
                )
            }, {
                title: 'Assignee',
                dataIndex: 'assignee',
                key: 'assignee',
                render: (item, record) => (
                    <span>{record.assignee && record.assignee_data ? record.assignee_data.first_name : ''}</span>)
            },
            {
                title: 'Assigner',
                dataIndex: 'reporter',
                key: 'reporter',
                render: (item, record) => (
                <span>{record.reporter && record.reporter_data ? record.reporter_data.first_name : ''}</span>)
            },
            {
                title: 'Priority',
                dataIndex: 'priority',
                key: 'priority',
                render: (item, record) => (
                    <span>{record.priority && record.priority_data ? record.priority_data.value : ''}</span>)
            },
            {
                title: 'Status',
                dataIndex: 'task_status',
                key: 'task_status',
            }, {
                title: 'Time Remaining',
                dataIndex: 'deadline',
                key: 'deadline',
                render: (item, record) => (
                    <span>{record.deadline ? moment(record.deadline).format('LLL') : null}</span>)

            }
        ];
        return <div>
            <h2>All Tasks</h2>
            <Table
                dataSource={currentTask}
                columns={columns}
                pagination={false}
                loading={this.state.loading}
            />
            <InfiniteFeedLoaderButton
                loaderFunction={() => this.loadTask(this.state.next)}
                loading={this.state.loading}
                hidden={!this.state.next}
            />
        </div>
    }
}
