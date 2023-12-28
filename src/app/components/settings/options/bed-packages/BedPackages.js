import React from "react";
import {Button, Card, Divider, Icon, Popconfirm} from 'antd';
import {Link, Redirect, Route, Switch} from "react-router-dom";
import CustomizedTable from "../../../common/CustomizedTable";
import AddorEditBedPackages from "./AddorEditBedPackages";
import {getAPI, interpolate, makeFileURL, postAPI} from "../../../../utils/common";
import {BED_PACKAGES} from "../../../../constants/api";

export default class BedPackages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            packages: []
        }
    }

    componentDidMount() {
        this.loadData();
    }

    loadData = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                loading: false,
                packages: data
            })
        }
        const errorFn = function () {
            that.setState({
                loading: false,
            })
        }
        getAPI(interpolate(BED_PACKAGES, [this.props.active_practiceId]), successFn, errorFn);
    }

    deleteObject(record) {
        const that = this;
        const reqData = record;
        reqData.is_active = false;
        const successFn = function (data) {
            that.loadData();
        }
        const errorFn = function () {
        }
        postAPI(interpolate(BED_PACKAGES, [this.props.active_practiceId]), reqData, successFn, errorFn);
    }

    editObject = (record) => {
        this.setState({
            editPackage: record,
            loading: false
        });
        this.props.history.push('/erp/settings/bed-packages/edit')
    }

    render() {
        const that = this;
        const columns = [{
            dataIndex: 'image',
            key: 'image',
            render: (value) => value ?
                <img src={makeFileURL(value)} alt="" style={{maxWidth: 200, maxHeight: 100}} /> : null
        }, {
            title: "Package Name",
            dataIndex: 'name',
            key: 'name'
        }, {
            title: "Days",
            dataIndex: 'no_of_days',
            key: 'no_of_days'
        }, {
            title: "Normal Price+tax (INR)",
            dataIndex: 'normal_price',
            key: 'normal_price',
            render: (value, record) => (<p>{(record.normal_price + record.normal_tax_value).toFixed(2)}</p>

            ),
        }, {
            title: "Tatkal Price+tax (INR)",
            dataIndex: 'tatkal_price',
            key: 'tatkal_price',
            render: (value, record) => (<p>{(record.tatkal_price + record.tatkal_tax_value).toFixed(2)}</p>)
        },{
            title:'Description',
            dataIndex:'description',
            key:'description'
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={() => this.editObject(record)}>
                Edit</a>
                <Divider type="vertical" />
                  <Popconfirm
                    title="Are you sure delete this prescription?"
                    onConfirm={() => that.deleteObject(record)}
                    okText="Yes"
                    cancelText="No"
                  >
                      <a>Delete</a>
                  </Popconfirm>
                </span>
            ),
        }]
        return (
<Switch>
            <Route
              path="/erp/settings/bed-packages/add"
              render={(route) => (
<AddorEditBedPackages
  {...this.props}
  {...route}
  loadData={this.loadData}
/>
)}
            />
            <Route
              path="/erp/settings/bed-packages/edit"
              render={(route) => (this.state.editPackage ?
                       <AddorEditBedPackages {...this.state} {...this.props} {...route} loadData={this.loadData} /> :
                       <Redirect to="/erp/settings/bed-packages" />)}
            />
            <Route>
                <Card
                  title={(
<h4>Bed Packages <Link to="/erp/settings/bed-packages/add"><Button
  style={{float: 'right'}}
  type="primary"
><Icon
  type="plus"
/> Add
                                                       </Button>
                 </Link>
</h4>
)}
                >
                    <CustomizedTable
                      dataSource={this.state.packages}
                      loading={this.state.loading}
                      columns={columns}
                    />
                </Card>
            </Route>
</Switch>
)
    }
}
