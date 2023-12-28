import {Button, Card, Col, Divider, Modal, Row, Table, Typography, Input} from "antd";

import React from "react";
import * as _ from 'lodash';
import {Link} from "react-router-dom";
import {RECURRING_TASK} from "../../../constants/api";
import {getAPI} from "../../../utils/common";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import RecurringTaskAssignModal from "./RecurringTaskAssignModal";
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
const {Text} = Typography;
export default class DepartmentRecurringTaskList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            taskList: [],
            showTaskDetails: null
        }
    }

    componentDidMount() {
        this.loadTaskList()
    }

    loadTaskList = (page) => {
        const that = this;
        this.setState({
            loading: true
        })
        const successFn = function (data) {
            if (data.current == 1) {
                that.setState({
                    taskList: data.results,
                    nextTaskPage: data.next,
                    loading: false
                })
            } else {
                that.setState(function (prevState) {
                    return {
                        taskList: [...prevState.taskList, ...data.results],
                        nextTaskPage: data.next,
                        loading: false
                    }
                })

            }
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })
        }
        const apiParams = {
            page,
            department: this.props.user.staff.department
        }
        getAPI(RECURRING_TASK, successFn, errorFn, apiParams);
    }

    assignToSelf = (recordId) => {
        this.setState({
            assignTaskModalId: recordId
        })
    }

    showDetails = (record) => {
        this.setState({
            showTaskDetails: record
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
        const tableColomns = [{
            title: 'Task',
            dataIndex: 'name',
            key: 'name',
            ...this.getColumnSearchProps('name'),
            render: (item, record) => <Button type="link" onClick={() => this.showDetails(record)}>{item}</Button>
        }, {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            ...this.getColumnSearchProps('priority_data'),
            render: (item, record) => (
                <span>{record.priority && record.priority_data ? record.priority_data.value : ''}</span>)
        }, {
            title: 'Days',
            dataIndex: 'days',
            key: 'days',
            ...this.getColumnSearchProps('days'),

        }, {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            ...this.getColumnSearchProps('department_data'),
            render: (item, record) => (
                <span>{record.department && record.department_data ? record.department_data.value : ''}</span>)
        }, {
            title: 'Designation',
            dataIndex: 'designation',
            key: 'designation',
            ...this.getColumnSearchProps('designation_data'),
            render: (item, record) => (
                <span>{record.designation && record.designation_data ? record.designation_data.value : ''}</span>)
        }, {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            
            render: (item, record) => (
<span>
                <Button type="link" onClick={() => this.assignToSelf(record.id)}>Assign to Self</Button>

</span>
)
        }]
        const {taskList, nextTaskPage, loading, assignTaskModalId, showTaskDetails} = this.state;
        return (
            <div>
                <Table pagination={false} dataSource={taskList} columns={tableColomns} loading={loading}  />
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
                  title={_.get(showTaskDetails, 'name')}
                  footer={null}
                  onCancel={() => this.showDetails(null)}
                >
                    {showTaskDetails ? (
                            <>
                                <DetailRow label="Department" value={_.get(showTaskDetails, 'department_data.value')} />
                                <DetailRow label="Designation" value={_.get(showTaskDetails, 'designation_data.value')} />
                                <DetailRow label="Priority" value={_.get(showTaskDetails, 'priority_data.value')} />
                                <DetailRow label="Days" value={_.get(showTaskDetails, 'days')} />
                                <DetailRow label="Remark" value={_.get(showTaskDetails, 'remark')} />
                                <Divider />
                                <div dangerouslySetInnerHTML={{__html: showTaskDetails.description}} />
                            </>
                        )
                        : null}
                    <Button onClick={() => this.showDetails(null)}>Close</Button>
                </Modal>
            </div>
        )
    }
}

function DetailRow(props) {
    return (
        <Row gutter={16}>
            <Col span={8} style={{textAlign: 'right'}}>
                <Text type="secondary">{props.label}:</Text>
            </Col>
            <Col span={16}>
                <Text>{props.value}</Text>
            </Col>
        </Row>
    )
}
