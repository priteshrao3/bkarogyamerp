import React from "react";
import { Button, Card, Checkbox, Col, Radio, Row, Select } from "antd";
import { EXPENSE_TYPE, PATIENT_GROUPS, PAYMENT_MODES, TAXES, VENDOR_API, PROCEDURE_CATEGORY } from "../../../constants/api";
import { getAPI, interpolate } from "../../../utils/common";
import { PAYMENT_RELATED_REPORT, SCHEDULE_OF_PAYMENT, TYPE_OF_CONSUMPTION, DISCOUNT } from "../../../constants/hardData";
import {
    ALL_EXPENSES, ALL_PAYMENTS,
    CREDIT_AMOUNT_PER_DOCTOR, CREDIT_NOTES, MODE_OF_PAYMENTS, PATIENTS_UNSETTLED_ADVANCE,
    PAYMENT_RECEIVED_PATIENT_GROUP, PAYMENT_RECEIVED_PER_DAY, PAYMENT_RECEIVED_PER_DOCTOR, PAYMENT_RECEIVED_PER_MONTH,
    PAYMENT_REFUND, PAYMENT_SETTLEMENT, PAYMENT_SETTLEMENT_PER_DOCTOR
} from "../../../constants/dataKeys";
import AllPayments from "./AllPayments";
import { loadDoctors } from "../../../utils/clinicUtils";
import CreditAmountPerDoctor from "./CreditAmountPerDoctor";
import RefundPayments from "./RefundPayments";
import PaymentReceivedEachPatientGroup from "./PaymentReceivedEachPatientGroup";
import PatientsWithUnsettledAdvance from "./PatientsWithUnsettledAdvance";
import ModesOfPayment from "./ModesOfPayment";
import PaymentReceivedPerDay from "./PaymentReceivedPerDay";
import PaymentReceivedPerMonth from "./PaymentReceivedPerMonth";
import PaymentReceivedPerDoctor from "./PaymentReceivedPerDoctor";
import CreditNotes from "./CreditNotes";
import PaymentSettlement from "./PaymentSettlement";
import PaymentSettlementPerDoctor from "./PaymentSettlementPerDoctor";

