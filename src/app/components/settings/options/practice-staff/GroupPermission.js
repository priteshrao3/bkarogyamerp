import React from 'react'
import CustomizedTable from "../../../common/CustomizedTable";
import {GROUP_PERMISSION_REPORT,SINGLE_GROUP_PERMISSION_REPORT} from "../../../../constants/api";
import {getAPI,interpolate,putAPI, postAPI} from "../../../../utils/common";
import {Icon,Button,Divider,Popconfirm} from "antd";
import {Link} from "react-router-dom";

export class GroupPermission extends React.Component{
constructor(props) {
    super(props)

    this.state = {
        loadings: false,
        groupPermission:[]
    }
    this.loadData = this.loadData.bind(this);
}
componentDidMount() {
    this.loadData();
}

groupdataLoad(){
    const that=this;
    that.setState({
        loadings:true
    })
    const successFn=function(data){
        that.setState({  
            groupPermission:data,
            loadings:false
    })
}
const errorFn = function () {
    that.setState({
        loadings:false
    })
}
getAPI(GROUP_PERMISSION_REPORT, successFn, errorFn);
}
loadData(){
    this.groupdataLoad(); 
}

deleteGroup(value) {
    const that = this;
    const reqData = {
        is_active:false,
        id:value
    }
    const successFn = function (data) {
        that.loadData();
    };
    const errorFn = function () {
    };
    postAPI(SINGLE_GROUP_PERMISSION_REPORT, reqData, successFn, errorFn);
}

    render() {
        const that=this;
        let{groupPermission,loadings}=this.state;
        const employeeColumns = [{
            title: 'S. No.',
            key: 'key',
            render: (text, record, index) => <span>{index + 1}</span>
        }, {
            title: 'Group Name',
            dataIndex: 'group_name',
            key: 'group_name', 
        },
        {
            title: 'Group Description',
            dataIndex: 'group_description',
            key: 'group_description', 
        },
        {
            title:"Action",
            key:"action",
            render:(text, record) => (
                <span>
                <Link to={`/erp/settings/clinics-staff/group/${record.id}/edit`}>
                 <a>Edit</a>
                </Link>
                <Divider type="vertical" />
                <Popconfirm
                title="Are you sure delete this Group"
                onConfirm={() => that.deleteGroup(record.id)}
                okText="Yes"
                cancelText="No"
                >
                 <a>Delete</a>
                </Popconfirm>
                </span>
                )
        }
    ];
              return (
                 <div>
                  <h2>Group
                    <Link to="/erp/settings/clinics-staff/addgroup">
                    <Button type="primary" style={{float: 'right'}}>
                    <Icon type="plus" />&nbsp;Group Permission
                    </Button>
                    </Link>
                     </h2>
                 <CustomizedTable
                        loading={loadings}
                        columns={employeeColumns}
                        dataSource={groupPermission}
                        pagination={false}
                    />
                
            </div>
        )
    }
}

export default GroupPermission
