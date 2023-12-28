import moment from 'moment';
import {displayMessage, getAPI} from '../../../utils/common';
import {HR_SETTINGS, TARGET_HEADS, TASK_MONTHLY_TARGET, TASK_MONTHLY_TARGET_STATUS} from '../../../constants/api';
import {Col, Divider, Popconfirm, Row, DatePicker, Select, Button, Modal, Form} from 'antd';
import React from 'react';
import CustomizedTable from '../../common/CustomizedTable';
import DynamicFieldsForm from '../../common/DynamicFieldsForm';
import {LABEL_FIELD, NUMBER_FIELD, SUCCESS_MSG_TYPE} from '../../../constants/dataKeys';
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";

const {MonthPicker} = DatePicker;
export default class MonthlyTarget extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            currentDate: moment(),
            targets: [],
            designationList: [],
            departmentList: [],
            projectList: [],
            filterStrings: {
                month: moment().format('MM'),
                year: moment().format('YYYY'),
            },
        };
    }

    componentDidMount() {
        this.loadData();
        this.loadDepartment();
        this.loadDesignation();
        this.loadProject();
    }

    loadProject = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                projectList: data,
            });
        };
        const errorFn = function () {

        };
        getAPI(HR_SETTINGS, successFn, errorFn, {name: 'Project'});
    };
    loadDepartment = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                departmentList: data,
            });
        };
        const errorFn = function () {

        };
        getAPI(HR_SETTINGS, successFn, errorFn, {name: 'Department'});
    };

    loadDesignation = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                designationList: data,
            });
        };
        const errorFn = function () {
        };
        getAPI(HR_SETTINGS, successFn, errorFn, {name: 'Designation'});
    };

    loadData = (page = 1) => {
        const that = this;
        const successFn = function (data) {
            if (data.current == 1) {
                that.setState({
                    targets: data.results,
                    nextPage: data.next,
                    loading: false,
                });
            } else {
                that.setState(function (prevState) {
                    return {
                        targets: [...prevState.targets,...data.results],
                        nextPage: data.next,
                        loading: false,
                    }
                });
            }

        };
        const errorFn = function () {
            that.setState({
                loading: false,
            });
        };
        const apiParams = {
            page,
            ...this.state.filterStrings,
        };
        getAPI(TASK_MONTHLY_TARGET_STATUS, successFn, errorFn, apiParams);
    }

    applyFilter = (type, value, type2, value2) => {
        const that = this;
        this.setState(function (prevState) {
            return {
                filterStrings: {...prevState.filterStrings, [type]: value, [type2]: value2},
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
            title: 'Working Days ',
            dataIndex: 'month_target.working_days',
            key: 'working_days',
        }, {
            title: 'Month Target ',
            dataIndex: 'month_target.target',
            key: 'month_target',
        }, {
            title: 'Actions',
            key: 'action',
            render: (text, record) => (
                <span>
                   <a onClick={() => this.editTarget(record)}>Edit Target</a>
                </span>
            ),
        },
        ];
        const {departmentList, designationList, projectList, filterStrings, currentDate, editRecord, visible} = this.state;
        const MonthlyTargetEditForm = Form.create()(DynamicFieldsForm);
        const fields = [{
            label: 'Target Name',
            follow: editRecord ? editRecord.name : null,
            type: LABEL_FIELD,
            key: 'name',
        }, {
            label: 'Department',
            follow: editRecord && editRecord.designation ? editRecord.designation.value : null,
            type: LABEL_FIELD,
            key: 'department',
        }, {
            label: 'Designation',
            follow: editRecord && editRecord.department ? editRecord.department.value : null,
            type: LABEL_FIELD,
            key: 'designation',
        }, {
            label: 'Project',
            follow: editRecord && editRecord.project ? editRecord.project.value : null,
            type: LABEL_FIELD,
            key: 'project',
        }, {
            label: 'Working Days',
            initialValue: editRecord && editRecord.month_target ? editRecord.month_target.working_days : null,
            type: NUMBER_FIELD,
            key: 'working_days',
            required: true,
            max: 31
        }, {
            label: 'Target Count',
            initialValue: editRecord && editRecord.month_target ? editRecord.month_target.target : null,
            type: NUMBER_FIELD,
            key: 'target',
            required: true,
        }];
        const formProp = {
            method: 'post',
            action: TASK_MONTHLY_TARGET,
            beforeSend: function (values) {
                return [{
                    ...values,
                    id: editRecord && editRecord.month_target ? editRecord.month_target.id : null
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
        const defaultFields = [{key: 'month', value: filterStrings.month},
            {key: 'year', value: filterStrings.year},
            {key: 'department', value: editRecord && editRecord.department ? editRecord.department.id : null},
            {key: 'designation', value: editRecord && editRecord.designation ? editRecord.designation.id : null},
            {key: 'project', value: editRecord && editRecord.project ? editRecord.project.id : null},
            {key: 'head', value: editRecord ? editRecord.id : null}];
        return (
            <div>
                <Row gutter={16}>
                    <Col span={6}>
                        <h4>Month</h4>
                        <MonthPicker allowClear={false}
                                     defaultValue={currentDate}
                                     style={{width: '100%', marginBottom: 10}}
                                     onChange={(value) => this.applyFilter('month', moment(value).format('MM'), 'year', moment(value).format('YYYY'))}/>
                    </Col>
                    <Col span={6}>
                        <h4>Department</h4>
                        <Select allowClear={true} onChange={(value) => this.applyFilter('department', value)}
                                style={{width: '100%', marginBottom: 10}}>
                            {departmentList.map(item => <Select.Option value={item.id}>{item.value}</Select.Option>)}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <h4>Designation</h4>
                        <Select allowClear={true} onChange={(value) => this.applyFilter('designation', value)}
                                style={{width: '100%', marginBottom: 10}}>
                            {designationList.map(item => <Select.Option value={item.id}>{item.value}</Select.Option>)}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <h4>Project</h4>
                        <Select allowClear={true} onChange={(value) => this.applyFilter('project', value)}
                                style={{width: '100%', marginBottom: 10}}>
                            {projectList.map(item => <Select.Option value={item.id}>{item.value}</Select.Option>)}
                        </Select>
                    </Col>
                </Row>
                <Divider/>
                <CustomizedTable loading={this.state.loading} columns={columns} dataSource={this.state.targets} pagination={false} hideReport={true}/>
                <InfiniteFeedLoaderButton hidden={!this.state.nextPage} loaderFunction={()=>this.loadData(this.state.nextPage)} loading={this.state.loading}/>
                <Modal visible={visible} footer={null} title="Edit Monthly Target" onCancel={() => this.editCancel()}>
                    <MonthlyTargetEditForm fields={fields} formProp={formProp} defaultValues={defaultFields}/>
                </Modal>
            </div>
        );
    }
}
