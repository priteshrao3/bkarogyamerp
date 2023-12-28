import {Button, Card, Divider, Icon, Popconfirm, Table} from "antd";
import React from "react";
import {Route, Switch} from "react-router";
import {Link} from "react-router-dom";
import {getAPI, interpolate, patchAPI} from "../../../../utils/common";
import {BLOG_CONTACTUS, SINGLE_CONTACT} from "../../../../constants/api";
import AddContacts from "./AddContacts";
import InfiniteFeedLoaderButton from "../../../common/InfiniteFeedLoaderButton";

export default class ContactsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contacts: [],
            loading:true
        };
        this.loadData = this.loadData.bind(this);
        this.deleteObject = this.deleteObject.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData =(page = 1)=> {
        const that = this;
        const successFn = function (data) {
            that.setState(function (prevState) {
                if (data.current == 1){
                    return{
                        contacts: [...data.results],
                        next:data.next,
                        loading:false
                    }
                }
                return {
                    contacts: [...prevState.contacts, ...data.results],
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
        const apiParams={
            page,
        }
        getAPI(BLOG_CONTACTUS, successFn, errorFn, apiParams);
    }

    deleteObject(record) {
        const that = this;
        const reqData = {};
        reqData.is_active = false;
        const successFn = function (data) {
            that.loadData();
        };
        const errorFn = function () {
        };
        patchAPI(interpolate(SINGLE_CONTACT, [record.id]), reqData, successFn, errorFn)
    }

    render() {
        const that = this;
        const columns = [{
            title: 'Rank',
            dataIndex: 'contact_rank',
            key: 'rank'
        }, {
            title: 'Address',
            dataIndex: 'address',
            key: 'address'
        }, {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        }, {
            title: 'Phone',
            dataIndex: 'phone_no',
            key: 'phone'
        },
            {
                title: 'Actions',
                render: (item) => {
                    return (
<div>
                        <Link to={`/web/contact/edit/${  item.id}`}>Edit</Link>
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
              path='/web/contact/add'
              render={(route) => <AddContacts {...this.state} {...route} loadData={this.loadData} />}
            />
            <Route
              exact
              path='/web/contact/edit/:id'
              render={(route) => <AddContacts {...this.state} {...route} loadData={this.loadData} />}
            />
            <Card
              title="Contacts"
              extra={<Link to="/web/contact/add"> <Button type="primary"><Icon type="plus" /> Add</Button></Link>}
            >
                <Table loading={this.state.loading} dataSource={this.state.contacts} columns={columns} pagination={false} />

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
