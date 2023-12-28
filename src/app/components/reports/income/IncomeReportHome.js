import React from 'react';
import { Button, Card, Checkbox, Col, Radio, Row, Select } from 'antd';
import {
    EXPENSE_TYPE,
    PATIENT_GROUPS,
    PAYMENT_MODES,
    PROCEDURE_CATEGORY,
    PRODUCTS_API,
    TAXES,
    VENDOR_API,
} from '../../../constants/api';
import { getAPI, interpolate } from '../../../utils/common';
import {
    DISCOUNT,
    INCOME_RELATED_REPORT,
    INVOICE_RELATED_REPORT,
    SCHEDULE_OF_INVOICES,
} from '../../../constants/hardData';
import {
    ALL,
    ALL_INVOICE,
    ALL_PAYMENTS,
    DAILY_INCOME,
    DOCTOR_EACH_INCOME,
    MONTHLY_INCOME,
    PATIENT_GROUPS_INCOME,
    PROCEDURE_INCOME,
    PRODUCT_INCOME,
    TAXED_INCOME,
} from '../../../constants/dataKeys';
import { loadDoctors } from '../../../utils/clinicUtils';
import AllInvoices from './AllInvoices';
import DailyInvoicedIncome from './DailyInvoicedIncome';
import MonthlyInvoicedIncome from './MonthlyInvoicedIncome';
import TaxedInvoicedIncome from './TaxedInvoicedIncome';
import InvoicedIncomeForEachDoctor from './InvoicedIncomeForEachDoctor';
import InvoicedIncomeForEachProcedure from './InvoicedIncomeForEachProcedure';
import InvoicedIncomeForEachPatientGroup from './InvoicedIncomeForEachPatientGroup';
import InvoicedIncomeForEachProduct from './InvoicedIncomeForEachProduct';

