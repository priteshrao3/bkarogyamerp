import React from "react";
import {Table} from "antd";
import {BILL_SUPPLIER, STOCK_ENTRY} from "../../../constants/api";
import {getAPI,makeFileURL, interpolate} from "../../../utils/common";


export default class ReportInnerTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inventoryList: [],
            loading:false,
        }
        this.loadData = this.loadData.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        const that = this;
        that.setState({
            loading:true,
        });
        const successFn = function (data) {
            that.setState({
                inventoryList:data,
                loading:false
            })
        }
        const errorFn = function () {
            that.setState({
                loading:false
            })
        }
        if(this.props.id || this.props.supplier){
            getAPI(BILL_SUPPLIER,successFn,errorFn,{id:this.props.id})
        }

    }

    render() {
        const that =this;
        const columns = [ {
            title:'name',
            key:'name',
            dataIndex:'inventory_item_data.name'
        }, {
            title: 'Batch',
            key: 'batch_number',
            dataIndex: 'batch_number'
        },{
            title:'Expiry Date',
            key:'expiry_date',
            dataIndex:'expiry_date'
        },{
            title: 'Item Type',
            key: 'item_type',
            dataIndex: 'inventory_item_data.item_type'
        },{
            title: 'ADD/CONSUME',
            key: 'item_add_type',
            dataIndex: 'item_add_type'
        }, {
            title:'Type of Consumption',
            key:'type_of_consumption',
            dataIndex:'type_of_consumption'
        },{
            title:'Bill File',
            key:'bill_file',
            dataIndex:'bill_file',
            render: (item)=>{
                return item?<a target="_blank" href={makeFileURL(item)}>Bill</a> : null
            }
        },{
            title: 'Quantity',
            key: 'quantity',
            dataIndex: 'quantity'
        },{
            title:'Unit Cost',
            key:'unit_cost',
            dataIndex:'unit_cost',
        },{
            title:'Total Cost',
            key:'total_cost',
            dataIndex:'total_cost',
        },];

        return (
<div>
                <Table
                  loading={this.state.loading}
                  bordered
                  rowKey={(record) => record.id}
                  pagination={false}
                  columns={columns}
                  dataSource={this.state.inventoryList}
                />
</div>
)
    }
}
