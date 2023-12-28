import {Button, Card,Icon,Divider,Popconfirm} from "antd";
import React from "react";
import {Route, Switch} from "react-router";
import {Link} from "react-router-dom";
import {getAPI,deleteAPI,interpolate,putAPI} from "../../../utils/common";
import {MANUFACTURER_API,SINGLE_MANUFACTURER_API} from "../../../constants/api";
import AddManufacture from "./AddManufacture";
import CustomizedTable from "../../common/CustomizedTable";
import PermissionDenied from "../../common/errors/PermissionDenied";

export default class ManufactureList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active_practiceId: this.props.active_practiceId,
            manufactures: null,
            loading:true
        };
        this.loadData = this.loadData.bind(this);
        this.deleteManufacture =this.deleteManufacture.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                manufactures: data,
                loading:false
            })
        }
        const errorFn = function () {
            that.setState({
                loading:false
            })

        }
        getAPI(MANUFACTURER_API, successFn, errorFn);
    }

    deleteManufacture(value) {
        const that = this;
        const reqDate={...value,
            'is_active':false
        }
        const successFn = function (data) {
            that.setState({
                loading:false
            })
            that.loadData();
        };
        const errorFn = function () {
        };
        putAPI(interpolate(SINGLE_MANUFACTURER_API, [value]), reqDate,successFn, errorFn);

    }


    render() {
        
        const that = this;
        const manufactureColoumns = [{
            title: 'Name',
            key: 'name',
            dataIndex: 'name'
        }, {
            title: 'Details',
            key: 'details',
            dataIndex: 'description'
        }, {
            title: 'Action',
            render (record) {
                return (
<div>
                    {that.props.activePracticePermissions.EditManufacturer || that.props.allowAllPermissions ?
                    <Link to={`/erp/inventory/manufacture/edit/${  record.id}`}>Edit</Link>:null}
                    <Divider type="vertical" />
                    {that.props.activePracticePermissions.DeleteManufacturer || that.props.allowAllPermissions ? (
                    <Popconfirm
                      title="Are you sure delete this item?"
                      onConfirm={() => that.deleteManufacture(record.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                        <a>Delete</a>
                    </Popconfirm>
                  ):null}

                    
</div>
)
            }
        }];
        return (
<div><Switch>
            <Route
              exact
              path='/erp/inventory/manufacture/add'
              render={(route) =>(that.props.activePracticePermissions.EditManufacturer || that.props.allowAllPermissions ? <AddManufacture {...this.state} {...route} {...this.props} loadData={that.loadData} />:<PermissionDenied />)}
            />
            <Route
              path='/erp/inventory/manufacture/edit/:id'
              render={(route) =>(that.props.activePracticePermissions.EditManufacturer || that.props.allowAllPermissions ? <AddManufacture {...this.state} {...this.props} {...route} loadData={that.loadData} />:<PermissionDenied />)}
            />
            <Card
              title="Manufacturers"
              extra={(
<Link to="/erp/inventory/manufacture/add"> <Button type="primary" disabled={!that.props.activePracticePermissions.EditManufacturer}><Icon
  type="plus"
/> Add
                                       </Button>
</Link>
)}
            >
                <CustomizedTable loading={this.state.loading} dataSource={this.state.manufactures} columns={manufactureColoumns} hideReport={!that.props.activePracticePermissions.ExportManufacturer} />
            </Card>
     </Switch>
</div>
)
    }
}