export default class IncomeReportHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advancedOptionShow: true,
            sidePanelColSpan: 4,
            type: 'ALL',
            practiceDoctors: [],
            patientGroup: [],
            vendorOption: [],
            taxes_list: [],
            productItems: [],
            treatment_data: [],
        };
        loadDoctors(this);
        this.loadPatientGroup = this.loadPatientGroup.bind(this);
        this.loadTaxes = this.loadTaxes.bind(this);
        this.loadProductItem = this.loadProductItem.bind(this);
        this.loadTreatments = this.loadTreatments.bind(this);
    }

    componentDidMount() {
        this.loadPatientGroup();
        this.loadTaxes();
        this.loadProductItem();
        this.loadTreatments();
    }

    loadProductItem() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                productItems: data,
            });
        };
        const errorFn = function() {};
        getAPI(PRODUCTS_API, successFn, errorFn, { practice: this.props.active_practiceId });
    }

    loadPatientGroup() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                patientGroup: data,
            });
        };
        const errorFn = function() {};
        getAPI(interpolate(PATIENT_GROUPS, [this.props.active_practiceId]), successFn, errorFn);
    }

    loadTaxes() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                taxes_list: data,
            });
        };
        const errorFn = function() {};
        getAPI(interpolate(TAXES, [this.props.active_practiceId]), successFn, errorFn);
    }

    loadTreatments() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                treatment_data: data,
            });
        };
        const errorFn = function() {};
        getAPI(
            interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId]),
            successFn,
            errorFn,
            { pagination: false },
        );
    }

    onChangeHandle = (type, value) => {
        const that = this;
        this.setState({
            [type]: value.target.value,
        });
    };

    advancedOption(value) {
        this.setState({
            advancedOptionShow: value,
        });
    }

    changeSidePanelSize = sidePanel => {
        this.setState({
            sidePanelColSpan: sidePanel ? 0 : 4,
        });
    };

    handleChangeOption = (type, value) => {
        const that = this;
        this.setState({
            [type]: value,
        });
    };

    onChangeCheckbox = e => {
        this.setState({
            is_cancelled: !this.state.is_cancelled,
        });
    };

    render() {
        return (
            <div>
                <h2>
                    Income Report{' '}
                    <Button
                        type="primary"
                        shape="round"
                        icon={this.state.sidePanelColSpan ? 'double-right' : 'double-left'}
                        style={{ float: 'right' }}
                        onClick={() => this.changeSidePanelSize(this.state.sidePanelColSpan)}
                    >
                        Panel
                    </Button>
                </h2>
                <Card>
                    <Row gutter={16}>
                        <Col span={24 - this.state.sidePanelColSpan}>
                            {this.state.type == ALL_PAYMENTS ? (
                                <AllInvoices {...this.props} {...this.state} />
                            ) : null}

                            {this.state.type == DAILY_INCOME ? (
                                <DailyInvoicedIncome {...this.props} {...this.state} />
                            ) : null}

                            {this.state.type == MONTHLY_INCOME ? (
                                <MonthlyInvoicedIncome {...this.props} {...this.state} />
                            ) : null}

                            {this.state.type == TAXED_INCOME ? (
                                <TaxedInvoicedIncome {...this.props} {...this.state} />
                            ) : null}

                            {this.state.type == DOCTOR_EACH_INCOME ? (
                                <InvoicedIncomeForEachDoctor {...this.props} {...this.state} />
                            ) : null}

                            {this.state.type == PROCEDURE_INCOME ? (
                                <InvoicedIncomeForEachProcedure {...this.props} {...this.state} />
                            ) : null}

                            {this.state.type == PATIENT_GROUPS_INCOME ? (
                                <InvoicedIncomeForEachPatientGroup
                                    {...this.props}
                                    {...this.state}
                                />
                            ) : null}

                            {this.state.type == PRODUCT_INCOME ? (
                                <InvoicedIncomeForEachProduct {...this.props} {...this.state} />
                            ) : null}
                        </Col>

                        <Col span={this.state.sidePanelColSpan}>
                            <Radio.Group
                                buttonStyle="solid"
                                defaultValue={ALL_INVOICE}
                                onChange={value => this.onChangeHandle('type', value)}
                            >
                                <h2>Income</h2>
                                <Radio.Button
                                    style={{
                                        width: '100%',
                                        backgroundColor: 'transparent',
                                        border: '0px',
                                    }}
                                    value={ALL_INVOICE}
                                >
                                    All Invoice
                                </Radio.Button>
                                <p>
                                    <br />
                                </p>
                                <h2>Related Reports</h2>
                                {INCOME_RELATED_REPORT.map(item => (
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
                                    <Button
                                        type="link"
                                        onClick={value => this.advancedOption(false)}
                                    >
                                        Hide Advanced Options
                                    </Button>
                                    <Col>
                                        {' '}
                                        <br />
                                        <br />
                                        <h4>Show income from</h4>
                                        <Radio.Group
                                            style={{ width: '100%', display: 'inline-grid' }}
                                            onChange={e =>
                                                this.handleChangeOption(
                                                    'income_type',
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            {/* <Row> */}
                                            {SCHEDULE_OF_INVOICES.map(item => (
                                                <Radio value={item.value}> {item.label}</Radio>
                                            ))}
                                            {/* </Row> */}
                                        </Radio.Group>
                                        <br />
                                        <br />
                                        <h4>Doctors</h4>
                                        <Select
                                            style={{ minWidth: '200px' }}
                                            mode="multiple"
                                            placeholder="Select Doctors"
                                            onChange={value =>
                                                this.handleChangeOption('doctors', value)
                                            }
                                        >
                                            {this.state.practiceDoctors.map(item => (
                                                <Select.Option value={item.id}>
                                                    {item.user.first_name}
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
                                            onChange={value =>
                                                this.handleChangeOption('patient_groups', value)
                                            }
                                        >
                                            {this.state.patientGroup.map(item => (
                                                <Select.Option value={item.id}>
                                                    {item.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        <br />
                                        <br />
                                        <h4>Discount</h4>
                                        <Select
                                            style={{ minWidth: '200px' }}
                                            placeholder="Select Discount"
                                            onChange={value =>
                                                this.handleChangeOption('discount', value)
                                            }
                                        >
                                            {DISCOUNT.map(item => (
                                                <Select.Option value={item.value}>
                                                    {item.label}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        <br />
                                        <br />
                                        <h4>Product</h4>
                                        <Select
                                            style={{ minWidth: '200px' }}
                                            mode="multiple"
                                            placeholder="Select Products"
                                            onChange={value =>
                                                this.handleChangeOption('products', value)
                                            }
                                            showSearch
                                            optionFilterProp="label"
                                        >
                                            {this.state.productItems.map(item => (
                                                <Select.Option value={item.id} label={item.name}>
                                                    {item.name}
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
                                            onChange={value =>
                                                this.handleChangeOption('treatments', value)
                                            }
                                        >
                                            {this.state.treatment_data.map(item => (
                                                <Select.Option value={item.id}>
                                                    {item.name}
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
                                            onChange={value =>
                                                this.handleChangeOption('taxes', value)
                                            }
                                        >
                                            {this.state.taxes_list.map(item => (
                                                <Select.Option value={item.id}>
                                                    {item.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        <br />
                                        <br />
                                        <Checkbox onChange={e => this.onChangeCheckbox(e)}>
                                            {' '}
                                            Exclude Cancelled
                                        </Checkbox>
                                    </Col>
                                </>
                            ) : (
                                <Button type="link" onClick={value => this.advancedOption(true)}>
                                    Show Advanced Options
                                </Button>
                            )}
                        </Col>
                    </Row>
                </Card>
            </div>
        );
    }
}
