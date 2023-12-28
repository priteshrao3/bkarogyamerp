import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Divider, Tag , Input} from 'antd';
import moment from 'moment';
import { getAPI, interpolate } from '../../../utils/common';
import { TASK } from '../../../constants/api';
import InfiniteFeedLoaderButton from '../../common/InfiniteFeedLoaderButton';
import CommentTaskModal from '../common/CommentTaskModal';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

class DepartmentTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTask: [],
            loading: false,
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
            if (data.current == 1) {
                that.setState({
                    currentTask: data.results,
                    nextTaskPage: data.next,
                    loading: false
                })
            } else {
                that.setState(function (prevState) {
                    return {
                        currentTask: [...prevState.currentTask, ...data.results],
                        nextTaskPage: data.next,
                        loading: false
                    }
                })

            }
        };

        const errorFn = function(error) {
            that.setState({
                loading: false,
            });

        };
        const params = {
            page: page,
            department: this.props.user.staff.department,
            incomplete: true,
        };
        getAPI(TASK, successFn, errorFn, params);
    };


    toggleCommentTask = (option) => {
        this.setState({
            commentTaskModalOpen: option,
        });
    };


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
        const { currentTask, completeTaskModalOpen, commentTaskModalOpen } = this.state;
        let that = this;
        const columns = [

            {
                title: 'Task Name',
                dataIndex: 'name',
                key: 'name',
                ...this.getColumnSearchProps('name'),
                render: (item, record) => (
                    <Link to={`/erp/tasktracker/task/${record.id}/view`}>
                        <a>{record.name}</a>
                    </Link>
                ),
            }, {
                title: 'Assignee',
                dataIndex: 'assignee',
                key: 'assignee',
                ...this.getColumnSearchProps('assignee_data'),
                render: (item, record) => (
                    <span>{record.assignee && record.assignee_data ? record.assignee_data.first_name : ''}</span>),
            },
            {
                title: 'Assigner',
                dataIndex: 'reporter',
                key: 'reporter',
                ...this.getColumnSearchProps('reporter'),
                render: (item, record) => (
                    <span>{record.reporter && record.reporter_data ? record.reporter_data.first_name : ''}</span>),
            },
            {
                title: 'Priority',
                dataIndex: 'priority',
                key: 'priority',
                ...this.getColumnSearchProps('priority_data'),
                render: (item, record) => (
                    <span>{record.priority && record.priority_data ? record.priority_data.value : ''}</span>),
            },
            {
                title: 'Status',
                dataIndex: 'task_status',
                key: 'task_status',
                ...this.getColumnSearchProps('task_status'),
            }, {
                title: 'Time Remaining',
                dataIndex: 'deadline',
                key: 'deadline',
                render: (item, record) => (
                    <span>{record.deadline ? (moment(record.deadline) > moment() ? moment(record.deadline).from(moment(), true) :
                        <Tag color="red">
                            Delayed By {moment().from(moment(record.deadline), true)}
                        </Tag>) : null}</span>),

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
                <CommentTaskModal
                    open={!!commentTaskModalOpen}
                    key={commentTaskModalOpen}
                    cancelFn={() => this.toggleCommentTask(false)}
                    taskId={completeTaskModalOpen}
                />
                <Table loading={that.state.loading}
                       dataSource={currentTask}
                       columns={columns}
                       pagination={false}
                />
                <InfiniteFeedLoaderButton
                    loaderFunction={() => this.loadTask(that.state.nextTaskPage)}
                    loading={that.state.loading}
                    hidden={!that.state.nextTaskPage}
                />

            </div>
        );
    }
}


export default DepartmentTask;
