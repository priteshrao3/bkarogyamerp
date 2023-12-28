import React, { Component } from 'react';
import { Row, Col, Card, Typography, Button, Divider, Collapse, Icon, Comment, Tooltip, List, Spin,Statistic ,Table} from 'antd';
import { Link } from 'react-router-dom';
import * as _ from 'lodash';
import moment from 'moment';
import CommentModal from './CommentModal';
import { getAPI, interpolate } from '../../../utils/common';
import { SINGLE_TASK, TASK_DETAILS } from '../../../constants/api';
import { completeTask, startTask, stopTask } from '../../../utils/taskTracker';
import CompleteTaskModal from '../common/CompleteTaskModal';
import CommentTaskModal from '../common/CommentTaskModal';
import {
    TASK_COMPLETE_STATUS,
    TASK_OPEN_STATUS,
    TASK_PAUSED_STATUS,
    TASK_PROGRESS_STATUS,
} from '../../../constants/hardData';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Countdown } = Statistic;
class TaskDescription extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visibleCommentModal: false,
            taskValue: {},
            loading: false,
            taskData: {},
        }
        this.getTaskValue = this.getTaskValue.bind(this);
    }

    componentDidMount() {
        const { match } = this.props;
        if (_.get(match, 'params.id')) {
            console.log(` terraform ${_.get(match,'params.id')}`)
            this.getTaskValue(_.get(match, 'params.id'));
            console.log(`terraform2 ${this.state.taskValue}`)
        }
    }

    getTaskValue = (id)=> {
        const that = this;
        that.setState({
            loading: true,
        
        });
        const successFn = (data) => {
            if(data){

                that.setState({
                    taskValue: data,
                    loading: false,
                });
            }
            // console.log(this.state);
        };
        const errorFn = function() {
            that.setState({
                loading: false,
            });
        };
        getAPI(interpolate(TASK_DETAILS, [id]), successFn, errorFn);
    }

    openCommentModal = () => {
        const { visibleCommentModal } = this.state;
        this.setState({
            visibleCommentModal: !visibleCommentModal,
        });
    };

    startTask = (id) => {
        const that = this;
        this.setState({
            disableStart: true,
        });
        const successCallback = function() {
            that.getTaskValue(id);
        };
        const errorCallback = function() {
            that.setState({
                disableStart: false,
            });
        };
        startTask(id, successCallback, errorCallback);
    };

    stopTask = (id) => {
        const that = this;
        this.setState({
            disableStop: true,
        });
        const successCallback = function() {
            that.getTaskValue(id);
        };
        const errorCallback = function() {
            that.setState({
                disableStop: false,
            });
        };
        stopTask(id, successCallback, errorCallback);
    };

    toggleCompleteTask = (option) => {
        this.setState({
            completeTaskModalOpen: !!option,
        });
    };

    toggleCommentTask = (option) => {
        this.setState({
            commentTaskModalOpen: !!option,
        });
    };
    goBack = () => {
        this.props.history.goBack();
    };

    render() {
        const that = this;
        const customPanelStyle = {
            background: '#ffffff',
            borderRadius: 4,
            marginBottom: 24,
            border: 0,
            overflow: 'hidden',
        };
        const { visibleCommentModal, loading, taskData, taskValue, disableStart, disableStop, completeTaskModalOpen, commentTaskModalOpen } = this.state;
        const {id} =  taskValue;
        console.log(this.props.user.id);
        return (
            <Card>
                <CompleteTaskModal
                    open={completeTaskModalOpen}
                    cancelFn={() => that.toggleCompleteTask(false)}
                    taskId={_.get(taskValue, 'id')}
                    callback={() => that.getTaskValue(_.get(taskValue, 'id'))}
                />
                <CommentTaskModal
                    open={commentTaskModalOpen}
                    cancelFn={() => that.toggleCommentTask(false)}
                    taskId={_.get(taskValue, 'id')}
                    callback={() => that.getTaskValue(_.get(taskValue, 'id'))}
                />
                <Spin tip="Loading..." spinning={loading}>
                    <Row>

                        <Title level={2} ellipsis={1}><Button icon="arrow-left" shape="circle" type="primary"
                                                              onClick={this.goBack}/>&nbsp;&nbsp;{_.get(taskValue, 'name')}
                        </Title>
                        <div>
                            <Link to={`/erp/tasktracker/task/${_.get(taskValue, 'id')}/edit`}>
                                <Button type="primary" ghost icon="edit"
                                    disabled={ this.props.user.staff.is_manager ? false : true}    >  
                                           {/* // this section is for using disable it button using data disabled */}
                                    Edit
                                </Button>
                            </Link>
                            <Divider type="vertical" dashed/>
                            <Button
                                type="primary"
                                ghost
                                icon="message"
                                onClick={() => this.toggleCommentTask(true)}
                            >Comments
                            </Button>

                            {/* <Divider type="vertical" dashed /> */}
                            {/* <Button type="primary" ghost>Assign</Button> */}

                            <Divider type="vertical" dashed/>
                            <Button
                                type="primary"
                                ghost
                                onClick={() => this.startTask(_.get(taskValue, 'id'))}
                                disabled={(_.get(taskValue, 'task_status') == TASK_PROGRESS_STATUS || _.get(taskValue, 'task_status') == TASK_COMPLETE_STATUS)}
                            >Start
                            </Button>

                            <Divider type="vertical" dashed/>
                            <Button
                                type="danger"
                                ghost
                                onClick={() => this.stopTask(_.get(taskValue, 'id'))}
                                disabled={(_.get(taskValue, 'task_status') == TASK_PAUSED_STATUS || _.get(taskValue, 'task_status') == TASK_OPEN_STATUS || _.get(taskValue, 'task_status') == TASK_COMPLETE_STATUS)}
                            >Stop
                            </Button>

                            <Divider type="vertical" dashed/>
                            <Button
                                type="primary"
                                ghost
                                onClick={() => this.toggleCompleteTask(true)}
                                disabled={(_.get(taskValue, 'task_status') == TASK_COMPLETE_STATUS)}
                            >Close
                                Task
                            </Button>
                        </div>

                        <Divider style={{ marginBottom: '5px' }}/>

                    </Row>
                    <Row gutter={16}>
                        <Col span={16}>
                            <Collapse
                                bordered={false}
                                defaultActiveKey={['1', '2', '3','4']}
                                expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0}/>}
                            >
                                <Panel header="Details" key="1" style={customPanelStyle}>
                                    <Details {...taskValue} />
                                </Panel>
                                <Panel header="Daily Task Report" key="4" style={customPanelStyle}>
                                    <DailyTaskResult {...taskValue} />
                                </Panel>
                                <Panel header="Daily Task Point" key="8" style={customPanelStyle}>
                                    <DailyTaskpoint {...taskValue} />
                                </Panel>
                                <Panel header="Description" key="2" style={customPanelStyle}>
                                    <Description {...taskValue} />
                                </Panel>
                                <Panel header="Activity" key="3" style={customPanelStyle}>
                                    <Activity {...taskValue} />
                                </Panel>
                            </Collapse>
                        </Col>
                        <Col span={8} >
                            <Card hoverable>
                            <Countdown title="Time Remaining" value={moment(_.get(taskValue, 'deadline'))} format="D:H:m:s" style={{textAlign:'center'}}/>
                            </Card>
                            <Collapse
                                bordered={false}
                                defaultActiveKey={['1', '2']}
                                expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0}/>}
                            >
                                <Panel header="People" key="1" style={customPanelStyle}>
                                    <Row>
                                        <DetailRow label="Assignee"
                                                   value={_.get(taskValue, 'assignee_data.first_name')}/>
                                        <DetailRow label="Reporter"
                                                   value={_.get(taskValue, 'reporter_data.first_name')}/>
                                    </Row>
                                </Panel>
                                <Panel header="Work Log" key="2" style={customPanelStyle}>
                                    <WorkLogList {...taskValue} />
                                </Panel>
                            </Collapse>
                        </Col>
                    </Row>
                </Spin>
            </Card>
        );
    }

}

