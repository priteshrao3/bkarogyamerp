import { Card, Form,Row} from "antd";
import React from "react";
import {Route} from "react-router";
import {Redirect} from "react-router-dom";
import moment from "moment";
import {
    DATE_PICKER, SINGLE_IMAGE_UPLOAD_FIELD,
    INPUT_FIELD,
    QUILL_TEXT_FIELD,
    SUCCESS_MSG_TYPE,
    TEXT_FIELD,
    MULTI_IMAGE_UPLOAD_FIELD
} from "../../../../constants/dataKeys";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {displayMessage, getAPI, interpolate} from "../../../../utils/common";
import {
    MISSION_BLOG_POST,
    MISSION_SINGLE_POST
} from "../../../../constants/api";


export default class AddPost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editBlogData : this.props.editBlogData?this.props.editBlogData:null
        }
    }

    changeRedirect(){
        const redirectVar=this.state.redirect;
        this.setState({
            redirect:  !redirectVar,
        })  ;
    }

    componentDidMount(){
        if(this.props.match.params.id){
            if(!this.state.editBlogData) {
                this.loadData();
            }
        }
    }

    loadData(){
        const that =this;
        const successFn = function (data) {
            that.setState({
                editBlogData:data,
            })
        }
        const errorFn = function () {

        }
        getAPI(interpolate(MISSION_SINGLE_POST, [this.props.match.params.id]) ,successFn, errorFn);


    }


    render(){
        const that =this;
        const  fields= [{
            label: "Blog Title",
            key: "title",
            required:true,
            initialValue:this.state.editBlogData?this.state.editBlogData.title:null,
            type: INPUT_FIELD
        },{
            label: "Blog Domain ",
            key: "domain",
            initialValue:this.state.editBlogData?this.state.editBlogData.domain:null,
            type: INPUT_FIELD
        },{
            label: "Blog URL ",
            key: "slug",
            required:true,
            initialValue:this.state.editBlogData?this.state.editBlogData.slug:null,
            type: INPUT_FIELD
        },{
            label: "Blog Image",
            key: "featured_image",
            initialValue:this.state.editBlogData?this.state.editBlogData.featured_image:null,
            type: SINGLE_IMAGE_UPLOAD_FIELD,
        },{
            label: "Posted On",
            key: "posted_on",
            initialValue:this.state.editBlogData && this.state.editBlogData.posted_on?moment(this.state.editBlogData.posted_on):moment(),
            type: DATE_PICKER

        },{
            label: "SEO Description",
            key: "meta_description",
            initialValue:this.state.editBlogData?this.state.editBlogData.meta_description:null,
            type: INPUT_FIELD,
        },{
            label: "SEO Keywords",
            key: "keywords",
            required:true,
            initialValue:this.state.editBlogData?this.state.editBlogData.keywords:null,
            type: TEXT_FIELD,
        },{
            label: "Content",
            key: "content",
            // required:true,
            initialValue:this.state.editBlogData?this.state.editBlogData.content:' ',
            type: QUILL_TEXT_FIELD,
            // preview:true
        }, ];


        let editformProp;
        if(this.state.editBlogData) {
            editformProp = {
                successFn (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "success");
                    that.setState({
                        redirect: true
                    });
                    that.props.loadData();
                    if (that.props.history){
                        that.props.history.replace('/mission/blog');
                    }

                },
                errorFn () {

                },
                action: interpolate(MISSION_SINGLE_POST, [this.props.match.params.id]),
                method: "put",

            }
        }
        const TestFormLayout = Form.create()(DynamicFieldsForm);

        const formProp={
            successFn(data){
                displayMessage(SUCCESS_MSG_TYPE, "success");
                that.setState({
                    redirect: true
                });
                that.props.loadData();
                if (that.props.history){
                    that.props.history.replace('/mission/blog');
                };
            },
            errorFn(data){
            },
            action:  MISSION_BLOG_POST,
            method: "post",
        };
        const defaultValues=[];

        return (
<Row>
            <Card>
                <Route
                  exact
                  path='/mission/blog/edit/:id'
                  render={() => (this.props.match.params.id?<TestFormLayout defaultValues={defaultValues} title="Edit Post" changeRedirect={this.changeRedirect} formProp={editformProp} fields={fields} />: <Redirect to="/mission/blog" />)}
                />
                <Route
                  exact
                  path='/mission/blog/add'
                  render={() =><TestFormLayout title="Add Post" changeRedirect={this.changeRedirect} formProp={formProp} fields={fields} />}
                />


            </Card>
            {this.state.redirect&&    <Redirect to="/mission/blog" />}
</Row>
)

    }
}
