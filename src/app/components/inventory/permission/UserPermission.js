
import React from 'react';
import CustomizedTable from '../../common/CustomizedTable';
import { USER_PERMISSION_VIEW } from '../../../constants/api';
import { getAPI } from '../../../utils/common';
import { Card, Col, Divider, Form, Result, Row, Select } from 'antd';
import { loadStaff } from '../../../utils/clinicUtils';

export default class UserPermission extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            practiceStaff: [],
            selectedStaff: null,
        };
        this.userPermission = this.userPermission.bind(this);
    }

    componentDidMount() {
        loadStaff(this);
    }

    userPermission() {
        const that = this;
        this.setState({
            loading: true,
        });
        const successFn = function(data) {
            let dataObject = { ...data };
            let tableData = [];
            let allowedPermissions = {};
            dataObject.allowed_permissions.forEach(function(perm) {
                allowedPermissions = {
                    ...allowedPermissions,
                    [perm.practice]: { ...allowedPermissions[perm.practice], [perm.codename]: true },
                };
            });
            dataObject.all_permissions.forEach(function(permission) {
                let permissionObject = { permission: permission.name };
                dataObject.practices.forEach(function(practice) {
                    permissionObject[practice.id] = (allowedPermissions[practice.id] && allowedPermissions[practice.id][permission.codename] ? 'YES' : 'NO');
                });
                tableData.push(permissionObject);
            });
            that.setState({
                practices: dataObject.practices,
                all: tableData,
                loading: false,
            });
        };
        const errorFn = function() {
            that.setState({
                loading: false,
            });
        };
        let apiParams = {
            staff: that.state.selectedStaff,
        };
        getAPI(USER_PERMISSION_VIEW, successFn, errorFn, apiParams);
    }

    changeStaff = (value) => {
        const that = this;
        this.setState({
            selectedStaff: value,
        }, function() {
            that.userPermission();
        });
    };

    render() {
        const that = this;
        const { practices, all, practiceStaff, selectedStaff, loading } = this.state;
        const columnfeild = [{
            title: 'Permission',
            key: 'permission',
            dataIndex: 'permission',
        }];
        if (practices)
            practices.forEach(function(value) {
                columnfeild.push({ title: value.name, dataIndex: value.id, key: value.id });
            });
        return (
            <div>
                <Card title="User Permission">
                    <Row>
                        <Col sm={24} md={12} lg={8}>
                            <h4>Staff</h4>
                            <Select value={selectedStaff} style={{ width: '100%' }}
                                    onChange={(e) => this.changeStaff(e)}>
                                {practiceStaff.map(item => <Select.Option
                                    value={item.id}>{item.user.first_name}</Select.Option>)}
                            </Select>
                        </Col>
                    </Row>
                    <Divider/>
                    {selectedStaff ? <CustomizedTable
                        loading={loading}
                        dataSource={all}
                        columns={columnfeild}
                        pagination={false}
                    /> : <Result title={'Select Staff to see permissions'} status="info"/>}
                </Card>
            </div>
        );
    }
}
