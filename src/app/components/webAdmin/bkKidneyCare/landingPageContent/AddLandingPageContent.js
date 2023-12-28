import {Card, Form, Row} from "antd";
import React from "react";
import {Route} from "react-router";
import {Redirect} from "react-router-dom";
import {
    SINGLE_IMAGE_UPLOAD_FIELD,
    INPUT_FIELD,
    QUILL_TEXT_FIELD,
    SUCCESS_MSG_TYPE,
} from "../../../../constants/dataKeys";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {displayMessage, getAPI, interpolate} from "../../../../utils/common";
import {
    LANDING_PAGE_CONTENT,
    SINGLE_LANDING_PAGE_CONTENT,
} from "../../../../constants/api";


export default class AddLandingPageContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editBlogData: this.props.editBlogData ? this.props.editBlogData : null
        }
    }

    componentDidMount() {
        if (this.props.match.params.id) {
            if (!this.state.editBlogData) {
                this.loadData();
            }
        }
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
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
        getAPI(interpolate(SINGLE_LANDING_PAGE_CONTENT, [this.props.match.params.id]), successFn, errorFn);

    }

    render() {
        const that = this;
        const fields = [{
            label: "Title",
            key: "title",
            initialValue: this.state.editBlogData ? this.state.editBlogData.title : null,
            type: INPUT_FIELD
        }, {
            label: "Image",
            key: "image",
            initialValue: this.state.editBlogData ? this.state.editBlogData.image : null,
            type: SINGLE_IMAGE_UPLOAD_FIELD,
        }, {
            label: "Content",
            key: "content",
            initialValue: this.state.editBlogData ? this.state.editBlogData.content : null,
            type: QUILL_TEXT_FIELD,
        },];

        let editformProp;
        if (this.state.editBlogData) {
            editformProp = {
                successFn (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "success");
                    that.setState({
                        redirect: true
                    });
                    that.props.loadData();
                    if (that.props.history){
                        that.props.history.replace('/web/landingpagecontent');
                    };
                },
                errorFn () {

                },
                action: interpolate(SINGLE_LANDING_PAGE_CONTENT, [this.props.match.params.id]),
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
                if (that.props.history){
                    that.props.history.replace('/web/landingpagecontent');
                };
            },
            errorFn () {

            },
            action: LANDING_PAGE_CONTENT,
            method: "post",
        }
        const defaultValues = [];

        return (
<Row>
            <Card>
                <Route
                  exact
                  path='/web/landingpagecontent/edit/:id'
                  render={() => (this.props.match.params.id ? (
                           <TestFormLayout
                             defaultValues={defaultValues}
                             title="Edit Content"
                             changeRedirect={this.changeRedirect}
                             formProp={editformProp}
                             fields={fields}
                           />
                         ) : <Redirect to="/web/landingpagecontent" />)}
                />
                <Route
                  exact
                  path='/web/landingpagecontent/add'
                  render={() => (
<TestFormLayout
  title="Add Content"
  changeRedirect={this.changeRedirect}
  formProp={formProp}
  fields={fields}
/>
)}
                />


            </Card>
            {this.state.redirect && <Redirect to="/web/landingpagecontent" />}
</Row>
)

    }
}
