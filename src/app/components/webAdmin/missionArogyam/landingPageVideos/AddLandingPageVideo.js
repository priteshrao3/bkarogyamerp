import {Card, Form, Row} from "antd";
import React from "react";
import {Route} from "react-router";
import {Redirect} from "react-router-dom";
import {
    INPUT_FIELD, NUMBER_FIELD,
    SUCCESS_MSG_TYPE,
} from "../../../../constants/dataKeys";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {displayMessage, getAPI, interpolate} from "../../../../utils/common";
import {
    MISSION_LANDING_PAGE_VIDEO,
    MISSION_SINGLE_LANDING_PAGE_VIDEO,
} from "../../../../constants/api";


export default class AddLandingPageVideo extends React.Component {
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
        getAPI(interpolate(MISSION_SINGLE_LANDING_PAGE_VIDEO, [this.props.match.params.id]), successFn, errorFn);


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
            initialValue: this.state.editBlogData ? this.state.editBlogData.rank : null,
            type: NUMBER_FIELD
        }, {
            label: "Video link",
            key: "link",
            initialValue: this.state.editBlogData ? this.state.editBlogData.link : null,
            type: INPUT_FIELD,
        }];


        let editformProp;
        if (this.state.editBlogData) {
            editformProp = {
                successFn (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "success");
                    that.props.loadData();
                    that.changeRedirect();
                    if (that.props.history){
                        that.props.history.replace('/mission/landingpagevideo');
                    };
                },
                errorFn () {

                },
                action: interpolate(MISSION_SINGLE_LANDING_PAGE_VIDEO, [this.props.match.params.id]),
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
                    that.props.history.replace('/mission/landingpagevideo');
                };
            }
            ,
            errorFn () {

            },
            action: MISSION_LANDING_PAGE_VIDEO,
            method: "post",
        }
        const defaultValues = [{"is_active": true}];

        return (
<Row>
            <Card>
                <Route
                  exact
                  path='/mission/landingpagevideo/edit/:id'
                  render={() => (this.props.match.params.id ? (
                           <TestFormLayout
                             defaultValues={defaultValues}
                             title="Edit Video"
                             changeRedirect={this.changeRedirect}
                             formProp={editformProp}
                             fields={fields}
                           />
                         ) : <Redirect to="/mission/landingpagevideo" />)}
                />
                <Route
                  exact
                  path='/mission/landingpagevideo/add'
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
            {this.state.redirect && <Redirect to="/mission/landingpagevideo" />}
</Row>
)

    }
}
