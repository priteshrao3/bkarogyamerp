import { Card, Form, Row } from 'antd';
import React from 'react';
import { Route } from 'react-router';
import { Redirect } from 'react-router-dom';
import {
    SINGLE_IMAGE_UPLOAD_FIELD,
    INPUT_FIELD,
    QUILL_TEXT_FIELD,
    SELECT_FIELD,
    SUCCESS_MSG_TYPE,
    TEXT_FIELD, MULTI_IMAGE_UPLOAD_FIELD, DATE_PICKER,
} from '../../../../constants/dataKeys';
import DynamicFieldsForm from '../../../common/DynamicFieldsForm';
import { displayMessage, getAPI, interpolate } from '../../../../utils/common';
import { BLOG_DISEASE, CONVERSION_DISEASE_CATEGORY, SINGLE_DISEASE } from '../../../../constants/api';
import { DISEASE_TYPES } from '../../../../constants/hardData';
import moment from 'moment';


export default class AddDiseaseCategory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editBlogData: this.props.editBlogData ? this.props.editBlogData : null,
        };
    }

    componentDidMount() {
        if (this.props.match.params.id) {
            if (!this.state.editBlogData) {
                this.loadData();
            }
        }
    }

    changeRedirect = () => {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    };

    loadData() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                editBlogData: data[0],
            });
        };
        const errorFn = function() {

        };
        let apiParams = {
            id: this.props.match.params.id,
        };
        getAPI(CONVERSION_DISEASE_CATEGORY, successFn, errorFn, apiParams);


    }


    render() {
        const that = this;
        const fields = [{
            label: 'Disease Category',
            key: 'category',
            initialValue: this.state.editBlogData ? this.state.editBlogData.category : null,
            type: INPUT_FIELD,
            required: true,
            // options: DISEASE_TYPES,
        }, {
            label: 'Domain URL',
            key: 'domain',
            initialValue: this.state.editBlogData ? this.state.editBlogData.domain : null,
            type: INPUT_FIELD,
            required: true,
        }, {
            label: 'SEO Keywords',
            key: 'keywords',
            initialValue: this.state.editBlogData ? this.state.editBlogData.keywords : null,
            type: INPUT_FIELD,
        }, {
            label: 'SEO Description',
            key: 'meta_description',
            initialValue: this.state.editBlogData ? this.state.editBlogData.meta_description : null,
            type: TEXT_FIELD,
        }, {
            label: 'Main Image',
            key: 'main_image',
            initialValue: this.state.editBlogData ? this.state.editBlogData.main_image : null,
            type: SINGLE_IMAGE_UPLOAD_FIELD,
            required: true,
        }, {
            label: 'Posted On',
            key: 'posted_on',
            initialValue: this.state.editBlogData && this.state.editBlogData.posted_on ? moment(this.state.editBlogData.posted_on) : moment(),
            type: DATE_PICKER,
        }, {
            label: 'Content',
            key: 'content',
            initialValue: this.state.editBlogData ? this.state.editBlogData.content : ' ',
            type: QUILL_TEXT_FIELD,
        }, {
            label: 'Treatment',
            key: 'treatment',
            initialValue: this.state.editBlogData ? this.state.editBlogData.treatment : ' ',
            type: QUILL_TEXT_FIELD,
        }];


        let editformProp;
        if (this.state.editBlogData) {
            editformProp = {
                successFn(data) {
                    displayMessage(SUCCESS_MSG_TYPE, 'success');
                    that.setState({
                        redirect: true,
                    });
                    that.props.loadData();
                    if (that.props.history) {
                        that.props.history.replace('/web/disease');
                    }
                },
                errorFn() {

                },
                action: CONVERSION_DISEASE_CATEGORY,
                method: 'post',

            };
        }
        const TestFormLayout = Form.create()(DynamicFieldsForm);

        const formProp = {
            successFn(data) {
                displayMessage(SUCCESS_MSG_TYPE, 'success');
                that.setState({
                    redirect: true,
                });
                that.props.loadData();
                if (that.props.history) {
                    that.props.history.replace('/web/disease');
                }
            },
            errorFn() {

            },
            action: CONVERSION_DISEASE_CATEGORY,
            method: 'post',
        };
        const defaultValues = [{ key: 'id', value: this.state.editBlogData ? this.state.editBlogData.id : null }];

        return (
            <Row>
                <Route
                    exact
                    path='/web/disease/edit/:id'
                    render={() => (this.props.match.params.id ? (
                        <TestFormLayout
                            defaultValues={defaultValues}
                            title="Edit Disease Category"
                            changeRedirect={this.changeRedirect}
                            formProp={editformProp}
                            fields={fields}
                        />
                    ) : <Redirect to="/web/disease"/>)}
                />
                <Route
                    exact
                    path='/web/disease/add'
                    render={() => (
                        <TestFormLayout
                            title="Add Disease Category"
                            changeRedirect={this.changeRedirect}
                            formProp={formProp}
                            fields={fields}
                            {...this.props}
                        />
                    )}
                />
                {this.state.redirect && <Redirect to="/web/disease"/>}
            </Row>
        );

    }
}
