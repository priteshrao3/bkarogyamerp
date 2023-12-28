import { Card, Form, Row} from "antd";
import React from "react";
import {Route} from "react-router";
import {Redirect} from "react-router-dom";
import {
    INPUT_FIELD, NUMBER_FIELD,
    SUCCESS_MSG_TYPE,
    TEXT_FIELD
} from "../../../../constants/dataKeys";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {displayMessage, getAPI, interpolate} from "../../../../utils/common";
import {
    BLOG_CONTACTUS,
    SINGLE_CONTACT
} from "../../../../constants/api";


export default class AddContacts extends React.Component {
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
        getAPI(interpolate(SINGLE_CONTACT, [this.props.match.params.id]), successFn, errorFn);

    }


    render() {
        const fields = [{
            label: "Name",
            key: "name",
            required:true,
            initialValue: this.state.editBlogData ? this.state.editBlogData.name : null,
            type: INPUT_FIELD
        }, {
            label: "Rank ",
            key: "contact_rank",
            initialValue: this.state.editBlogData ? this.state.editBlogData.contact_rank : 1,
            type: NUMBER_FIELD,
            required:true,
            min:1
        }, {
            label: "Link",
            key: "link",
            initialValue: this.state.editBlogData ? this.state.editBlogData.link : null,
            type: INPUT_FIELD,
        }, {
            label: "Phone Number ",
            key: "phone_no",
            initialValue: this.state.editBlogData ? this.state.editBlogData.phone_no : null,
            type: INPUT_FIELD,
        },{
            label: "Email",
            key: "email",
            required:true,
            initialValue: this.state.editBlogData ? this.state.editBlogData.email : null,
            type: INPUT_FIELD,
        }, {
            label: "Address",
            key: "address",
            required:true,
            initialValue: this.state.editBlogData ? this.state.editBlogData.address : null,
            type: TEXT_FIELD,
            minRows: 3,
        }];

        const that = this;
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
                        that.props.history.replace('/web/contact');
                    };
                },
                errorFn () {

                },
                action: interpolate(SINGLE_CONTACT, [this.props.match.params.id]),
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
                    that.props.history.replace('/web/contact');
                };
            },
            errorFn () {

            },
            action: BLOG_CONTACTUS,
            method: "post",
        }
        const defaultValues = [{key: 'is_active', value: true}];

        return (
<Row>
            <Card>
                <Route
                  exact
                  path='/web/contact/edit/:id'
                  render={() => (this.props.match.params.id ? (
                           <TestFormLayout
                             defaultValues={defaultValues}
                             title="Edit Contact"
                             changeRedirect={this.changeRedirect}
                             formProp={editformProp}
                             fields={fields}
                           />
                         ) : <Redirect to="/web/contact" />)}
                />
                <Route
                  exact
                  path='/web/contact/add'
                  render={() => (
<TestFormLayout
  title="Add Contact"
  defaultValues={defaultValues}
  changeRedirect={this.changeRedirect}
  formProp={formProp}
  fields={fields}
/>
)}
                />


            </Card>
            {this.state.redirect && <Redirect to="/web/contact" />}
</Row>
)

    }
}
