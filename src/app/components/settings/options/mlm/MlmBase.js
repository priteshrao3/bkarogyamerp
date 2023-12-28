
import React from "react";
import {Button, Card, Icon, Table, Tabs, Row, Popconfirm,Collapse} from "antd";
import {Link, Route, Switch} from "react-router-dom";
import {getAPI, interpolate, postAPI, patchAPI, deleteAPI, putAPI} from "../../../../utils/common";
import MLMGenerate from "./MLMGenerate"
import {
    PRODUCT_MARGIN,
    ROLE_COMMISION,
    SINGLE_PRODUCT_MARGIN,
    AGENT_ROLES,
    GENERATE_MLM_COMMISSON
} from "../../../../constants/api";

const {TabPane} = Tabs;
const {Panel} = Collapse;
export default class MlmBase extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mlmItems: [],
            productMargin: [],
            active_practiceId: this.props.active_practiceId,
            loading: true
        };
        this.loadMlmData = this.loadMlmData.bind(this);
        this.deleteObject = this.deleteObject.bind(this);
        this.loadRoles = this.loadRoles.bind(this);
        this.loadData = this.loadData.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        this.loadMlmData();
        this.loadRoles();
        this.loadProductMargin();
    }

    loadMlmData() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                mlmItems: data,
                loading: false
            })
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })

        };
        getAPI(GENERATE_MLM_COMMISSON, successFn, errorFn);
    }

    loadRoles() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                staffRoles: data,
                loading: false
            })
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        getAPI(AGENT_ROLES, successFn, errorFn);
    }

    loadProductMargin() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                productMargin: data
            })
        };
        const errorFn = function () {

        };
        getAPI(PRODUCT_MARGIN, successFn, errorFn);
    }

    editObject(id, record) {
        this.setState({
            editId: id,
            editRecord: record,
            loading: false
        }, function () {
            this.props.history.push('/erp/settings/mlm/edit');
        })
    }

    deleteObject(record) {
        const that = this;
        const reqData = {...record, is_active: false};
        reqData.is_active = false;
        const successFn = function (data) {
            that.loadData();
        };
        const errorFn = function () {
        };
        putAPI(interpolate(SINGLE_PRODUCT_MARGIN, [record.id]), reqData, successFn, errorFn);
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    render() {
        const that = this;
        const rolesdata = {}
        if (this.state.staffRoles) {
            this.state.staffRoles.forEach(function (role) {
                rolesdata[role.id] = role.name;
            })
        }
        const columns = {};

        that.state.productMargin.forEach(function (productMargin) {
            columns[productMargin.id] = [{
                title: 'Role',
                key: 'role',
                dataIndex: 'role',
            }];
            for (let level = 1; level <= productMargin.level_count; level++) {
                columns[productMargin.id].push({
                    title: `Level ${  level}`,
                    key: level,
                    dataIndex: level,
                    render: (value) => <span>{value}%</span>
                })
            }
        })


        const datasource = {};

        that.state.mlmItems.forEach(function (productMargin) {
            datasource[productMargin.id] = [];

            if (that.state.staffRoles) {
                that.state.staffRoles.forEach(function (role) {
                    const roledata = {"role": role.name, roleId: role.id};
                    if (productMargin.level_count) {
                        for (let level = 1; level <= productMargin.level_count; level++) {
                            if (productMargin.comissions) {
                                for (let i = 0; i < productMargin.comissions.length; i++) {
                                    const item = productMargin.comissions[i];
                                    if (item.margin == productMargin.id && item.level == level && role.id == item.role) {
                                        roledata[level] = item.commision_percent;
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    datasource[productMargin.id].push(roledata);
                })
            }
        });
        return (
<div>
            <Switch>
                <Route
                  exact
                  path="/erp/settings/mlm/generate"
                  render={(route) => (
<MLMGenerate
  {...route}
  loadData={this.loadData}
/>
)}
                />
                {this.state.editId && this.state.editRecord ? (
                    <Route
                      exact
                      path="/erp/settings/mlm/edit"
                      render={(route) => (
<MLMGenerate
  {...route}
  key={this.state.editId}
  loadData={this.loadData}
  {...this.state}
/>
)}
                    />
                  ) : null}
                <Route>
                    <div>
                        <h2>MLM Commissions
                            <Link to="/erp/settings/mlm/generate">
                                <Button type="primary" style={{float: 'right'}}>
                                    <Icon type="plus" />&nbsp;Add
                                </Button>
                            </Link>
                        </h2>
                        <Card>
                            {this.state.productMargin ? (
<Collapse defaultActiveKey={['0']} accordion>
                                {this.state.productMargin.map((marginType, index) => (
                                    <Panel
                                      header={marginType.name}
                                      key={index}
                                      extra={[<Button.Group size="small">
                                               <Button
                                                 type="primary"
                                                 onClick={() => this.editObject(marginType.id, datasource[marginType.id])}
                                               ><Icon
                                                 type="edit"
                                               /> Edit
                                               </Button>

                                               <Popconfirm
                                                 title="Are you sure delete this item?"
                                                 onConfirm={() => that.deleteObject(marginType)}
                                                 okText="Yes"
                                                 cancelText="No"
                                               >
                                                   <Button type="danger"><Icon type="delete" /> Delete</Button>
                                               </Popconfirm>
                                              </Button.Group>]}
                                    >
                                        <Table
                                          loading={this.state.loading}
                                          pagination={false}
                                          style={{marginTop: 10}}
                                          dataSource={datasource[marginType.id]}
                                          rowKey="role"
                                          columns={columns[marginType.id]}
                                          bordered
                                        />
                                    </Panel>
                                  ))}
</Collapse>
) : <h4>No MLM Data</h4>}


                            {/* {this.state.productMargin ?
                                <Tabs type="card">
                                    {this.state.productMargin.map(marginType =>
                                        <TabPane tab={marginType.name} key={marginType.id}>
                                            <Row>
                                                <br/>
                                                <h2>
                                                    {marginType.name}
                                                    <Button.Group style={{float: 'right'}}>
                                                        <Button type="primary"
                                                                onClick={() => this.editObject(marginType.id, datasource[marginType.id])}><Icon
                                                            type="edit"/> Edit</Button>
                                                        <Popconfirm title="Are you sure delete this item?"
                                                                    onConfirm={() => that.deleteObject(marginType)} okText="Yes" cancelText="No">
                                                            <Button type="danger"><Icon type="delete"/> Delete</Button>
                                                        </Popconfirm>

                                                    </Button.Group>
                                                </h2>
                                            </Row>
                                            <Table loading={this.state.loading} pagination={false}
                                                   style={{marginTop: 10}}
                                                   dataSource={datasource[marginType.id]}
                                                   rowKey="role"
                                                   columns={columns[marginType.id]}
                                                   bordered/>
                                        </TabPane>)}
                                </Tabs> : <h4>No MLM Data</h4>} */}

                        </Card>
                    </div>
                </Route>
            </Switch>

</div>
)
    }
}
