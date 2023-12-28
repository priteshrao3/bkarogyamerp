import React from "react";
import {
    Affix,
    Alert,
    Card,
    Col,
    Divider,
    Modal,
    Row,
    Spin,
    Statistic,
    Table,
    Tag,
    Tooltip,
    Form,
    Menu,
    Icon,
    Button,
    Dropdown,
    Input,
} from "antd";
import moment from "moment";
import {Route, Switch} from "react-router";
import {Link, Redirect} from "react-router-dom";
import * as _ from "lodash";
import {displayMessage, getAPI, interpolate, putAPI, postAPI} from "../../../utils/common";
import {
    INVOICE_RETURN_API,
    DRUG_CATALOG,
    PROCEDURE_CATEGORY,
    TAXES,
    RETURN_INVOICE_PDF_API,
    SINGLE_RETURN_API,
    CANCELINVOICE_GENERATE_OTP,
    CANCELINVOICE_RESENT_OTP,
    CANCELINVOICE_VERIFY_OTP, INVOICE_PDF_API
} from "../../../constants/api";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import {BACKEND_BASE_URL} from "../../../config/connect";
import {SUCCESS_MSG_TYPE, OTP_DELAY_TIME} from "../../../constants/dataKeys";
import {sendMail} from "../../../utils/clinicUtils";
import { REQUIRED_FIELD_MESSAGE } from "../../../constants/messages";


