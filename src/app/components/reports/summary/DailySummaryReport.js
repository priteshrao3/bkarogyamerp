import React from "react";
import {
    Card,
    Col,
    Row,
    Table, Tag, Select, Typography, List, Checkbox
} from "antd";
import {getAPI} from "../../../utils/common";
import {INVOICES_API} from "../../../constants/api";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import {loadDoctors, sendReportMail} from "../../../utils/clinicUtils";

const {Text} = Typography;
export default class DailySummaryReport extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            dailySummary: [],
            practiceDoctors: [],
            paidAmountForPaymentMode: {},
            mailingUsersList:this.props.mailingUsersList

        }
        this.loadDailySummary = this.loadDailySummary.bind(this);
        loadDoctors(this);
    }

    componentDidMount() {
        this.loadDailySummary();
       
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            }, function () {
                that.loadDailySummary();
            })
    }

    loadDailySummary(page = 1) {
        const that = this;
        that.setState({
            loading: true
        })
        const successFn = function (data) {
            that.setState(function (prevState) {
                const rows = [];
                let finalRow = {
                    type: 'FINAL',
                    unit_cost: 0,
                    tax_value: 0,
                    unit: 1,
                    total: 0,
                    discount_value: 0,
                    invoice: {
                        inventory: [],
                        prescription: [],
                        procedure: [],
                        payments: []
                    },
                    paidAmount: 0,
                }
                let paidAmountForPaymentMode = {};
                if (data.current > 1) {
                    paidAmountForPaymentMode = { ...prevState.paidAmountForPaymentMode };
                    finalRow = {...prevState.finalRow}
                }
                if (data.results.length)
                    data.results.forEach(function (resultRow) {
                        resultRow.inventory.forEach(function (inventory) {
                            rows.push({
                                ...inventory,
                                invoice: resultRow,
                            });
                            finalRow.unit_cost += inventory.unit_cost * inventory.unit;
                            finalRow.tax_value += inventory.tax_value;
                            finalRow.discount_value += inventory.discount_value;
                            finalRow.total += inventory.total;
                        });
                        resultRow.prescription.forEach(function (prescription) {
                            rows.push({
                                ...prescription,
                                invoice: resultRow,
                            });
                            finalRow.unit_cost += prescription.unit_cost * prescription.unit;
                            finalRow.tax_value += prescription.tax_value;
                            finalRow.discount_value += prescription.discount_value;
                            finalRow.total += prescription.total;
                        });
                        resultRow.procedure.forEach(function (procedure) {
                            rows.push({
                                ...procedure,
                                invoice: resultRow,
                            });
                            finalRow.unit_cost += procedure.unit_cost * procedure.unit;
                            finalRow.tax_value += procedure.tax_value;
                            finalRow.discount_value += procedure.discount_value;
                            finalRow.total += procedure.total;
                        });
                        // finalRow.paidAmount += resultRow.payments.map(payment => payment.pay_amount).reduce((a, b) => a + b, 0);
                        resultRow.payments.forEach(function (payment) {
                            finalRow.paidAmount += payment.pay_amount;
                            if (paidAmountForPaymentMode[payment.payment_mode]) {
                                paidAmountForPaymentMode[payment.payment_mode] += payment.pay_amount;
                            } else {
                                paidAmountForPaymentMode[payment.payment_mode] = payment.pay_amount;
                            }
                        })
                    });
                if (data.count && !data.next) {
                    rows.push(finalRow);
                }
                if (data.current == 1) {
                    return {
                        loading: false,
                        dailySummary: rows,
                        nextItemPage: data.next,
                        paidAmountForPaymentMode,
                        finalRow
                    }
                }
                    return {
                        loading: false,
                        dailySummary: [...prevState.dailySummary, ...rows],
                        nextItemPage: data.next,
                        paidAmountForPaymentMode,
                        finalRow
                    }

            })

        }

        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        const apiParams = {
            page,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            practice: this.props.active_practiceId
        };
        if (this.state.doctors) {
            apiParams.doctor = this.state.doctors.toString();
        }
        if(this.state.unpaid){
            apiParams.is_pending=true
        }

        getAPI(INVOICES_API, successFn, errorFn, apiParams);
    }

    filterReport(type, value) {
        this.setState(function (prevState) {
            return {[type]: value}
        }, function () {
            this.loadDailySummary();
        });
    }

    sendMail = (mailTo) => {
        const apiParams = {
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            practice: this.props.active_practiceId
        };
        if (this.state.doctors) {
            apiParams.doctor = this.state.doctors.toString();
        }
        apiParams.mail_to = mailTo;
        sendReportMail(INVOICES_API, apiParams)
    }

    render() {
        const that = this;
        let i = 1;
        let lastInvoiceForSerialNo = null;
        let lastInvoiceForPatientName = null;
        let lastInvoiceForReceipt = null;
        let lastInvoiceForPaymentMode = null;
        let lastInvoiceForAmountPaid = null;
        let lastInvoiceForTotalAmountPaid = null;
        const columns = [{
            title: 'S. No',
            key: 'sno',
            dataIndex: 'abcd',
            align: 'center',
            render: (item, record, index) => {
                const obj = {props: {}};
                if (record.invoice.invoice_id == lastInvoiceForSerialNo) {
                    obj.props.rowSpan = 0
                } else {
                    lastInvoiceForSerialNo = record.invoice.invoice_id;
                    obj.children = record.type == 'FINAL' ? '--' : <span> {i++}</span>;
                    obj.props.rowSpan = record.invoice.inventory.length + record.invoice.prescription.length + record.invoice.procedure.length;
                    if (record.type == 'FINAL') {
                        obj.props.rowSpan = 1;
                    }
                }
                return obj;
            },
            // export: (item, record, index) => index + 1,
            width: 50
        }, {
            title: 'Patient Name',
            key: 'patient_name',
            dataIndex: 'invoice.patient_data.user.first_name',
            render: (item, record, index) => {
                const obj = {props: {}};
                if (record.invoice.invoice_id == lastInvoiceForPatientName) {
                    obj.props.rowSpan = 0
                } else {
                    lastInvoiceForPatientName = record.invoice.invoice_id;
                    const paidAmount = record.invoice.payments.map(payment => payment.pay_amount).reduce((a, b) => a + b, 0).toFixed(2);
                    obj.children = record.type == 'FINAL' ? '--' : (
                        <span><b>{item} ({record.invoice.patient_data.custom_id})</b><br />
                        <span>Invoice Income: <Text
                          type="danger"
                        >INR&nbsp;{record.invoice.total.toFixed(2)}
                                              </Text>
                        </span><br />
                    <span>Total Payment: <Text
                      type="danger"
                    >INR&nbsp;{paidAmount}
                                         </Text>
                    </span><br />
                    <span>Amount Due: <Text
                      type="danger"
                    >INR&nbsp;{(record.invoice.total - paidAmount).toFixed(2)}
                                      </Text>
                    </span><br />
                    <span>Status: <Text
                        type={record.invoice.is_pending ? "danger":"success"}
                    >&nbsp;{record.invoice.is_pending ? "Unpaid":"Paid"}
                                      </Text>
                    </span>
                        </span>
                      );
                    obj.props.rowSpan = record.invoice.inventory.length + record.invoice.prescription.length + record.invoice.procedure.length;
                    if (record.type == 'FINAL') {
                        obj.props.rowSpan = 1;
                    }
                }
                return obj;
            },
            // export: (item, record) => (record.patient_data.user.first_name),
        }, {
            title: 'Treatment & Products',
            dataIndex: 'name',
            key: 'name'
        }, {
            title: 'Cost (INR)',
            key: 'unit_cost',
            dataIndex: 'unit_cost',
            align: 'right',
            render: (item, record) => record.unit_cost ? (
                <span>{(record.unit_cost.toFixed(2) * record.unit).toFixed(2)}
                    {record.type == 'FINAL' ? null :
                        <span><br /><small>{record.unit_cost.toFixed(2)}x{record.unit}</small></span>}
                </span>
              ) : '--',
            // export: (item, record) => (record.unit_cost ? record.unit_cost.toFixed(2) : '0.00'),
        }, {
            title: 'Discount (INR)',
            key: 'discount_value',
            dataIndex: 'discount_value',
            align: 'right',
            render: (item, record) => <span>{item ? item.toFixed(2) : ''}</span>,
            // export: (item, record) => (record.discount ? record.discount.toFixed(2) : '0.00'),
        }, {
            title: 'Tax',
            dataIndex: 'tax_value',
            key: 'taxes',
            align: 'right',
            render: (item, record) => <span>{item ? item.toFixed(2) : ''}</span>,
            // export: (item, record) => (record.taxes ? record.taxes.toFixed(2) : '0.00'),
        }, {
            title: 'Invoice No.',
            key: 'invoice_id',
            dataIndex: 'invoice.invoice_id',
            render: (item, record) => <span>{item}<br /><small>{record.invoice.date}</small></span>
        }, {
            title: 'Invoice Cost (INR)',
            key: 'invoice_cost',
            dataIndex: 'total',
            align: 'right',
            render: (item, record) => <span>{item ? item.toFixed(2) : ''}</span>,
            // export: (item, record) => (record.cost ? record.cost.toFixed(2) : '0.00'),
        }, {
            title: 'Receipt No',
            key: 'payment_data.payment_id',
            dataIndex: '',
            render: (item, record, index) => {
                const obj = {props: {}};
                if (record.invoice.invoice_id == lastInvoiceForReceipt) {
                    obj.props.rowSpan = 0
                } else {
                    lastInvoiceForReceipt = record.invoice.invoice_id;
                    obj.children =
                        <span>{record.invoice.payments.map(payment => <span>{payment.payment_id}<br /></span>)}</span>;
                    obj.props.rowSpan = record.invoice.inventory.length + record.invoice.prescription.length + record.invoice.procedure.length;
                    if (record.type == 'FINAL') {
                        obj.props.rowSpan = 1;
                    }
                }
                return obj;
            },
        }, {
            title: 'Mode Of Payment',
            key: 'mode_of_payments',
            dataIndex: 'payment_mode',
            align: 'center',
            render: (item, record, index) => {
                const obj = {props: {}};
                if (record.invoice.invoice_id == lastInvoiceForPaymentMode) {
                    obj.props.rowSpan = 0
                } else {
                    lastInvoiceForPaymentMode = record.invoice.invoice_id;
                    obj.children = (
<span>
                            {record.invoice.payments.map(payment => <span>{payment.payment_mode || '--'}<br /></span>)}
</span>
);
                    obj.props.rowSpan = record.invoice.inventory.length + record.invoice.prescription.length + record.invoice.procedure.length;
                    if (record.type == 'FINAL') {
                        obj.props.rowSpan = 1;

                    }
                }
                return obj;
            },
        }, {
            title: 'Amount Paid (INR)',
            key: 'amount_paid',
            dataIndex: 'pay_amount',
            align: 'right',
            render: (item, record, index) => {
                const obj = {props: {}};
                if (record.invoice.invoice_id == lastInvoiceForAmountPaid) {
                    obj.props.rowSpan = 0
                } else {
                    lastInvoiceForAmountPaid = record.invoice.invoice_id;
                    obj.children = (
<span>
                            {record.invoice.payments.map(payment =>
                                <span>{payment.pay_amount.toFixed(2) || '--'}<br /></span>)}
</span>
);
                    obj.props.rowSpan = record.invoice.inventory.length + record.invoice.prescription.length + record.invoice.procedure.length;
                    if (record.type == 'FINAL') {
                        obj.props.rowSpan = 1;
                        obj.children = <span>{record.paidAmount.toFixed(2)}</span>
                    }
                }
                return obj;
            },
        }, {
            title: 'Total Amount Paid',
            key: 'total_amount_paid',
            dataIndex: 'total',
            align: 'right',
            render: (item, record, index) => {
                const obj = {props: {}};
                if (record.invoice.invoice_id == lastInvoiceForTotalAmountPaid) {
                    obj.props.rowSpan = 0
                } else {
                    lastInvoiceForTotalAmountPaid = record.invoice.invoice_id;
                    obj.children = (
<span>
                            {record.invoice.payments.map(payment =>
                                <b>{payment.pay_amount.toFixed(2) || '--'}<br /></b>)}
</span>
);
                    obj.props.rowSpan = record.invoice.inventory.length + record.invoice.prescription.length + record.invoice.procedure.length;
                    if (record.type == 'FINAL') {
                        obj.props.rowSpan = 1;
                        obj.children = <span>{record.paidAmount.toFixed(2)}</span>
                    }
                }
                return obj;
            },
            // export: (item, record) => (record.total ? record.total.toFixed(2) : '0.00'),
        }];

        return (
<div><h2>Daily Summary Report
     </h2>
            <Card
              bodyStyle={{padding: 0}}
              extra={(
<><span>Only UnPaid :&nbsp;</span>
    <Checkbox
        style={{minWidth: '200px'}}

        onChange={(e) => this.filterReport('unpaid', e.target.checked)}
    />&nbsp;&nbsp;
                    <span>Doctors :&nbsp;</span>
                    <Select
                      style={{minWidth: '200px'}}
                      mode="multiple"
                      placeholder="Select Doctors"
                      onChange={(value) => this.filterReport('doctors', value)}
                    >
                        {this.state.practiceDoctors.map((item) => (
<Select.Option key={item.id} value={item.id}>
                            {item.user.first_name}
</Select.Option>
))}
                    </Select>&nbsp;&nbsp;

                    <span>E-Mail To:&nbsp;
                            <Select onChange={(e) => this.sendMail(e)} style={{width: 200}}>
                                {this.state.mailingUsersList.map(item => (
<Select.Option
  value={item.email}
>{item.name}
</Select.Option>
))}
                            </Select>
                    </span>
</>
)}
            >

                <Table
                  bordered
                  rowKey={(record, index) => {
                           return index
                       }}
                  columns={columns}
                  dataSource={this.state.dailySummary}
                  pagination={false}
                />


                <InfiniteFeedLoaderButton
                  loaderFunction={() => this.loadDailySummary(this.state.nextItemPage)}
                  loading={this.state.loading}
                  hidden={!this.state.nextItemPage}
                />
                {this.state.nextItemPage ? null : (
<Row gutter={16}>
                    <Col span={6} style={{margin: 15}}>
                        <h4>Amount Total by Mode of Payments</h4>
                        <List
                          size="small"
                          dataSource={Object.keys(this.state.paidAmountForPaymentMode).map(key => {
                            return {payment_mode: key || '--', value: 0}
                        })}
                          renderItem={item => (
<List.Item>
                                  <List.Item.Meta title={item.payment_mode || '--'} />
                                  <span>INR {that.state.paidAmountForPaymentMode[item.payment_mode].toFixed(2)}</span>
</List.Item>
)}
                        />
                    </Col>
</Row>
)}
            </Card>
</div>
)
    }
}
