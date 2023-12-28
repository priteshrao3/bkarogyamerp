import React from 'react';
import {
    Affix,
    Alert,
    Button,
    Card,
    Col,
    Divider,
    Dropdown,
    Icon,
    Menu,
    Row,
    Spin,
    Statistic,
    Table,
    Tag,
    Tooltip,
    Form,
} from 'antd';
import moment from 'moment';
import { Route, Switch } from 'react-router';
import { Link, Redirect } from 'react-router-dom';
import { getAPI, interpolate, postAPI, putAPI } from '../../../utils/common';
import {
    DRUG_CATALOG,
    PROCEDURE_CATEGORY,
    TAXES, PROFORMA_INVOICE, PROFORMA_INVOICE_DETAIL, PROFORMA_PDF, CANCELINVOICE_GENERATE_OTP,
} from '../../../constants/api';
import AddInvoicedynamic from './AddInvoicedynamic';
import AddInvoicedynamicToProforma from '../invoices/AddInvoicedynamic'
import InfiniteFeedLoaderButton from '../../common/InfiniteFeedLoaderButton';
import { BACKEND_BASE_URL } from '../../../config/connect';
import {
    MEMBERSHIP_AMOUNT,
    INVOICE,
    REGISTRATION_AMOUNT, OTP_DELAY_TIME,
} from '../../../constants/dataKeys';
import PermissionDenied from '../../common/errors/PermissionDenied';


