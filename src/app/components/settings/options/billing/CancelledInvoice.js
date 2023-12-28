import React from "react";
import {Form} from "antd";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {
    CHECKBOX_FIELD,
    INPUT_FIELD,
    RADIO_FIELD,
    SELECT_FIELD,
    SINGLE_CHECKBOX_FIELD, SUCCESS_MSG_TYPE
} from "../../../../constants/dataKeys";
import {displayMessage, getAPI, interpolate} from "../../../../utils/common";
import {PRACTICE} from "../../../../constants/api";

class CancelledInvoice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            practiceDetail: {}
        }
    }

    componentDidMount() {
        const that = this;
        const successFn = function (data) {
            const {countries} = data;
            that.setState({
                countries,
                practiceDetail: data,
            })
        };
        const errorFn = function () {
        };
        getAPI(interpolate(PRACTICE, [this.props.active_practiceId]), successFn, errorFn);

    }

    render() {
        const fields = [{
            key: "hide_cancelled_invoice",
            type: SINGLE_CHECKBOX_FIELD,
            follow:<b>Hide Cancelled Invoice</b>,
            initialValue: this.state.practiceDetail ? this.state.practiceDetail.hide_cancelled_invoice : false,
        },{
            key: "hide_cancelled_return",
            type: SINGLE_CHECKBOX_FIELD,
            follow:<b>Hide Cancelled Return Invoice</b>,
            initialValue: this.state.practiceDetail ? this.state.practiceDetail.hide_cancelled_return : false,
        }, {
            key: "hide_cancelled_payment",
            type: SINGLE_CHECKBOX_FIELD,
            follow:<b>Hide Cancelled Payments</b>,
            initialValue: this.state.practiceDetail ? this.state.practiceDetail.hide_cancelled_payment : false
        },{
            key: "hide_cancelled_proforma",
            type: SINGLE_CHECKBOX_FIELD,
            follow:<b>Hide Cancelled Proforma</b>,
            initialValue: this.state.practiceDetail ? this.state.practiceDetail.hide_cancelled_proforma : false,
        }];
        const formProp = {
            successFn (data) {
                displayMessage(SUCCESS_MSG_TYPE, "Settings Saved Successfuly!!");
            },
            errorFn () {

            },
            action: interpolate(PRACTICE, [this.props.active_practiceId]),
            method: "put",
        };
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        const defaultValue = [{key: 'id', value: this.props.active_practiceId}];
        return (
<div>
            <TestFormLayout formProp={formProp} fields={fields} {...this.props} defaultValues={defaultValue} />
</div>
)
    }
}

export default CancelledInvoice;