const { TextArea } = Input;
class ReturnInvoices extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPatient: this.props.currentPatient,
            active_practiceId: this.props.active_practiceId,
            returnInvoices: [],
            drug_catalog: null,
            procedure_category: null,
            taxes_list: null,
            loading: true,
            cancelReturnIncoiceVisible:false,
            otpField:false,
        }
        this.loadReturnInvoices = this.loadReturnInvoices.bind(this);
        this.loadDrugCatalog = this.loadDrugCatalog.bind(this);
        this.loadProcedureCategory = this.loadProcedureCategory.bind(this);
        this.loadTaxes = this.loadTaxes.bind(this);

    }

    componentDidMount() {
        const that =this
        that.loadReturnInvoices();

    }

    loadReturnInvoices(page = 1) {
        const that = this;
        if (that.props.refreshWallet && page==1){
            that.props.refreshWallet();
        }
        that.setState({
            loading: true
        });
        const successFn = function (data) {
            if (data.current == 1) {
                that.setState({
                    total: data.count,
                    returnInvoices: data.results,
                    loading: false,
                    loadMoreReturnInvoice: data.next
                })
            } else {
                that.setState(function (prevState) {
                    return {
                        total: data.count,
                        returnInvoices: [...prevState.returnInvoices, ...data.results],
                        loading: false,
                        loadMoreReturnInvoice: data.next
                    }
                })
            }
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })

        }
        const apiParams = {
            page,
            practice: this.props.active_practiceId,
        };
        if (this.props.match.params.id) {
            apiParams.patient = this.props.match.params.id;
        }
        // if (this.props.showAllClinic && this.props.match.params.id) {
        //     delete (apiParams.practice)
        // }
        getAPI(INVOICE_RETURN_API, successFn, errorFn, apiParams);
    }

    loadDrugCatalog() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                drug_catalog: data,
            })
        }
        const errorFn = function () {

        }
        getAPI(interpolate(DRUG_CATALOG, [this.props.active_practiceId]), successFn, errorFn)
    }

    loadProcedureCategory() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                procedure_category: data,
            })
        }
        const errorFn = function () {


        }
        getAPI(interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId]), successFn, errorFn);
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



    loadPDF = (id) => {
        const that = this;
        const successFn = function (data) {
            if (data.report)
                window.open(BACKEND_BASE_URL + data.report);
        }
        const errorFn = function () {

        }
        getAPI(interpolate(RETURN_INVOICE_PDF_API, [id]), successFn, errorFn);
    }


    updateFormValue =(type,value)=>{
        this.setState({
            [type]: value
        })
    };

    mailModalOpen =() =>{
        this.setState({
            visibleMail:true
        })
    };

    mailModalClose =() =>{
        this.setState({
            visibleMail:false
        })
    };

    sendPatientMail =(invoice)=>{
        this.mailModalOpen()
        this.setState({
            patientName:_.get(invoice,'patient_data.user.first_name'),
            paymentId:_.get(invoice,'id'),
            mail_to:_.get(invoice,'patient_data.user.email')
        })

    };

    sendMailToPatient =()=>{
        const {mail_to ,paymentId } = this.state;
        const apiParams ={
            mail_to,
        }
        sendMail(interpolate(RETURN_INVOICE_PDF_API,[paymentId]),apiParams)
        this.mailModalClose();
    }

    cancelModalOpen = (record) => {
        const that = this;
        const created_time=moment().diff(record.created_at,'minutes');
            if(created_time>OTP_DELAY_TIME){
                that.setState({
                    otpField:true
                })
            }
            that.setState({
                cancelReturnIncoiceVisible: true,
                editReturnInvoice: record,
                patientId:record.patient
            });
            const reqData = {
                practice: this.props.active_practiceId,
                type: `${'Return Invoice' + ':'}${  record.return_id  } ` + ` Cancellation`
            }
            const successFn = function (data) {
                that.setState({
                    otpSent: true,
                    patientId: record.patient,
                    returnInvoiceId: record.id
                })
            }
            const errorFn = function () {

            };
            if(created_time >OTP_DELAY_TIME){
                postAPI(CANCELINVOICE_GENERATE_OTP, reqData, successFn, errorFn);
            }
    };


    sendOTP() {
        const that = this;
        const successFn = function (data) {

        }
        const errorFn = function () {

        }
        getAPI(CANCELINVOICE_RESENT_OTP, successFn, errorFn);
    }

    cancelReturnInvoiceClose = () => {
        this.setState({
            cancelReturnIncoiceVisible: false
        })
    }

    handleSubmitCancelReturnInvoice = (e) => {
        const that = this;
        const created_time=moment().diff(that.state.editReturnInvoice.created_at,'minutes');
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const reqData = {
                    ...values,
                    practice: this.props.active_practiceId,
                }

                const successFn = function (data) {
                    that.setState({
                        cancelReturnIncoiceVisible: false,
                        otpField:false,
                    });
                    that.deleteReturnInvoice(that.state.patientId, that.state.returnInvoiceId, values.cancel_note)
                };
                const errorFn = function () {

                };
                if(created_time >OTP_DELAY_TIME){
                    postAPI(CANCELINVOICE_VERIFY_OTP, reqData, successFn, errorFn);
                }else{
                    that.deleteReturnInvoice(that.state.patientId, that.state.editReturnInvoice.id, values.cancel_note)
                }
            }
        });
    }

    // deleteReturnInvoice(patient ,returnInvoiceId)
    deleteReturnInvoice(patient ,returnInvoiceId ,cancel_note) {
        const that = this;
        const reqData = {patient,
            is_cancelled: true,
            cancel_note
        };
        const successFn = function (data) {
            displayMessage(SUCCESS_MSG_TYPE, "Return Invoice cancelled successfully")
            that.loadReturnInvoices();
            that.cancelReturnInvoiceClose();
        }
        const errorFn = function () {
        }
        putAPI(interpolate(SINGLE_RETURN_API, [returnInvoiceId]), reqData, successFn, errorFn);
     }

    render() {
        const that = this;
        const drugs = {}
        if (this.state.drug_catalog) {

            this.state.drug_catalog.forEach(function (drug) {
                drugs[drug.id] = (`${drug.name  },${  drug.strength}`)
            })
        }
        const procedures = {}
        if (this.state.procedure_category) {
            this.state.procedure_category.forEach(function (procedure) {
                procedures[procedure.id] = procedure.name;
            })
        }

        const taxesdata = {}
        if (this.state.taxes_list) {
            this.state.taxes_list.forEach(function (tax) {
                taxesdata[tax.id] = tax.name;
            })
        }
        const {getFieldDecorator} = that.props.form;

        if (this.props.match.params.id) {
            return (
<div>
                <Switch>
                    <Route>
                        <div>
                            <Alert
                              banner
                              showIcon
                              type="info"
                              message="The invoices return shown are only for the current selected practice!"
                            />
                            <Affix offsetTop={0}>
                                <Card
                                  bodyStyle={{padding: 0}}
                                  style={{boxShadow: '0 5px 8px rgba(0, 0, 0, 0.09)'}}
                                  title={(this.state.currentPatient ? `${this.state.currentPatient.user.first_name  } Invoice Return` : "Invoices Return ") + (this.state.total ? `(Total:${this.state.total})` : '')}
                                />
                            </Affix>
                            {this.state.returnInvoices.map(invoice => InvoiceCard(invoice, that))}
                            <Spin spinning={this.state.loading}>
                                <Row />
                            </Spin>
                            <InfiniteFeedLoaderButton
                              loaderFunction={() => this.loadInvoices(this.state.loadMoreInvoice)}
                              loading={this.state.loading}
                              hidden={!this.state.loadMoreInvoice}
                            />

                        </div>
                    </Route>
                </Switch>

                <Modal
                  title={null}
                  visible={this.state.visibleMail}
                  onOk={this.sendMailToPatient}
                  onCancel={this.mailModalClose}
                  footer={[
                        <Button key="back" onClick={this.mailModalClose}>
                            Cancel
                        </Button>,
                        <Button key="submit" type="primary" onClick={this.sendMailToPatient}>
                            Send
                        </Button>,
                    ]}
                >
                    <p>Send invoice To {this.state.patientName} ?</p>
                    <Input
                      value={that.state.mail_to}
                      placeholder="Email"
                      onChange={(e)=>that.updateFormValue('mail_to',e.target.value)}
                    />
                </Modal>

                <Modal
                  visible={that.state.cancelReturnIncoiceVisible}
                  title="Cancel Return Invoice"
                  footer={null}
                  onOk={that.handleSubmitCancelReturnInvoice}
                  onCancel={that.cancelReturnInvoiceClose}
                >
                    <Form>
                        <Form.Item key="cancel_notes">
                            {getFieldDecorator('cancel_note',{
                                rules:[{required:true, message:REQUIRED_FIELD_MESSAGE}],
                            })(
                                <TextArea placeholder="cancel notes" />
                            )}
                        </Form.Item>
                        {that.state.otpField && (
                            <Form.Item>
                                {getFieldDecorator('otp', {
                                    rules: [{required: true, message: 'Please input Otp!'}],
                                })(
                                    <Input
                                      prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}} />}
                                      placeholder="Otp"
                                    />,
                                )}
                            </Form.Item>
                          )}
                        <Form.Item>
                            {that.state.otpSent ? (
<a style={{float: 'right'}} type="primary" onClick={that.sendOTP}>
                                Resend Otp ?
</a>
) : null}
                            <Button size="small" type="primary" htmlType="submit" onClick={that.handleSubmitCancelReturnInvoice}>
                                Submit
                            </Button>&nbsp;
                            <Button size="small" onClick={that.cancelReturnInvoiceClose}>
                                Close
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

