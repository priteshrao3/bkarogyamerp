import { Button, Card, Divider, Icon, Popconfirm, Table } from 'antd';
import React from 'react';
import { Route, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import { getAPI, interpolate, patchAPI } from '../../../../utils/common';
import { BLOG_DISEASE, CONVERSION_DISEASE_CATEGORY, SINGLE_DISEASE } from '../../../../constants/api';
import AddDiseaseCategory from './AddDiseaseCategory';
import InfiniteFeedLoaderButton from '../../../common/InfiniteFeedLoaderButton';

export default class DiseaseCategory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            disease: [],
            loading: true,
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

                return {
                    disease: data,
                    loading: false,
                };
            });
        };
        const errorFn = function() {
            that.setState({
                loading: false,
            });

        };
        const apiParams = {
            page,
        };

        getAPI(CONVERSION_DISEASE_CATEGORY, successFn, errorFn, apiParams);
    };

    deleteObject(record) {
        const that = this;
        const reqData = {};
        reqData.is_active = false;
        const successFn = function(data) {
            that.loadDiseases();
        };
        const errorFn = function() {
        };
        patchAPI(interpolate(SINGLE_DISEASE, [record.id]), reqData, successFn, errorFn);
    }

    render() {
        const that = this;
        const columns = [{
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
        }, {
            title: 'Domain',
            dataIndex: 'domain',
            key: 'domain',
        }, {
            title: 'Actions',
            render: (item) => {
                return (
                    <div>
                        <Link to={`/web/disease/edit/${item.id}`}>Edit</Link>
                        <Divider type="vertical"/>
                        <Popconfirm
                            title="Are you sure delete this item?"
                            onConfirm={() => that.deleteObject(item)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <a>Delete</a>
                        </Popconfirm>
                    </div>
                );
            },
        }];
        return (
            <div>
                <Switch>
                    <Route
                        exact
                        path='/web/disease/add'
                        render={(route) => <AddDiseaseCategory {...this.state} {...route} loadData={this.loadDiseases}/>}
                    />
                    <Route
                        exact
                        path='/web/disease/edit/:id'
                        render={(route) => <AddDiseaseCategory {...this.state} {...route} loadData={this.loadDiseases}/>}
                    />
                    <Card
                        title="Disease Category"
                        extra={<Link to="/web/disease/add"> <Button type="primary"><Icon
                            type="plus"/> Add</Button></Link>}
                    >
                        <Table loading={this.state.loading} pagination={false} columns={columns}
                               dataSource={this.state.disease}/>

                    </Card>
                </Switch>
            </div>
        );
    }
}