export default TaskDescription;

function Details(props) {
    return (
        <div>
            <Row>
                <Col xs={24} sm={24} md={12} lg={12}>
                    <DetailRow label="Created On" value={moment(props.created_at).format('LLL')}/>
                    <DetailRow label="Priority" value={_.get(props.priority_data, 'value')}/>
                    <DetailRow label="Status" value={_.get(props, 'task_status')}/>
                    <DetailRow label="Result Target" value={_.get(props, 'result_target')}/>
                    <DetailRow label="Effert Target" value={_.get(props, 'effert_target')}/>
                </Col>
                <Col xs={24} sm={24} md={12} lg={12}>
                    <DetailRow
                        label="Time Spent"
                        value={`${moment(props.work_time, 'hh:mm:ss').from(moment('00:00:00', 'hh:mm:ss'), true)} (${props.work_time})`}
                    />
                    <DetailRow label="Deadline" value={moment(_.get(props, 'deadline')).format('LLL')}/>
                    <DetailRow label="Remark" value={_.get(props, 'remark')}/>
                    <DetailRow label="Result Point" value={_.get(props, 'result_point')}/>
                    <DetailRow label="Effert Point" value={_.get(props, 'effert_point')}/>
                </Col>
            </Row>
        </div>
    );
}


function DailyTaskResult(props) {

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            
        },

        {
            title: 'Effert Score / Day',
            dataIndex: 'effert_score',
            key: 'effert_score',
            render: (value , record)=>{
                return  `${value} / ${(props.effert_target/ (moment(props.deadline).diff(moment(props.created_at), 'days')+1)).toFixed(1)}`;
            }
            
        },
         {
            title: 'Result Score / Day',
            dataIndex: 'result_score',
            key: 'result_score',

            render: (value , record)=>{
                return  `${value} / ${(props.result_target/ (moment(props.deadline).diff(moment(props.created_at), 'days')+1)).toFixed(1)}`;
            }
        },
       
    
    
    ]



    return (
        <div>
            <h2>Daily  Tasks Report</h2>
            <Table
                dataSource={props.reccuringtarget_data}
                columns={columns}
                pagination={false}
                
            />
        </div>
    );
}


