import { Button, Card, Divider, Form, Icon, Modal, Popconfirm, Table, Tag } from 'antd';
import React from 'react';
import _get from 'lodash/get';
import { Route, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import { displayMessage, getAPI, interpolate, patchAPI, postAPI } from '../../../../utils/common';
import {
    BLOG_DISEASE,
    CONVERSION_DISEASE_API,
    CONVERSION_DISEASE_CATEGORY, CONVERSION_SYMPTOM_API,
    DISEASE_LIST,
    SINGLE_DISEASE,
    TAXES,
} from '../../../../constants/api';
import AddDiseaseCategory from './AddDiseaseCategory';
import InfiniteFeedLoaderButton from '../../../common/InfiniteFeedLoaderButton';
import DynamicFieldsForm from '../../../common/DynamicFieldsForm';
import {
    INPUT_FIELD,
    MULTI_SELECT_FIELD,
    NUMBER_FIELD,
    SELECT_FIELD,
    SUCCESS_MSG_TYPE,
} from '../../../../constants/dataKeys';

export default class DiseaseList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            disease: [],
            loading: true,
            diseaseCategory: [],
            symptoms: [],
        };
        this.loadDiseases = this.loadDiseases.bind(this);
        this.deleteObject = this.deleteObject.bind(this);
    }

    componentDidMount() {
        this.loadDiseases();
        this.loadDiseasesCategory();
        this.loadSymptoms();
    }

    loadDiseasesCategory = (page = 1) => {
        const that = this;
        const successFn = function(data) {
            that.setState(function(prevState) {

                return {
                    diseaseCategory: data,
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
    loadSymptoms = (page = 1) => {
        const that = this;
        const successFn = function(data) {
            that.setState(function(prevState) {

                return {
                    symptoms: data,
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

        getAPI(CONVERSION_SYMPTOM_API, successFn, errorFn, apiParams);
    };
    loadDiseases = (page = 1) => {
        const that = this;
        const successFn = function(data) {
            that.setState(function(prevState) {
                return {
                    disease: [...data],
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

        getAPI(CONVERSION_DISEASE_API, successFn, errorFn, apiParams);
    };

    deleteObject(record) {
        const that = this;
        const reqData = { ...record, is_active: false };

        const successFn = function(data) {
            that.loadDiseases();
        };
        const errorFn = function() {
        };
        postAPI(CONVERSION_DISEASE_API, reqData, successFn, errorFn);
    }

    editDisease(value) {
        this.setState({
            editingId: value.id,
            editingValues: value,
            visible: true,
        });
    }

    handleCancel = () => {
        this.setState({ visible: false });
    };

    render() {
        const that = this;
        const columns = [{
            title: 'Disease Name',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (value, record) => <span>{_get(value, 'category')}</span>     ,
        }, {
            title: 'Symptpoms',
            dataIndex: 'symptoms',
            key: 'symptoms',
            render: (value, record) => <span>{value.map(item => <Tag>{_get(item, 'name')}</Tag>)}</span>
        }, {
            title: 'Actions',
            render: (item, record) => {
                return (
                    <div>
                        <a onClick={() => this.editDisease(record)}>Edit</a>
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
            },
        }];
        const fields = [{
            label: 'Disease Name',
            key: 'name',
            placeholder: 'Disease Name',
            required: true,
            type: INPUT_FIELD,
        }, {
            label: 'Disease Category',
            key: 'category',
            required: true,
            type: SELECT_FIELD,
            options: this.state.diseaseCategory.map(item => {
                return { label: item.category, value: item.id };
            }),
        }, {
            label: 'Disease Symptoms',
            key: 'symptoms',
            required: true,
            type: MULTI_SELECT_FIELD,
            options: this.state.symptoms.map(item => {
                return { label: item.name, value: item.id };
            }),
        }];
        const editfields = [{
            label: 'Disease Name',
            key: 'name',
            placeholder: 'Disease Name',
            initialValue: this.state.editingValues ? this.state.editingValues.name : null,
            required: true,
            type: INPUT_FIELD,
        }, {
            label: 'Disease Category',
            key: 'category',
            initialValue: this.state.editingValues && this.state.editingValues.category? this.state.editingValues.category.id : null,
            required: true,
            type: SELECT_FIELD,
            options: this.state.diseaseCategory.map(item => {
                return { label: item.category, value: item.id };
            }),
        }, {
            label: 'Disease Symptoms',
            key: 'symptoms',
            required: true,
            initialValue: this.state.editingValues && this.state.editingValues.symptoms ? this.state.editingValues.symptoms.map(item=>item.id) : null,
            type: MULTI_SELECT_FIELD,
            options: this.state.symptoms.map(item => {
                return { label: item.name, value: item.id };
            }),
        }];
        const formProp = {
            successFn(data) {
                that.handleCancel();
                that.loadDiseases();
                displayMessage(SUCCESS_MSG_TYPE, 'success');
            },
            errorFn() {

            },
            action: CONVERSION_DISEASE_API,
            method: 'post',
        };
        const defaultValues = [];
        const editFormDefaultValues = [{
            'key': 'id',
            'value': this.state.editingId,
        }];
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        return (
            <div>
                <TestFormLayout defaultValues={defaultValues} formProp={formProp} fields={fields} {...this.props} />
                <Divider/>
                <Table loading={this.state.loading} pagination={false} columns={columns}
                       dataSource={this.state.disease}/>

                <Modal
                    title="Edit Disease"
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                >
                    <TestFormLayout defaultValues={editFormDefaultValues} formProp={formProp} fields={editfields}/>
                    <Button key="back" onClick={this.handleCancel}>Return</Button>,
                </Modal>
            </div>
        );
    }
}
