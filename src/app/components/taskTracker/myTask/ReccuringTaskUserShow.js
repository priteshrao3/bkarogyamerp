import React, { Component } from 'react'
import { Table, Divider, Tag ,Modal,Button,Row,Col,Typography,Input} from 'antd';
import { getAPI, deleteAPI } from "../../../utils/common";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import { RECURRING_TASK ,TASK_ASSIGNEE,TASK_REPORTER} from "../../../constants/api";
import * as _ from "lodash";
import ReccuringTaskUser from './ReccuringTaskUser';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
const { Text } = Typography;

export default class ReccuringTaskUserShow extends Component {

    constructor(props) {
        super(props);
        this.state = {
          taskList: [],
          assigneeList: [],
          reporterList: [],
          showTaskDetails: null,
          searchText: '',
          searchedColumn: '',
          isDeleteModalVisible: false,
          recordToDelete: null,
          showEditModal : false,
          modaleditid : null,
          opendeletemodal : false,
          deletetask : null,
          nextTaskPage: null,
          searchText: '',
          searchedColumn: '',
        }
        this.searchInput = React.createRef();
      }


      componentDidMount() {
        this.loadTaskList();
        this.loadAssignee();
        this.loadReporter()
      }


      handledelet = (id)=>{
        const that = this;
        this.setState({
          loading: true
        })
        const successFn = function (data) {
          if (data) {
            this.loadTaskList(1);
            that.setState({
    
              loading: false
            })
          } else {
            that.setState(function (prevState) {
              return {
    
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
        deleteAPI(`${'tasks/templatesUser/'}?id=${id}`, successFn, errorFn);
    
    
      
      }


      showDetails = (record) => {
        this.setState({
          showTaskDetails: record
        })
      }

      showEditModal = (con,id) =>{
        console.log(`id ${id}`)
       
        this.setState({
          showEditModal : con,
          modaleditid : id
        })
       
      }

      opendeletemodeal = (id, del) =>{
        console.log(del);
        
        this.setState({
          deletetask : id,
          opendeletemodal : del
        })
      }

      loadReporter = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                reporterList: data
            })
        }
        const errorFn = function () {

        }
        getAPI(TASK_REPORTER, successFn, errorFn);
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
          page: page
        }
        getAPI('tasks/templatesUser/', successFn, errorFn, apiParams);
      }


      // for filter section add using this
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
          
          if(dataIndex == 'assignee'){
            
            let user = this.state.assigneeList.find(u => u.first_name.toString().toLowerCase().includes(value.toLowerCase()));
            let u = record.assignee
           
            if (record.assignee === user.id){
              return record;
            } 
            
          }
          if(dataIndex == 'reporter'){
            let user = this.state.reporterList.find(u => u.first_name.toString().toLowerCase().includes(value.toLowerCase()));
            let u = record.reporter
           
            if (user != null && u === user.id){
              return record;
            } 
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
      const  columns = [
           {
             title: 'Task Name',
             dataIndex: 'name',
             key: 'name',
             ...this.getColumnSearchProps('name'),
             render: (text,record) => <Button type="link" onClick={() => this.showDetails(record)}>{text}</Button>,
           },
           {
             title: 'Assignee',
             dataIndex: 'assignee',
             key: 'assignee',
             ...this.getColumnSearchProps('assignee'),
             render: assigneeId =>{
                const user = this.state.assigneeList.find(u => u.id === assigneeId);
                return user? user.first_name : 'Unknown';
             }
           },
           {
             title: 'Report Person',
             dataIndex: 'reporter',
             key: 'reporter',
             ...this.getColumnSearchProps('reporter'),
             render: reporteeid =>{
                const reporter = this.state.reporterList.find(r =>r.id === reporteeid);
                return reporter ? reporter.first_name : 'Unknown';
             }
           },
           {
             title: 'Priority',
             key: 'priority',
             dataIndex: 'priority',
             render: (tags, data )=> (
               <span>
                <Tag color={'green'}>
                    {
                        data.priority_data.value
                    }
                </Tag>
                 {/* {data.map(tag => {
                   let color = tag.length > 5 ? 'geekblue' : 'green';
                   if (tag === 'loser') {
                     color = 'volcano';
                   }
                   return (
                     <Tag color={color} key={tag}>
                       {tag.toUpperCase()}
                     </Tag>
                   );
                 })} */}
               </span>
             ),
           },
           {
             title: 'Action',
             key: 'action',
             render: (text, record) => (
               <span>
                 <Button type='link' onClick={()=>this.showEditModal(true,text)} >
                  
                  <a>Edit </a>
                  </Button>  
                 <Divider type="vertical" />
                 <Button type='link' onClick={()=>{
                  
                  this.opendeletemodeal(text.id,true );}}>

                 <a  style={{color:'red'}}>Delete</a>
                 </Button>
               </span>
             ),
           },
         ];
         
         const {taskList,showTaskDetails,showEditModal, modaleditid, opendeletemodal,deletetask,nextTaskPage,loading} = this.state;
        return (
      <div>
        <Table  pagination={false} columns={columns} dataSource={taskList} />
        <InfiniteFeedLoaderButton
          loaderFunction={() => this.loadTaskList(nextTaskPage)}
          loading={loading}
          hidden={!nextTaskPage}
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
              <DetailRow label="Remark" value={_.get(showTaskDetails, 'remark')} />
              <DetailRow label="Days" value={_.get(showTaskDetails, 'days')} />
              <DetailRow label="Effert Point" value={_.get(showTaskDetails, 'effert_point')} />
              <DetailRow label="Result Point" value={_.get(showTaskDetails, 'result_point')} />
              <DetailRow label="Effert Target" value={_.get(showTaskDetails, 'effert_target')} />
              <DetailRow label="Result Target" value={_.get(showTaskDetails, 'result_target')} />
              <DetailRow label="Support Person" value={_.get(showTaskDetails, 'supportpersion')} />


              <Divider />
              <div dangerouslySetInnerHTML={{ __html: showTaskDetails.description }} />
            </>
          )
            : null}
          <Button onClick={() => this.showDetails(null)}>Close</Button>
        </Modal>
        <Modal 
        visible ={!!showEditModal}
        title={'Edit User Reccuring'}
        footer = {null}
        onCancel={()=>this.showEditModal(false, null)}
        width={1000}
        >

          <ReccuringTaskUser taskid={modaleditid ? modaleditid : null} />

        </Modal>
        <Modal visible={!!opendeletemodal}
        title ={'Delete Task'}
        onOk={() => {
          // Handle the delete operation here
          this.handledelet(deletetask);
          this.opendeletemodeal(null,false);
        }}
        okText={'DELETE'}
        
        onCancel={()=> this.opendeletemodeal(null,false)}
        >
          <p>Are you sure you want to delete this item?</p>

        </Modal>
      </div>
    )
  }
}

function DetailRow(props) {
  return (
    <Row gutter={16}>
      <Col span={8} style={{ textAlign: 'right' }}>
        <Text type="secondary">{props.label}:</Text>
      </Col>
      <Col span={16}>
        <Text>{props.value}</Text>
      </Col>
    </Row>
  )
}
