import React from "react";
import {Table, Spin, Empty, Select} from "antd";
import moment from "moment";
import {ComposedChart,Bar, XAxis, YAxis, Tooltip,} from 'recharts';
import {INVENTORY_RETAILS_REPORT} from "../../../constants/api";
import {getAPI} from "../../../utils/common";
import { sendReportMail} from "../../../utils/clinicUtils";

export default class ProfitLossReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inventoryReports:[],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            mailingUsersList: this.props.mailingUsersList
        }
        this.loadInventoryRetails = this.loadInventoryRetails.bind(this);
    }

    componentDidMount() {
        this.loadInventoryRetails();
        
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate ||this.props.products!=newProps.products
            ||this.props.doctors!=newProps.doctors ||this.props.manufacturers!=newProps.manufacturers ||this.props.suppliers!=newProps.suppliers ||this.props.patient_groups!=newProps.patient_groups)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            },function(){
                that.loadInventoryRetails();
            })

    }

    loadInventoryRetails= () => {
        const that = this;
        that.setState({
            loading:true,
        });
        const successFn = function (data) {
            const modifiedData = [];
            data.forEach(function(row){
                const newRow = {...row};
                newRow.profit = (row.total - row.cost - row.tax).toFixed(2);
                modifiedData.push(newRow);
            })
            that.setState({
                inventoryReports:modifiedData,
                loading: false
            });

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
        if(this.props.manufacturers){
            apiParams.manufacturers=this.props.manufacturers.toString();
        }
        if(this.props.suppliers){
            apiParams.suppliers=this.props.suppliers.toString();
        }

        getAPI(INVENTORY_RETAILS_REPORT,  successFn, errorFn, apiParams);
    };




    sendMail = (mailTo) => {
        const that = this;
        const apiParams={
            practice:that.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
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
        if(this.props.manufacturers){
            apiParams.manufacturers=this.props.manufacturers.toString();
        }
        if(this.props.suppliers){
            apiParams.suppliers=this.props.suppliers.toString();
        }
        apiParams.mail_to = mailTo;
        sendReportMail(INVENTORY_RETAILS_REPORT, apiParams)
    };

    render() {
        const that=this;
        const inventoryData=that.state.inventoryReports;
        const inventorySummary=[];
            let total_sale=0;
            let total_cost=0;
            let total_tax=0;
            let profit_before_tax=0;
            let profit_after_tax=0;
            for (let indx=0;indx<inventoryData.length;indx++){
                total_cost +=inventoryData[indx].cost;
                total_tax += inventoryData[indx].tax;
                total_sale +=inventoryData[indx].total;
                profit_before_tax +=inventoryData[indx].total - inventoryData[indx].cost;
                profit_after_tax +=inventoryData[indx].total - inventoryData[indx].cost -inventoryData[indx].tax ;
            }
        inventorySummary.push({sale_amount:total_sale,tax_amount:total_tax,cost_amount:total_cost ,profit_before_tax ,profit_after_tax});

        const SummaryColumns = [{
            title:'Total Sales (INR)',
            key:'sale_amount',
            dataIndex:'sale_amount',
            render:(value,record)=>(<span>{record.sale_amount.toFixed(2)}</span>)
        },{
            title:'Total Cost (INR)',
            key:'cost_amount',
            dataIndex:'cost_amount',
            render:(value,record)=>(<span>{record.cost_amount.toFixed(2)}</span>)
        },{
            title:'Total Profit before Tax(INR)',
            key:'tax_with_out',
            dataIndex:'profit_before_tax',
            render:(value,record)=>(<span>{record.profit_before_tax.toFixed(2)}</span>)
        },{
            title:'Total Tax(INR)',
            key:'tax_amount',
            dataIndex:"tax_amount",
            render:(value ,record)=>(<span>{record.tax_amount.toFixed(2)}</span>)
        },{
            title:'Total Profit after Tax(INR)',
            key:'tax_with',
            dataIndex:"profit_after_tax",
            render:(value,record)=>(<span>{record.profit_after_tax.toFixed(2)}</span>)
        }];

        const {inventoryReports} =this.state;
        const inventoryReportsData = [];
        for (let i = 1; i <= inventoryReports.length; i++) {
            inventoryReportsData.push({s_no: i,...inventoryReports[i-1]});
        };


        const DetailColumns = [{
            title: 'S. No',
            key: 's_no',
            dataIndex:'s_no',
            width: 50
        },{
            title: 'Date',
            key: 'date',
            render: (text, record) => (
                <span>
                {moment(record.date).format('YYYY-MM-DD')}
                </span>
            ),
        },{
            title:'Sales (INR)',
            key:'sale_amount',
            dataIndex:'total',
            render:(value,record)=>(<span>{record.total.toFixed(2)}</span>)
        },{
            title:'Cost',
            key:'cost',
            dataIndex:'cost',
            render:(value,record)=>(<span>{record.cost.toFixed(2)}</span>)
        },{
            title:'Profit before Tax(INR)',
            key:'tax_with_out',
            render:(text ,record)=>(
                <span>{(record.total - record.cost).toFixed(2)}</span>
            )
        },{
            title:'Tax(INR)',
            key:'tax',
            dataIndex:'tax',
            render:(value,record)=>(<span>{record.tax.toFixed(2)}</span>)
        },{
            title:'Profit after Tax(INR)',
            key:'tax_with',
            render:(text ,record)=>(
                <span>{(record.total - record.cost -record.tax).toFixed(2)}</span>
            )
        }];

        const renderCustomBarLabel = ({ payload, x, y, width, height, value }) => {
            return <text x={x + width / 2} y={y} fill="#666" textAnchor="middle" dy={-6}>{value}</text>;
        };
        return (
<div>
            <h2>Profit Loss
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
            <Spin size="large" spinning={this.state.loading}>
                {inventoryReportsData.length>0? (
                    <ComposedChart
                      width={1000}
                      height={400}
                      data={inventoryReportsData}
                      margin={{top: 20, right: 20, bottom: 20, left: 20}}
                    >

                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => {
                            return moment(value).format('DD MMM')
                        }}
                          label={{value:"Data Range", offset:0, margin:{top:10}, position:"insideBottom"}}
                        />
                        {/* </XAxis> */}

                        <YAxis label={{ value: 'Sales Profit', angle: -90, position: 'insideLeft' }} />
                        <YAxis />
                        <Tooltip />
                        {/* <Legend /> */}
                        <Bar dataKey='profit' barSize={35} fill='#0059b3' stroke="#0059b3" label={renderCustomBarLabel} />
                    </ComposedChart>
                  ):<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data to Show" />}


            </Spin>
            <Table loading={this.state.loading} columns={SummaryColumns} pagination={false} dataSource={inventorySummary} />

            <Table loading={this.state.loading} columns={DetailColumns} pagination={false} dataSource={inventoryReportsData} />

</div>
)
    }
}
