import React from "react";
import { Button, Card, Form, Icon, Row } from "antd";
import { Redirect } from 'react-router-dom'
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {
    CHECKBOX_FIELD,
    EMAIL_FIELD,
    SUCCESS_MSG_TYPE,
    INPUT_FIELD,
    RADIO_FIELD,
    SELECT_FIELD,
    SINGLE_IMAGE_UPLOAD_FIELD, NUMBER_FIELD
} from "../../../../constants/dataKeys";
import { PRACTICE } from "../../../../constants/api";
import { getAPI, displayMessage, interpolate } from "../../../../utils/common";
import { LANGUAGE, SMS_LANGUAGE_CONFIG_PARAM } from "../../../../constants/hardData";
import { loadConfigParameters, loadDoctors } from "../../../../utils/clinicUtils";


class EditPracticeDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            practiceDetail: null,
            countries: null,
            [SMS_LANGUAGE_CONFIG_PARAM]: [],
            practiceDoctors:[]
        };
        loadDoctors(this);
        this.changeRedirect = this.changeRedirect.bind(this);

    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    componentDidMount() {
        const that = this;
        const successFn = function (data) {
            const { countries } = data;
            that.setState({
                countries,
                practiceDetail: data,
            })
        };
        const errorFn = function () {
        };
        getAPI(interpolate(PRACTICE, [this.props.practiceId]), successFn, errorFn);
        loadConfigParameters(this, [SMS_LANGUAGE_CONFIG_PARAM])
    }


    render() {
        let that=this;

        if (this.state.practiceDetail) {
            const fields = [{
                label: "Practice Logo",
                key: "logo",
                type: SINGLE_IMAGE_UPLOAD_FIELD,
                initialValue: this.state.practiceDetail.logo,
                allowWebcam: false
            }, {
                label: "Practice Name",
                key: "name",
                required: true,
                placeholder: "Practice Name",
                initialValue: this.state.practiceDetail.name,
                type: INPUT_FIELD
            }, {
                label: "Practice Tagline",
                key: "tagline",
                placeholder: "Practice Tagline",
                required: true,
                initialValue: this.state.practiceDetail.tagline,
                type: INPUT_FIELD
            }, {
                label: "Practice Specialisation",
                key: "specialisation",
                placeholder: "Practice Specialisation",
                initialValue: this.state.practiceDetail.specialisation,
                type: INPUT_FIELD,
                // options: specialisationsOptions
            }, {
                label: "Practice Street Address",
                key: "address",
                placeholder: "Practice Street Address",
                initialValue: this.state.practiceDetail.address,
                type: INPUT_FIELD
            }, {
                label: "Practice locality",
                initialValue: this.state.practiceDetail.locality,
                key: "locality",
                placeholder: "Practice Locality",
                type: INPUT_FIELD
            }, {
                label: "Practice City",
                initialValue: this.state.practiceDetail.City,
                placeholder: "Practice City",
                key: "city",
                type: INPUT_FIELD,
                //     options: [{label: "Hello", value: "1"}, {label: "New", value: "13"}, {label: "World", value: "14"}]
            }, {
                label: "Practice state",
                key: "state",
                placeholder: "Practice State",
                initialValue: this.state.practiceDetail.state,
                type: INPUT_FIELD,
                // options: [{label: "Hello", value: "1"}, {label: "New", value: "13"}, {label: "World", value: "14"}]
            }, {
                label: "Practice Country",
                key: "country",
                placeholder: "Practice Country",
                initialValue: this.state.practiceDetail.country,
                type: INPUT_FIELD,
            }, {
                label: "Practice PINCODE",
                key: "pincode",
                placeholder: "Practice PINCODE",
                initialValue: this.state.practiceDetail.pincode,
                type: INPUT_FIELD
            }, {
                label: "Practice Contact Number",
                key: "contact",
                placeholder: "Practice Contact Number",
                initialValue: this.state.practiceDetail.contact,
                type: INPUT_FIELD
            }, {
                label: "Practice Email",
                key: "email",
                placeholder: "Practice Email",
                initialValue: this.state.practiceDetail.email,
                type: EMAIL_FIELD
            }, {
                label: "SMS Language",
                key: "language",
                placeholder: 'SMS Language',
                initialValue: this.state.practiceDetail && this.state.practiceDetail.language ? this.state.practiceDetail.language : this.props.activePracticeData.language,
                type: SELECT_FIELD,
                options: this.state[SMS_LANGUAGE_CONFIG_PARAM].map(item => {
                    return { label: item, value: item }
                }),
            }, {
                label: "Practice website",
                key: "website",
                placeholder: "Practice Website",
                initialValue: this.state.practiceDetail.website,
                type: INPUT_FIELD
            }, {
                label: "GSTIN",
                initialValue: this.state.practiceDetail.gstin,
                placeholder: "GSTIN",
                key: "gstin",
                type: INPUT_FIELD
            }, {
                label: "Invoice Prefix",
                initialValue: this.state.practiceDetail.invoice_prefix,
                placeholder: "DEL/INV/",
                key: "invoice_prefix",
                type: INPUT_FIELD,
                required: true
            },{
                label: "Proforma Prefix",
                placeholder: "DEL/PRO/",
                initialValue: this.state.practiceDetail.proforma_prefix,
                key: "proforma_prefix",
                type: INPUT_FIELD,
                required: true
            }, {
                label: "Payment Prefix",
                initialValue: this.state.practiceDetail.payment_prefix,
                placeholder: "DEL/RCPT/",
                key: "payment_prefix",
                type: INPUT_FIELD,
                required: true
            }, {
                label: "Return Prefix",
                placeholder: "DEL/RET/",
                initialValue: this.state.practiceDetail.return_prefix,
                key: "return_prefix",
                type: INPUT_FIELD,
                required: true
            }, {
                label: "Default Doctor",
                key: "default_doctor",
                initialValue:this.state.practiceDetail.default_doctor,
                placeholder: "Default Doctor",
                type: SELECT_FIELD,
                options: this.state.practiceDoctors.map(item => {
                    return { label: item.user.first_name, value: item.id }
                })
            }];
            const TestFormLayout = Form.create()(DynamicFieldsForm);
            const formProp = {
                successFn(data) {
                    displayMessage(SUCCESS_MSG_TYPE, "success");
                    if (that.props.history) {
                        that.props.history.replace('/erp/settings/clinics')
                    }
                },
                errorFn(data) {

                },
                action: interpolate(PRACTICE, [this.props.practiceId]),
                method: "put",
            };


            return (
                <Row>
                    <Card>
                        <TestFormLayout
                            title="Edit Practice Details"
                            changeRedirect={this.changeRedirect}
                            formProp={formProp}
                            fields={fields}
                            {...this.props}
                        />
                        {this.state.redirect && <Redirect to='/erp/settings/clinics' />}
                    </Card>
                </Row>
            )
        } return <Card loading />
    }
}

export default EditPracticeDetail;
