import React from "react";
import {Button, Card, Icon, Tabs, Divider, Tag, Row, Table, Popconfirm, Input} from "antd";
import {Route, Link, Switch} from "react-router-dom";
import {Redirect} from "react-router";
import {PROCEDURE_CATEGORY} from "../../../../constants/api"
import {getAPI, interpolate, postAPI} from "../../../../utils/common";
import EditProcedure from "./EditProcedure";
import PermissionDenied from "../../../common/errors/PermissionDenied";
import CustomizedTable from "../../../common/CustomizedTable";
import AddProcedure from "./AddProcedure";
import AddorEditProcedure from "./AddorEditProcedure";
import InfiniteFeedLoaderButton from "../../../common/InfiniteFeedLoaderButton";


const {Column, ColumnGroup} = Table;
const {TabPane} = Tabs;

class RecentProcedure extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 'staff',
            procedure_category: null,
            editingProcedureData: null,
            loading: true
        };
        this.loadProcedures = this.loadProcedures.bind(this);
    }

    componentDidMount() {
        this.loadProcedures();
    }

    loadProcedures(page = 1) {
        const that = this;
        const params = {
            page
        }
        if (this.state.searchString) {
            params.name = this.state.searchString
        }
        const successFn = function (data) {
            if (data.current == 1 && that.state.searchString == params.name)
                that.setState({
                    procedure_category: data.results,
                    next: data.next,
                    loading: false
                })
            else
                that.setState(function (prevState) {
                    return {
                        procedure_category: [...prevState.procedure_category, ...data.results],
                        next: data.next,
                        loading: false
                    }
                })
        };
        const errorFn = function () {
        };

        getAPI(interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId]), successFn, errorFn, params);
    }


    handleClick = (e) => {
        this.setState({
            current: e.key,
        });
    }

    deleteObject(record) {
        const that = this;
        const reqData = {
            id: record.id,
            is_active: false
        };
        reqData.is_active = false;
        const successFn = function (data) {
            that.loadProcedures();
        }
        const errorFn = function () {
        };
        postAPI(interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId]), reqData, successFn, errorFn)
    }

    editProcedure(record) {
        this.setState({
            editingProcedureData: record,
            loading: false
        });
        const url = `/erp/settings/procedures/${  record.id  }/editprocedure`;
        this.props.history.push(url);

    }

    changeSearchValue = (value) => {
        this.setState({
            searchString: value
        }, function () {
            this.loadProcedures();
        })
    }

    render() {
        const that = this;
        const columns = [{
            title: "Procedure Name",
            dataIndex: "name",
            key: "name",
        }, {
            title: "Procedure Unit Cost",
            dataIndex: "cost_with_tax",
            key: "cost"
        }, {
            title: "MLM Margin",
            dataIndex: "margin",
            key: "margin",
            render: (taxes) => (
                <span>{taxes ? taxes.name : null}
                </span>
)
        }, {
            title: "Applicable Taxes",
            dataIndex: "taxes",
            key: "taxes",
            render: (taxes) => (
                <span>
                                    {taxes && taxes.length ? taxes.map(tax =>
                                        <Tag> {tax.name}|<b>{tax.tax_value}%</b></Tag>) : null}
                </span>
            )
        }, {
            title: "Standard Notes",
            dataIndex: "default_notes",
            key: "default_notes"
        }, {
            title: "Action",
            key: "action",
            render: (text, record) => (
                <span>
                    <Link
                      to={`/erp/settings/procedures/addprocedure?under=${  record.id}`}
                      disabled={record.under}
                    >Add SubCategory
                    </Link>
                        <Divider type="vertical" />
                        <a onClick={() => this.editProcedure(record)}>Edit</a>
                        <Divider type="vertical" />
                        <Popconfirm
                          title="Are you sure delete this?"
                          onConfirm={() => that.deleteObject(record)}
                          okText="Yes"
                          cancelText="No"
                        >
                        <a>Delete</a>
                        </Popconfirm>
                </span>
)
        }];
        return (
<Switch>
            <Route
              path="/erp/settings/procedures/addprocedure"
              render={(route) => (this.props.activePracticePermissions.SettingsProcedureCatalog || this.props.allowAllPermissions ?
                           <AddorEditProcedure {...this.props} {...route} loadData={this.loadProcedures} /> :
                           <PermissionDenied />
                   )}
            />
            <Route
              exact
              path="/erp/settings/procedures/:id/editprocedure"
              render={(route) => (that.props.activePracticePermissions.SettingsProcedureCatalog || that.props.allowAllPermissions ?
                           (that.state.editingProcedureData ? (
                               <AddorEditProcedure
                                 {...this.state}
                                 {...this.props}
                                 {...route}
                                 loadData={this.loadProcedures}
                               />
                             ) :
                               <Redirect to="/erp/settings/procedures" />) : <PermissionDenied />
                   )}
            />
            <Route>
                <Row>
                    <h2>Procedures Catalog
                        <Link to="/erp/settings/procedures/addprocedure">
                            <Button type="primary" style={{float: 'right'}}>
                                <Icon type="plus" />&nbsp;Add Procedure
                            </Button>
                        </Link>
                    </h2>
                    <Card>
                        <div className="row mar-b-10">
                            <div className="col-md-12">
                                <Input
                                  onChange={(e) => this.changeSearchValue(e.target.value)}
                                  value={this.state.searchString}
                                  style={{width: 200}}
                                  placeholder="Search Procedure..."
                                />
                            </div>
                        </div>
                        <Table
                          columns={columns}
                          pagination={false}
                          dataSource={this.state.procedure_category}
                        />
                        <InfiniteFeedLoaderButton
                          loading={this.state.loading}
                          hidden={!this.state.next}
                          loaderFunction={() => this.loadProcedures(this.state.next)}
                        />

                    </Card>
                </Row>
            </Route>
</Switch>
)
    }
}

export default RecentProcedure;
