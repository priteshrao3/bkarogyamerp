import React from "react";
import {Button, Card, Checkbox, Col, Radio, Row, Select} from "antd";
import {
    ALL,
    ALL_INVOICE_RETURN,DAILY_WISE_RETURN_INVOICE, MONTHLY_WISE_RETURN_INVOICE,
    RETURN_INVOICE_FOR_EACH_DOCTOR, RETURN_INVOICE_FOR_EACH_PATIENT_GROUPS,
    RETURN_INVOICE_FOR_EACH_PROCEDURE,
    RETURN_INVOICE_FOR_EACH_PRODUCT, RETURN_INVOICE_FOR_EACH_TAX,

} from "../../../constants/dataKeys";
import {DISCOUNT, INCOME_TYPE, INVOICE_RELATED_REPORT} from "../../../constants/hardData";
import AllReturnedInvoice from "./AllReturnedInvoice";
import MonthlyWiseReturnInvoice from "./MonthlyWiseReturnInvoice";
import {loadDoctors} from "../../../utils/clinicUtils";
import {getAPI, interpolate} from "../../../utils/common";
import {PATIENT_GROUPS, PROCEDURE_CATEGORY, PRODUCTS_API, TAXES} from "../../../constants/api";
import InvoiceReturnForEachProcedure from "./InvoiceReturnForEachProcedure";
import InvoiceReturnForEachProduct from "./InvoiceReturnForEachProduct";
import InvoiceReturnForEachDoctor from "./InvoiceReturnForEachDoctor";
import InvoiceReturnForEachPatientGroup from "./InvoiceReturnForEachPatientGroup";
import InvoiceReturnForEachTax from "./InvoiceReturnForEachTax";
import DailyWiseReturnInvoice from "./DailyWiseReturnInvoice"

export default class InvoiceReturnHome extends React.Component{
    constructor(props){
        super(props);
        this.state={
            type:'ALL',
            loading:true,
            sidePanelColSpan:4,
            advancedOptionShow: true,
            patientGroup:[],
            practiceDoctors:[],
            taxes_list:[],
            productItems: [],
            treatment_data: [],
        }
        loadDoctors(this);

    }

    componentDidMount() {
        this.loadPatientGroup();
        this.loadTaxes();
        this.loadProductItem();
        this.loadTreatments()
    }

