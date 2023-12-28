import React from "react";
import {Button, Card, Col, Icon, Radio, Row, Table, Checkbox,Select} from "antd";
import {PRODUCTS_API} from "../../../constants/api";
import {
    ALL,
    ALL_INVENTORY, DAILY_INVENTORY, MONTHLY_INVENTORY, TOP_INVENTORY,MISMANAGED_INVENTORY
} from "../../../constants/dataKeys";
import {
    PRODUCT_ITEM,
    INVENTORY_RELATED_REPORT, TYPE_OF_CONSUMPTION
} from "../../../constants/hardData";
import {getAPI} from "../../../utils/common";
import InventoryReport from "./InventoryReport";
import DailyInventory from "./DailyInventory";
import MonthlyInventory from "./MonthlyInventory";
import TopInventory from "./TopInventory";
import MismanagedInventory from "./MismanagedInventory";

export default class InventoryReportHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advancedOptionShow: true,
            sidePanelColSpan: 4,
            productItems:[],
            type:'ALL',
            consume:TYPE_OF_CONSUMPTION.map(item=>item.value),
        }
        this.loadProductItem = this.loadProductItem.bind(this);
    }

    componentDidMount() {
        this.loadProductItem();

    }

    loadProductItem(){
        const that=this;
        const successFn =function (data) {
            that.setState({
                productItems:data,
            });
        };
        const errorFn=function () {

        }
        getAPI(PRODUCTS_API,successFn ,errorFn,{practice:this.props.active_practiceId})
    }

    onChangeHandle = (type, value) => {
        const that = this;
        this.setState({
            [type]: value.target.value,
        })
    }

    advancedOption(value){
        this.setState({
            advancedOptionShow:value,
        })
    }

    changeSidePanelSize = (sidePanel) => {
        this.setState({
            sidePanelColSpan: sidePanel ? 0 : 4
        })
    }

    handleChangeOption = (type,value) => {
        const that = this;
        this.setState({
            [type]: value,
        })
    };

    render() {
        return (
<div>
            <h2>Inventory Report <Button
              type="primary"
              shape="round"
              icon={this.state.sidePanelColSpan ? "double-right" : "double-left"}
              style={{float: "right"}}
              onClick={() => this.changeSidePanelSize(this.state.sidePanelColSpan)}
            >Panel
                                 </Button>
            </h2>
            <Card>
                <Row gutter={16}>
                    <Col span={(24 - this.state.sidePanelColSpan)}>

                        {this.state.type == ALL_INVENTORY ?
                            <InventoryReport {...this.props} {...this.state} /> : null}

                        {this.state.type == DAILY_INVENTORY ?
                            <DailyInventory {...this.props} {...this.state} /> : null}

                        {this.state.type ==MONTHLY_INVENTORY?
                            <MonthlyInventory {...this.props} {...this.state}  />:null}

                        {this.state.type== TOP_INVENTORY?
                            <TopInventory {...this.props} {...this.state} />:null}

                        
                        {this.state.type == MISMANAGED_INVENTORY ?
                            <MismanagedInventory {...this.props} {...this.state} /> : null} 
        

                    </Col>


                    <Col span={this.state.sidePanelColSpan}>
                        <Radio.Group
                          buttonStyle="solid"
                          defaultValue={ALL_INVENTORY}
                          onChange={(value) => this.onChangeHandle('type', value)}
                        >
                            <h2>Inventory</h2>
                            <Radio.Button
                              style={{width: '100%', backgroundColor: 'transparent', border: '0px'}}
                              value={ALL_INVENTORY}
                            >
                                All Stock Update History
                            </Radio.Button>
                            <p><br /></p>
                            <h2>Related Reports</h2>
                            {INVENTORY_RELATED_REPORT.map((item) => (
<Radio.Button
  style={{width: '100%', backgroundColor: 'transparent'}}
  value={item.value}
>
                                {item.name}
</Radio.Button>
))}
                        </Radio.Group>

                        <br />
                        <br />
                        {this.state.type !== ALL_INVENTORY?(
<>
                            {this.state.advancedOptionShow?(
<>
                                <Button type="link" onClick={(value)=>this.advancedOption(false)}>Hide Advanced Options </Button>
                                <Col> <br />
                                    <h4>Product</h4>
                                    <Select
                                      style={{minWidth: '200px'}}
                                      defaultValue={ALL}
                                      onChange={(value)=>this.handleChangeOption('product_item',value)}
                                    >
                                        <Select.Option value="">{ALL}</Select.Option>
                                        {this.state.productItems.map((item) => (
<Select.Option value={item.id}>
                                            {item.name}
</Select.Option>
))}
                                    </Select>

                                    <br />
                                    <br />
                                    <br />
                                    <Checkbox.Group style={{ width: '100%',display:"inline-grid" }} defaultValue={TYPE_OF_CONSUMPTION.map(item=>item.value)} onChange={(value)=>this.handleChangeOption('consume',value)}>
                                        {/* <Row> */}
                                            {TYPE_OF_CONSUMPTION.map((item) =><Checkbox value={item.value}> {item.label}</Checkbox>)}
                                        {/* </Row> */}
                                    </Checkbox.Group>

                                </Col>
</>
): <Button type="link" onClick={(value)=>this.advancedOption(true)}>Show Advanced Options </Button>}
</>
):null}
                    </Col>

                </Row>
            </Card>
</div>
)
    }
}