</div>
)
        }
            return (
<div>
                <Affix offsetTop={0}>
                    <Card
                      bodyStyle={{padding: 0}}
                      style={{boxShadow: '0 5px 8px rgba(0, 0, 0, 0.09)'}}
                      title={(this.state.currentPatient ? `${this.state.currentPatient.user.first_name  } Invoice Return` : "Invoice Return ") + (this.state.total ? `(Total:${this.state.total})` : '')}
                    />
                </Affix>
                {this.state.returnInvoices.map(invoice => InvoiceCard(invoice, that))}
                <Spin spinning={this.state.loading}>
                    <Row />
                </Spin>
                <InfiniteFeedLoaderButton
                  loaderFunction={() => this.loadInvoices(this.state.loadMoreInvoice)}
                  loading={this.state.loading}
                  hidden={!this.state.loadMoreInvoice}
                />

                <Modal
                  title={null}
                  visible={this.state.visibleMail}
                  onOk={this.sendMailToPatient}
                  onCancel={this.mailModalClose}
                  footer={[
                        <Button key="back" onClick={this.mailModalClose}>
                            Cancel
                        </Button>,
                        <Button key="submit" type="primary" onClick={this.sendMailToPatient}>
                            Send
                        </Button>,
                    ]}
                >
                    <p>Send invoice To {this.state.patientName} ?</p>
                    <Input
                      value={that.state.mail_to}
                      placeholder="Email"
                      onChange={(e)=>that.updateFormValue('mail_to',e.target.value)}
                    />
                </Modal>

                <Modal
                  visible={that.state.cancelReturnIncoiceVisible}
                  title="Cancel Return Invoice"
                  footer={null}
                  onOk={that.handleSubmitCancelReturnInvoice}
                  onCancel={that.cancelReturnInvoiceClose}
                >
                    <Form>
                        <Form.Item key="cancel_notes">
                            {getFieldDecorator('cancel_note',{
                                rules:[{required:true, message:REQUIRED_FIELD_MESSAGE}],
                            })(
                                <TextArea placeholder="cancel notes" />
                            )}
                        </Form.Item>
                        {that.state.otpField && (
                            <Form.Item>
                                {getFieldDecorator('otp', {
                                    rules: [{required: true, message: 'Please input Otp!'}],
                                })(
                                    <Input
                                      prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}} />}
                                      placeholder="Otp"
                                    />,
                                )}
                            </Form.Item>
                          )}
                        <Form.Item>
                            {that.state.otpSent ? (
<a style={{float: 'right'}} type="primary" onClick={that.sendOTP}>
                                Resend Otp ?
</a>
) : null}
                            <Button size="small" type="primary" htmlType="submit" onClick={that.handleSubmitCancelReturnInvoice}>
                                Submit
                            </Button>&nbsp;
                            <Button size="small" onClick={that.cancelReturnInvoiceClose}>
                                Close
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