class PatientInvoices extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPatient: this.props.currentPatient,
            active_practiceId: this.props.active_practiceId,
            invoices: [],
            drug_catalog: null,
            procedure_category: null,
            taxes_list: null,
            editInvoice: null,
            loading: true,
        };
        this.loadInvoices = this.loadInvoices.bind(this);
        this.loadDrugCatalog = this.loadDrugCatalog.bind(this);
        this.loadProcedureCategory = this.loadProcedureCategory.bind(this);
        this.loadTaxes = this.loadTaxes.bind(this);
    }

    componentDidMount() {
        this.loadInvoices();
    }

    loadInvoices(page = 1) {
        const that = this;
        if (that.props.refreshWallet && page == 1) {
            that.props.refreshWallet();
        }
        that.setState({
            loading: true,
        });
        const successFn = function(data) {
            if (data.current == 1) {
                that.setState({
                    total: data.count,
                    invoices: data.results,
                    loading: false,
                    loadMoreInvoice: data.next,
                });
            } else {
                that.setState(function(prevState) {
                    return {
                        total: data.count,
                        invoices: [...prevState.invoices, ...data.results],
                        loading: false,
                        loadMoreInvoice: data.next,
                    };
                });
            }
        };
        const errorFn = function() {
            that.setState({
                loading: false,
            });

        };
        const apiParams = {
            page,
            practice: this.props.active_practiceId,
            summary: true,
        };
        if (this.props.match.params.id) {
            apiParams.patient = this.props.match.params.id;
        }
        // if (this.props.showAllClinic && this.props.match.params.id) {
        //     delete (apiParams.practice)
        // }
        getAPI(PROFORMA_INVOICE, successFn, errorFn, apiParams);
    }

    loadDrugCatalog() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                drug_catalog: data,
            });
        };
        const errorFn = function() {

        };
        getAPI(interpolate(DRUG_CATALOG, [this.props.active_practiceId]), successFn, errorFn);
    }

    loadProcedureCategory() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                procedure_category: data,
            });
        };
        const errorFn = function() {


        };
        getAPI(interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId]), successFn, errorFn);
    }

    loadTaxes() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                taxes_list: data,
            });
        };
        const errorFn = function() {
        };
        getAPI(interpolate(TAXES, [this.props.active_practiceId]), successFn, errorFn);

    }


    loadPDF = (id) => {
        const that = this;
        const successFn = function(data) {
            if (data.report)
                window.open(BACKEND_BASE_URL + data.report);
        };
        const errorFn = function() {

        };
        getAPI(interpolate(PROFORMA_PDF, [id]), successFn, errorFn);
    };

    createInvoice(record) {
        const that = this;
        that.setState({
            editInvoice: record,
        });

        that.props.history.push(`/erp/patient/${record.patient_data.id}/proforma-invoice/convert`);

    };


    editProforma(record) {
        const that = this;
        that.setState({
            editInvoice: record,
        });

        that.props.history.push(`/erp/patient/${record.patient_data.id}/proforma-invoice/edit/`);

    };

    onCancelProforma = (record) => {
        const that = this;
        const reqData = {
            ...record,
            is_cancelled: true,
        };
        const successFn = function(data) {
            that.loadInvoices();
        };
        const errorFn = function() {
        };
        delete reqData.reservation;
        putAPI(interpolate(PROFORMA_INVOICE_DETAIL, [record.id]), reqData, successFn, errorFn);
    };

    render() {
        const that = this;
        const drugs = {};
        if (this.state.drug_catalog) {

            this.state.drug_catalog.forEach(function(drug) {
                drugs[drug.id] = (`${drug.name},${drug.strength}`);
            });
        }
        const procedures = {};
        if (this.state.procedure_category) {
            this.state.procedure_category.forEach(function(procedure) {
                procedures[procedure.id] = procedure.name;
            });
        }

        const taxesdata = {};
        if (this.state.taxes_list) {
            this.state.taxes_list.forEach(function(tax) {
                taxesdata[tax.id] = tax.name;
            });
        }

        if (this.props.match.params.id) {
            return (
                <div>
                    <Switch>
                        <Route
                            path='/erp/patient/:id/proforma-invoice/add/'
                            render={(route) => (
                                (this.props.activePracticePermissions.PatientAddEditInvoices ? <AddInvoicedynamic
                                    {...route}
                                    {...this.props}
                                    loadData={this.loadInvoices}
                                /> : <PermissionDenied/>)
                            )}
                        />
                        <Route
                            path='/erp/patient/:id/proforma-invoice/edit'
                            render={(route) => (
                                this.state.editInvoice ? (
                                        (this.props.activePracticePermissions.PatientAddEditInvoices ? <AddInvoicedynamic
                                            {...this.state}
                                            {...route}
                                            {...this.props}
                                            editId={this.state.editInvoice.id}
                                            loadData={this.loadInvoices}
                                        /> : <PermissionDenied/>)
                                    ) :
                                    <Redirect to={`/erp/patient/${this.props.match.params.id}/proforma-invoice`}/>
                            )}
                        />
                        <Route
                            path='/erp/patient/:id/proforma-invoice/convert/'
                            render={(route) => (
                                this.state.editInvoice ? (
                                        (this.props.activePracticePermissions.PatientAddEditInvoices ? <AddInvoicedynamicToProforma
                                            {...this.state}
                                            {...route}
                                            {...this.props}
                                            proformaId={this.state.editInvoice.id}
                                            loadData={this.loadInvoices}
                                        /> : <PermissionDenied/>)
                                    ) :
                                    <Redirect to={`/erp/patient/${this.props.match.params.id}/proforma-invoice`}/>
                            )}
                        />
                        {/*<Route*/}
                        {/*    path='/patient/:id/billing/invoices/return'*/}
                        {/*    render={(route) => (*/}
                        {/*        this.state.editInvoice ? (*/}
                        {/*                (this.props.activePracticePermissions.PatientAddEditReturns ? <AddReturnInvoice*/}
                        {/*                    {...this.state}*/}
                        {/*                    {...route}*/}
                        {/*                    editId={this.state.editInvoice.id}*/}
                        {/*                    loadData={this.loadInvoices}*/}
                        {/*                />: <PermissionDenied/>)*/}
                        {/*            ) :*/}
                        {/*            <Redirect to={`/patient/${this.props.match.params.id}/billing/invoices`}/>*/}
                        {/*    )}*/}
                        {/*/>*/}
                        <Route>
                            <div>
                                <Alert
                                    banner
                                    showIcon
                                    type="info"
                                    message="The invoices shown are only for the current selected practice!"
                                />
                                <Affix offsetTop={0}>
                                    <Card
                                        bodyStyle={{ padding: 0 }}
                                        style={{ boxShadow: '0 5px 8px rgba(0, 0, 0, 0.09)' }}
                                        title={(this.state.currentPatient ? `${this.state.currentPatient.user.first_name} Invoice ` : 'Invoices ') + (this.state.total ? `(Total:${this.state.total})` : '')}
                                        extra={(
                                            <Button.Group>
                                                <Link
                                                    to={`/erp/patient/${this.props.match.params.id}/proforma-invoice/add`}
                                                >
                                                    <Button type="primary"
                                                            disabled={!this.props.activePracticePermissions.PatientAddEditInvoices}>
                                                        <Icon type="plus"/>Add
                                                    </Button>
                                                </Link>
                                            </Button.Group>
                                        )}
                                    />
                                </Affix>
                                {this.state.invoices.map(invoice => InvoiceCard(invoice, that))}
                                <Spin spinning={this.state.loading}>
                                    <Row/>
                                </Spin>
                                <InfiniteFeedLoaderButton
                                    loaderFunction={() => this.loadInvoices(this.state.loadMoreInvoice)}
                                    loading={this.state.loading}
                                    hidden={!this.state.loadMoreInvoice}
                                />

                            </div>
                        </Route>
                    </Switch>


                </div>
            );
        }
        return (
            <div>
                <Affix offsetTop={0}>
                    <Card
                        bodyStyle={{ padding: 0 }}
                        style={{ boxShadow: '0 5px 8px rgba(0, 0, 0, 0.09)' }}
                        title={(this.state.currentPatient ? `${this.state.currentPatient.user.first_name} Invoice ` : 'Invoice ') + (this.state.total ? `(Total:${this.state.total})` : '')}
                        extra={(
                            <Button.Group>
                                <Button type="primary" onClick={() => this.props.togglePatientListModal(true)}
                                        disabled={!this.props.activePracticePermissions.PatientAddEditInvoices}>
                                    <Icon type="plus"/>Add
                                </Button>
                            </Button.Group>
                        )}
                    />
                </Affix>
                {this.state.invoices.map(invoice => InvoiceCard(invoice, that))}
                <Spin spinning={this.state.loading}>
                    <Row/>
                </Spin>
                <InfiniteFeedLoaderButton
                    loaderFunction={() => this.loadInvoices(this.state.loadMoreInvoice)}
                    loading={this.state.loading}
                    hidden={!this.state.loadMoreInvoice}
                />


            </div>
        );


    }
}

