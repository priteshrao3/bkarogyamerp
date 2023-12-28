import React from "react";
import {Select, Table, Tag} from "antd";
import moment from "moment";
import {INCOME_REPORTS} from "../../../constants/api";
import {getAPI} from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import { sendReportMail} from "../../../utils/clinicUtils";

export default class AllInvoices extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inventoryReports:[],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            invoiceReports:[],
            mailingUsersList: this.props.mailingUsersList
        };
        this.loadInvoices = this.loadInvoices.bind(this);
        // this.loadPatientList = this.loadPatientList.bind(this);
    }

    componentDidMount() {
        this.loadInvoices();
        // this.loadPatientList();
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate ||this.props.products!=newProps.products || this.props.income_type!=newProps.income_type
            ||this.props.is_cancelled!=newProps.is_cancelled ||this.props.discount!=newProps.discount || this.props.treatments!=newProps.treatments
            ||this.props.doctors!=newProps.doctors ||this.props.taxes!=newProps.taxes ||this.props.patient_groups!=newProps.patient_groups)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            },function(){
                that.loadInvoices();
            })

    }

    loadInvoices= () => {
        const that = this;
        that.setState({
            loading:true
        })
        const successFn = function (data) {
            that.setState({
                invoiceReports:data,
                loading: false
            });
            // if (data.reservation){
            //     that.setState(function (prevData) {
            //         // console.log(data.)
            //     })
            // }

        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        const apiParams={
            practice:that.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            type:that.props.type,
            is_cancelled:!!this.props.is_cancelled,
        };
        if (that.props.income_type){
            apiParams.income_type= that.props.income_type;
        }
        if(that.props.discount){
            apiParams.discount=that.props.discount;
        }
        if(this.props.patient_groups){
            apiParams.groups=this.props.patient_groups.toString();
        }
        if(this.props.products){
            apiParams.products=this.props.products.toString();
        }
        if(this.props.doctors){
            apiParams.doctors=this.props.doctors.toString();
        }
        if(this.props.taxes){
            apiParams.taxes=this.props.taxes.toString();
        }
        if(this.props.treatments){
            apiParams.treatments=this.props.treatments.toString();
        }

        getAPI(INCOME_REPORTS,  successFn, errorFn, apiParams);
    };

    // loadPatientList(){
    //     let that=this;
    //     let successFn = function (data) {
    //         that.setState({
    //             patientList:data,
    //             loading: false
    //         });
    //
    //     };
    //     let errorFn = function () {
    //         that.setState({
    //             loading: false
    //         })
    //     };
    //     getAPI(PATIENTS_LIST,successFn,errorFn);
    // }


    sendMail = (mailTo) => {
        const that = this;
        const apiParams = {
            practice:that.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            type:that.props.type,
            is_cancelled:!!this.props.is_cancelled,
        };

        if (that.props.income_type){
            apiParams.income_type= that.props.income_type;
        }
        if(that.props.discount){
            apiParams.discount=that.props.discount;
        }
        if(this.props.patient_groups){
            apiParams.groups=this.props.patient_groups.toString();
        }
        if(this.props.products){
            apiParams.products=this.props.products.toString();
        }
        if(this.props.doctors){
            apiParams.doctors=this.props.doctors.toString();
        }
        if(this.props.taxes){
            apiParams.taxes=this.props.taxes.toString();
        }
        if(this.props.treatments){
            apiParams.treatments=this.props.treatments.toString();
        }
        apiParams.mail_to = mailTo;
        sendReportMail(INCOME_REPORTS, apiParams)
    };

    render() {
        const that = this;
        const inventoryData=this.state.invoiceReports;
        const inventorySummary=[];
        let total_sale=0;
        let total_cost=0;
        let total_tax=0;
        let profit_before_tax=0;
        let profit_after_tax=0;
        let delivery_charge = 0;
        for (let indx=0;indx<inventoryData.length;indx++){
            total_cost +=inventoryData[indx].clinic_cost;
            total_tax += inventoryData[indx].taxes;
            total_sale +=inventoryData[indx].total;
            profit_before_tax +=inventoryData[indx].total - inventoryData[indx].clinic_cost - inventoryData[indx].courier_charge;
            profit_after_tax +=inventoryData[indx].total - inventoryData[indx].clinic_cost -inventoryData[indx].taxes - inventoryData[indx].courier_charge;
            delivery_charge +=inventoryData[indx].courier_charge;
        }
        inventorySummary.push({sale_amount:total_sale,tax_amount:total_tax,cost_amount:total_cost ,profit_before_tax ,profit_after_tax,delivery_charge});


        let tableObjects=[];
        const newData=[];
        inventoryData.map((invoice)=>{
            tableObjects = [];
            if (invoice.reservation){
                let medicinesPackages= invoice.reservation_data.medicines.map((item)=>({
                    ...item.medicine,
                    unit: item.quantity,
                    total: item.total_price,
                    unit_cost: item.unit_cost,
                    discount: 0

                }));

                const mapper = {
                    "NORMAL": {total: 'final_normal_price', tax: "normal_tax_value", unit_cost: "normal_price"},
                    "TATKAL": {total: 'final_tatkal_price', tax: "tatkal_tax_value", unit_cost: "tatkal_price"}
                }
                tableObjects = [...tableObjects, {
                    ...invoice.reservation_data.bed_package,
                    unit: 1,
                    total: invoice.reservation_data.bed_package ? invoice.reservation_data.bed_package[mapper[invoice.reservation_data.seat_type].total] : null,
                    tax_value: invoice.reservation_data.bed_package ? invoice.reservation_data.bed_package[mapper[invoice.reservation_data.seat_type].tax] : null,
                    unit_cost: invoice.reservation_data.bed_package ? invoice.reservation_data.bed_package[mapper[invoice.reservation_data.seat_type].unit_cost] : null
                }, ...medicinesPackages]
            }

            newData.push({...invoice,treatment:[...tableObjects,...invoice.procedure,...invoice.inventory]})
        });


        let i=1;
        const SummaryColumns = [{
            title:'Total Sales (INR)',
            key:'sale_amount',
            dataIndex:'sale_amount',
            render:(value,record)=>(<span>{record.sale_amount.toFixed(2)}</span>),
            export:(item,record)=>(record.sale_amount.toFixed(2)),
        },{
            title:'Total Cost (INR)',
            key:'cost_amount',
            dataIndex:'cost_amount',
            render:(value,record)=>(<span>{record.cost_amount.toFixed(2)}</span>),
            export:(item,record)=>(record.cost_amount.toFixed(2)),
        },{
            title:'Delivery Charges(INR)',
            key:'delivery_charge',
            dataIndex:"delivery_charge",
            render:(value,record)=>(<span>{record.delivery_charge.toFixed(2)}</span>),
            export:(item,record)=>(record.delivery_charge.toFixed(2)),
        },{
            title:'Total Profit before Tax(INR)',
            key:'tax_with_out',
            dataIndex:'profit_before_tax',
            render:(value,record)=>(<span>{record.profit_before_tax.toFixed(2)}</span>),
            export:(item,record)=>(record.profit_before_tax.toFixed(2)),
        },{
            title:'Total Tax(INR)',
            key:'tax_amount',
            dataIndex:"tax_amount",
            render:(value ,record)=>(<span>{record.tax_amount.toFixed(2)}</span>),
            export:(item,record)=>(record.tax_amount.toFixed(2)),
        },{
            title:'Total Profit after Tax(INR)',
            key:'tax_with',
            dataIndex:"profit_after_tax",
            render:(value,record)=>(<span>{record.profit_after_tax.toFixed(2)}</span>),
            export:(item,record)=>(record.profit_after_tax.toFixed(2)),
        }];

        const DetailColumns = [{
            title: 'S. No',
            key: 'sno',
            render: (item, record) => <span> {i++}</span>,
            width: 50
        },{
            title: 'Date',
            key: 'date',
            render: (text, record) => (
                <span>
                {moment(record.created_at).format('ll')}
                </span>
            ),
            export:(item,record)=>(moment(record.created_at).format('ll')),
        },{
            title:'Invoice Number',
            key:'invoice_id',
            dataIndex:'invoice_id',
        },
            {
            title:'Patient',
            key:'patient',
            dataIndex:'patient',
            render:(value,record)=>(<span>{record.patient?record.patient.user.first_name:record.patient}</span>),
            export:(item,record)=>(record.patient?record.patient.user.first_name:record.patient),
        },
            {
            title:'Treatments & Products',
            key:'treatments',
            render: (text, record) => (
<span>{record.treatment.map((item) =>
                <Tag>{item.name}</Tag>
            )}
</span>
),
            export:(text,record)=>(record.treatment.map((item)=>(`${item.name },`)))
        },{
                title:'Total Amount',
                key:'total',
                dataIndex:'total',
                align:'right',
                render:(value,record)=><span>{record.total.toFixed(2)}</span>,
                export:(item,record)=>(record.total.toFixed(2)),
            }];

        if(that.props.income_type=='PRODUCTS'){
            DetailColumns.push({
                title:'Cost(INR)',
                key:'cost',
                dataIndex:'cost',
                render:(value,record)=><span>{record.cost.toFixed(2)}</span>,
                export:(item,record)=>(record.cost.toFixed(2)),
            },{
                title:'Discount(INR)',
                key:'discount',
                dataIndex:'discount',
                render:(value,record)=><span>{record.discount.toFixed(2)}</span>,
                export:(item,record)=>(record.discount.toFixed(2)),
            },{
                title:"tax(INR)",
                key:'tax',
                dataIndex:'taxes',
                render:(value,record)=><span>{record.taxes.toFixed(2)}</span>,
                export:(item,record)=>(record.taxes.toFixed(2)),

            },{
                title:"Invoice Amount(INR)",
                key:'amount',
                dataIndex:'total',
                render:(value,record)=><span>{record.total.toFixed(2)}</span>,
                export:(item,record)=>(record.total.toFixed(2)),

            },{
                title:"Amount Paid(INR)",
                key:'tax',
                dataIndex:'tax',
                // render:(value,record)=><span>{record.taxes.toFixed(2)}</span>,
                // export:(item,record)=>(record.taxes.toFixed(2)),

            });
        }


        return (
<div>
            <h2>All Invoices
                <span style={{float: 'right'}}>
                    <p><small>E-Mail To:&nbsp;</small>
                        <Select onChange={(e) => this.sendMail(e)} style={{width: 200}}>
                            {this.state.mailingUsersList.map(item => (
<Select.Option
  value={item.email}
>{item.name}
</Select.Option>
))}
                        </Select>
                    </p>
                </span>
            </h2>

            <Table loading={this.state.loading} columns={SummaryColumns} pagination={false} dataSource={inventorySummary} />

            <CustomizedTable loading={this.state.loading} columns={DetailColumns} pagination={false} dataSource={newData} hideReport />

</div>
)
    }
}