export default class PaymentsReportHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advancedOptionShow: true,
            paymentModeOption: [],
            sidePanelColSpan: 4,
            type: 'ALL',
            practiceDoctors: [],
            patientGroup: [],
            vendorOption: [],
            taxes_list: [],
            treatment_data: [],
            exclude_cancelled:true
        };
        loadDoctors(this);
        this.loadPatientGroup = this.loadPatientGroup.bind(this);
        this.loadPaymentMode = this.loadPaymentMode.bind(this);
        this.loadTaxes = this.loadTaxes.bind(this);
        this.loadTreatments = this.loadTreatments.bind(this);
    }

    componentDidMount() {
        this.loadPatientGroup();
        this.loadPaymentMode();
        this.loadTaxes();
        this.loadTreatments();
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

    loadPaymentMode() {
        const that = this;
        const successFun = function (data) {
            that.setState({
                paymentModeOption: data,
            })
        };
        const errorFn = function () {

        };
        getAPI(interpolate(PAYMENT_MODES, [this.props.active_practiceId]), successFun, errorFn);
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

    loadTreatments() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                treatment_data: data,
            })
        };
        const errorFn = function () {
        };
        getAPI(interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId]), successFn, errorFn, { pagination: false });

    }

    onChangeHandle = (type, value) => {
        const that = this;
        this.setState({
            [type]: value.target.value,
        })
    };

    advancedOption(value) {
        this.setState({
            advancedOptionShow: value,
        })
    }

    changeSidePanelSize = (sidePanel) => {
        this.setState({
            sidePanelColSpan: sidePanel ? 0 : 4
        })
    };

    handleChangeOption = (type, value) => {
        const that = this;
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
        return (
            <div>
                <h2>Payments Report <Button
                    type="primary"
                    shape="round"
                    icon={this.state.sidePanelColSpan ? "double-right" : "double-left"}
                    style={{ float: "right" }}
                    onClick={() => this.changeSidePanelSize(this.state.sidePanelColSpan)}
                >Panel
                                </Button>
                </h2>
                <Card>
                    <Row gutter={16}>
                        <Col span={(24 - this.state.sidePanelColSpan)}>

                            {this.state.type == ALL_PAYMENTS ?
                                <AllPayments {...this.props} {...this.state} /> : null}

                            {/* {this.state.type==PAYMENT_REFUND?
                            <RefundPayments {...this.props} {...this.state}/> : null} */}

                            {this.state.type == PAYMENT_RECEIVED_PATIENT_GROUP ?
                                <PaymentReceivedEachPatientGroup {...this.props} {...this.state} /> : null}

                            {this.state.type == PATIENTS_UNSETTLED_ADVANCE ?
                                <PatientsWithUnsettledAdvance {...this.props} {...this.state} /> : null}

                            {this.state.type == MODE_OF_PAYMENTS ?
                                <ModesOfPayment {...this.props} {...this.state} /> : null}

                            {this.state.type == PAYMENT_RECEIVED_PER_DAY ?
                                <PaymentReceivedPerDay {...this.props} {...this.state} /> : null}

                            {this.state.type == PAYMENT_RECEIVED_PER_MONTH ?
                                <PaymentReceivedPerMonth {...this.props} {...this.state} /> : null}

                            {this.state.type == PAYMENT_RECEIVED_PER_DOCTOR ?
                                <PaymentReceivedPerDoctor {...this.props} {...this.state} /> : null}
                            {/* 
                        {this.state.type == CREDIT_NOTES ?
                            <CreditNotes {...this.props} {...this.state} /> : null} */}

                            {this.state.type == PAYMENT_SETTLEMENT ?
                                <PaymentSettlement {...this.props} {...this.state} /> : null}

                            {/* {this.state.type == PAYMENT_SETTLEMENT_PER_DOCTOR ?
                            <PaymentSettlementPerDoctor {...this.props} {...this.state} /> : null} */}



                        </Col>


                        <Col span={this.state.sidePanelColSpan}>
                            <Radio.Group
                                buttonStyle="solid"
                                defaultValue={ALL_PAYMENTS}
                                onChange={(value) => this.onChangeHandle('type', value)}
                            >
                                <h2>Payments</h2>
                                <Radio.Button
                                    style={{ width: '100%', backgroundColor: 'transparent', border: '0px' }}
                                    value={ALL_PAYMENTS}
                                >
                                    All Payments
                            </Radio.Button>
                                <p><br /></p>
                                <h2>Related Reports</h2>
                                {PAYMENT_RELATED_REPORT.map((item) => (
                                    <Radio.Button
                                        style={{ width: '100%', backgroundColor: 'transparent' }}
                                        value={item.value}
                                    >
                                        {item.name}
                                    </Radio.Button>
                                ))}
                            </Radio.Group>

                            <br />
                            <br />
                            {this.state.advancedOptionShow ? (
                                <>
                                    <Button type="link" onClick={(value) => this.advancedOption(false)}>Hide Advanced
                                        Options
                            </Button>
                                    <Col>
                                        {this.state.type == PAYMENT_RECEIVED_PER_DOCTOR || this.state.type == PAYMENT_RECEIVED_PER_MONTH || this.state.type == PAYMENT_RECEIVED_PER_DAY ? null : (
                                            <>

                                                <br />
                                                <h4>Show</h4>
                                                <Checkbox.Group
                                                    style={{ width: '100%', display: "inline-grid" }}
                                                    onChange={(value) => this.handleChangeOption('consume', value)}
                                                >
                                                    {/* <Row> */}
                                                    {SCHEDULE_OF_PAYMENT.map((item) => (
                                                        <Checkbox
                                                            value={item.value}
                                                        > {item.label}
                                                        </Checkbox>
                                                    ))}
                                                    {/* </Row> */}
                                                </Checkbox.Group>
                                            </>
                                        )}

                                        <br />
                                        <br />
                                        <h4>Doctors</h4>
                                        <Select
                                            style={{ minWidth: '200px' }}
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
                                        <h4>Treatments</h4>
                                        <Select
                                            style={{ minWidth: '200px' }}
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
                                        <h4>Patient Groups</h4>
                                        <Select
                                            style={{ minWidth: '200px' }}
                                            mode="multiple"
                                            placeholder="Select Patient Groups"
                                            onChange={(value) => this.handleChangeOption('patient_groups', value)}
                                        >
                                            {this.state.patientGroup.map((item) => (
                                                <Select.Option value={item.id}>
                                                    {item.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        <br />
                                        <br />
                                        <h4>Payment Modes</h4>
                                        <Select
                                            style={{ minWidth: '200px' }}
                                            mode="multiple"
                                            placeholder="Select Payment Modes"
                                            onChange={(value) => this.handleChangeOption('payment_mode', value)}
                                        >
                                            {this.state.paymentModeOption.map((item) => (
                                                <Select.Option value={item.id}>
                                                    {item.mode}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        <br />
                                        <br />
                                        <h4>Discount</h4>
                                        <Select
                                            style={{ minWidth: '200px' }}
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
                                        <h4>Taxes</h4>
                                        <Select
                                            style={{ minWidth: '200px' }}
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
                                        <Checkbox onChange={(e) => this.onChangeCheckbox(e)} checked={this.state.exclude_cancelled}> Exclude Cancelled</Checkbox>

                                    </Col>
                                </>
                            ) : (
                                    <Button type="link" onClick={(value) => this.advancedOption(true)}>Show Advanced
                                                                Options
</Button>
                                )}

                        </Col>

                    </Row>
                </Card>
            </div>
        )
    }
}
