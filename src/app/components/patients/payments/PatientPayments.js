import React from "react";

import {
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
    Table,
    Tag,
    Tooltip,
    Form,
    Input, Statistic
,Modal} from "antd";
import moment from "moment";
import {Link, Redirect} from "react-router-dom";
import {Route, Switch} from "react-router";
import * as _ from "lodash";
import {displayMessage, getAPI, interpolate, putAPI, postAPI} from "../../../utils/common";
import {
    PATIENT_PAYMENTS_API,
    PAYMENT_PDF,
    SINGLE_PAYMENT_API,
    CANCELINVOICE_VERIFY_OTP,
    CANCELINVOICE_GENERATE_OTP,
    CANCELINVOICE_RESENT_OTP, TREATMENTPLANS_PDF
} from "../../../constants/api";
import AddPaymentForm from "./AddPaymentForm";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import {BACKEND_BASE_URL} from "../../../config/connect";
import {OTP_DELAY_TIME, SUCCESS_MSG_TYPE} from "../../../constants/dataKeys";

import EditPaymentModal from "./EditPaymentModal";
import InvoiceReturnModal from "../invoices/InvoiceReturnModal";
import CancelPaymentModal from "./CancelPaymentModal";
import {sendMail} from "../../../utils/clinicUtils";
import PermissionDenied from "../../common/errors/PermissionDenied";

const {confirm} = Modal;

