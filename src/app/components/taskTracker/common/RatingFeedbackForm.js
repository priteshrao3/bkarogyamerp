import {Button, Form, Modal} from "antd";
import React from "react";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";
import {LABEL_FIELD, RATE_FIELD, TEXT_FIELD} from "../../../constants/dataKeys";
import moment from "moment";
import {TASK_RATING} from "../../../constants/api";

export default class RatingFeedbackForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: this.props.open
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.props.open != nextProps.open) {
            this.setState({
                open: nextProps.open
            })
        }
    }

    render() {
        const that = this;
        const {open} = this.state;
        const {record} = this.props;
        const FeedbackForm = Form.create()(DynamicFieldsForm);
        const fields = [{
            label: "Date",
            key: 'date',
            type: LABEL_FIELD,
            follow: moment(record.date).format('LL')
        }, {
            label: "Employee",
            key: 'emp',
            type: LABEL_FIELD,
            follow: record.first_name
        }, {
            label: 'Rate',
            key: 'rating',
            type: RATE_FIELD,
            allowHalf: true,
            initialValue: record.rating ? record.rating.rating : null
        }, {
            label: 'Feedback',
            key: 'feedback',
            type: TEXT_FIELD,
            minRows: 3,
            initialValue: record.rating ? record.rating.feedback : null
        }];
        const formProp = {
            method: 'post',
            action: TASK_RATING,
            successFn: function () {
                if (that.props.cancelFn)
                    that.props.cancelFn(null)
            }, errorFn: function () {

            }
        }
        let defaultFields = [{key: 'date', value: record.date.format('YYYY-MM-DD')}, {key: 'user', value: record.id}]
        if (record.rating) {
            defaultFields.push({key: 'id', value: record.rating.id})
        }
        return (
            <Modal visible={open} footer={null} title="Assign Rating & Feedback">
                <FeedbackForm fields={fields} formProp={formProp} defaultValues={defaultFields}/>
                {this.props.cancelFn ? <Button onClick={this.props.cancelFn}>Cancel</Button> : null}
            </Modal>
        )
    }

}
