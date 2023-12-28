import {Card, Form, Row,} from "antd";
import React from "react";
import {Route} from "react-router";
import {Redirect} from "react-router-dom";
import {
    INPUT_FIELD, NUMBER_FIELD,
    SUCCESS_MSG_TYPE
} from "../../../../constants/dataKeys";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {displayMessage, getAPI, interpolate} from "../../../../utils/common";
import {
    MISSION_BLOG_VIDEOS,
    MISSION_SINGLE_VIDEO
} from "../../../../constants/api";


export default class AddVideo extends React.Component {
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
        getAPI(interpolate(MISSION_SINGLE_VIDEO, [this.props.match.params.id]), successFn, errorFn);


    }


    render() {
        const that = this;
        const fields = [{
            label: "Name",
            key: "name",
            initialValue: this.state.editBlogData ? this.state.editBlogData.name : null,
            type: INPUT_FIELD
        }, {
            label: "Rank ",
            key: "rank",
            initialValue: this.state.editBlogData ? this.state.editBlogData.rank : 1,
            type: NUMBER_FIELD,
            required: true,
            min: 1
        }, {
            label: "Video link",
            key: "link",
            initialValue: this.state.editBlogData ? this.state.editBlogData.link : null,
            type: INPUT_FIELD,
            required: true
        },
            //     {
            //     label: "Active",
            //     key: "is_active",
            //     initialValue: this.state.editBlogData ? this.state.editBlogData.is_active : null,
            //     type: SINGLE_CHECKBOX_FIELD,
            // },
        ];


        let editformProp;
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
                action: interpolate(MISSION_SINGLE_VIDEO, [this.props.match.params.id]),
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
                console.log(data);
            },
            errorFn () {

            },
            action: MISSION_BLOG_VIDEOS,
            method: "post",
        }
        const defaultValues = [{key: 'is_active', value: true}];

        return (
<Row>
            <Card>
                <Route
                  exact
                  path='/mission/videos/edit/:id'
                  render={() => (this.props.match.params.id ? (
                           <TestFormLayout
                             defaultValues={defaultValues}
                             title="Edit Video"
                             changeRedirect={this.changeRedirect}
                             formProp={editformProp}
                             fields={fields}
                           />
                         ) : <Redirect to="/mission/videos" />)}
                />
                <Route
                  exact
                  path='/mission/videos/add'
                  render={() => (
<TestFormLayout
  title="Add video"
  defaultValues={defaultValues}
  changeRedirect={this.changeRedirect}
  formProp={formProp}
  fields={fields}
/>
)}
                />


            </Card>

            {this.state.redirect && <Redirect to="/mission/videos" />}
</Row>
)

    }
}
