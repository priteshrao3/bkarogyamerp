import React from "react";
import {Route, Switch} from "react-router";
import {Button, Card, Divider, Icon, Popconfirm, Table} from "antd";
import {Link} from "react-router-dom";
import AddOrEditZoomUser from "./AddOrEditZoomUser";
import {getAPI, interpolate, patchAPI, postAPI} from "../../../../utils/common";
import {MEETING_USER, SINGLE_POST} from "../../../../constants/api";

export default class ZoomUser extends React.Component{
    constructor(props){
        super(props);
        this.state={
            loading:true,
        }
        this.loadData = this.loadData.bind(this);
    }

    componentWillMount() {
        this.loadData();
    }

    loadData(){
        const that=this;
        const successFn=function (data) {
            that.setState({
                zoomUser:data,
                loading:false,
            })
        }
        const errorFn =function () {
            that.setState({
                loading:false,
            })
        }
        getAPI(MEETING_USER,successFn,errorFn);
    }

    deleteObject(record) {
        const that = this;
        const reqData = {};
        reqData.id=record.id;
        reqData.is_active = false;
        const successFn = function (data) {
            that.loadData();
        };
        const errorFn = function () {
        };
        postAPI(interpolate(MEETING_USER, [record.id]), reqData, successFn, errorFn)
    }

    render() {
        const that=this;
            const columns=[
                {
                    title: 'User Name',
                    dataIndex: 'username',
                    key: 'username'
                },{
                    title: 'API Key',
                    dataIndex: 'API_Key',
                    key: 'API_key'
                },{
                    title: 'API Secret',
                    dataIndex: 'API_Secret',
                    key: 'API_Secret'
                },{
                    title: 'Actions',
                    render: (item) => {
                        return (
<div>
                            <Link to={`/erp/settings/zoom-user/edit/${  item.id}`}>Edit</Link>
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
                }
            ];
        return( 
<div>
                <Switch>
                    <Route
                      exact
                      path='/erp/settings/zoom-user/add'
                      render={(route) => <AddOrEditZoomUser {...this.state} {...route} loadData={this.loadData} />}
                    />

                    <Route exact path="/erp/settings/zoom-user/edit/:id" render={(route)=><AddOrEditZoomUser loadData={this.loadData} {...route} {...this.state} />} />

                    <Card
                      title="Zoom User"
                      extra={
                        <Link to="/erp/settings/zoom-user/add"><Button type="primary"><Icon type="plus" /> Add Zoom User</Button></Link>
                    }
                    >


                        <Table dataSource={this.state.zoomUser} columns={columns} pagination={false} />
                    </Card>
                </Switch>
</div>
        )
    }
}