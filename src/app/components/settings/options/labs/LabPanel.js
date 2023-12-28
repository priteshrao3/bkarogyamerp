import React from "react";
import {Button, Card, Divider, Form, Icon, Popconfirm, Row, Table} from "antd";
import {Link, Route, Switch} from "react-router-dom";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {CHECKBOX_FIELD, INPUT_FIELD, RADIO_FIELD, SELECT_FIELD} from "../../../../constants/dataKeys";
import {LABPANEL_API} from "../../../../constants/api";
import {getAPI, postAPI, interpolate,} from "../../../../utils/common";
import AddorEditLabPanel from "./AddorEditLabPanel";
import CustomizedTable from "../../../common/CustomizedTable";

export default class LabPanel extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            labPanel:null,
            editTest:null,
            selectedTest:{},
        }
        this.loadLabPanel = this.loadLabPanel.bind(this);
        this.editPanels = this.editPanels.bind(this);
    }

    componentDidMount() {
        this.loadLabPanel();
    }

    loadLabPanel(){
        const that =this;
        const successFn=function(data){
            that.setState({
                labPanel:data,
                loading:false
            })
        };
        const errorFn = function(){
            that.setState({

            })
        };
        getAPI(interpolate(LABPANEL_API, [that.props.active_practiceId]), successFn, errorFn);
    }

    editPanels(record) {
        const that = this;
        this.setState({
            editTest: record,
            loading: false
        }, function () {
            that.props.history.push('/erp/settings/labs/edit');
        })


    }

    deleteLabPanel(record) {
        const that = this;
        const reqData = {...record, is_active:false,
            tests:Object.keys(this.state.selectedTest)
        }
        const successFn = function (data) {
            that.loadLabPanel();
        }
        const errorFn = function () {
        }
        postAPI(interpolate(LABPANEL_API, [this.props.active_practiceId]), reqData, successFn, errorFn);
    }

    render() {
        const that = this;
        const product_margin = {}
        if (this.state.productMargin) {
            this.state.productMargin.forEach(function (margin) {
                product_margin[margin.id] = (margin.name)
            })
        }
        const columns = [{
            title: 'Name',
            dataIndex: 'name',
            key: 'code',
        }, {
            title: 'Cost',
            dataIndex: 'cost',
            key: 'cost',
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span><a onClick={() => that.editPanels(record)}>
                Edit
                      </a>
                <Divider type="vertical" />
                    <Popconfirm
                      title="Are you sure delete this test?"
                      onConfirm={() => that.deleteLabPanel(record)}
                      okText="Yes"
                      cancelText="No"
                    >
                        <a>Delete</a>
                    </Popconfirm>
                </span>
            ),
        }];

        const subColumns =[{
            title: 'Name',
            dataIndex: 'name',
            key: 'code',
        }, {
            title: 'Cost',
            dataIndex: 'cost',
            key: 'cost',
        }, {
            title: ' Test Instructions',
            dataIndex: 'instruction',
            key: 'instruction',
        }];
        return (
<Row>
            <Route
              exact
              path="/erp/settings/labs/add"
              render={(route) => (
<AddorEditLabPanel
  {...that.state}
  loadData={this.loadData}
  {...this.props}
  {...route}
/>
)}
            />
            <Route
              exact
              path="/erp/settings/labs/edit"
              render={(route) => (
<AddorEditLabPanel
  {...that.state}
  loadData={this.loadData}
  {...this.props}
  {...route}
/>
)}
            />
            <Route exact path="/erp/settings/labs">
                <div>
                    <Row>
                        <h2>
                            <Link to="/erp/settings/labs/add">
                                <Button type="primary" style={{float: 'right'}}>
                                    <Icon type="plus" />&nbsp;Add
                                </Button>
                            </Link>
                        </h2>
                    </Row>
                    <CustomizedTable loading={this.state.loading} columns={columns} expandedRowRender={record => <Card><Table pagination={false} columns={subColumns} dataSource={record.tests} /></Card>} dataSource={this.state.labPanel} />
                </div>
            </Route>

</Row>
)
    }
}

