import { Button, Col, Divider, Icon, Popconfirm, Row, Table } from "antd";
import React from "react";
import { Route, Switch } from "react-router";
import { Link } from "react-router-dom";
import { getAPI, interpolate, putAPI } from "../../../../utils/common";
import {
    BLOG_DISEASE,
    SINGLE_DISEASE
} from "../../../../constants/api";
import AddDiseaseDetails from "./AddDiseaseDetails";
import InfiniteFeedLoaderButton from "../../../common/InfiniteFeedLoaderButton";

export default class DetailedDisease extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            disease: [],
            loading: true,
            diseaseCategory: [],
            symptoms: []
        };
        this.loadDiseases = this.loadDiseases.bind(this);
        this.deleteObject = this.deleteObject.bind(this);
    }

    componentDidMount() {
        this.loadDiseases();
    }

    loadDiseases = (page = 1) => {
        const that = this;
        const successFn = function(data) {
            that.setState(function(prevState) {
                if (data.current == 1) {
                    return {
                        disease: [...data.results],
                        next: data.next,
                        loading: false
                    };
                }
                return {
                    disease: [...prevState.disease, ...data.results],
                    next: data.next,
                    loading: false
                };
            });
        };
        const errorFn = function() {
            that.setState({
                loading: false
            });

        };
        const apiParams = {
            page
        };

        getAPI(BLOG_DISEASE, successFn, errorFn, apiParams);
    };

    deleteObject(record) {
        const that = this;
        const reqData = { ...record, is_active: false };

        const successFn = function(data) {
            that.loadDiseases();
        };
        const errorFn = function() {
        };
        putAPI(interpolate(SINGLE_DISEASE, [record.id]), reqData, successFn, errorFn);
    }

    handleCancel = () => {
        this.setState({ visible: false });
    };

    render() {
        const that = this;
        const columns = [{
            title: "Disease Name",
            dataIndex: "disease_detail.name",
            key: "disease_detail"
        }, {
            title: "Domain",
            dataIndex: "domain",
            key: "domain"
        }, {
            title: "Actions",
            render: (item, record) => {
                return (
                    <div>
                        <Link to={`/web/disease/edit-disease/${item.id}`}>Edit</Link>
                        <Divider type="vertical"/>
                        <Popconfirm
                            title="Are you sure delete this item?"
                            onConfirm={() => that.deleteObject(item)}
                            okText="Yes"
                            cancelText="No">
                            <a>Delete</a>
                        </Popconfirm>
                    </div>
                );
            }
        }];


        return (
            <div>
                <Switch>
                    <Route
                        exact
                        path='/web/disease/add-disease'
                        render={(route) => <AddDiseaseDetails {...this.state} {...route} loadData={this.loadDiseases}/>}
                    />
                    <Route
                        exact
                        path='/web/disease/edit-disease/:id'
                        render={(route) => <AddDiseaseDetails {...this.state} {...route} loadData={this.loadDiseases}/>}
                    />
                    <Route>
                        <Row>
                            <Col span={24}>
                                <Link to="/web/disease/add-disease">
                                    <Button type="primary" style={{ margin: 10, float: "right" }}>
                                        <Icon type="plus"/> Add
                                    </Button>
                                </Link>
                            </Col>
                            <Col span={24}>
                                <Table loading={this.state.loading} pagination={false} columns={columns}
                                       dataSource={this.state.disease}/>
                                <InfiniteFeedLoaderButton
                                    loaderFunction={() => this.loadDiseases(this.state.next)}
                                    loading={this.state.loading}
                                    hidden={!this.state.next}
                                />
                            </Col>
                        </Row>
                    </Route>
                </Switch>
            </div>
        );
    }
}