class PatientPayments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            payments: [],
            active_practiceId: this.props.active_practiceId,
            loading: true,
            otpSent: false,
            editPaymentVisible: false,
            editPayment: null,
        }

    }

    componentDidMount() {
        const that = this;
        this.loadPayments();

    }


    loadPayments = (page = 1) => {
        const that = this;
        if (that.props.refreshWallet && page == 1) {
            that.props.refreshWallet();
        }
        this.setState({
            loading: true
        });
        const successFn = function (data) {
            that.setState(function (prevState) {
                if (data.current == 1)
                    return {
                        payments: [...data.results],
                        next: data.next,
                        loading: false
                    }
                return {
                    payments: [...prevState.payments, ...data.results],
                    next: data.next,
                    loading: false
                }
            })
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
        getAPI(PATIENT_PAYMENTS_API, successFn, errorFn, apiParams);
    };


    loadPDF = (id) => {
        const that = this;
        const successFn = function (data) {
            if (data.report)
                window.open(BACKEND_BASE_URL + data.report);
        };
        const errorFn = function () {

        };
        getAPI(interpolate(PAYMENT_PDF, [id]), successFn, errorFn);
    };

    updateFormValue = (type, value) => {
        this.setState({
            [type]: value
        })
    };

    mailModalOpen = () => {
        this.setState({
            visibleMail: true
        })
    };

    mailModalClose = () => {
        this.setState({
            visibleMail: false
        })
    };

    sendPatientMail = (payment) => {
        this.mailModalOpen()
        this.setState({
            patientName: _.get(payment, 'patient_data.user.first_name'),
            paymentId: _.get(payment, 'id'),
            mail_to: _.get(payment, 'patient_data.user.email')
        })

    };

    sendMailToPatient = () => {
        const {mail_to, paymentId} = this.state;
        const apiParams = {
            mail_to,
        }
        sendMail(interpolate(PAYMENT_PDF, [paymentId]), apiParams)
        this.mailModalClose();
    }


    editModelOpen = (record) => {
        const that = this;

        const created_time = moment().diff(record.created_at, 'minutes');
        console.log("otp",created_time);
        if (created_time > OTP_DELAY_TIME) {
            that.setState({
                editPaymentVisible: true,
                cancelPaymentVisible: false,
                editPayment: record,
            });
            const reqData = {
                practice: this.props.active_practiceId,
                type: `${'Payment' + ':'}${  record.payment_id  } ` + `Edit`
            }
            const successFn = function (data) {
                that.setState({
                    otpSent: true,
                    patientId: record.patient,
                    paymentId: record.payment_id
                })
            };
            const errorFn = function () {

            };

            postAPI(CANCELINVOICE_GENERATE_OTP, reqData, successFn, errorFn);
        } else {
            that.setState({
                editPayment: record,
            }, function () {
                that.props.history.push(`/erp/patient/${  record.patient  }/billing/payments/edit`)
            });
        }
    };


    editPaymentData = (record) => {
        const that = this;
        // let id = this.props.match.params.id;
        that.setState({
            editPayment: record,
        }, function () {
            that.props.history.push(`/erp/patient/${  record.patient  }/billing/payments/edit/`)
        });
    };
    // editPaymentClose = () => {
    //     this.setState({
    //         editPaymentVisible: false
    //     })
    // };
    //
    // handleSubmitEditPayment = (e) => {
    //     let that = this;
    //     e.preventDefault();
    //     this.props.form.validateFields((err, values) => {
    //         if (!err) {
    //             let reqData = {
    //                 ...values,
    //                 practice: this.props.active_practiceId,
    //             };
    //             let successFn = function (data) {
    //                 that.setState({
    //                     editPaymentVisible: false,
    //                 });
    //                 that.editPaymentData(that.state.editPayment);
    //
    //             };
    //             let errorFn = function () {
    //
    //             };
    //             postAPI(CANCELINVOICE_VERIFY_OTP, reqData, successFn, errorFn);
    //         }
    //     });
    // };
    // editPaymentData=(record)=>{
    //     let that =this;
    //     console.log('"""""""""""""""""""""""">',record);
    //     that.setState({
    //         editPayment:record,
    //     },function () {
    //         that.props.history.push("/patient/" + record.patient + "/billing/payments/edit")
    //     });
    //
    // };

    cancelModalOpen = (record) => {
        const that = this;
        const created_time = moment().diff(record.created_at, 'minutes');
        console.log("otp",created_time,OTP_DELAY_TIME, record);
        console.log(created_time>OTP_DELAY_TIME)
            that.setState({
                editPaymentVisible: false,
                cancelPaymentVisible: true,
                editPayment: record,
            });
            const reqData = {
                practice: this.props.active_practiceId,
                type: `${'Payment' + ':'}${  record.payment_id  } ` + ` Cancellation`
            }
            const successFn = function (data) {
                that.setState({
                    otpSent: true,
                    patientId: record.patient,
                    paymentId: record.id
                })
            }
            const errorFn = function () {

            };
            if (created_time > OTP_DELAY_TIME) {
                postAPI(CANCELINVOICE_GENERATE_OTP, reqData, successFn, errorFn);
            }
    };

    deletePayment(patient, payment) {
        const that = this;
        const reqData = {patient, is_cancelled: true};
        const successFn = function (data) {
            displayMessage(SUCCESS_MSG_TYPE, "Payment cancelled successfully")
            that.loadPayments();
        };
        const errorFn = function () {
        };
        putAPI(interpolate(SINGLE_PAYMENT_API, [payment]), reqData, successFn, errorFn);

    }


    editPaymentClose = () => {
        this.setState({
            editPaymentVisible: false
        })
    };

    cancelPaymentClose = () => {
        this.setState({
            cancelPaymentVisible: false
        })
    }


    render() {
        const that = this;
        const paymentmodes = {}
        if (this.state.paymentModes) {
            this.state.paymentModes.forEach(function (mode) {
                paymentmodes[mode.id] = mode.mode;
            })
        }


        if (this.props.match.params.id) {
            return (
<div>
                <Switch>
                    <Route
                      exact
                      path='/erp/patient/:id/billing/payments/add'
                      render={(route) => (this.props.activePracticePermissions.PatientAddEditPayments ?
<AddPaymentForm
  {...this.state}
  {...route}
  {...this.props}
  loadData={this.loadPayments}
/> : <PermissionDenied/>
)}
                    />
                    <Route
                      exact
                      path='/erp/patient/:id/billing/payments/edit'
                      render={(route) => (that.state.editPayment ? (this.props.activePracticePermissions.PatientAddEditPayments ?
                               <AddPaymentForm
                                 {...this.state}
                                 {...route}
                                 {...this.props}
                                 paymentId={this.state.paymentId}
                                 loadData={this.loadPayments}
                               /> : <PermissionDenied/>
                             ) :
                               <Redirect to={`/erp/patient/${  route.match.params.id  }/billing/payments`} />)}
                    />
                    <Route>
                        <div>
                            <Alert
                              banner
                              showIcon
                              type="info"
                              message="The payments shown are only for the current selected practice!"
                            />
                            <Card
                              bodyStyle={{padding: 0}}
                              title={this.state.currentPatient ? `${this.state.currentPatient.name  } Payments` : "Payments"}
                              extra={(
<Button.Group>
                                    <Link
                                      to={`/erp/patient/${  this.props.match.params.id  }/billing/payments/add`}
                                    ><Button disabled={!this.props.activePracticePermissions.PatientAddEditPayments}><Icon
                                      type="plus"
                                    />Add
                                     </Button>
                                    </Link>
</Button.Group>
)}
                            />
                            {this.state.payments.map(payment => PaymentCard(payment, this))}
                            <Spin spinning={this.state.loading}>
                                <Row />
                            </Spin>
                            <InfiniteFeedLoaderButton
                              loaderFunction={() => this.loadPayments(that.state.next)}
                              loading={this.state.loading}
                              hidden={!this.state.next}
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
                    <p>Send Payment To {this.state.patientName} ?</p>
                    <Input
                      value={that.state.mail_to}
                      placeholder="Email"
                      onChange={(e) => that.updateFormValue('mail_to', e.target.value)}
                    />
                </Modal>

                {that.state.cancelPaymentVisible ? (
                    <CancelPaymentModal
                      {...that.state}
                      key="cancel_payment"
                      cancelPaymentClose={that.cancelPaymentClose}
                      loadPayments={that.loadPayments}
                    />
                  ):null}

</div>
)
        }
            return (
<div>
                <Card
                  bodyStyle={{padding: 0}}
                  title={this.state.currentPatient ? `${this.state.currentPatient.name  } Payments` : "Payments"}
                  extra={(
<Button.Group>
                        {/* onClick={() => this.props.togglePatientListModal(true)} */}
                        <Button type="primary" onClick={() => this.props.togglePatientListModal(true)}>
                            <Icon type="plus" />Add
                        </Button>
</Button.Group>
)}
                />
                {this.state.payments.map(payment => PaymentCard(payment, this))}
                <Spin spinning={this.state.loading}>
                    <Row />
                </Spin>
                <InfiniteFeedLoaderButton
                  loaderFunction={() => this.loadPayments(that.state.next)}
                  loading={this.state.loading}
                  hidden={!this.state.next}
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
                    <p>Send Payment To {this.state.patientName} ?</p>
                    <Input
                      value={that.state.mail_to}
                      placeholder="Email"
                      onChange={(e) => that.updateFormValue('mail_to', e.target.value)}
                    />
                </Modal>

                {that.state.cancelPaymentVisible ? (
                    <CancelPaymentModal
                      {...that.state}
                      key="cancel_payment"
                      cancelPaymentClose={that.cancelPaymentClose}
                      loadPayments={that.loadPayments}
                    />
                  ):null}

</div>
)


    }
}

