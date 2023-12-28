import React from "react";
import { Alert, Button, Form, Modal } from "antd";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";
import {INPUT_FIELD, SELECT_FIELD, SUCCESS_MSG_TYPE} from "../../../constants/dataKeys";
import {displayMessage, getAPI, interpolate} from "../../../utils/common";
import {ASSIGN_RECURRING_TASK, COMPLETE_TASK, TASK_REPORTER} from "../../../constants/api";

export default class RecurringTaskAssignModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: this.props.open,
            assignee: this.props.assignee,
            taskId: this.props.taskId,
            reporterList: []
        }
    }

    componentDidMount() {
        this.loadReporter(this.state.assignee);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.props.open != nextProps.open) {
            this.setState({
                open: nextProps.open
            })
        }
    }

    loadReporter = (assigneeId) => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                reporterList: data
            })
        }
        const errorFn = function () {

        }
        getAPI(TASK_REPORTER, successFn, errorFn, {user: assigneeId});
    }

    render() {
        const {open, reporterList, assignee, taskId} = this.state;
        const that = this;
        const AssignForm = Form.create()(DynamicFieldsForm);
        const fields = [{
            label: 'Reporter',
            key: 'reporter',
            type: SELECT_FIELD,
            options: reporterList.map(user => {
                return {label: user.first_name, value: user.id}
            }),
            required: true
        }];
        const formProps = {
            successFn(data) {
                if (that.props.callback)
                    that.props.callback()
                if(that.props.cancelFn)
                    that.props.cancelFn();
                displayMessage(SUCCESS_MSG_TYPE,"Task Assigned Successfully!!");
            },
            errorFn() {
                if (that.props.errorCallback)
                    that.props.errorCallback()
            },
            method: "post",
            action: ASSIGN_RECURRING_TASK
        };
        const defaultFields = [{key: 'assignee', value: assignee}, {key: 'template', value: taskId}]
        return (
            <Modal visible={open} footer={null} title="Assign Task to Self">
                { Array.isArray(this.state.taskId)?<Alert message={`You have selected ${this.state.taskId.length} recurring tasks to assign.`} banner/>:null}
                <AssignForm fields={fields} formProp={formProps} defaultValues={defaultFields} />
                {this.props.cancelFn ? <Button onClick={this.props.cancelFn}>Cancel</Button> : null}
            </Modal>
        )
    }
}
