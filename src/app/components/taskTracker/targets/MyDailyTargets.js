import CustomizedTable from '../../common/CustomizedTable';
import React from 'react';
import {Col, DatePicker, Form, Modal, Progress, Row} from 'antd';
import moment from 'moment';
import {displayMessage, getAPI} from '../../../utils/common';
import {
    TARGET_HEADS,
    TASK_MONTHLY_TARGET,
    TASK_USER_DAILY_TARGET,
    TASK_USER_DAILY_TARGET_STATUS,
} from '../../../constants/api';
import DynamicFieldsForm from '../../common/DynamicFieldsForm';
import {LABEL_FIELD, NUMBER_FIELD, SUCCESS_MSG_TYPE, TEXT_FIELD} from '../../../constants/dataKeys';
import {loadConfigParameters} from "../../../utils/clinicUtils";
import {TODAY_DATE_CONFIG_PARAM} from "../../../constants/hardData";

export default class MyDailyTargets extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            targets: [],
            loading:false,
            currentDate: moment(),
            filterStrings: {
                date: moment().format('YYYY-MM-DD'),
            },
        };
    }

    componentDidMount() {
        this.loadData();
        loadConfigParameters(this, [TODAY_DATE_CONFIG_PARAM]);
    }

    loadData = () => {
        const that = this;
        that.setState({
            loading:true
        })
        const successFn = function (data) {
            that.setState({
                targets: data.results,
                loading: false,
            });
        };
        const errorFn = function () {
            that.setState({
                loading: false,
            });
        };
        const apiParams = {
            ...this.state.filterStrings,
            department: this.props.user.staff.department,
            designation: this.props.user.staff.designation,
            user: this.props.user.id,
        };
        getAPI(TASK_USER_DAILY_TARGET_STATUS, successFn, errorFn, apiParams);
    };

    applyFilter = (type, value) => {
        const that = this;
        this.setState(function (prevState) {
            return {
                filterStrings: {...prevState.filterStrings, [type]: value},
            };
        }, function () {
            that.loadData();
        });
    };

    editTarget = (record) => {
        this.setState({
            editRecord: record,
            visible: true,
        });
    };

    editCancel = () => {
        this.setState({
            editRecord: null,
            visible: false,
        });
    };

    render() {
        const that = this;
        const {filterStrings, currentDate, editRecord, visible,loading} = this.state;
        const columns = [{
            title: 'Target Name',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'Department ',
            dataIndex: 'department.value',
            key: 'department',
        }, {
            title: 'Designation ',
            dataIndex: 'designation.value',
            key: 'designation',
        }, {
            title: 'Project ',
            dataIndex: 'project.value',
            key: 'project',
        }, {
            width: 150,
            title: 'Progress ',
            dataIndex: 'date_target.target',
            key: 'date_target.target',
            render: (value, record) => {
                let percent = (record.month_target && record.month_target.target && record.month_target.working_days ? ((value || 0) * 100 / (record.month_target.target / record.month_target.working_days)).toFixed(0) : 0) || 0;
                return <span>
                <Progress
                    percent={percent}
                    strokeColor={percent>90?"#87d068":(percent>50?"#d0c268":"#f50")}/>
                </span>

            },export:(value,record)=> (record.month_target && record.month_target.target && record.month_target.working_days ? ((value || 0) * 100 / (record.month_target.target / record.month_target.working_days)).toFixed(0) : 0) || 0 +"%"

        }, {
            title: 'Target Achieved',
            dataIndex: 'date_target.target',
            key: 'date_target',
        }, {
            title: 'Remarks',
            dataIndex: 'date_target.remarks',
            key: 'remarks',
        }, {
            title: 'Actions',
            key: 'action',
            render: (text, record) => (
                <span>
                   <a onClick={() => this.editTarget(record)}
                      disabled={!this.state[TODAY_DATE_CONFIG_PARAM] || moment(this.state[TODAY_DATE_CONFIG_PARAM]).format('YYYY-MM-DD') != this.state.filterStrings.date}>Edit Target</a>
                </span>
            ),
        }];

        const DailyTargetEditForm = Form.create()(DynamicFieldsForm);
        const fields = [{
            label: 'Target Name',
            follow: editRecord ? editRecord.name : null,
            type: LABEL_FIELD,
            key: 'name',
        }, {
            label: 'Achived Target Count',
            initialValue: editRecord && editRecord.date_target ? editRecord.date_target.target : null,
            type: NUMBER_FIELD,
            key: 'target',
            required: true,
        }, {
            label: 'Remark',
            initialValue: editRecord && editRecord.date_target ? editRecord.date_target.remarks : null,
            type: TEXT_FIELD,
            key: 'remarks',
            row: 3
        }];
        const formProp = {
            method: 'post',
            action: TASK_USER_DAILY_TARGET,
            beforeSend: function (values) {
                return [{
                    ...values,
                    id: editRecord && editRecord.date_target ? editRecord.date_target.id : null,
                }];
            },
            successFn: function (data) {
                displayMessage(SUCCESS_MSG_TYPE, 'Monthly Target Recorded Successfully!!');
                that.editCancel();
                that.loadData();
            },
            errorFn: function () {

            },
        };
        const defaultFields = [{key: 'date', value: filterStrings.date},
            {key: 'head', value: editRecord ? editRecord.id : null},{key:"user",value:this.props.user.id}];
        return <>
            <Row gutter={16}>
                <Col span={6}>
                    <h4>Date</h4>
                    <DatePicker allowClear={false}
                                defaultValue={currentDate}
                                style={{width: '100%', marginBottom: 10}}
                                onChange={(value) => this.applyFilter('date', moment(value).format('YYYY-MM-DD'))}/>
                </Col>
            </Row>
            <CustomizedTable loading={this.state.loading} columns={columns} dataSource={this.state.targets}
                             hideReports={true}/>
            <Modal visible={visible} footer={null} title="Daily Target" onCancel={() => this.editCancel()}>
                <DailyTargetEditForm fields={fields} formProp={formProp} defaultValues={defaultFields}/>
            </Modal>
        </>;
    }
}
