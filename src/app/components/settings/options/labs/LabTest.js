import React from "react";
import {Button, Card, Divider, Form, Icon, Popconfirm, Row, Table} from "antd";
import {Link, Route, Switch} from "react-router-dom";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {CHECKBOX_FIELD, INPUT_FIELD, RADIO_FIELD, SELECT_FIELD} from "../../../../constants/dataKeys";
import {LABTEST_API, OFFERS, PRODUCT_MARGIN} from "../../../../constants/api";
import {getAPI, deleteAPI, interpolate, postAPI} from "../../../../utils/common";
import AddorEditLab from "./AddorEditLab";
import CustomizedTable from "../../../common/CustomizedTable";
import InfiniteFeedLoaderButton from "../../../common/InfiniteFeedLoaderButton";

class LabTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tests: null,
            editTest: null,
            loading: true,
            productMargin: null
        };
        this.editLabs = this.editLabs.bind(this);
        this.loadData = this.loadData.bind(this);
        this.deleteTest = this.deleteTest.bind(this);
        this.loadProductMargin = this.loadProductMargin.bind(this);
    }

    componentDidMount() {
        this.loadData();
        this.loadProductMargin();
    }

    loadData(page=1) {
        const that = this;
        const successFn = function (data) {
            console.log("get table");
            if(data.current)
            that.setState({
                next:data.next,
                tests: data.results,
                loading: false
            })
            else{
                that.setState(function(prevState){return {
                    next: data.next,
                    tests: [...prevState.tests,...data.results],
                    loading: false
                }})
            }
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        getAPI(interpolate(LABTEST_API, [that.props.active_practiceId]), successFn, errorFn);
    }

    editLabs(record) {
        const that = this;
        this.setState({
            editTest: record,
            loading: false
        }, function () {
            that.props.history.push('/erp/settings/labs/edit');
        })


    }

    deleteTest(record) {
        const that = this;
        const reqData = record;
        reqData.is_active = false;
        const successFn = function (data) {
            that.loadData();
        }
        const errorFn = function () {
        }
        postAPI(interpolate(LABTEST_API, [this.props.active_practiceId]), reqData, successFn, errorFn);
    }

    loadProductMargin() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                productMargin: data
            })
        }
        const errorFn = function () {

        }
        getAPI(PRODUCT_MARGIN, successFn, errorFn);
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
            title: ' Test Instructions',
            dataIndex: 'instruction',
            key: 'instruction',
        }, {
            title: ' MLM Margin',
            key: 'margin',
            render: (text, record) => (
                <span> {product_margin[record.margin]}</span>
            )
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span><a onClick={() => that.editLabs(record)}>
                Edit
                      </a>
                <Divider type="vertical" />
                    <Popconfirm
                      title="Are you sure delete this test?"
                      onConfirm={() => that.deleteTest(record)}
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
            <Route
              exact
              path="/erp/settings/labs/add"
              render={(route) => (
<AddorEditLab
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
<AddorEditLab
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
                    <CustomizedTable columns={columns} dataSource={this.state.tests} pagination={false} />
                    <InfiniteFeedLoaderButton loading={this.state.loading} hidden={!this.state.next} loaderFunction={()=>this.loadData(this.state.next)} />
                </div>
            </Route>

</Row>
)
    }
}

export default LabTest;
