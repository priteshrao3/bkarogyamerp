import React from "react";
import { Card, Form, Row } from "antd";
import { Redirect } from 'react-router-dom'
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {
    EMAIL_FIELD,
    INPUT_FIELD,
    SELECT_FIELD,
    SINGLE_IMAGE_UPLOAD_FIELD,
    SUCCESS_MSG_TYPE
} from "../../../../constants/dataKeys";
import { ALL_PRACTICE, EXTRA_DATA } from "../../../../constants/api";
import { displayMessage, getAPI } from "../../../../utils/common";
import { LANGUAGE, SMS_LANGUAGE_CONFIG_PARAM } from "../../../../constants/hardData";
import { loadConfigParameters, loadDoctors } from "../../../../utils/clinicUtils";


class AddPracticeDetails extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            countries: null,
            [SMS_LANGUAGE_CONFIG_PARAM]: [],
            practiceDoctors: [],
        }
        loadDoctors(this);
        this.changeRedirect = this.changeRedirect.bind(this);
    }

    componentDidMount() {
        loadConfigParameters(this, [SMS_LANGUAGE_CONFIG_PARAM]);
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    render() {
        let that=this;

        const fields = [{
            label: "Practice Logo",
            key: "logo",
            type: SINGLE_IMAGE_UPLOAD_FIELD,
            allowWebcam: false
        }, {
            label: "Practice Name",
            key: "name",
            placeholder: "Practice Name",
            required: true,
            type: INPUT_FIELD
        }, {
            label: "Practice Tagline",
            key: "tagline",
            placeholder: "Practice Tagline",
            required: true,
            type: INPUT_FIELD
        }, {
            label: "Practice Specialisation",
            key: "specialisation",
            placeholder: "Practice Specialisation",
            type: INPUT_FIELD,
            // options: specialisationsOptions,
        }, {
            label: "Practice Street Address",
            key: "address",
            placeholder: "Practice Street Address",
            type: INPUT_FIELD
        }, {
            label: "Practice Locality",
            key: "locality",
            placeholder: "Practice Locality",
            type: INPUT_FIELD
        }, {
            label: "Practice Country",
            key: "country",
            placeholder: "Practice Country",
            type: INPUT_FIELD,
        }, {
            label: "Practice State",
            key: "state",
            placeholder: "Practice State",
            type: INPUT_FIELD,
        }, {
            label: "Practice City",
            key: "city",
            placeholder: "Practice City",
            type: INPUT_FIELD,
        }, {
            label: "Practice PINCODE",
            key: "pincode",
            placeholder: "Practice PINCODE",
            type: INPUT_FIELD
        }, {
            label: "Practice Contact Number",
            key: "contact",
            placeholder: "Practice Contact Number",
            type: INPUT_FIELD
        }, {
            label: "Practice Email",
            key: "email",
            placeholder: "Practice Email",
            type: EMAIL_FIELD
        }, {
            label: "SMS Language",
            key: "language",
            placeholder: 'SMS Language',
            initialValue: this.props.activePracticeData.language ? this.props.activePracticeData.language : [],
            type: SELECT_FIELD,
            options: this.state[SMS_LANGUAGE_CONFIG_PARAM].map(item => {
                return { label: item, value: item }
            }),
        }, {
            label: "Practice Website",
            key: "website",
            placeholder: "Practice Website",
            type: INPUT_FIELD
        }, {
            label: "GSTIN",
            key: "gstin",
            placeholder: "GSTIN",
            type: INPUT_FIELD
        }, {
            label: "Invoice Prefix",
            placeholder: "DEL/INV/",
            key: "invoice_prefix",
            type: INPUT_FIELD,
            required: true
        },{
            label: "Proforma Prefix",
            placeholder: "DEL/PRO/",
            key: "proforma_prefix",
            type: INPUT_FIELD,
            required: true
        }, {
            label: "Payment Prefix",
            placeholder: "DEL/RCPT/",
            key: "payment_prefix",
            type: INPUT_FIELD,
            required: true
        },
        {
            label: "Return Prefix",
            placeholder: "DEL/RET/",
            key: "return_prefix",
            type: INPUT_FIELD,
            required: true
        }, {
            label: "Default Doctor",
            key:"default_doctor",
            placeholder: "Default Doctor",
            type: SELECT_FIELD,
            options: this.state.practiceDoctors.map(item => {
                return { label: item.user.first_name, value: item.id }
            })
        }];

        const formProp = {
            successFn(data) {
                displayMessage(SUCCESS_MSG_TYPE, "success")
                if (that.props.history) {
                    that.props.history.replace('/erp/settings/clinics')
                }
            },
            errorFn(data) {

            },
            action: ALL_PRACTICE,
            method: "post",
        }

        const TestFormLayout = Form.create()(DynamicFieldsForm);
        return (
            <Row>
                <Card>
                    <TestFormLayout
                        title="Practice Details"
                        changeRedirect={this.changeRedirect}
                        formProp={formProp}
                        fields={fields}
                        {...this.props}
                    />
                </Card>
                {this.state.redirect && <Redirect to='/erp/settings/clinics' />}
            </Row>
        )
    }
}

export default AddPracticeDetails;
