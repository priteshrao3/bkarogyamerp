import {Card, Form, Row} from "antd";
import React from "react";
import {Route} from "react-router";
import {Redirect} from "react-router-dom";
import {
    INPUT_FIELD,
    SUCCESS_MSG_TYPE,
    TEXT_FIELD
} from "../../../../constants/dataKeys";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {displayMessage, getAPI, interpolate} from "../../../../utils/common";
import {
    MISSION_BLOG_PAGE_SEO,
    MISSION_SINGLE_PAGE_SEO,
} from "../../../../constants/api";


export default class AddSEO extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editBlogData: this.props.editBlogData ? this.props.editBlogData : null
        }
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    componentDidMount() {
        if (this.props.match.params.id) {
            if (!this.state.editBlogData) {
                this.loadData();
            }
        }
    }

    loadData() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                editBlogData: data,
            })
        }
        const errorFn = function () {

        }
        getAPI(interpolate(MISSION_SINGLE_PAGE_SEO, [this.props.match.params.id]), successFn, errorFn);

    }


    render() {
        const fields = [{
            label: "Page",
            key: "name",
            initialValue: this.state.editBlogData ? this.state.editBlogData.name : null,
            type: INPUT_FIELD,
            disabled: true
        }, {
            label: "Page Title",
            key: "title",
            initialValue: this.state.editBlogData ? this.state.editBlogData.title : null,
            type: INPUT_FIELD
        }, {
            label: "SEO Description",
            key: "meta_description",
            initialValue: this.state.editBlogData ? this.state.editBlogData.meta_description : null,
            type: TEXT_FIELD,
        }, {
            label: "SEO Keywords",
            key: "keywords",
            required:true,
            initialValue: this.state.editBlogData ? this.state.editBlogData.keywords : null,
            type: TEXT_FIELD,
        },];


        let editformProp;
        const that = this;
        if (this.state.editBlogData) {
            editformProp = {
                successFn (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "success");
                        that.setState({
                            redirect: true
                        });
                        that.props.loadData();
                },
                errorFn () {

                },
                action: interpolate(MISSION_SINGLE_PAGE_SEO, [this.props.match.params.id]),
                method: "put",

            }
        }
        const TestFormLayout = Form.create()(DynamicFieldsForm);

        const formProp = {
            successFn (data) {
                displayMessage(SUCCESS_MSG_TYPE, "success");
                    that.setState({
                        redirect: true
                    });
                    that.props.loadData();
            },
            errorFn () {

            },
            action: MISSION_BLOG_PAGE_SEO,
            method: "post",
        }
        const defaultValues = [{key: 'is_active', value: true}];

        return (
<Row>
            <Card>
                <Route
                  exact
                  path='/mission/pageseo/edit/:id'
                  render={() => (this.props.match.params.id ? (
                           <TestFormLayout
                             defaultValues={defaultValues}
                             title="Edit SEO"
                             changeRedirect={this.changeRedirect}
                             formProp={editformProp}
                             fields={fields}
                           />
                         ) : <Redirect to="/mission/pageseo" />)}
                />
                <Route
                  exact
                  path='/mission/pageseo/add'
                  render={() => (
<TestFormLayout
  title="Add SEO"
  changeRedirect={this.changeRedirect}
  formProp={formProp}
  fields={fields}
/>
)}
                />


            </Card>
            {this.state.redirect && <Redirect to="/mission/pageseo" />}
</Row>
)

    }
}