export default Form.create()(PatientInvoices);

function invoiceFooter(presc) {
    if (presc) {
        return (
            <p>
                {presc.doctor ? (
                    <Tooltip title="Doctor"><Tag color={presc.doctor ? presc.doctor.calendar_colour : null}>
                        <b>{`prescribed by  ${presc.doctor.user.first_name}`} </b>
                    </Tag>
                    </Tooltip>
                ) : null}
                {presc.practice ? (
                    <Tag style={{ float: 'right' }}>
                        <Tooltip title="Practice Name">
                            <b>{presc.practice.name} </b>
                        </Tooltip>
                    </Tag>
                ) : null}
                {presc.courier_charge ? <p>Packing and Delivery Charges : {presc.courier_charge} INR</p> : null}
                {presc.notes ? <p>Notes : {presc.notes}</p> : null}
                {presc.cancel_note ? <p>Cancel Notes : {presc.cancel_note}</p> : null}
            </p>
        );


    }
    return null;
}

function InvoiceCard(invoice, that) {
    let tableObjects = [...invoice.procedure, ...invoice.inventory];


    if (invoice.reservation) {
        const medicinesPackages = invoice.reservation_data.medicines.map(item => Object.create({
            ...item,
            unit: 1,
            total: item.final_price,
            unit_cost: item.price,
            discount: 0,
            courier_charge: invoice.courier_charge,
        }));
        const mapper = {
            'NORMAL': { total: 'final_normal_price', tax: 'normal_tax_value', unit_cost: 'normal_price' },
            'TATKAL': { total: 'final_tatkal_price', tax: 'tatkal_tax_value', unit_cost: 'tatkal_price' },
        };
        tableObjects = [...tableObjects, {
            ...invoice.reservation_data.bed_package,
            unit: 1,
            total: invoice.reservation_data.bed_package ? invoice.reservation_data.bed_package[mapper[invoice.reservation_data.seat_type].total] : null,
            tax_value: invoice.reservation_data.bed_package ? invoice.reservation_data.bed_package[mapper[invoice.reservation_data.seat_type].tax] : null,
            unit_cost: invoice.reservation_data.bed_package ? invoice.reservation_data.bed_package[mapper[invoice.reservation_data.seat_type].unit_cost] : null,
        }, ...medicinesPackages];
    }

    const renderTables = (invoice) => {
        switch (invoice.type) {
            case MEMBERSHIP_AMOUNT:
                return (
                    <Table
                        bordered
                        pagination={false}
                        columns={columns}
                        dataSource={[{
                            inventory: true,
                            name: 'Membership',
                            unit_cost: invoice.total,
                            unit: 1,
                            discount_value: 0,
                            tax_value: 0,
                            total: invoice.total,
                        }, {
                            name: 'Total',
                            unit_cost: invoice.total,
                            unit: 1,
                            discount_value: 0,
                            tax_value: 0,
                            total: invoice.total,

                        }]}
                        footer={() => invoiceFooter({
                            practice: invoice.practice_data,
                            notes: invoice.notes,
                            cancel_note: invoice.cancel_note,
                            courier_charge: invoice.courier_charge,
                        })}
                    />
                );
                break;
            case REGISTRATION_AMOUNT:
                return (
                    <Table
                        bordered
                        pagination={false}
                        columns={columns}
                        dataSource={[{
                            inventory: true,
                            name: 'Registration',
                            unit_cost: invoice.total,
                            unit: 1,
                            discount_value: 0,
                            tax_value: 0,
                            total: invoice.total,
                        }, {
                            name: 'Total',
                            unit_cost: invoice.total,
                            unit: 1,
                            discount_value: 0,
                            tax_value: 0,
                            total: +invoice.total,


                        }]}
                        footer={() => invoiceFooter({
                            practice: invoice.practice_data,
                            notes: invoice.notes,
                            cancel_note: invoice.cancel_note,
                            courier_charge: invoice.courier_charge,
                        })}
                    />
                );
                break;
            case INVOICE:
                return (
                    <Table
                        bordered
                        pagination={false}
                        columns={columns}
                        dataSource={[...tableObjects, {
                            name: 'Total',
                            unit_cost: tableObjects.reduce(function(prev, cur) {
                                return prev + cur.unit_cost;
                            }, 0),
                            unit: tableObjects.reduce(function(prev, cur) {
                                return prev + cur.unit;
                            }, 0),
                            discount_value: tableObjects.reduce(function(prev, cur) {
                                return prev + cur.discount_value;
                            }, 0),
                            tax_value: tableObjects.reduce(function(prev, cur) {
                                return prev + cur.tax_value;
                            }, 0),
                            total: tableObjects.reduce(function(prev, cur) {
                                return prev + cur.total;
                            }, 0),

                        }]}
                        footer={() => invoiceFooter({
                            practice: invoice.practice_data,
                            notes: invoice.notes,
                            cancel_note: invoice.cancel_note,
                            courier_charge: invoice.courier_charge,
                        })}
                    />
                );
                break;
            case 'Bed Booking':
                return (<Table
                    bordered
                    pagination={false}
                    columns={columns}
                    dataSource={[...tableObjects, {
                        name: 'Total',
                        unit_cost: tableObjects.reduce(function(prev, cur) {
                            return prev + cur.unit_cost;
                        }, 0),
                        unit: tableObjects.reduce(function(prev, cur) {
                            return prev + cur.unit;
                        }, 0),
                        discount_value: tableObjects.reduce(function(prev, cur) {
                            return prev + cur.discount_value;
                        }, 0),
                        tax_value: tableObjects.reduce(function(prev, cur) {
                            return prev + cur.tax_value;
                        }, 0),
                        total: tableObjects.reduce(function(prev, cur) {
                            return prev + cur.total;
                        }, 0),
                    }]}
                    footer={() => invoiceFooter({
                        practice: invoice.practice_data,
                        notes: invoice.notes,
                        cancel_note: invoice.cancel_note,
                        courier_charge: invoice.courier_charge,
                    })}
                />);
            default:
                return (null);
        }
    };
    return (
        <Card
            key={invoice.id}
            style={{ marginTop: 10 }}
            bodyStyle={{ padding: 0 }}
            title={(
                <small>{invoice.date ? moment(invoice.date).format('ll') : null}
                    {that.state.currentPatient ? null : (
                        <span>
                            <Link
                                to={`/erp/patient/${invoice.patient_data ? invoice.patient_data.id : null}/proforma-invoice`}
                            >
                                &nbsp;&nbsp; {invoice.patient_data ? invoice.patient_data.user.first_name : null} (ID: {invoice.patient_data && invoice.patient_data.custom_id ? invoice.patient_data.custom_id : invoice.patient_data.id})&nbsp;
                            </Link>, {invoice.patient_data ? invoice.patient_data.gender : null}
                        </span>
                    )}
                </small>
            )}
            extra={(
                <Dropdown.Button
                    size="small"
                    style={{ float: 'right' }}
                    overlay={(
                        <Menu>
                            <Menu.Item key="1"
                                onClick={() => that.createInvoice(invoice)} disabled={!that.props.match.params.id}>

                                <Icon type="dollar"/>
                                &nbsp;
                                Create Invoice

                            </Menu.Item>
                            <Menu.Divider/>
                            <Menu.Item
                                key="2"
                                onClick={() => that.editProforma(invoice)}
                                disabled={(invoice.practice != that.props.active_practiceId) || invoice.payments_data || invoice.is_cancelled || !that.props.activePracticePermissions.PatientAddEditInvoices}
                            >

                                <Icon type="edit"/>
                                Edit


                            </Menu.Item>


                            <Menu.Item
                                key="3"
                                onClick={() => that.onCancelProforma(invoice)}
                                disabled={(invoice.practice != that.props.active_practiceId) || invoice.payments_data || invoice.is_cancelled || !that.props.activePracticePermissions.PatientAddEditInvoices}
                            >
                                <Icon type="delete"/>
                                Cancel
                            </Menu.Item>

                        </Menu>
                    )}
                >
                    <a onClick={() => that.loadPDF(invoice.id)}><Icon
                        type="printer"
                    />
                    </a>
                </Dropdown.Button>
            )}
        >
            <Row gutter={8}>
                <Col xs={24} sm={24} md={6} lg={4} xl={4} xxl={4} style={{ padding: 10 }}>
                    {invoice.is_cancelled ?
                        <Alert message="Cancelled" type="error" showIcon/> : null}
                    <Divider style={{ marginBottom: 0 }}>{invoice.invoice_id}</Divider>
                    <Statistic
                        title="Paid / Total "
                        value={(invoice.payments_data ? invoice.payments_data.toFixed(2) : 0)}
                        suffix={`/ ${invoice.total ? invoice.total.toFixed(2) : 0}`}
                    />
                </Col>
                <Col xs={24} sm={24} md={18} lg={20} xl={20} xxl={20}>
                    {renderTables(invoice)}


                </Col>
            </Row>


        </Card>
    );
}

