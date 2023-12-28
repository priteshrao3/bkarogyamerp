import {Card, Form, Row} from "antd";
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
    BLOG_POST,
    SINGLE_POST, WEB_DYNAMIC_CONTENT
} from "../../../../constants/api";
import {DYNAMIC_CATEGORY_CAREER, DYNAMIC_SUBCATEGORY_CAREERCONTENT} from "../../../../constants/hardData";


export default class EditCareers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editData: {}
        }
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        let that = this;
        that.setState({
            loading: true
        });
        let successFn = function (data) {
            let content = null;
            if (data.results.length) {
                content = data.results[0];
            }
            that.setState({
                editData: content,
                loading: false
            });
        }
        let errorFn = function () {
            that.setState({
                loading: false
            });
        }
        let apiParams = {
            "language": "ENGLISH",
            "category": DYNAMIC_CATEGORY_CAREER,
            "sub_category": DYNAMIC_SUBCATEGORY_CAREERCONTENT,
            page: 1,
            page_size: 1
        }
        getAPI(WEB_DYNAMIC_CONTENT, successFn, errorFn, apiParams);
    }


    render() {
        const that = this;
        const fields = [{
            label: "Career Title",
            key: "title",
            required: true,
            initialValue: this.state.editData ? this.state.editData.title : null,
            type: INPUT_FIELD
        }, {
            label: "Banner Image",
            key: "image",
            initialValue: this.state.editData ? this.state.editData.image : null,
            type: SINGLE_IMAGE_UPLOAD_FIELD,
        }, {
            label: "Career Body",
            key: "body",
            required: true,
            initialValue: this.state.editData ? this.state.editData.body : ' ',
            type: QUILL_TEXT_FIELD,
            // preview:true
        },];


        let editformProp = {
            successFn(data) {
                displayMessage(SUCCESS_MSG_TYPE, "Updated Successfully");
                that.props.loadData();
                if (that.props.history) {
                    that.props.history.replace('/web/careers');
                }

            },
            errorFn() {

            },
            action: WEB_DYNAMIC_CONTENT,
            method: "post",


        }
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        const defaultValues = [{key: "language", value: "ENGLISH"}, {
            key: "category",
            value: DYNAMIC_CATEGORY_CAREER
        }, {key: "sub_category", value: DYNAMIC_SUBCATEGORY_CAREERCONTENT}];

        return (
            <Row>
                <Card>
                    <TestFormLayout defaultValues={defaultValues} title="Edit Careers"
                                    changeRedirect={this.changeRedirect} formProp={editformProp}
                                    fields={fields} loadData={this.props.loadData}/>


                </Card>
                {this.state.redirect && <Redirect to="/web/careers"/>}
            </Row>
        )

    }
}