export default Form.create()(PatientPayments);

const columns = [{
    title: 'S.No',
    key: 's_no',
    dataIndex: 's_no',
    render: (item, record, index) => (index + 1),

},{
    title: 'INVOICE',
    dataIndex: 'invoice_id',
    key: 'invoice',
    render: invoice => <span>{invoice}</span>,
}, {
    title: 'Amount Paid',
    key: 'pay_amount',
    dataIndex: 'pay_amount',
    render: value => value ? value.toFixed(2) : 0,
}];

function PaymentCard(payment, that) {
    const {getFieldDecorator} = that.props.form;
    const advancePay = [];
    if (payment.is_advance) {
        advancePay.push({
            invoice_id: "Advance Payment",
            pay_amount: payment.advance_value
        })
    }
    return (
<Card
  style={{marginTop: 10}}
  key={payment.id}
  bodyStyle={{padding: 0}}
  title={(payment.patient_data && !that.props.currentPatient ? (
                     <small>{payment.date ? moment(payment.date).format('ll') : null}
                         <Link to={`/erp/patient/${  payment.patient_data.id  }/billing/payments`}>
                             &nbsp;&nbsp; {payment.patient_data.user.first_name} (ID: {payment.patient_data.custom_id ? payment.patient_data.custom_id : payment.patient_data.id})&nbsp;
                         </Link>
                         <span>, {payment.patient_data.gender}</span>
                     </small>
                   )
                     : <small>{payment.date ? moment(payment.date).format('ll') : null}</small>)}
  extra={(
<Dropdown.Button
  size="small"
  style={{float: 'right'}}
  overlay={(
<Menu>
                         <Menu.Item
                           key="2"
                           onClick={() => that.editModelOpen(payment)}
                           disabled={(payment.practice != that.props.active_practiceId || !that.props.activePracticePermissions.PatientAddEditPayments)}
                         >
                             <Icon type="edit" />
                             Edit
                         </Menu.Item>
                         <Menu.Item
                           key="3"
                           onClick={() => that.cancelModalOpen(payment)}
                           disabled={(payment.practice != that.props.active_practiceId) || payment.is_cancelled || payment.type=='Membership Amount.' || !that.props.activePracticePermissions.PatientAddEditPayments }
                         >
                             <Icon type="delete" />
                             Cancel
                         </Menu.Item>
                         <Menu.Divider />
                         <Menu.Item key="4">
                             <Link to={`/erp/patient/${  payment.patient  }/emr/timeline`}>
                                 <Icon type="clock-circle" />
                                 Patient Timeline
                             </Link>
                         </Menu.Item>

                         <Menu.Divider />
                         <Menu.Item key="4">
                             <a onClick={() => that.sendPatientMail(payment)}><Icon
                               type="mail"
                             /> Send mail to patient
                             </a>
                         </Menu.Item>

</Menu>
)}
>
                     <a onClick={() => that.loadPDF(payment.id)}><Icon
                       type="printer"
                     />
                     </a>
</Dropdown.Button>
)}
>


        <Row gutter={8}>
            <Col xs={24} sm={24} md={6} lg={4} xl={4} xxl={4} style={{padding: 10}}>
                {payment.is_cancelled ?
                    <Alert message="Cancelled" type="error" showIcon /> : null}
                <Divider style={{marginBottom: 0}}>{payment.payment_id}</Divider>

            </Col>
            <Col xs={24} sm={24} md={18} lg={20} xl={20} xxl={20}>

                <Table
                  columns={columns}
                  pagination={false}
                  footer={() => PaymentFooter({practice: payment.practice_data, notes: payment.notes, cancel_note : payment.cancel_note})}
                  dataSource={[...payment.invoices, ...advancePay]}
                  rowKey={payment.id}
                />
            </Col>
        </Row>

        {that.state.editPaymentVisible && that.state.otpSent && (
        <EditPaymentModal
          {...that.state}
          payment={payment}
          editPaymentClose={that.editPaymentClose}
          key={payment.id}
          editPaymentData={that.editPaymentData}
          {...that.props}
        />
      )}



</Card>
)
}

function PaymentFooter(presc) {
    if (presc) {
        return (
<p>
            {presc.doctor ? (
<Tooltip title="Doctor"><Tag color={presc.doctor ? presc.doctor.calendar_colour : null}>
                <b>{`prescribed by  ${  presc.doctor.user.first_name}`} </b>
                        </Tag>
</Tooltip>
) : null}
            {presc.practice ? (
<Tag style={{float: 'right'}}>
                <Tooltip title="Practice Name">
                    <b>{presc.practice.name} </b>
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
