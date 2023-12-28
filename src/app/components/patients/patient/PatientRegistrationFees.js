import React, { Component } from "react";
import { Row, Form, Card, Popconfirm, Button, Badge } from "antd";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";
import { SELECT_FIELD, DATE_PICKER, SUCCESS_MSG_TYPE, SINGLE_IMAGE_UPLOAD_FIELD } from "../../../constants/dataKeys";
import moment from "moment";
import { displayMessage, interpolate, getAPI, postAPI, makeFileURL } from "../../../utils/common";
import { REGISTRATION, PATIENT_REGISTRATION, PATIENT_REGISTRATION_CANCEL } from "../../../constants/api";

class PatientRegistrationFees extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addFees: false,
            loading: false,
            registrationFeesData: [],
            patientRegistration: null

        }
    }

    componentDidMount() {
        this.loadRegistrationFees();
        this.loadData();
    }

    loadData() {
        const that = this;
        that.setState({
            loading: true
        })
        const successFn = function (data) {
            that.setState({
                patientRegistration: data[data.length - 1],
                loading: false
            })
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })

        }
        getAPI(PATIENT_REGISTRATION, successFn, errorFn, { patient: this.props.patientId });
    }


    loadRegistrationFees = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                registrationFeesData: data
            })
        }
        const errorFn = function () {

        }
        getAPI(REGISTRATION, successFn, errorFn);
    }

    onClickHandler() {
        const that = this;
        let { addFees } = that.state;
        that.setState({
            addFees: !addFees
        })

    }
    deleteObject(id) {
        const that = this;
        const reqData = {
            id,
            is_active: false
        }
        const successFn = function (data) {
            displayMessage(SUCCESS_MSG_TYPE, 'Patient Registration Fees Cancelled Successfully');
            that.loadData();
            // that.loadProfile();
            // that.loadMedicalMembership();
            // if (that.props.refreshWallet) {
            //     that.props.refreshWallet();
            // }
        }
        const errorFn = function () {

        };
        postAPI(interpolate(PATIENT_REGISTRATION_CANCEL, [that.props.currentPatient.id]), reqData, successFn, errorFn);
    }

    render() {
        let that = this;
        let { patientRegistration } = that.state;
        console.log(patientRegistration)
        const fields = [{
            label: "Type",
            key: "registration",
            type: SELECT_FIELD,
            width:270,
            options: this.state.registrationFeesData.map(fees => ({ label: fees.name, value: fees.id }))
        }, {
            label: "Start Date",
            key: "registration_from",
            initilValue: moment(),
            type: DATE_PICKER,
            format: 'YYYY-MM-DD'

        }, {
            label: "Document",
            key: "registration_upload",
            type: SINGLE_IMAGE_UPLOAD_FIELD

        }];
        const formProp = {
            successFn(data) {
                displayMessage(SUCCESS_MSG_TYPE, "Patient Registration Fees added");
                that.loadData();
                that.onClickHandler();
            },
            errorFn() {

            },
            action: interpolate(PATIENT_REGISTRATION, [this.props.patientId]),
            method: "post"
        }
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        const defaultValues = [{ key: 'patient', value: this.props.patientId }, { key: 'practice', value: this.props.active_practiceId }]
        return (
            <Row>
                {this.state.addFees ? (
                    <div>
                        <h1 style={{ fontSize: '18px' }}>
                            Registration Fees
                            <a href="#" onClick={() => this.onClickHandler()}> Cancel </a>
                        </h1>
                        <TestFormLayout formProp={formProp} defaultValues={defaultValues} fields={fields} />

                    </div>
                ) : (<div style={{ padding: '0px' }}>

                    {patientRegistration ? (
                        <Card
                            headStyle={{ color: moment(patientRegistration.registration_to) < moment() ? 'red' : null }}
                            bodyStyle={{ color: moment(patientRegistration.registration_to) < moment() ? 'red' : null }} Registration
                            size="small"
                            title={moment(patientRegistration.registration_to) < moment() ? 'Registration Expired' : 'Registration'}
                            extra={(
                                <Popconfirm
                                    title="Are you sure delete this item?"
                                    onConfirm={() => that.deleteObject(patientRegistration.id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button
                                        icon="close"
                                        type="danger"
                                        shape="circle"
                                        size="small"
                                        disabled={!this.props.activePracticePermissions.CancelPatientRegistration}
                                    />
                                </Popconfirm>
                            )}
                            style={{ textAlign: "center" }}
                        >

                            <div style={{ textAlign: "left" }}>
                                <p>
                                    <strong>Name : </strong>
                                    <span>
                                        {
                                            patientRegistration.registration ? patientRegistration.registration.name : null
                                        }
                                    </span>
                                </p>

                                <p><strong>Start Date : </strong>
                                    <span>{patientRegistration.registration_from}</span>
                                </p>
                                <p><strong>Valid Till : </strong>
                                    <span>{patientRegistration.registration_to}</span>
                                </p>
                                <p>
                                    <strong>Document : </strong>
                                    <span>
                                        {
                                            patientRegistration
                                                .registration_upload ? <a target="_blank" href={makeFileURL(patientRegistration
                                                    .registration_upload)}>Document</a> : "--"
                                        }
                                    </span>
                                </p>
                                {moment(patientRegistration.registration_to) < moment() ? <Button block type="primary"onClick={() => this.onClickHandler()} disabled={!this.props.activePracticePermissions.AddPatientRegistration}>{'Add New Registration'}</Button>:null}
                            </div>

                        </Card>
                    )
                        : <h1 style={{ fontSize: '18px', textAlign: 'center' }}>
                            Registration Fees
                            <a href="#" onClick={() => this.onClickHandler()} disabled={!this.props.activePracticePermissions.AddPatientRegistration}>{' Add'}</a>
                        </h1>}

                </div>

                    )
                }


            </Row>
        );
    }

}

export default PatientRegistrationFees
