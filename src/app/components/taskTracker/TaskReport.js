import React from "react";
import {Button, Card, Col, DatePicker, Row, Select, Statistic, Table, Tag,Input,Progress} from "antd";
import {Link} from "react-router-dom";
import moment from "moment";
import {HR_SETTINGS, TASK, TASK_ASSIGNEE, TASK_REPORTER} from "../../constants/api";
import {getAPI} from "../../utils/common";
import InfiniteFeedLoaderButton from "../common/InfiniteFeedLoaderButton";
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

const {RangePicker} = DatePicker;
const dateFormat = 'YYYY/MM/DD';

export default class TaskReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTask: [],
            assigneeList: [],
            priorityData: [],
            assignee: this.props.user.staff.is_manager ? null : this.props.user.id,
            deadline_gte: moment().startOf('month').format(),
            deadline_lte: moment().endOf('month').format(),
            priority: null,
            incomplete: null,
            loading:false
        };
    }

    componentDidMount() {
        this.loadTask();
        this.loadAssignee();
        this.loadPriority();
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
          if(data.current == 1)
          {

            that.setState({
                currentTask: data.results,
                nextTaskPage: data.next,
                taskCount: data.count,
                loading: false
            })
          }else {
            that.setState(function (prevState) {
                return {
                    currentTask: [...prevState.currentTask,...data.results],
                    nextTaskPage: data.next,
                    loading: false,
                }
            });
        }

        }

        const errorFn = function (error) {
            that.setState({
                loading: false
            })

        }
        const params = {
            page: page,
            // reporter:this.props.user.id,
        };
        console.log(this.props.user.is_superuser)
        if(! this.props.user.is_superuser){
          params.reporter = this.props.user.id
        }
        if (this.state.incomplete) {
            params.incomplete = this.state.incomplete
        }
        if (this.state.priority) {
            params.priority = this.state.priority
        }
        if (this.state.assignee) {
            params.assignee = this.state.assignee;
        }
        if (this.state.deadline_gte) {
            params.deadline_gte = this.state.deadline_gte;
        }
        if (this.state.deadline_lte) {
            params.deadline_lte = this.state.deadline_lte;
        }
        getAPI(TASK, successFn, errorFn, params)
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

    loadPriority = () => {
        const that = this;
        const successFn = function (result) {
            that.setState({
                priorityData: result,
            })
        }

        const errorFn = function (error) {
        }
        const apiParams = {
            name: "Task Priority"
        }
        getAPI(HR_SETTINGS, successFn, errorFn, apiParams)
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
        const {currentTask, taskCount, priorityData, assigneeList, deadline_gte, deadline_lte, assignee, priority, incomplete} = this.state;
        const columns = [{
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
            title: 'Assignee',
            dataIndex: 'assignee',
            key: 'assignee',
            ...this.getColumnSearchProps('assignee_data'),
            render: (item, record) => (
                <span>{record.assignee && record.assignee_data ? record.assignee_data.first_name : ''}</span>)
        }, {
            title: 'Assigner',
            dataIndex: 'reporter',
            key: 'reporter',
            ...this.getColumnSearchProps('reporter'),
            render: (item, record) => (
                <span>{record.reporter && record.reporter_data ? record.reporter_data.first_name : ''}</span>)
        }, {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            ...this.getColumnSearchProps('priority_data'),
            render: (item, record) => (
                <span>{record.priority && record.priority_data ? record.priority_data.value : ''}</span>)
        }, {
            title: 'Status',
            dataIndex: 'task_status',
            key: 'task_status',
            ...this.getColumnSearchProps('task_status'),
            render: (item,record)=>(
              <Tag color={item == "In Progress" ? "blue" :  item == "Paused" ? "red" : ""}>
                {item}
              </Tag>
            )
        }, {
            title: 'Delayed',
            dataIndex: 'delayed',
            key: 'delayed',
            
            render: (item, record) => ( moment(record.deadline).isBefore(moment(record.completed_on)))  ?
                    <Tag color="pink">Delayed    </Tag> : <Tag color="green">OnTime    </Tag>
        }, {
            title: 'DeadLine',
            dataIndex: 'deadline',
            key: 'deadline',
            render: (item, record) => (
                <span>{record.deadline ? moment(record.deadline).format('LLL') : null}</span>)

        },
        {
          width: 150,
          title: ' Progress E/R',
          dataIndex: 'result_target',
          key: 'result_target',
          render: (value, record) => {
              let sumresulttarget = record.reccuringtarget_data.reduce((accu, currval)=>{
                  return accu+currval.result_score
              },0)
              let sumtarget = record.reccuringtarget_data.reduce((accu, currval)=>{
                return accu+currval.effert_score
            },0)

            let percent1 = (record.reccuringtarget_data && record.effert_target ? (100 *(  sumtarget / value  )).toFixed(0) : 0) || 0;

              let percent = (record.reccuringtarget_data && record.result_target && sumresulttarget ? (  100 *(sumresulttarget / value || 0)).toFixed(0) : 0) || 0;
              return <span>
             

              
              <Progress
                  percent={percent}
                  strokeColor={percent>90?"#87d068":(percent>50?"#d0c268":"#f50")}/>
              
              <Progress
                  percent={percent1}
                  strokeColor={percent1>90?"#87d068":(percent1>50?"#d0c268":"#f50")}/>

              
              </span>

          },export:(value,record)=> (record.month_target && record.month_target.target && record.month_target.working_days ? ((value || 0) * 100 / (record.month_target.target / record.month_target.working_days)).toFixed(0) : 0) || 0 +"%"

      },
      
      
      ];
        return (
            <div>
                <h2>Task Report</h2>
                <Card>
                    <Row gutter={16}>
                        <Col span={6}>
                            <p>Status</p>
                            <Select
                                showSearch
                                optionFilterProp="children"
                                style={{width: '100%'}}
                                onChange={(e) => this.setFilters({'incomplete': e})}
                                value={incomplete}
                            >
                                <Select.Option value={null}>All</Select.Option>
                                <Select.Option value="true">Incomplete</Select.Option>
                                <Select.Option value="false">Complete</Select.Option>
                            </Select>
                        </Col>
                        <Col span={6}>
                            <p>Priority</p>
                            <Select
                                showSearch
                                optionFilterProp="children"
                                style={{width: '100%'}}
                                onChange={(e) => this.setFilters({'priority': e})}
                                value={priority}
                            >
                                <Select.Option value={null}>All</Select.Option>
                                {priorityData.map(item => <Select.Option value={item.id}key={item.id} >{item.value}</Select.Option>)}
                            </Select>
                        </Col>
                        <Col span={6}>
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
                        {this.props.user.staff.is_manager ? (
                            <Col span={6}>
                                <p>Assignee</p>
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    style={{width: '100%'}}
                                    onChange={(e) => this.setFilters({'assignee': e})}
                                    value={assignee}
                                >
                                    <Select.Option value={null}>All</Select.Option>
                                    {assigneeList.map(item => (
                                        <Select.Option
                                            value={item.id}
                                            key={item.id}
                                        >{item.first_name}&nbsp;({item.emp_id})
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Col>
                        ) : null}
                    </Row>
                </Card>
                <Card>
                    <Row style={{textAlign: 'center', marginBottom: 10}}>
                        <Statistic value={taskCount} title="Task Count"/>
                    </Row>
                    <Table
                        loading={this.state.loading}
                        dataSource={currentTask}
                        columns={columns}
                        pagination={false}
                    />
                    <InfiniteFeedLoaderButton
                        loaderFunction={() => this.loadTask(this.state.nextTaskPage)}
                        loading={this.state.loading}
                        hidden={!this.state.nextTaskPage}
                    />
                </Card>
            </div>
        )
    }
}
