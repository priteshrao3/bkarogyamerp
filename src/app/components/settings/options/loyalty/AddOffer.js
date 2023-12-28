import React from "react";
import {Form, Card, message} from "antd";
import {Redirect} from 'react-router-dom'
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {
    CHECKBOX_FIELD,
    SUCCESS_MSG_TYPE,
    INPUT_FIELD,
    RADIO_FIELD,
    NUMBER_FIELD,
    SELECT_FIELD
} from "../../../../constants/dataKeys";
import {OFFERS} from "../../../../constants/api";
import {getAPI, displayMessage, deleteAPI, interpolate} from "../../../../utils/common";


class AddOffer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            fields: [{
                label: "Offer Name ",
                key: "code",
                placeholder:"Offer Name",
                required: true,
                type: INPUT_FIELD
            }, {
                label: "Description ",
                key: "description",
                placeholder:"E.g. 20% off on all services",
                type: INPUT_FIELD
            }, {
                label: "Discount",
                key: "discount",
                required: true,
                type: NUMBER_FIELD,
                // follow:'%'
            }, {
                label: "Discount Unit",
                key: 'unit',
                required: true,
                options: [{label: 'Percent', value: '%'}, {label: 'Rupees', value: 'INR'}],
                type: SELECT_FIELD,
                initialValue: '%'
            }]
        }
        this.changeRedirect = this.changeRedirect.bind(this);

    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    render() {
        const that = this;
        const formProp = {
            successFn (data) {
                displayMessage(SUCCESS_MSG_TYPE, "success")
                if (that.props.loadData)
                    that.props.loadData();
                if (that.props.history){
                    that.props.history.replace("/erp/settings/loyalty");
                }
            },
            errorFn () {

            },
            action: interpolate(OFFERS, [this.props.active_practiceId]),
            method: "post",
            beforeSubmit (data) {
                console.log(data)
            }
        }
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        return (
<div>
            <TestFormLayout
              formProp={formProp}
              fields={this.state.fields}
              {...this.props}
            />
            {this.state.redirect && <Redirect to='/erp/settings/loyalty' />}

</div>
)
    }
}

export default AddOffer;
