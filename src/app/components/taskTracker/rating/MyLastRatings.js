import React from "react";
import {Card, Rate, Table , Input,Button} from "antd";
import {getAPI} from "../../../utils/common";
import {TASK_ASSIGNEE, TASK_RATING} from "../../../constants/api";
import moment from "moment";
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

export default class MyLastRatings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ratings: [],
            loading: false
        }
    }

    componentDidMount() {
        this.loadRatings();
    }

    loadRatings = () => {
        const that = this;
        that.setState({
            loading:true
        })
        const successFn = function (data) {
            that.setState({
                ratings: data.results,
                loading:false
            })
        }
        const errorFn = function () {
            that.setState({
                loading:false
            })
        }
        let apiParams = {
            user: this.props.user.id,
            start:moment().subtract(3,'days').format('YYYY-MM-DD'),
            end:moment().format('YYYY-MM-DD'),
            page_size:50
        }
        getAPI(TASK_RATING, successFn, errorFn, apiParams);
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
        const {loading, ratings} = this.state;
        const column = [{
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (item) => <span>{moment(item).format('LL')}</span>
        }, {
            title: 'Assigner',
            dataIndex: 'rating_by_data',
            key: 'rating_by_data',
            ...this.getColumnSearchProps('rating_by_data'),
            render: (item) => <span>{item.first_name}</span>
        },{
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            render: (item) => <Rate disabled value={item} allowHalf/>
        }, {
            title: 'Feedback',
            dataIndex: 'feedback',
            key: 'feedback'
        }]
        return <div>
            <h2>My Last Ratings</h2>
            <Card>
                <Table pagination={false} loading={loading} dataSource={ratings} columns={column}/>
            </Card>
        </div>
    }
}
