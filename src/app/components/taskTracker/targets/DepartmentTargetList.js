import CustomizedTable from '../../common/CustomizedTable';
import React from 'react';
import { Card, Divider, Popconfirm } from 'antd';
import { getAPI } from '../../../utils/common';
import { TARGET_HEADS } from '../../../constants/api';

export default class DepartmentTargetList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            targets: [],
            loading:false
        };
    }

    componentDidMount() {
        this.loadData();
    }

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
        const apiParams = {
            department: this.props.user.staff.department,
        };
        getAPI(TARGET_HEADS, successFn, errorFn,apiParams);
    }

    render() {
        let i = 1;
        const columns = [{
            title: 'S.No',
            dataIndex: 'sno',
            key: 'sno',
            render: (value, record) => <span>{i++}</span>,
        }, {
            title: 'Target Name',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'Project ',
            dataIndex: 'project.value',
            key: 'project',
        },
        {
            title: 'Designation ',
            dataIndex: 'designation.value',
            key: 'designation',
        },
        {
            title: 'Department ',
            dataIndex: 'department.value',
            key: 'department',
        }];
        return <>
            <CustomizedTable loading={this.state.loading} columns={columns} dataSource={this.state.targets}
                             hideReport={true} pagination={false}/>
        </>;
    }
}
