import {Card, Form, Row} from "antd";
import React from "react";
import {Route} from "react-router";
import {Redirect} from "react-router-dom";
import {
    SINGLE_IMAGE_UPLOAD_FIELD,
    INPUT_FIELD,
    QUILL_TEXT_FIELD,
    SELECT_FIELD,
    SUCCESS_MSG_TYPE,
    TEXT_FIELD, MULTI_IMAGE_UPLOAD_FIELD
} from "../../../../constants/dataKeys";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {displayMessage, getAPI, interpolate} from "../../../../utils/common";
import {MISSION_BLOG_DISEASE, MISSION_SINGLE_DISEASE} from "../../../../constants/api";
import {DISEASE_TYPES} from "../../../../constants/hardData";


export default class AddDisease extends React.Component {
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
        getAPI(interpolate(MISSION_SINGLE_DISEASE, [this.props.match.params.id]), successFn, errorFn);


    }


    render() {
        const that = this;
        const fields = [{
            label: "Disease Type",
            key: "disease_type",
            initialValue: this.state.editBlogData ? this.state.editBlogData.disease_type : null,
            type: SELECT_FIELD,
            options: DISEASE_TYPES
        }, {
            label: "Disease Name",
            key: "disease_name",
            initialValue: this.state.editBlogData ? this.state.editBlogData.disease_name : null,
            type: INPUT_FIELD
        }, {
            label: "Disease Main Image",
            key: "main_image",
            initialValue: this.state.editBlogData ? this.state.editBlogData.main_image : null,
            type: SINGLE_IMAGE_UPLOAD_FIELD,
        }, {
            label: "Disease Side Image",
            key: "side_image",
            initialValue: this.state.editBlogData ? this.state.editBlogData.side_image : [],
            type: MULTI_IMAGE_UPLOAD_FIELD,
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
        }, {
            label: "URL",
            key: "domain",
            initialValue: this.state.editBlogData ? this.state.editBlogData.domain : null,
            type: INPUT_FIELD,
            required: true
        }, {
            label: "Content",
            key: "content",
            initialValue: this.state.editBlogData ? this.state.editBlogData.content : ' ',
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
                        that.props.history.replace('/mission/disease');
                    };
                },
                errorFn () {

                },
                action: interpolate(MISSION_SINGLE_DISEASE, [this.props.match.params.id]),
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
                    that.props.history.replace('/mission/disease');
                };
            },
            errorFn () {

            },
            action: MISSION_BLOG_DISEASE,
            method: "post",
        }
        const defaultValues = [];

        return (
<Row>
            <Card>
                <Route
                  exact
                  path='/mission/disease/edit/:id'
                  render={() => (this.props.match.params.id ? (
                           <TestFormLayout
                             defaultValues={defaultValues}
                             title="Edit Disease"
                             changeRedirect={this.changeRedirect}
                             formProp={editformProp}
                             fields={fields}
                           />
                         ) : <Redirect to="/mission/disease" />)}
                />
                <Route
                  exact
                  path='/mission/disease/add'
                  render={() => (
<TestFormLayout
  title="Add Disease"
  changeRedirect={this.changeRedirect}
  formProp={formProp}
  fields={fields}
/>
)}
                />


            </Card>
            {this.state.redirect && <Redirect to="/mission/disease" />}
</Row>
)

    }
}