    loadPatientGroup() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                patientGroup: data,
            });
        };
        const errorFn = function () {

        }
        getAPI(interpolate(PATIENT_GROUPS, [this.props.active_practiceId]), successFn, errorFn)
    }

    loadTaxes() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                taxes_list: data,
            })
        };
        const errorFn = function () {
        };
        getAPI(interpolate(TAXES, [this.props.active_practiceId]), successFn, errorFn);

    }

    loadProductItem() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                productItems: data,
            });
        };
        const errorFn = function () {

        }
        getAPI(PRODUCTS_API, successFn, errorFn, {practice: this.props.active_practiceId})
    }

    loadTreatments() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                treatment_data: data,
            })
        };
        const errorFn = function () {
        };
        getAPI(interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId]), successFn, errorFn, {pagination: false});

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

    changeSidePanelSize = (sidePanel) => {
        this.setState({
            sidePanelColSpan: sidePanel ? 0 : 4
        })
    };

    handleChangeOption = (type,value) => {
        this.setState({
            [type]: value,
        })
    };

    onChangeCheckbox = (e) => {
        this.setState({
            exclude_cancelled: !this.state.exclude_cancelled,
        });
    };

    render() {
        return(
<div>
            <h2>Return Invoice Report <Button
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
                        {this.state.type == ALL_INVOICE_RETURN ?

                            <AllReturnedInvoice {...this.props} {...this.state} /> : null}


                        {this.state.type == DAILY_WISE_RETURN_INVOICE ?

                            <DailyWiseReturnInvoice {...this.props} {...this.state} /> : null}

                        {this.state.type == MONTHLY_WISE_RETURN_INVOICE?

                            <MonthlyWiseReturnInvoice {...this.props} {...this.state}  />:null}
                        {this.state.type == RETURN_INVOICE_FOR_EACH_PROCEDURE?

                            <InvoiceReturnForEachProcedure {...this.props} {...this.state} />:null}

                        {this.state.type ==RETURN_INVOICE_FOR_EACH_PRODUCT?

                            <InvoiceReturnForEachProduct {...this.props} {...this.state} />:null}

                        {this.state.type == RETURN_INVOICE_FOR_EACH_DOCTOR?

                            <InvoiceReturnForEachDoctor {...this.state} {...this.props} />:null}
                        {this.state.type == RETURN_INVOICE_FOR_EACH_PATIENT_GROUPS?

                            <InvoiceReturnForEachPatientGroup {...this.state} {...this.props} />:null}

                        {this.state.type == RETURN_INVOICE_FOR_EACH_TAX?

                            <InvoiceReturnForEachTax {...this.state} {...this.props} />:null}




                    </Col>
                    <Col span={this.state.sidePanelColSpan}>
                        <Radio.Group
                          buttonStyle="solid"
                          defaultValue={ALL_INVOICE_RETURN}
                          onChange={(value) => this.onChangeHandle('type', value)}
                        >
                            <h2>Invoice Returns</h2>
                            <Radio.Button
                              style={{width: '100%', backgroundColor: 'transparent', border: '0px'}}
                              value={ALL}
                            >
                                All Returned Invoices
                            </Radio.Button>
                            <p><br /></p>
                            <h2>Related Reports</h2>
                            {INVOICE_RELATED_REPORT.map((item) => (
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
                                <br />

                                <h4>Doctors</h4>
                                <Select
                                  style={{minWidth: '200px'}}
                                  mode="multiple"
                                  placeholder="Select Doctors"
                                  onChange={(value) => this.handleChangeOption('doctors', value)}
                                >
                                    {this.state.practiceDoctors.map((item) => (
<Select.Option value={item.id}>
                                        {item.user.first_name}
</Select.Option>
))}
                                </Select>

                                <br />
                                <br />
                                <h4>Income Type</h4>
                                <Select
                                  style={{minWidth: '200px'}}
                                  placeholder="Select Income Type"
                                  onChange={(value) => this.handleChangeOption('income_type', value)}
                                >
                                    {INCOME_TYPE.map((item) => (
<Select.Option value={item.value}>
                                        {item.label}
</Select.Option>
))}
                                </Select>
                                <br />
                                <br />
                                <h4>Taxes</h4>
                                <Select
                                  style={{minWidth: '200px'}}
                                  mode="multiple"
                                  placeholder="Select Taxes"
                                  onChange={(value) => this.handleChangeOption('taxes', value)}
                                >
                                    {this.state.taxes_list.map((item) => (
<Select.Option value={item.id}>
                                        {item.name}
</Select.Option>
))}
                                </Select>

                                <br />
                                <br />
                                <h4>Discount</h4>
                                <Select
                                  style={{minWidth: '200px'}}
                                  placeholder="Select Discount"
                                  onChange={(value) => this.handleChangeOption('discount', value)}
                                >
                                    {DISCOUNT.map((item) => (
<Select.Option value={item.value}>
                                        {item.label}
</Select.Option>
))}
                                </Select>
                                <br />
                                <br />

                                <h4>Product</h4>
                                <Select
                                  style={{minWidth: '200px'}}
                                  mode="multiple"
                                  placeholder="Select Products"
                                  onChange={(value) => this.handleChangeOption('products', value)}
                                >
                                    {this.state.productItems.map((item) => (
<Select.Option value={item.id}>
                                        {item.name}
</Select.Option>
))}
                                </Select>
                                <br />
                                <br />

                                <h4>Treatments</h4>
                                <Select
                                  style={{minWidth: '200px'}}
                                  mode="multiple"
                                  placeholder="Select Treatments"
                                  onChange={(value) => this.handleChangeOption('treatments', value)}
                                >
                                    {this.state.treatment_data.map((item) => (
<Select.Option value={item.id}>
                                        {item.name}
</Select.Option>
))}
                                </Select>

                                <br />
                                <br />

                                <Checkbox onChange={(e) => this.onChangeCheckbox(e)}> Exclude Cancelled</Checkbox>


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
