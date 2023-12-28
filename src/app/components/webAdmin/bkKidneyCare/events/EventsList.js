import {Button, Card, Divider, Icon, Popconfirm, Table} from "antd";
import React from "react";
import {Route, Switch} from "react-router";
import {Link} from "react-router-dom";
import moment from "moment";
import {getAPI, interpolate, patchAPI} from "../../../../utils/common";
import {BLOG_EVENTS, BLOG_POST,SINGLE_EVENTS} from "../../../../constants/api";
import AddEvent from "./AddEvent";
import InfiniteFeedLoaderButton from "../../../common/InfiniteFeedLoaderButton";

export default class DiseaseList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            events: null,
            loading:true
        };
        this.loadData = this.loadData.bind(this);
        this.deleteObject = this.deleteObject.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData =(page =1 )=> {
        const that = this;
        const successFn = function (data) {
            that.setState(function (prevState) {
                if (data.current == 1){
                    return{
                        events: [...data.results],
                        next:data.next,
                        loading:false
                    }
                }
                return {
                    events: [...prevState.events, ...data.results],
                    next:data.next,
                    loading:false
                }
            })
        };
        const errorFn = function () {
            that.setState({
                loading:false
            })

        };
        const apiParams ={
            page,
        };
        getAPI(BLOG_EVENTS, successFn, errorFn, apiParams);
    };

    deleteObject(record) {
        const that = this;
        const reqData = {};
        reqData.is_active = false;
        const successFn = function (data) {
            that.loadData();
        };
        const errorFn = function () {
        };
        patchAPI(interpolate(SINGLE_EVENTS, [record.id]), reqData, successFn, errorFn)
    }

    render() {
        const that = this;
        const columns = [{
            title: 'Event Title',
            dataIndex: 'title',
            key: 'event_title'
        }, {
            title: 'Date',
            dataIndex:'event_date',
            key: 'event_date',
            render: (item) => {
                return moment(item).format('LLL');
            }
        }, {
            title: 'Actions',
            render: (item) => {
                return (
<div>
                    <Link to={`/web/event/edit/${  item.id}`}>Edit</Link>
                    <Divider type="vertical" />
                    <Popconfirm
                      title="Are you sure delete this item?"
                      onConfirm={() => that.deleteObject(item)}
                      okText="Yes"
                      cancelText="No"
                    >
                        <a>Delete</a>
                    </Popconfirm>
</div>
)
            }
        }];
        return (
<div><Switch>
            <Route
              exact
              path='/web/event/add'
              render={(route) => <AddEvent {...this.state} loadData={this.loadData} {...route} />}
            />
            <Route
              exact
              path='/web/event/edit/:id'
              render={(route) => <AddEvent {...this.state} loadData={this.loadData} {...route} />}
            />
            <Card
              title="Events"
              extra={<Link to="/web/event/add"><Button type="primary"><Icon type="plus" /> Add</Button></Link>}
            >
                <Table loading={this.state.loading} pagination={false} dataSource={this.state.events} columns={columns} />

                <InfiniteFeedLoaderButton
                  loaderFunction={()=>this.loadData(this.state.next)}
                  loading={this.state.loading}
                  hidden={!this.state.next}
                />
            </Card>
     </Switch>
</div>
)
    }
}
