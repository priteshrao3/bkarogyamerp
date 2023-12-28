import React, {Component} from "react";
import * as _ from 'lodash';
import {Row, Card, Form, Select, Divider, Button, Popconfirm} from 'antd';
import {
    ALL_PRACTICE_STAFF,
    MANAGER_EMPLOYEE,
    MANAGER_ADVISOR,
    PATIENTS_LIST,
    SINGLE_PRACTICE_STAFF_API
} from "../../../../constants/api";
import {getAPI, interpolate, putAPI, displayMessage} from "../../../../utils/common";
import CustomizedTable from "../../../common/CustomizedTable";
import {SUCCESS_MSG_TYPE} from "../../../../constants/dataKeys";

class AssignManagerToEmployee extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            advisorsLoading: false,
            employeeLoading: false,
            manager: null,
            employees: null,
            managerData: [],
            employeeData: [],
            managerEmployeeData: [],
            managerAdvisorData: [],
            advisorData: [],
            employeeField: true,
            advisorField: true,
        }

    }

    componentDidMount() {
        this.loadManager();
        this.loadEmployee();
        this.loadAdvisor();

    }


    loadManager = () => {
        let that = this;
        that.setState({
            loading: true,
        })
        let successFn = function (data) {
            if (data.length) {
                that.setState({
                    managerData: data,
                    manager: data[0].id,
                    managerName: data[0].user.first_name,
                    loading: false
                })
                that.loadManagerUnderEmployee(data[0].id);
                that.loadManagerUnderAdvisor(data[0].id);
            }
        }
        let errorFn = function () {
            that.setState({
                loading: true,
            })
        }
        let apiParams = {
            is_manager: true
        }
        getAPI(ALL_PRACTICE_STAFF, successFn, errorFn, apiParams)
    }

    loadEmployee = () => {
        let that = this;
        that.setState({
            loading: true,
        })
        let successFn = function (data) {
            that.setState({
                employeeData: data,
                loading: false
            })
        }
        let errorFn = function () {
            that.setState({
                loading: true,
            })
        }
        let apiParams = {
            // is_manager: false
        }
        getAPI(ALL_PRACTICE_STAFF, successFn, errorFn, apiParams)
    }

    loadAdvisor = () => {
        let that = this;
        that.setState({
            loading: true,
        })
        let successFn = function (data) {
            that.setState({
                advisorData: data,
                loading: false
            })
        }
        let errorFn = function () {
            that.setState({
                loading: true,
            })
        }
        let apiParams = {
            approved: true,
            pagination: false
        }
        getAPI(PATIENTS_LIST, successFn, errorFn, apiParams)
    }


    loadManagerUnderEmployee = (managerId) => {
        let that = this;
        that.setState({
            employeeLoading: true
        })
        let successFn = function (data) {
            if (data.length > 0) {
                let tempEmployees = []
                data.map(item => {
                    tempEmployees.push(item.id)

                })
                that.setState({
                    selectedEmployee: tempEmployees,
                    managerEmployeeData: data,
                    employeeLoading: false
                })
            }

        }

        let errorFn = function (data) {
            that.setState({
                employeeLoading: false
            })
        }

        getAPI(interpolate(MANAGER_EMPLOYEE, [managerId]), successFn, errorFn);
    }

    loadManagerUnderAdvisor = (managerId) => {
        let that = this;
        that.setState({
            advisorsLoading: true
        })
        let successFn = function (data) {
            if (data.length > 0) {
                let tempAdvisor = []
                data.map(item => {
                    tempAdvisor.push(item.id)

                })
                that.setState({
                    selectedAdvisor: tempAdvisor,
                    managerAdvisorData: data,
                    advisorsLoading: false
                })
            }


        }

        let errorFn = function (data) {
            that.setState({
                advisorsLoading: false
            })
        }

        getAPI(interpolate(MANAGER_ADVISOR, [managerId]), successFn, errorFn);
    }


    onChangeValue = (type, value) => {
        const that = this;
        that.setState(function (prevState) {
            let managerName = prevState.managerName;
            if (type == 'manager') {
                prevState.managerData.forEach(function (manager) {
                    if (manager.id == value) {
                        managerName = manager.user.first_name;
                    }
                })
            }
            return {
                [type]: value,
                managerName
            }
        }, function () {
            if (type == 'manager') {
                that.loadManagerUnderEmployee(value);
                that.loadManagerUnderAdvisor(value);
            }
        })
    }

    handleSubmit = (e) => {
        const that = this;
        let {manager, selectedEmployee, selectedAdvisor} = that.state;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const reqData = {
                    ...values,
                }
                delete reqData.manager;
                reqData.id = values.manager;
                if (selectedEmployee && selectedEmployee.length > 0) {
                    reqData.employees = _.union(selectedEmployee, reqData.employees);
                }

                if (selectedAdvisor && selectedAdvisor.length > 0) {
                    reqData.advisors = _.union(selectedAdvisor, reqData.advisors)
                }


                const successFn = function (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "Saved Successfully!!");
                    that.setState({
                        loading: false
                    });
                    that.loadManagerUnderEmployee(manager);
                    that.loadManagerUnderAdvisor(manager);
                    that.props.form.resetFields();
                }
                const errorFn = function () {
                    that.setState({
                        loading: false
                    })
                }

                putAPI(interpolate(SINGLE_PRACTICE_STAFF_API, [manager]), reqData, successFn, errorFn);
            }
        })
    }

    addNewItem = (type, values) => {
        let that = this;
        if (type == 'employee') {
            let tempEmployees = []
            values.map(item => {
                tempEmployees.push(item.id)

            })
            that.setState({
                selectedEmployee: tempEmployees,
                advisorField: false,
                employeeField: true


            })
            console.log("type", type, values, tempEmployees)
        }
        if (type == 'advisor') {
            let tempAdvisor = []
            values.map(item => {
                tempAdvisor.push(item.id)
            })
            that.setState({
                selectedAdvisor: tempAdvisor,
                advisorField: true,
                employeeField: false
            })
            console.log("type", type, values, tempAdvisor)
        }
    }

    deleteObject = (type, values) => {
        let that = this;
        let {managerEmployeeData, managerAdvisorData} = this.state;
        if (type == 'employee') {
            let tempEmployees = []
            managerEmployeeData.map(item => {
                tempEmployees.push(item.id)

            })
            this.deleteManagerItem('employee', _.pull(tempEmployees, values.id));
        }
        if (type == 'advisor') {
            let tempAdvisor = []
            managerAdvisorData.map(item => {
                tempAdvisor.push(item.id)
            })
            this.deleteManagerItem('advisor', _.pull(tempAdvisor, values.id))
        }

    }

    deleteManagerItem = (type, values) => {
        let that = this;
        let {manager} = this.state
        let reqData = {
            id: manager
        }
        that.setState({
            loading: true
        })
        if (type == 'advisor') {
            reqData.advisors = values;
        }

        if (type == 'employee') {
            reqData.employees = values;
        }
        let successFn = function (data) {
            that.setState({
                loading: false
            })
            that.loadManagerUnderEmployee(manager);
            that.loadManagerUnderAdvisor(manager);
        }

        let errorFn = function (data) {
            that.setState({
                loading: false
            })

        }
        console.log('Delete', reqData)
        putAPI(interpolate(SINGLE_PRACTICE_STAFF_API, [manager]), reqData, successFn, errorFn);
    }


    render() {
        let {managerName,
            loading, employeeLoading, advisorsLoading, managerData, advisorData, employeeData,
            managerEmployeeData, managerAdvisorData, employeeField,
            advisorField
        } = this.state;
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = ({
            labelCol: {span: 8},
            wrapperCol: {span: 12},
        });

        const employeeColumns = [{
            title: 'S. No.',
            key: 'key',
            render: (text, record, index) => <span>{index + 1}</span>
        }, {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (item, record) => <span>{record && record.user ? record.user.first_name : ''}</span>
        }, {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (item, record) => <span>{record && record.user ? record.user.email : ''}</span>
        }, {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (item, record) => <span>{record && record.user ? record.user.mobile : ''}</span>
        }, {
            title: "Action",
            key: 'action',
            render: (text, record) => (
                <span>
                    <Popconfirm
                        title="Are you sure to delete this?"
                        onConfirm={() => this.deleteObject('employee', record)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <a>Delete</a>
                    </Popconfirm>
                </span>

            ),
        }]

        const advisorColumns = [{
            title: 'S. No.',
            key: 'key',
            render: (text, record, index) => <span>{index + 1}</span>
        }, {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (item, record) => <span>{record && record.user ? record.user.first_name : ''}</span>
        }, {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (item, record) => <span>{record && record.user ? record.user.email : ''}</span>
        }, {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (item, record) => <span>{record && record.user ? record.user.mobile : ''}</span>
        }, {
            title: "Action",
            key: 'action',
            render: (text, record) => (
                <span>
                    <Popconfirm
                        title="Are you sure to delete this?"
                        onConfirm={() => this.deleteObject('advisor', record)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <a>Delete</a>
                    </Popconfirm>
                </span>

            ),
        }]

        return (
            <Row>
                <h2>Assign Manager to Employee</h2>

                <Form onSubmit={this.handleSubmit}>
                    <Form.Item key="manager" {...formItemLayout} label="Manager">
                        {getFieldDecorator("manager", {
                            validateTrigger: ["onChange", "onBlur"],
                            initialValue: managerData.length > 0 ? managerData[0].id : [],
                            rules: [{required: true, message: 'This field is required!'}],

                        })(
                            <Select
                                placeholder="Select Manager"
                                onChange={(value) => this.onChangeValue("manager", value)}
                                showSearch
                                optionFilterProp="children"
                            >

                                {managerData.map((option) => (
                                    <Select.Option key={option.id}
                                                   value={option.id}
                                    >{option.user.first_name} ({option.emp_id})
                                    </Select.Option>
                                ))}
                            </Select>
                        )}

                    </Form.Item>
                    {employeeField &&
                    <Form.Item key="employees" {...formItemLayout} label="Employee">
                        {getFieldDecorator("employees", {})(
                            <Select
                                placeholder="Select Employee"
                                onChange={(value) => this.onChangeValue("employees", value)}
                                showSearch
                                mode="multiple"
                                optionFilterProp="children"
                            >

                                {employeeData.map((option) => (
                                    <Select.Option key={option.id}
                                                   value={option.id}
                                    >{option.user.first_name} ({option.emp_id})
                                    </Select.Option>
                                ))}
                            </Select>
                        )}

                    </Form.Item>
                    }
                    {advisorField &&

                    <Form.Item key="advisors" {...formItemLayout} label="Advisor">
                        {getFieldDecorator("advisors", {})(
                            <Select
                                placeholder="Select Advisor"
                                onChange={(value) => this.onChangeValue("advisors", value)}
                                showSearch
                                mode="multiple"
                                optionFilterProp="children"
                            >

                                {advisorData.map((option) => (
                                    <Select.Option key={option.id}
                                                   value={option.id}
                                    >{option.user.first_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}

                    </Form.Item>
                    }

                    <Form.Item>
                        {this.props.history ? (
                            <Button style={{margin: 5}} onClick={() => this.props.history.goBack()}>
                                Cancel
                            </Button>
                        ) : null}
                        <Button style={{margin: 5}} type="primary" htmlType="submit" loading={this.state.loading}>
                            Save
                        </Button>

                    </Form.Item>


                </Form>


                <Card title={"Employess under "+managerName}>
                    <CustomizedTable
                        rowKey={record => record.id}
                        hideReport
                        loading={employeeLoading}
                        columns={employeeColumns}
                        dataSource={managerEmployeeData}
                        pagination={false}
                    />

                </Card>

                <Divider/>
                <Card title={"Advisor under "+managerName}>
                    <CustomizedTable
                        rowKey={record => record.id}
                        hideReport
                        loading={advisorsLoading}
                        columns={advisorColumns}
                        dataSource={managerAdvisorData}
                        pagination={false}
                    />
                </Card>


            </Row>
        );
    }

}

export default Form.create()(AssignManagerToEmployee)
