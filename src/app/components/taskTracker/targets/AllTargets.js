import { Button, Divider, Form, Modal, Popconfirm } from 'antd';
import CustomizedTable from '../../common/CustomizedTable';
import React from 'react';
import { INPUT_FIELD, NUMBER_FIELD, SELECT_FIELD, SUCCESS_MSG_TYPE } from '../../../constants/dataKeys';
import { displayMessage, getAPI, interpolate, postAPI } from '../../../utils/common';
import { HR_SETTINGS, TARGET_HEADS, TAXES } from '../../../constants/api';
import DynamicFieldsForm from '../../common/DynamicFieldsForm';

export default class AllTargets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            targets: [],
            designationList: [],
            departmentList: [],
            projectList: [],
            loading:false
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
        const successFn = function(data) {
            that.setState({
                projectList: data,
            });
        };
        const errorFn = function() {

        };
        getAPI(HR_SETTINGS, successFn, errorFn, { name: 'Project' });
    };
    loadDepartment = () => {
        const that = this;
        const successFn = function(data) {
            that.setState({
                departmentList: data,
            });
        };
        const errorFn = function() {

        };
        getAPI(HR_SETTINGS, successFn, errorFn, { name: 'Department' });
    };

    loadDesignation = () => {
        const that = this;
        const successFn = function(data) {
            that.setState({
                designationList: data,
            });
        };
        const errorFn = function() {
        };
        getAPI(HR_SETTINGS, successFn, errorFn, { name: 'Designation' });
    };

    loadData() {
        const that = this;
        that.setState({
            loading:true
        })
        const successFn = function(data) {
            that.setState({
                targets: data,
                loading: false,
            });
        };
        const errorFn = function() {
            that.setState({
                loading: false,
            });
        };
        getAPI(TARGET_HEADS, successFn, errorFn);
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    handleCancel = () => {
        this.setState({ visible: false, editRecord: null });
    };

    deleteObject(record) {
        const that = this;
        const reqData = { id: record.id };
        reqData.is_active = false;
        const successFn = function(data) {
            that.loadData();
        };
        const errorFn = function() {
        };
        postAPI(TARGET_HEADS, reqData, successFn, errorFn);
    }

    editRecord = (record) => {
        this.setState({
            editRecord: record,
            visible: true,
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
            title: 'Actions',
            key: 'action',
            render: (text, record) => (
                <span>
               <a onClick={() => this.editRecord(record)}>  Edit</a>
                     <Divider type="vertical"/>
                    <Popconfirm
                        title="Are you sure delete this?"
                        onConfirm={() => that.deleteObject(record)}
                        okText="Yes"
                        cancelText="No"
                    >
                      <a>Delete</a>
                    </Popconfirm>
                </span>
            ),
        }];
        const fields = [{
            label: 'Target Name',
            key: 'name',
            placeholder: 'Target Name',
            required: true,
            type: INPUT_FIELD,
        }, {
            label: 'Department',
            key: 'department',
            required: true,
            type: SELECT_FIELD,
            options: this.state.departmentList.map(item => {
                return { value: item.id, label: item.value };
            }),
        }, {
            label: 'Designation',
            key: 'designation',
            required: true,
            type: SELECT_FIELD,
            options: this.state.designationList.map(item => {
                return { value: item.id, label: item.value };
            }),
        }, {
            label: 'Project',
            key: 'project',
            required: true,
            type: SELECT_FIELD,
            options: this.state.projectList.map(item => {
                return { value: item.id, label: item.value };
            }),
        }];
        const editfields = [{
            label: 'Target Name',
            key: 'name',
            placeholder: 'Target Name',
            required: true,
            type: INPUT_FIELD,
            initialValue: this.state.editRecord ? this.state.editRecord.name : null,
        }, {
            label: 'Department',
            key: 'department',
            required: true,
            type: SELECT_FIELD,
            options: this.state.departmentList.map(item => {
                return { value: item.id, label: item.value };
            }),
            initialValue: this.state.editRecord && this.state.editRecord.department ? this.state.editRecord.department.id : null,
        }, {
            label: 'Designation',
            key: 'designation',
            required: true,
            type: SELECT_FIELD,
            options: this.state.designationList.map(item => {
                return { value: item.id, label: item.value };
            }),
            initialValue: this.state.editRecord && this.state.editRecord.designation ? this.state.editRecord.designation.id : null,
        }, {
            label: 'Project',
            key: 'project',
            required: true,
            type: SELECT_FIELD,
            options: this.state.projectList.map(item => {
                return { value: item.id, label: item.value };
            }),initialValue: this.state.editRecord && this.state.editRecord.project ? this.state.editRecord.project.id : null,
        }];
        const formProp = {
            successFn(data) {
                that.handleCancel();
                that.loadData();
                displayMessage(SUCCESS_MSG_TYPE, "Target recorded successfully!!");
            },
            errorFn() {

            },
            action: TARGET_HEADS,
            method: 'post',
        };
        const defaultValues = [];
        const editFormDefaultValues = [{
            'key': 'id',
            'value': this.state.editRecord ? this.state.editRecord.id : null,
        }];
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        return <div>
            <TestFormLayout defaultValues={defaultValues} formProp={formProp} fields={fields} {...this.props} />
            <Divider/>
            <CustomizedTable loading={this.state.loading} columns={columns} dataSource={this.state.targets}/>
            <Modal
                title="Edit Target"
                visible={this.state.visible}
                footer={null}
                onCancel={this.handleCancel}
            >
                <TestFormLayout defaultValues={editFormDefaultValues} formProp={formProp} fields={editfields}/>
                <Button key="back" onClick={this.handleCancel}>Return</Button>,

            </Modal>
        </div>;
    }
}
