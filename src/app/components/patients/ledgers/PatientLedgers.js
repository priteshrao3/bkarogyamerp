import React from "react";
import {Card, Table, Row, Button, Icon, Checkbox, Col} from "antd";
import {Link} from "react-router-dom";
import {BACKEND_BASE_URL} from "../../../config/connect";
import {getAPI, interpolate} from "../../../utils/common";
import {PATIENT_LEDGER} from "../../../constants/api";
import {
    patientInvoiceDetailsInString,
    patientPaymentDetailsInString,
    patientReturnInvoiceDetailsInString
} from "../../../utils/patientUtils";

class PatientLedgers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            ledger: [],
            loadingLedger: false,
            selectedList: {},
            credit: 0,
            debit: 0,
            balance: 0,
        }
    }

    componentDidMount() {
        this.loadPatientLedger();
    }

    loadPatientLedger = () => {
        const that = this;
        if (that.props.refreshWallet){
            that.props.refreshWallet();
        }
        this.setState({
            loadingLedger: true
        })
        const successFn = function (data) {
            const ledgerData = [];
            let balance = 0;
            let totalCredit = 0;
            let totalDebit = 0;
            data.forEach(function (dataRow) {
                const ledgerEntry = {
                    date: dataRow.date,
                    type: dataRow.ledger_type
                };
                if (dataRow.ledger_type == 'Invoice') {
                    ledgerEntry.type_id = dataRow.invoice_id;
                    ledgerEntry.details = patientInvoiceDetailsInString(dataRow);
                    ledgerEntry.credit = dataRow.total;
                    ledgerEntry.debit = 0;
                    ledgerEntry.return = 0;
                    ledgerEntry.cash_return = 0;

                } else if (dataRow.ledger_type == 'Payment') {
                    ledgerEntry.type_id = dataRow.payment_id;
                    ledgerEntry.details = patientPaymentDetailsInString(dataRow);
                    if (dataRow.return_pay) {
                        ledgerEntry.credit = 0;
                        ledgerEntry.debit = 0;
                        ledgerEntry.return = -1 * (dataRow.total + dataRow.advance_value);
                    } else {
                        ledgerEntry.credit = 0;
                        ledgerEntry.debit = dataRow.total + dataRow.advance_value;
                        ledgerEntry.return = 0;
                    }
                    ledgerEntry.cash_return = 0;

                } else if (dataRow.ledger_type == 'Return') {
                    ledgerEntry.type_id = dataRow.return_id;
                    ledgerEntry.details = patientReturnInvoiceDetailsInString(dataRow);
                    ledgerEntry.credit = dataRow.cash_return;
                    ledgerEntry.debit = 0;
                    ledgerEntry.return = dataRow.return_value;
                    if(dataRow.with_tax == false){
                        ledgerEntry.credit += dataRow.taxes;
                    }
                    ledgerEntry.cash_return = dataRow.cash_return;
                }
                balance += ledgerEntry.credit;
                balance -= ledgerEntry.debit;
                totalDebit += ledgerEntry.debit;
                totalCredit += ledgerEntry.credit;
                ledgerEntry.balance = balance;
                ledgerData.push(ledgerEntry);
            });
            that.setState({
                loadingLedger: false,
                credit: totalCredit,
                debit: totalDebit,
                balance,
                ledger: ledgerData
            })
        }
        const errorFn = function () {
            that.setState({
                loadingLedger: false
            })
        }
        const apiParams = {
            practice_id: this.props.active_practiceId
        };
        if (this.props.showAllClinic && this.props.match.params.id) {
            delete (apiParams.practice)
        }
        getAPI(interpolate(PATIENT_LEDGER, [that.props.currentPatient.id]), successFn, errorFn, apiParams);
    }

    ledgerCompleteToggle(id, option) {
        this.setState(function (prevState) {
            return {selectedList: {...prevState.selectedList, [id]: !!option}}
        });
    }

    loadPDF = (id) => {
        const that = this;
        const successFn = function (data) {
            if (data.report)
                window.open(BACKEND_BASE_URL + data.report);
        }
        const errorFn = function () {

        }
        // getAPI(interpolate(INVOICE_PDF_API, [id]), successFn, errorFn);
    }

    render() {
        const columns = [
            //     {
            //     title: '',
            //     key: 'is_completed',
            //     render: (text, record) => (record.is_completed ?
            //         <Icon type="check-circle" theme="twoTone" style={{marginLeft: '8px', fontSize: '20px'}}/> :
            //         <Checkbox key={record.id}
            //                   onChange={(e) => this.ledgerCompleteToggle(record.id, e.target.checked)}
            //                   value={this.state.selectedList[record.id]}/>)
            // },
            {
                title: 'Date',
                key: 'date',
                dataIndex: "date",
                width:120
            }, {
                title: 'Invoice/ Receipt/ Return No',
                key: 'type_id',
                dataIndex: "type_id",
            }, {
                title: 'Details',
                key: 'details',
                dataIndex: "details",
            }, {
                title: 'Type',
                key: 'type',
                dataIndex: "type",
            }, {
                title: 'Return(INR)',
                key: 'return',
                dataIndex: "return",
                align: "right",
                render: value => value.toFixed(2)
            }, {
                title: 'Cash Return(INR)',
                key: 'cash_return',
                dataIndex: "cash_return",
                align: "right",
                render: value => value.toFixed(2)
            }, {
                title: 'Credit(INR)',
                key: 'credit',
                dataIndex: "credit",
                align: "right",
                render: value => value.toFixed(2)
            }, {
                title: 'Debit(INR)',
                key: 'debit',
                dataIndex: "debit",
                align: "right",
                render: value => value.toFixed(2)
            }, {
                title: 'Balance(INR)',
                key: 'balance',
                dataIndex: "balance",
                align: "right",
                render: value => value.toFixed(2)
            }];
        return (
<Row>
            <Card
              title={this.state.currentPatient ? `${this.state.currentPatient.name  } Payment Ledger` : "Patient Ledgers"}
              extra={(
<Button.Group>
                    {/* <Button type="primary"> */}
                    {/*    <Icon type="printer"/>Print billing summary */}
                    {/* </Button> */}
                    <Link to={`/erp/patient/${  this.props.match.params.id  }/billing/payments`}> <Button
                      type="primary"
                    >
                        <Icon type="plus" />&nbsp;Add Payment
                                                                                              </Button>
                    </Link>

                    <Link to={`/erp/patient/${  this.props.match.params.id  }/billing/invoices`}> <Button
                      type="primary"
                    >
                        <Icon type="plus" />&nbsp;Add Invoice
                                                                                              </Button>
                    </Link>&nbsp;

                    {/* <Button type="primary" onClick={() => this.loadPDF()}> */}
                    {/*    <Icon type="printer"/>&nbsp;Print */}
                    {/* </Button>&nbsp; */}

                    {/* <Button type="primary" onClick={this.submitLedgers}> */}
                    {/*    <Icon type="save"/>Send Payment Reminder */}
                    {/* </Button> */}
</Button.Group>
)}
            >
                <Table
                  loading={this.state.loadingLedger}
                  columns={columns}
                  dataSource={this.state.ledger}
                  pagination={false}
                />
                <Row style={{marginTop: 20, textAlign: 'center'}}>
                    <Col span={8}>
                        <h3>Total Credit: {this.state.credit.toFixed(2)}</h3>
                    </Col>
                    <Col span={8}>
                        <h3>Total Debit: {this.state.debit.toFixed(2)}</h3>
                    </Col>
                    <Col span={8}>
                        <h3>Total
                            Balance: {this.state.balance < 0 ? `${(this.state.balance * -1).toFixed(2)  } (Advance)` : this.state.balance.toFixed(2)}
                        </h3>
                    </Col>
                </Row>
            </Card>
</Row>
)
    }
}

export default PatientLedgers;
