import { Card, Table, Button, Icon,Divider,Popconfirm } from "antd";
import React from "react";
import {Route, Switch} from "react-router";
import {Link} from "react-router-dom";
import {getAPI, interpolate, patchAPI} from "../../../../utils/common";
import {MISSION_BLOG_PAGE_SEO, MISSION_SINGLE_PAGE_SEO} from "../../../../constants/api";
import AddSEO from "./AddSEO";
import InfiniteFeedLoaderButton from "../../../common/InfiniteFeedLoaderButton";

export default class SEOList extends React.Component{
    constructor(props){
        super(props);
        this.state={
            pageSEO:null,
            loading:true
        };
        this.loadData=this.loadData.bind(this);
    }

    componentDidMount(){
        this.loadData();
    }

    loadData =(page=1)=>{
        const that =this;
        const successFn = function (data) {
            that.setState(function (prevState) {
                if (data.current ==1){
                    return{
                        pageSEO:[...data.results],
                        next:data.next,
                        loading:false
                    }
                }
                return {
                    pageSEO:[...prevState.pageSEO,...data.results],
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
            page
        };
        getAPI(MISSION_BLOG_PAGE_SEO ,successFn, errorFn, apiParams);
    };

    render(){
        const that = this;
        const columns = [{
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        },{
            title: 'Title',
            dataIndex: 'title',
            key: 'title'
        },{
            title: 'SEO Descriptions',
            dataIndex: 'meta_description',
            key: 'meta_description'
        },{
            title: 'SEO Keywords',
            dataIndex: 'keywords',
            key: 'keywords'
        },
            {
                title:'Actions',
                render:(item)=>{
                    return (
<div>
                        <Link to={`/mission/pageseo/edit/${item.id}`}>Edit</Link>
</div>
)
                }
            }];
        return(
<div><Switch>
                <Route
                  exact
                  path='/mission/pageseo/add'
                  render={(route) => <AddSEO {...this.state} {...route} loadData={this.loadData} />}
                />
                <Route
                  exact
                  path='/mission/pageseo/edit/:id'
                  render={(route) => <AddSEO loadData={this.loadData} {...this.state} {...route} />}
                />

                <Card title="Pages SEO"
                      // extra={<Link to="/mission/pageseo/add"> <Button type="primary"><Icon type="plus" /> Add</Button></Link>}
                >
                    <Table loading={this.state.loading} dataSource={this.state.pageSEO} columns={columns} pagination={false} />

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
