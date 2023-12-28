import React, { Component } from 'react';
import { Button, Card, Col, Icon, Radio, Row, Select } from 'antd';
import { TASKS_RELATED_REPORT, TASK_VALUE } from '../../../constants/hardData';
import {
    ALL_TREATMENTS, ALL_USER_TARGET_SUMMARY,
    AVG_RATING, TASK_REPORT, USER_WISE_TARGET_SUMMARY,
} from '../../../constants/dataKeys';
import { loadDoctors } from '../../../utils/clinicUtils';
import AllTaskReport from './AllTaskReport';
import AvgRatingReport from './AvgRatingReport';
import CompleteTaskReport from './CompleteTaskReport';
import { getAPI } from '../../../utils/common';
import { RATING_REPORT, HR_SETTINGS } from '../../../constants/api';
import AllUserTargetSummary from './AllUserTargetSummary';
import UserWiseTargetSummary from './UserWiseTargetSummary';


export default class TasksReportHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: ALL_TREATMENTS,
            loading: true,
            sidePanelColSpan: 4,
            advancedOptionShow: true,
            practiceDoctors: [],
            employeeOption: [],
            departmentList: [],
            designationList: [],

        };
        loadDoctors(this);
        //  this.loadAgents = this.loadAgents.bind(this);
        this.loadEmployee = this.loadEmployee.bind(this);
        this.loadDepartment = this.loadDepartment.bind(this);
        this.loadDesignation = this.loadDesignation.bind(this);
    }

    componentDidMount() {
        // this.loadAgents();
        this.loadEmployee();
        this.loadDepartment();
        this.loadDesignation();
    }

    onChangeHandle = (type, value) => {
        const that = this;
        this.setState({
            [type]: value.target.value,
        });
    };

    advancedOption(value) {
        this.setState({
            advancedOptionShow: value,
        });
    }

    changeSidePanelSize = (sidePanel) => {
        this.setState({
            sidePanelColSpan: sidePanel ? 0 : 4,
        });
    };

    handleChangeOption = (type, value) => {
        const that = this;
        this.setState({
            [type]: value,
        });
    };

    onChangeCheckbox = (e) => {
        this.setState({
            is_complete: !this.state.is_complete,
        });
    };

    loadEmployee() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                employeeOption: data,
                loading: false,
            });
        };
        const errorFn = function() {
            that.setState({
                loading: false,
            });
        };
        let apiParams = {
            type: 'AVERAGE',
        };
        getAPI(RATING_REPORT, successFn, errorFn, apiParams);
    }

    loadDepartment() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                departmentList: data,
            });
        };
        const errorFn = function() {

        };
        getAPI(HR_SETTINGS, successFn, errorFn, { name: 'Department' });
    }

    loadDesignation() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                designationList: data,
            });
        };
        const errorFn = function() {
        };
        getAPI(HR_SETTINGS, successFn, errorFn, { name: 'Designation' });
    }

    render() {
        return (
            <div>
                <h2>Task Track Report <Button
                    type="primary"
                    shape="round"
                    icon={this.state.sidePanelColSpan ? 'double-right' : 'double-left'}
                    style={{ float: 'right' }}
                    onClick={() => this.changeSidePanelSize(this.state.sidePanelColSpan)}
                >Panel
                </Button>
                </h2>
                <Card>
                    <Row gutter={16}>
                        <Col span={(24 - this.state.sidePanelColSpan)}>
                            {this.state.type == ALL_TREATMENTS ?
                                <AllTaskReport {...this.props} {...this.state}/> : null}
                            {this.state.type == AVG_RATING ? <AvgRatingReport {...this.props}{...this.state}/> : null}
                            {this.state.type == TASK_REPORT ?
                                <CompleteTaskReport {...this.props}{...this.state}/> : null}
                            {this.state.type == ALL_USER_TARGET_SUMMARY ?
                                <AllUserTargetSummary {...this.props}{...this.state} /> : null}
                            {this.state.type == USER_WISE_TARGET_SUMMARY ?
                                <UserWiseTargetSummary {...this.props}{...this.state}/> : null}
                        </Col>
                        <Col span={this.state.sidePanelColSpan}>
                            <Radio.Group buttonStyle="solid" defaultValue={ALL_TREATMENTS}
                                         onChange={(value) => this.onChangeHandle('type', value)}>
                                <h2>Task Track</h2>
                                <Radio.Button
                                    style={{ width: '100%', backgroundColor: 'transparent', border: '0px' }}
                                    value={ALL_TREATMENTS}
                                >
                                    All Tasks
                                </Radio.Button>
                                <p><br/></p>
                                <h2>Related Reports</h2>
                                {TASKS_RELATED_REPORT.map((item) => (
                                    <Radio.Button
                                        style={{ width: '100%', backgroundColor: 'transparent' }}
                                        value={item.value}
                                    >
                                        {item.name}
                                    </Radio.Button>
                                ))}
                            </Radio.Group>

                            <br/>
                            <br/>
                            {this.state.advancedOptionShow ? (
                                <>
                                    <Button type="link" onClick={(value) => this.advancedOption(false)}>Hide Advanced
                                        Options
                                    </Button>
                                    { this.state.type == AVG_RATING || this.state.type == ALL_TREATMENTS ? (
                                        <Row> <Col> <br/>
                                            <h4>Employee</h4>
                                            <Select
                                                style={{ minWidth: '200px' }}
                                                placeholder="Employee Name"
                                                showSearch
                                                optionFilterProp="children"
                                                onChange={(value) => this.handleChangeOption('employee', value)}
                                                allowClear
                                            >
                                                {this.state.employeeOption.map((item) => (
                                                    <Select.Option value={item.user.id}>
                                                        {item.user.first_name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Col>
                                            <Col> <br/>

                                                <h4>Department</h4>
                                                <Select
                                                    style={{ minWidth: '200px' }}
                                                    placeholder="Department"
                                                    showSearch
                                                    optionFilterProp="children"
                                                    onSearch={(value) => this.loadDepartment(value)}
                                                    onChange={(value) => this.handleChangeOption('dept', value)}
                                                    allowClear
                                                >
                                                    {this.state.departmentList.map((item) => (
                                                        <Select.Option value={item.id}>
                                                            {item.value}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Col>
                                            <Col> <br/>
                                                <h4>Designation</h4>
                                                <Select
                                                    style={{ minWidth: '200px' }}
                                                    placeholder="Designation"
                                                    showSearch
                                                    optionFilterProp="children"
                                                    onSearch={(value) => this.loadDesignation(value)}
                                                    onChange={(value) => this.handleChangeOption('designation', value)}
                                                    allowClear
                                                >
                                                    {this.state.designationList.map((item) => (
                                                        <Select.Option value={item.id}>
                                                            {item.value}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Col>
                                        </Row>

                                    ) : null}
                                    {this.state.type == TASK_REPORT ? (
                                        <Col> <br/>
                                            <h4>Task Type</h4>
                                            <Select
                                                style={{ minWidth: '200px' }}
                                                placeholder="Task Type"
                                                showSearch
                                                optionFilterProp="children"
                                                onChange={(value) => this.handleChangeOption('tasktype', value)}
                                                allowClear
                                            >
                                                {TASK_VALUE.map((item) => (
                                                    <Radio.Button
                                                        value={item.value}
                                                    >
                                                        {item.name}
                                                    </Radio.Button>
                                                ))}
                                            </Select>
                                        </Col>
                                    ) : null}
                                    {this.state.type == ALL_USER_TARGET_SUMMARY ? (
                                        <Row>
                                            <Col> <br/>

                                                <h4>Department</h4>
                                                <Select
                                                    style={{ minWidth: '200px' }}
                                                    placeholder="Department"
                                                    showSearch
                                                    optionFilterProp="children"
                                                    onSearch={(value) => this.loadDepartment(value)}
                                                    onChange={(value) => this.handleChangeOption('dept', value)}
                                                    allowClear
                                                >
                                                    {this.state.departmentList.map((item) => (
                                                        <Select.Option value={item.id}>
                                                            {item.value}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Col>
                                            <Col> <br/>
                                                <h4>Designation</h4>
                                                <Select
                                                    style={{ minWidth: '200px' }}
                                                    placeholder="Designation"
                                                    showSearch
                                                    optionFilterProp="children"
                                                    onSearch={(value) => this.loadDesignation(value)}
                                                    onChange={(value) => this.handleChangeOption('designation', value)}
                                                    allowClear
                                                >
                                                    {this.state.designationList.map((item) => (
                                                        <Select.Option value={item.id}>
                                                            {item.value}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Col>
                                        </Row>
                                    ) : null}

                                    {this.state.type == USER_WISE_TARGET_SUMMARY? (
                                        <Row>
                                            <Col> <br/>
                                                <h4>Employee</h4>
                                                <Select
                                                    style={{ minWidth: '200px' }}
                                                    placeholder="Employee Name"
                                                    showSearch
                                                    optionFilterProp="children"
                                                    onChange={(value) => this.handleChangeOption('employee', value)}
                                                    allowClear
                                                >
                                                    {this.state.employeeOption.map((item) => (
                                                        <Select.Option value={item.user.id}>
                                                            {item.user.first_name}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Col>
                                        </Row>
                                    ) : null}
                                </>
                            ) : <Button type="link" onClick={(value) => this.advancedOption(true)}>Show Advanced
                                Options </Button>}
                        </Col>
                    </Row>
                </Card>
            </div>
        );
    }
}
