import React from "react";
import {Card, Button, Icon, Table, Divider, Popconfirm} from "antd";
import {Route, Switch} from "react-router";
import {Redirect, Link} from "react-router-dom";
import {displayMessage, getAPI, interpolate, putAPI} from "../../../../utils/common";
import AddManageOpenings from "./AddManageOpenings"
import InfiniteFeedLoaderButton from "../../../common/InfiniteFeedLoaderButton";
import {WEB_DYNAMIC_CONTENT, WEB_DYNAMIC_SINGLE_CONTENT} from "../../../../constants/api";
import {DYNAMIC_CATEGORY_CAREER, DYNAMIC_SUBCATEGORY_OPENING} from "../../../../constants/hardData";

export default class ManageOpeningsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            offersData: null,
            loading: true
        };
        this.loadData = this.loadData.bind(this);
        this.deleteObject = this.deleteObject.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData = (page = 1) => {
        const that = this;
        const successFn = function (data) {
            that.setState(function (prevSate) {
                if (data.current == 1) {
                    return {
                        offersData: [...data.results],
                        next: data.next,
                        loading: false
                    }
                }
                return {
                    offersData: [...prevSate.offersData, ...data.results],
                    next: data.next,
                    loading: false
                }
            })
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })

        };
        const apiParams = {
            "language": "ENGLISH",
            "category": DYNAMIC_CATEGORY_CAREER,
            "sub_category": DYNAMIC_SUBCATEGORY_OPENING,
            page
        }

        getAPI(WEB_DYNAMIC_CONTENT, successFn, errorFn, apiParams);

    }

    deleteObject(record) {
        const that = this;
        const reqData = {...record};
        reqData.is_active = false;
        const successFn = function (data) {
            that.loadData();
        };
        const errorFn = function () {
        };
        putAPI(interpolate(WEB_DYNAMIC_SINGLE_CONTENT, [record.id]), reqData, successFn, errorFn)
    }

    render() {
        const that = this;
        const columns = [{
            title: 'Name',
            dataIndex: 'title',
            key: 'title'
        }, {
            title: 'Description',
            render: (item) => {
                return <div dangerouslySetInnerHTML={{__html: item.body}}/>
            }
        }, {
            title: 'Actions',
            render: (item) => {
                return (
                    <div>
                        <Link to={`/web/openings/edit/${item.id}`}>Edit</Link>
                        <Divider type="vertical"/>
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
            <div>
                <Switch>
                    <Route
                        exact
                        path='/web/openings/edit/:id'
                        render={(route) => <AddManageOpenings loadData={this.loadData} {...this.state} {...route} />}
                    />
                    <Route
                        exact
                        path='/web/openings/add'
                        render={(route) => <AddManageOpenings loadData={this.loadData} {...this.state} {...route} />}
                    />
                    <Card title={"Current Openings"} extra={<Link to="/web/openings/add">
                        <Button type="primary" icon={"plus"} style={{float: 'right'}}>Add</Button>
                    </Link>}>
                        <Table loading={this.state.loading} dataSource={this.state.offersData} pagination={false}
                               columns={columns}/>
                        <InfiniteFeedLoaderButton
                            loaderFunction={() => this.loadData(this.state.next)}
                            loading={this.state.loading}
                            hidden={!this.state.next}
                        />
                    </Card>
                </Switch>
            </div>
        )
    }
}
