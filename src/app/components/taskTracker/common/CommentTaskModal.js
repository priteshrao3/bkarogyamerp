import {Button, Form, Modal} from "antd";
import React from "react";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";
import {INPUT_FIELD, TEXT_FIELD} from "../../../constants/dataKeys";
import {interpolate} from "../../../utils/common";
import {COMMENT_TASK, COMPLETE_TASK} from "../../../constants/api";

export default class CommentTaskModal extends React.Component{
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
        const {open} = this.state;
        const that = this;
        const CommentForm = Form.create()(DynamicFieldsForm);
        const fields = [{
            label: 'Comment',
            key: 'comment',
            type: TEXT_FIELD,
            required: true,
            minRows:3
        }];
        const formProps = {
            successFn(data) {
                if (that.props.callback)
                    that.props.callback();
                if (that.props.cancelFn)
                    that.props.cancelFn();
            },
            errorFn() {
                if (that.props.errorCallback)
                    that.props.errorCallback()
            },
            method: "post",
            action: interpolate(COMMENT_TASK, [that.props.taskId])
        }
        return (
            <Modal visible={open} footer={null} title="Add Comment to Task">
                <CommentForm fields={fields} formProp={formProps} />
                {this.props.cancelFn ? <Button onClick={this.props.cancelFn}>Cancel</Button> : null}
            </Modal>
        )
    }
}
