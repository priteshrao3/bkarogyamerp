import {Card, Form, Row} from "antd";
import React from "react";
import {Route} from "react-router";
import {Redirect} from "react-router-dom";
import {
    INPUT_FIELD,
    QUILL_TEXT_FIELD,
    SUCCESS_MSG_TYPE,
} from "../../../../constants/dataKeys";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {displayMessage, getAPI, interpolate} from "../../../../utils/common";
import {
    MISSION_BLOG_FACILITY, MISSION_SINGLE_FACILITY,
} from "../../../../constants/api";


export default class AddFacility extends React.Component {
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
        console.log("i M groot")
        const successFn = function (data) {
            that.setState({
                editBlogData: data,
            })
        }
        const errorFn = function () {

        }
        getAPI(interpolate(MISSION_SINGLE_FACILITY, [this.props.match.params.id]), successFn, errorFn);

    }


    render() {
        const fields = [{
            label: "Name",
            key: "name",
            initialValue: this.state.editBlogData ? this.state.editBlogData.name : null,
            type: INPUT_FIELD
        }, {
            label: "content",
            key: "content",
            initialValue: this.state.editBlogData ? this.state.editBlogData.content : null,
            type: QUILL_TEXT_FIELD,
        },];

        const that = this;
        let editformProp;
        if (this.state.editBlogData) {
            editformProp = {
                successFn (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "success");
                    that.props.loadData();
                    that.changeRedirect();
                    if (that.props.history){
                        that.props.history.replace('/mission/facilities');
                    };

                },
                errorFn () {

                },
                action: interpolate(MISSION_SINGLE_FACILITY, [this.props.match.params.id]),
                method: "put",

            }
        }
        const TestFormLayout = Form.create()(DynamicFieldsForm);

        const formProp = {
            successFn (data) {
                displayMessage(SUCCESS_MSG_TYPE, "success");
                that.props.loadData();
                that.changeRedirect();
                if (that.props.history){
                    that.props.history.replace('/mission/facilities');
                };
            },
            errorFn () {

            },
            action: MISSION_BLOG_FACILITY,
            method: "post",
        }
        const defaultValues = [{key: 'is_active', value: true}];

        return (
<Row>
            <Card>
                <Route
                  exact
                  path='/mission/facilities/edit/:id'
                  render={() => (this.props.match.params.id ? (
                           <TestFormLayout
                             defaultValues={defaultValues}
                             title="Edit Facility"
                             changeRedirect={this.changeRedirect}
                             formProp={editformProp}
                             fields={fields}
                           />
                         ) : <Redirect to="mission/facilities" />)}
                />
                <Route
                  exact
                  path='/mission/facilities/add'
                  render={() => (
<TestFormLayout
  title="Add Facility"
  defaultValues={defaultValues}
  changeRedirect={this.changeRedirect}
  formProp={formProp}
  fields={fields}
/>
)}
                />


            </Card>
            {this.state.redirect && <Redirect to="/mission/facilities" />}
</Row>
)

    }
}
