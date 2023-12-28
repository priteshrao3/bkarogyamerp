import {Button, Card, Divider, Icon, Popconfirm, Table} from "antd";
import React from "react";
import {Route, Switch} from "react-router";
import {Link} from "react-router-dom";
import {getAPI, interpolate, patchAPI} from "../../../../utils/common";
import {
    BLOG_FACILITY, SINGLE_FACILITY,
} from "../../../../constants/api";
import AddFacility from "./AddFacility";
import InfiniteFeedLoaderButton from "../../../common/InfiniteFeedLoaderButton";

export default class FacilityList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            facility: null,
            loading:true
        };
        this.loadData = this.loadData.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData =(page =1) => {
        const that = this;
        const successFn = function (data) {
            that.setState(function (prevState) {
                if (data.current == 1){
                    return{
                        facility: [...data.results],
                        next:data.next,
                        loading:false
                    }
                }
                return {
                    facility: [...prevState.facility, ...data.results],
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
        getAPI(BLOG_FACILITY, successFn, errorFn, apiParams);
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
        patchAPI(interpolate(SINGLE_FACILITY, [record.id]), reqData, successFn, errorFn)
    }

    render() {
        const that = this;
        const columns = [{
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        }, {
            title: 'Actions',
            render: (item) => {
                return (
<div>
                    <Link to={`/web/facilities/edit/${  item.id}`}>Edit</Link>
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
              path='/web/facilities/add'
              render={(route) => <AddFacility loadData={this.loadData} {...this.state} {...route} />}
            />
            <Route
              exact
              path='/web/facilities/edit/:id'
              render={(route) => <AddFacility loadData={this.loadData} {...this.state} {...route} />}
            />
            <Card
              title="Facilities"
              extra={(
<Link to="/web/facilities/add"> <Button type="primary"><Icon
  type="plus"
/> Add
                                </Button>
</Link>
)}
            >
                <Table loading={this.state.loading} pagination={false} dataSource={this.state.facility} columns={columns} />

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