function DetailRow(props) {
    return (
        <Row>
            <Col span={8}>
                <Text type="secondary">{props.label}:</Text>
            </Col>
            <Col span={16}>
                <Text>{props.value}</Text>
            </Col>
        </Row>
    );
}

function Description(props) {
    return (<div dangerouslySetInnerHTML={{ __html: props.description }}/>);
}

function Activity(props) {

    if (props)

        return (
            <List
                className="comment-list"
                itemLayout="horizontal"
                dataSource={props.comments}
                renderItem={item => (
                    <List.Item>
                        <Comment
                            author={item.comment_by}
                            content={item.comment}
                            datetime={moment(item.created_at).format('LLL')}
                        />
                    </List.Item>
                )}
            />
        );
    return null;
}

function WorkLogList(props) {
    return (
        <List
            dataSource={props.work_log}
            renderItem={(item) => (
                <List.Item>
                    <List.Item.Meta
                        title={item.stop ? moment(item.stop).from(moment(item.start), true) : 'In Progress'}
                        description={(
                            <div style={{ width: '100%' }}>
                                <Row>
                                    <Col span={8}>
                                        <Text type="secondary">Start:</Text>
                                    </Col>
                                    <Col span={16}>
                                        <Text>{item.start ? moment(item.start).format('LLL') : '--'}</Text>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={8}>
                                        <Text type="secondary">End:</Text>
                                    </Col>
                                    <Col span={16}>
                                        <Text>{item.stop ? moment(item.stop).format('LLL') : '--'}</Text>
                                    </Col>
                                </Row>
                            </div>
                        )}
                    />

                </List.Item>
            )}
        />
    );
}


function DailyTaskpoint(props) {

    

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            
        },

       

        {
            title: 'Effert point / Day',
            dataIndex: 'effert_point',
            key: 'effert_point',

            render: (value , record)=>{
                return  `${value !== undefined && value !== NaN ? value : 0} `;
            }
        },
        {
            title: 'Result point / Day',
            dataIndex: 'result_point',
            key: 'result_point',

            render: (value , record)=>{
                return  `${value !== undefined && value !== NaN ? value : 0}  `;
            }
        },
       
    
    
    ]



    return (
        <div>
            <h2>Daily Tasks Point</h2>
            <Table
                dataSource={props.point_data}
                
                columns={columns}
                pagination={false}
                
            />
            
        </div>
    );
}