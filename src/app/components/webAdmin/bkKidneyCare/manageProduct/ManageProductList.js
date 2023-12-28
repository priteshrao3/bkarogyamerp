import React from "react";
import {Card, Button, Icon, Table, Divider, Popconfirm, Avatar} from "antd";
import {Route, Switch} from "react-router";
import {Redirect, Link} from "react-router-dom";
import {INPUT_FIELD, QUILL_TEXT_FIELD ,SUCCESS_MSG_TYPE, SINGLE_IMAGE_UPLOAD_FIELD} from "../../../../constants/dataKeys";
import {displayMessage, getAPI, interpolate, makeFileURL, patchAPI} from "../../../../utils/common";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {MANAGE_PRODUCT, MANAGE_SINGLE_PRODUCT} from "../../../../constants/api";
import AddManageProduct from "./AddManageProduct"
import InfiniteFeedLoaderButton from "../../../common/InfiniteFeedLoaderButton";

export default class ManageProductList extends React.Component{
	constructor(props){
		super(props);
		this.state= {
			productData:null,
            loading:true
		};
		this.loadData = this.loadData.bind(this);
		this.deleteObject = this.deleteObject.bind(this);
	}

	componentDidMount() {
        this.loadData();
    }

    loadData =(page=1)=> {
        const that = this;
        const successFn = function (data) {
            that.setState(function (prevState) {
                if (data.current ==1 ){
                    return{
                        productData: [...data.results],
                        next:data.next,
                        loading:false
                    }
                }
                return {
                    productData: [...prevState.productData,...data.results],
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
        getAPI(MANAGE_PRODUCT, successFn, errorFn, apiParams);
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
        patchAPI(interpolate(MANAGE_SINGLE_PRODUCT, [record.id]), reqData, successFn, errorFn)
    }

    render() {
        const that = this;
        const columns = [{
            title: 'Name',
            dataIndex: 'title',
            key: 'title'
        },{
            title:'image',
            key:'image',
            dataIndex:'image',
            render:(item,record)=><Avatar src={makeFileURL(record.image)} />
        },{
            title: 'Description',
            render: (item)=>{
                return <div dangerouslySetInnerHTML={{ __html: item.content }} />
            }
        },{
            title: 'Actions',
            render: (item) => {
                return (
<div>
                    <Link to={`/web/manageproduct/edit/${  item.id}`}>Edit</Link>
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
<div>
        	<Switch>
        		<Route
          exact
          path='/web/manageproduct/edit/:id'
          render={(route) => <AddManageProduct loadData={this.loadData} {...this.state} {...route} />}
        		/>
	        	<Route
  exact
  path='/web/manageproduct/add'
  render={(route) => <AddManageProduct loadData={this.loadData} {...this.state} {...route} />}
	        	/>
	            <Card
  title="Products"
  extra={(
<Link to="/web/manageproduct/add"> <Button type="primary"><Icon
  type="plus"
/> Add
                                   </Button>
</Link>
)}
	            >
	                <Table loading={this.state.loading} pagination={false} dataSource={this.state.productData} columns={columns} />

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