const columns = [{
    title: 'S.No',
    key: 's_no',
    dataIndex: 's_no',
    render: (item, record, index) => (index + 1),

},{
    title: 'Treatment & Products',
    dataIndex: 'drug',
    key: 'drug',
    render: (text, record) => (
        <span> <b>{record.name ? record.name : null}</b>
            <br/> {record.doctor_data ? (
                <Tag color={record.doctor_data ? record.doctor_data.calendar_colour : null}>
                    <b>{`prescribed by  ${record.doctor_data.user.first_name}`} </b>
                </Tag>
            ) : null}
        </span>
    ),
}, {
    title: 'Cost',
    dataIndex: 'unit_cost',
    key: 'unit_cost',
    render: (item, record) => <span>{record.unit_cost ? record.unit_cost.toFixed(2) : null}</span>,
}, {
    title: 'Unit',
    dataIndex: 'unit',
    key: 'unit',
}, {
    title: 'Discount',
    dataIndex: 'discount_value',
    key: 'discount_value',
    render: (item, record) => <span>{record.discount_value ? record.discount_value.toFixed(2) : null}</span>,
}, {
    title: 'Tax',
    dataIndex: 'tax_value',
    key: 'tax_value',
    render: (item, record) => <span>{record.tax_value ? record.tax_value.toFixed(2) : null}</span>,
}, {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    render: item => item ? item.toFixed(2) : null,
}];
