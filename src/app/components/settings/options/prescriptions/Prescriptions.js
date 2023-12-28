import React from "react";
import {Button, Card, Col, Divider, Form, Icon, Input, Popconfirm, Row, Table} from "antd";
import {Link, Redirect, Route, Switch} from "react-router-dom";
import {DRUG_CATALOG, INVENTORY_ITEM_API, SINGLE_INVENTORY_ITEM_API,} from "../../../../constants/api";
import {getAPI, interpolate, postAPI, putAPI} from "../../../../utils/common";
import AddPrescription from "./AddPrescription";
import {DRUG} from "../../../../constants/hardData";
import AddorEditPrescriptionForm from "./AddorEditPrescriptionForm";
import InfiniteFeedLoaderButton from "../../../common/InfiniteFeedLoaderButton";
import CustomizedTable from "../../../common/CustomizedTable";

class Prescriptions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            catalog: null,
            editCatalog: {},
            loading: true,
            loadMorePrescriptions: null,
        }
        this.loadData = this.loadData.bind(this);
        this.deleteObject = this.deleteObject.bind(this);
        this.loadInitialData = this.loadInitialData.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        const that = this;
        const successFn = function (data) {
            console.log("get table");
            that.setState({
                catalog: data.results,
                loadMorePrescriptions: data.next,
                loading: false
            })
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        const reqParams = {
            practice: this.props.active_practiceId,
            item_type: DRUG,
            // maintain_inventory: false,
            sort: "asc",
            on: "name",
            page: that.state.loadMorePrescriptions || 1
        }
        if (that.state.filterItemName) {
            reqParams.item_name = that.state.filterItemName;
        }
        getAPI(INVENTORY_ITEM_API, successFn, errorFn, reqParams);
    }

    loadInitialData() {
        const that = this;
        this.setState({
            loadMorePrescriptions: null
        }, function () {
            that.loadData();
        })
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
        putAPI(interpolate(SINGLE_INVENTORY_ITEM_API, [record.id]), reqData, successFn, errorFn);
    }

    editCatalog(record) {
        this.setState({
            editCatalog: record,
            loading: false
        });
        this.props.history.push('/erp/settings/prescriptions/edit')
    }

    changeInventoryFilters = (key, value) => {
        const that = this;
        that.setState(
            {
                [key]: value,
            },
            function () {
                that.loadData();
            },
        );
    };

    render() {
        const that = this;
        const columns = [{
            title: 'Name',
            dataIndex: 'name',
            key: 'code',
        }, {
            title: 'Strength',
            dataIndex: 'strength',
            key: 'strength',
            render: (strength, record) =>
                <span>{strength}&nbsp;{record.strength_type_data ? record.strength_type_data.name : null}</span>
        }, {
            title: 'Medicine Instructions',
            dataIndex: 'instructions',
            key: 'instructions',
        }, {
            title: 'Inventory Managed',
            dataIndex: 'maintain_inventory',
            key: 'maintain_inventory',
            render: (item) => <span>{item ? "YES" : "NO"}</span>
        }, {
            title: 'Details',
            dataIndex: 'package_details',
            key: 'package_details',
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={() => this.editCatalog(record)}>
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
        }];
        return (
            <Row>
                <Switch>
                    <Route
                      exact
                      path="/erp/settings/prescriptions/add"
                      render={() => (
                            <AddorEditPrescriptionForm
                              {...this.props}
                              loadData={this.loadInitialData}
                              title="Add Prescription"
                            />
                        )}
                    />
                    <Route
                      exact
                      path="/erp/settings/prescriptions/edit"
                      render={(route) => (this.state.editCatalog.id ? (
                                <AddorEditPrescriptionForm
                                  {...this.state}
                                  title="Edit Prescription"
                                  loadData={this.loadInitialData}
                                  {...this.props}
                                  {...route}
                                />
                            ) :
                            <Redirect to="/erp/settings/prescriptions/" />)}
                    />
                    <Route>
                        <div>
                            <h2>All presciptions
                                <Link to="/erp/settings/prescriptions/add">
                                    <Button type="primary" style={{float: 'right'}}>
                                        <Icon type="plus" />&nbsp;Add
                                    </Button>
                                </Link>
                            </h2>

                            <Card>
                                <Row style={{marginBottom: 10}}>
                                    <Col span={4} style={{textAlign: 'right'}}>
                                        <b> Search Name:&nbsp;</b>
                                    </Col>
                                    <Col span={4}>
                                        <Input
                                          style={{width: '100%'}}
                                          value={this.state.filterItemName}
                                          allowClear
                                            // disabled={this.state.loading}
                                          placeholder="Item Name"
                                          onChange={e =>
                                                this.changeInventoryFilters(
                                                    'filterItemName',
                                                    e.target.value,
                                                )}
                                        />
                                    </Col>
                                </Row>
                                <Table
                                  loading={this.state.loading}
                                  columns={columns}
                                  dataSource={this.state.catalog}
                                  pagination={false}
                                  hideReport
                                />
                            </Card>
                            <InfiniteFeedLoaderButton
                              loaderFunction={this.loadData}
                              loading={this.state.loading}
                              hidden={!this.state.loadMorePrescriptions}
                            />
                        </div>
                    </Route>
                </Switch>
            </Row>
        )
    }
}

export default Prescriptions;
