import React from "react";
import {Button, Card, Col, Icon, Radio, Row, Select, Checkbox} from "antd";
import {MANUFACTURER_API, SUPPLIER_API, PRODUCTS_API, PATIENT_GROUPS} from "../../../constants/api";
import {ALL} from "../../../constants/dataKeys";
import {getAPI, displayMessage, interpolate} from "../../../utils/common";
import { loadDoctors } from "../../../utils/clinicUtils";
import ProfitLossReport from "./ProfitLossReport";


export default class InventoryDetailsReportHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sidePanelColSpan: 4,
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            advancedOptionShow: true,
            manufacturesOption:[],
            productsOption:[],
            suppliersOption:[],
            practiceDoctors:[],
            patientGroup:[],


        };
        this.loadManufactures = this.loadManufactures.bind(this);
        this.loadProducts = this.loadProducts.bind(this);
        this.loadSuppliers = this.loadSuppliers.bind(this);
        this.loadPatientGroup = this.loadPatientGroup.bind(this);
        loadDoctors(this);

    }

    componentDidMount() {
        this.loadManufactures();
        this.loadProducts();
        this.loadSuppliers();
        this.loadPatientGroup();
    }

    loadPatientGroup(){
        const that=this;
        const successFn =function (data) {
            that.setState({
                patientGroup:data,
            });
        };
        const errorFn=function () {

        }
        getAPI(interpolate(PATIENT_GROUPS,[this.props.active_practiceId]),successFn ,errorFn)
    }

    loadManufactures(){
        const that=this;
        const successFn=function (data) {
            that.setState({
                manufacturesOption:data,
            })
        };
        const errorFn=function () {

        }
        getAPI(MANUFACTURER_API,successFn ,errorFn);
    };

    loadSuppliers(){
        const that=this;
        const successFn=function (data) {
            that.setState({
                suppliersOption:data,
            })
        };
        const errorFn=function () {

        };
        const apiParams={
            practice:this.props.active_practiceId,
        };
        getAPI(SUPPLIER_API ,successFn ,errorFn ,apiParams);
    }

    loadProducts(){
        const that=this;
        const successFn=function (data) {
            that.setState({
                productsOption:data,
            })
        };
        const errorFn=function () {

        };
        const apiParams={
            practice:this.props.active_practiceId,
        };
        getAPI(PRODUCTS_API ,successFn ,errorFn,apiParams);
    }


    onChangeHandle =(type,value)=>{
        const that=this;
        this.setState({
            [type]:value.target.value,
        });
    }

    advancedOption(value){
        this.setState({
            advancedOptionShow:value,
        })
    }

    handleChangeOption = (type,value) => {
        const that = this;
        this.setState({
            [type]: value,
        })
    }

    onChangeCheckbox=(e)=>{
        this.setState({
            exclude_cancelled: !this.state.exclude_cancelled,
        });
    };

    changeSidePanelSize = (sidePanel) => {
        this.setState({
            sidePanelColSpan: sidePanel ? 0 : 4
        })
    }

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
                        <ProfitLossReport {...this.state} {...this.props} />

                    </Col>
                    <Col span={this.state.sidePanelColSpan}>
                        <Radio.Group buttonStyle="solid" defaultValue={ALL}>
                            <h2>Inventory Retails</h2>
                            <Radio.Button
                              style={{width: '100%', backgroundColor: 'transparent', border: '0px'}}
                              value={ALL}
                            >
                                Profit Loss
                            </Radio.Button>
                            <p><br /></p>
                            <h2>Related Reports</h2>

                        </Radio.Group>

                        <br />
                        <br />
                        {this.state.advancedOptionShow?(
<>
                            <Button type="link" onClick={(value)=>this.advancedOption(false)}>Hide Advanced Options </Button>
                            <Col> <br />
                                <h4>Patient Groups</h4>
                                <Select
                                  style={{minWidth: '200px'}}
                                  mode="multiple"
                                  placeholder="Select Patient Groups"
                                  onChange={(value)=>this.handleChangeOption('patient_groups',value)}
                                >
                                    {this.state.patientGroup.map((item) => (
<Select.Option value={item.id}>
                                        {item.name}
</Select.Option>
))}
                                </Select>
                                <br />
                                <h4>Doctors</h4>
                                <Select
                                  style={{minWidth: '200px'}}
                                  mode="multiple"
                                  placeholder="Select Doctors"
                                  onChange={(value)=>this.handleChangeOption('doctors',value)}
                                >
                                    {this.state.practiceDoctors.map((item) => (
<Select.Option value={item.id}>
                                        {item.user.first_name}
</Select.Option>
))}
                                </Select>

                                <br />
                                <br />
                                <h4>Products</h4>
                                <Select
                                  style={{minWidth: '200px'}}
                                  placeholder="Select Products"
                                  onChange={(value)=>this.handleChangeOption('products',value)}
                                >
                                    {this.state.productsOption.map((item) => (
<Select.Option value={item.id}>
                                        {item.name}
</Select.Option>
))}
                                </Select>
                                <br />
                                <br />
                                <h4>Manufactures</h4>
                                <Select
                                  style={{minWidth: '200px'}}
                                  mode="multiple"
                                  placeholder="Select Manufacturers"
                                  onChange={(value)=>this.handleChangeOption('manufacturers',value)}
                                >
                                    {this.state.manufacturesOption.map((item) => (
<Select.Option value={item.id}>
                                        {item.name}
</Select.Option>
))}
                                </Select>
                                <br />
                                <br />
                                <h4>Suppliers</h4>
                                <Select
                                  style={{minWidth: '200px'}}
                                  mode="multiple"
                                  placeholder="Select Suppliers"
                                  onChange={(value)=>this.handleChangeOption('suppliers',value)}
                                >
                                    {this.state.suppliersOption.map((item) => (
<Select.Option value={item.id}>
                                        {item.name}
</Select.Option>
))}
                                </Select>
                            </Col>
</>
):<Button type="link" onClick={(value)=>this.advancedOption(true)}>Show Advanced Options </Button>}

                    </Col>
                </Row>
            </Card>
</div>
)
    }
}