</div>
)


    }
}

export default Form.create()(ReturnInvoices);

function invoiceFooter(presc) {
    if (presc) {
        return (
<p>
            {presc.staff ? (
<Tooltip title="Staff"><Tag color={presc.staff ? presc.staff_data.calendar_colour : null}>
                <b>{`Return by  ${  presc.staff_data.user.first_name}`} </b>
                       </Tag>
</Tooltip>
) : null}
            {presc.practice ? (
<Tag style={{float: 'right'}}>
                <Tooltip title="Practice Name">
                    <b>{presc.practice_data.name} </b>
                </Tooltip>
</Tag>
) : null}
            {presc.notes ? <p>Notes: {presc.notes}</p> : null}
            {presc.cancel_note ? <p>Cancel Notes: {presc.cancel_note}</p> : null}
</p>
)
    }
    return null
}

function InvoiceCard(invoice, that) {
    let tableObjects = [...invoice.procedure, ...invoice.inventory];

    return (
<Card
  key={invoice.id}
  style={{marginTop: 10}}
  bodyStyle={{padding: 0}}
  title={(
<small>{invoice.date ? moment(invoice.date).format('ll') : null}
            {that.state.currentPatient ? null : (
<span>
            <Link to={`/erp/patient/${  invoice.patient_data ? invoice.patient_data.id : null  }/billing/return/invoices`}>
                &nbsp;&nbsp; {invoice.patient_data ? invoice.patient_data.user.first_name : null} (ID: {invoice.patient_data.custom_id? invoice.patient_data.custom_id :invoice.patient_data.id })&nbsp;
            </Link>, {invoice.patient_data ? invoice.patient_data.gender : null}
</span>
)}
</small>
)}
  extra={(
<Dropdown.Button
  size="small"
  style={{float: 'right'}}
  overlay={(
<Menu>
                {/* <Menu.Item key="1" onClick={() => that.deleteReturnInvoice(invoice)} */}
                <Menu.Item
                  key="1"
                  onClick={() =>that.cancelModalOpen(invoice)}
                  disabled={(invoice.practice != that.props.active_practiceId) || invoice.payments_data || invoice.is_cancelled}
                >
                    <Icon type="delete" />
                    Cancel
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="2">
                    <a onClick={() => that.sendPatientMail(invoice)}><Icon
                      type="mail"
                    /> Send mail to patient
                    </a>
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
            <Col xs={24} sm={24} md={6} lg={4} xl={4} xxl={4} style={{padding: 10}}>
                {invoice.is_cancelled ?
                    <Alert message="Cancelled" type="error" showIcon /> : null}
                <Divider style={{marginBottom: 0}}>{invoice.return_id}</Divider>
                <Statistic
                  title="Cash / Return "
                  value={(invoice.cash_return ? invoice.cash_return.toFixed(2) : 0)}
                  suffix={`/ ${  invoice.return_value ? invoice.return_value.toFixed(2):0}`}
                />
            </Col>
            <Col xs={24} sm={24} md={18} lg={20} xl={20} xxl={20}>

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
                      footer={() => invoiceFooter({...invoice})}
                    />
            </Col>
        </Row>




</Card>
)
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
                    {/* <br/> {record.staff_data ?
                <Tag color={record.staff_data ? record.staff_data.calendar_colour : null}>
                    <b>{"return by  " + record.staff_data.user.first_name} </b>
                </Tag> : null} */}
        </span>
)
}, {
    title: 'Cost',
    dataIndex: 'unit_cost',
    key: 'unit_cost',
    render: (item, record) => <span>{record.unit_cost ? record.unit_cost.toFixed(2) : null}</span>
}, {
    title: 'Unit',
    dataIndex: 'unit',
    key: 'unit',
}, {
    title: 'Discount',
    dataIndex: 'discount_value',
    key: 'discount_value',
    render: (item, record) => <span>{record.discount_value ? record.discount_value.toFixed(2) : null}</span>
}, {
    title: 'Tax',
    dataIndex: 'tax_value',
    key: 'tax_value',
    render: (item, record) => <span>{record.tax_value ? record.tax_value.toFixed(2) : null}</span>
}, {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    render: item => item ? item.toFixed(2) : null
}];
