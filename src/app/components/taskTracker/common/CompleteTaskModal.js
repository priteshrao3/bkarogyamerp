import React from "react";
import {Button, Form, Modal} from "antd";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";
import {INPUT_FIELD} from "../../../constants/dataKeys";
import {interpolate} from "../../../utils/common";
import {COMPLETE_TASK} from "../../../constants/api";

export default class CompleteTaskModal extends React.Component {
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
        const RemarkForm = Form.create()(DynamicFieldsForm);
        const fields = [{
            label: 'Remark',
            key: 'complete_remark',
            type: INPUT_FIELD,
            required: true
        }];
        const formProps = {
            successFn(data) {
                if (that.props.callback)
                    that.props.callback();
                that.setState({
                    open:false
                })
            },
            errorFn() {
                if (that.props.errorCallback)
                    that.props.errorCallback()
            },
            method: "post",
            action: interpolate(COMPLETE_TASK, [this.props.taskId])
        }
        return (
            <Modal visible={open} footer={null} title="Complete Task">
                <RemarkForm fields={fields} formProp={formProps} />
                {this.props.cancelFn ? <Button onClick={this.props.cancelFn}>Cancel</Button> : null}
            </Modal>
        )
    }
}
