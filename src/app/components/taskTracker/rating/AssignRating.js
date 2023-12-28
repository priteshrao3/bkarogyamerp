import React from "react";
import {Button, Card, Col, DatePicker, Progress, Rate, Row, Table, Tag,Input} from "antd";
import CommentTaskModal from "../common/CommentTaskModal";
import {TASK_DATEWISE_RATING} from "../../../constants/api";
import {getAPI} from "../../../utils/common";
import moment from "moment";
import RatingFeedbackForm from "../common/RatingFeedbackForm";
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

export default class AssignRating extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: moment(),
            rating: []
        }
    }

    componentDidMount() {
        this.loadRating();
    }

    changeDate = (date) => {
        let that = this;
        this.setState({
            selectedDate: moment(date)
        }, function () {
            that.loadRating()
        })
    }
    toggleRatingForm = (option) => {
        this.setState({
            ratingTaskModalOpen: option
        })
        if (!option) {
            this.loadRating();
        }
    }
    loadRating = () => {
        let that = this;
        this.setState({
            loading: true
        })
        let successFn = function (data) {
            that.setState({
                rating: data,
                loading: false
            })
        }
        let errorFn = function () {
            that.setState({
                loading: false
            })
        }
        let apiParams = {
            date: this.state.selectedDate.format('YYYY-MM-DD')
        }
        getAPI(TASK_DATEWISE_RATING, successFn, errorFn, apiParams)
    }
    disableFutureDate = (currentDate)=>{
        return !moment(currentDate).isBefore(moment());
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
        let i = 1;
        const column = [{
            title: 'S.No.',
            dataIndex: 'count',
            key: 'count',
            render: (item) => <span>{i++}</span>
        }, {title: "Emp. ID", dataIndex: 'emp_id', key: 'emp_id'}, {
            title: "Name",
            dataIndex: 'first_name',
            key: 'first_name',
            ...this.getColumnSearchProps('first_name'),
        }, {
            title: "Rating",
            dataIndex: 'rating',
            key: 'rating',
            render: (item) => item ? <Rate value={item.rating} disabled allowHalf/> : <Tag color="red">Pending</Tag>
        }, {
            title: "Feedback",
            dataIndex: 'rating',
            key: 'feedback',
            render: (item) => item ? <p>{item.feedback}</p> : null
        }, {
            title: "Action",
            dataIndex: 'action',
            key: 'action',
            render: (item, record) => <Button type={"link"} size={"small"}
                                              onClick={() => this.toggleRatingForm(record)}>Assign Rating</Button>
        }];
        const {ratingTaskModalOpen, rating, loading, selectedDate} = this.state;
        return (
            <div>
                <h2>Daily Ratings
                    <DatePicker onChange={this.changeDate} value={selectedDate} style={{float: 'right'}}
                                disabledDate={this.disableFutureDate}
                                format={"DD-MM-YYYY"}/>
                </h2>
                <Card>
                    <Row>
                        <Col span={24}>
                            <Table columns={column} loading={loading} dataSource={rating} pagination={false}/>
                        </Col>
                    </Row>
                    <RatingFeedbackForm
                        open={!!ratingTaskModalOpen}
                        key={ratingTaskModalOpen ? ratingTaskModalOpen.id : null}
                        record={{...ratingTaskModalOpen, date: selectedDate}}
                        cancelFn={() => this.toggleRatingForm(null)}
                    />
                </Card>
            </div>
        )
    }
}
