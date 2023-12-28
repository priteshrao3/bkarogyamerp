import React, {Component} from "react";
import {Link} from "react-router-dom";
import {Table, Button, Divider, Tag, Input} from "antd";
import * as _ from "lodash";
import moment from "moment";
import CommentModal from "./CommentModal";
import {getAPI, interpolate} from "../../../utils/common";
import {TASK} from "../../../constants/api";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import {startTask, stopTask} from "../../../utils/taskTracker";
import CompleteTaskModal from "../common/CompleteTaskModal";
import CommentTaskModal from "../common/CommentTaskModal";
import {
    TASK_COMPLETE_STATUS,
    TASK_OPEN_STATUS,
    TASK_PAUSED_STATUS,
    TASK_PROGRESS_STATUS
} from "../../../constants/hardData";
import ClockLoader from "react-spinners/ClockLoader";
import ResultTargetTaskModal from "../common/ResultTargetTaskModal";
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

class CurrentTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visibleCommentModal: false,
            
            loading: false,
            commentData: null,
            
        }
    }


    componentDidMount() {
        this.loadTask();
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
                loading: false
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
            incomplete: true
        }
        getAPI(TASK, successFn, errorFn, params)
    }

    startTask = (id) => {
        const that = this;
        const successCallback = function () {
            that.loadTask()
        }
        const errorCallback = function () {
        }
        startTask(id, successCallback, errorCallback)
    }

    stopTask = (id) => {
        const that = this;
        const successCallback = function () {
            that.loadTask()
        }
        const errorCallback = function () {
        }
        stopTask(id, successCallback, errorCallback)
    }

    toggleCompleteTask = (option) => {
        this.setState({
            completeTaskModalOpen: option
        })
    }

    toggleCommentTask = (option) => {
        this.setState({
            commentTaskModalOpen: option
        })
    }

    toggleEditTarget = (toogle,id, name,t)=>{
        this.setState({
            tragetTaskModalOpen: toogle,
            taskname : name,
            tskid : id,
            tdata : t

        })
    }


 // filter method sarting
 handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = (clearFilters) => {
    clearFilters();
    this.setState({
      searchText: '',
    });
  };

getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={this.searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />

        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          style={{
            width: 90,
          }}
        >
          Search
        </Button>
        <Button
          onClick={() => clearFilters && this.handleReset(clearFilters)}
          size="small"
          style={{
            width: 90,
          }}
        >
          Reset
        </Button>
        <Button
          type="link"
          size="small"
          onClick={() => {
            confirm({
              closeDropdown: false,
            });
            this.setState({
              searchText: selectedKeys[0],
              searchedColumn: dataIndex,
            });
          }}
        >
          Filter
        </Button>
        <Button
          type="link"
          size="small"
          onClick={() => {
            close();
          }}
        >
          Close
        </Button>

      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) => {
        console.log(dataIndex);
        console.log(value);
      
      if(dataIndex == 'assignee_data'){
        
        
        let data = record.assignee_data.first_name.toLowerCase().includes(value.toLowerCase());
        return   data ? record : null
        
        
      }
      if(dataIndex == 'priority_data'){
        
        
        let data = record.priority_data.value.toLowerCase().includes(value.toLowerCase());
        return   data ? record : null
        
        
      }
      if(dataIndex == 'department_data'){
        
        
        let data = record.department_data.value.toLowerCase().includes(value.toLowerCase());
        return   data ? record : null
        
        
      }
      if(dataIndex == 'designation_data'){
        
        
        let data = record.designation_data.value.toLowerCase().includes(value.toLowerCase());
        return   data ? record : null
        
        
      }
      if(dataIndex == 'reporter'){
        
        
        let data = record.reporter_data.first_name.toLowerCase().includes(value.toLowerCase());
        return   data ? record : null
       
        
      }
      
      return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase());
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.current.select(), 100);
      }
    },
    render: (text) => {
      console.log(`hii ${text}`);
      return this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : 'text'}
        />
      ) : (
        text
      );
    }
  });



  // end filter method section here


    render() {
        const {visibleCommentModal,tskid,tdata, taskname,currentTask, commentData, completeTaskModalOpen, commentTaskModalOpen, tragetTaskModalOpen} = this.state;

        const createMarkup = (content) => {
            return {
                __html: content
            };
        };

        const columns = [

            {
                title: 'Task Name',
                dataIndex: 'name',
                key: 'name',
                ...this.getColumnSearchProps('name'),
                render: (item, record) => (
                    <Link to={`/erp/tasktracker/task/${record.id}/view`}>
                        {record.name}
                    </Link>
                )
            },
            {
              title: 'Type',
              dataIndex: 'is_recurring',
              key: 'is_recurring',
              render: (item, record) => (
                <Tag color={item ? "green" : "red"} >
                    {`${item ? "Recurring" : "Current"}`}
                </Tag>
            )
            },
            {
                title: 'Assigner',
                dataIndex: 'reporter',
                key: 'reporter',
                ...this.getColumnSearchProps('reporter'),
                render: (item, record) => (
                    <span>{record.reporter && record.reporter_data ? record.reporter_data.first_name : ''}</span>)
            },
            {
                title: 'Priority',
                dataIndex: 'priority',
                key: 'priority',
                ...this.getColumnSearchProps('priority_data'),
                render: (item, record) => (
                    <Tag color={ record.priority_data.value === 'Urgent Basis' ? 'red' : record.priority_data.value === 'High' ? 'blue' : 'green' }>{record.priority && record.priority_data ? record.priority_data.value : ''}</Tag>)
            },
            {
                title: 'Status',
                dataIndex: 'task_status',
                key: 'task_status',
                ...this.getColumnSearchProps('task_status'),
                render:(value,record)=><span style={{display:'inline-flex'}}>{(_.get(record, 'task_status') == TASK_PROGRESS_STATUS ? <ClockLoader size={20} color={"#1DA57A"} /> :null)}&nbsp;&nbsp;<Tag color={value == 'In Progress' ? "green" : value == "Paused" ? "blue" : "red" }>{value}</Tag></span>
            }, {
                title: 'Time Remaining',
                dataIndex: 'deadline',
                key: 'deadline',
                render: (item, record) => (
                    <span>{record.deadline ? (moment(record.deadline) > moment() ? moment(record.deadline).from(moment(), true) :
                        <Tag color="red">
                            Delayed By {moment().from(moment(record.deadline), true)}
                        </Tag>) : null}</span>)

            }, {
                title: "Action",
                key: "action",
                render: (text, record) => (
                    <span>
                        <Button.Group size="small">
                            <Button
                                size="small"
                                type="link"
                                onClick={() => this.startTask(record.id)}
                                disabled={(_.get(record, 'task_status') == TASK_PROGRESS_STATUS || _.get(record, 'task_status') == TASK_COMPLETE_STATUS)}
                            >Start
                            </Button>
                            <Button
                                size="small"
                                type="link"
                                onClick={() => this.stopTask(record.id)}
                                disabled={(_.get(record, 'task_status') == TASK_PAUSED_STATUS || _.get(record, 'task_status') == TASK_OPEN_STATUS || _.get(record, 'task_status') == TASK_COMPLETE_STATUS)}
                            > Stop
                            </Button>
                            <Button
                                type="link"
                                onClick={() => this.toggleCompleteTask(record.id)}
                                disabled={(_.get(record, 'task_status') == TASK_COMPLETE_STATUS)}
                            >Close
                            </Button>
                            <Button
                                type="link"
                                icon="message"
                                onClick={() => this.toggleCommentTask(record.id)}
                            >Comments
                            </Button>
                            <Button
                                type="link"
                                icon="message"
                                onClick={() => this.toggleEditTarget(true ,record.id,record.name,record)}
                            >Edit Target
                            </Button>
                        </Button.Group>
                    </span>
                )
            }
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
                


                <ResultTargetTaskModal  
                    {...this.props}
                    open={!!tragetTaskModalOpen}
                    key={tragetTaskModalOpen}
                    cancelFn={() => this.toggleEditTarget(false)}
                    loaddata = {()=> this.loadTask()}
                    taskId={tskid}
                    taskname = {taskname}
                    tdata = {tdata}
                    
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


export default CurrentTask;
