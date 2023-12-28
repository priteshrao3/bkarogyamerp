import React from "react";
import {Card, Form, Row} from "antd";
import {Route} from "react-router";
import {Redirect} from "react-router-dom";
import {INPUT_FIELD, QUILL_TEXT_FIELD, SUCCESS_MSG_TYPE, SINGLE_IMAGE_UPLOAD_FIELD} from "../../../constants/dataKeys";
import {displayMessage, getAPI, interpolate} from "../../../utils/common";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";
import {
    WEB_DYNAMIC_CONTENT,
    WEB_DYNAMIC_SINGLE_CONTENT
} from "../../../constants/api";


export default class AddManageOffers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editTherapyData: this.props.editOfferData ? this.props.editOfferData : null
        }
    }

    componentDidMount() {
        if (this.props.match.params.id) {
            if (!this.state.editOfferData) {
                this.loadData();
            }
        }
    }

    loadData() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                editOfferData: data,
            })
        }
        const errorFn = function () {

        }
        getAPI(interpolate(WEB_DYNAMIC_SINGLE_CONTENT, [this.props.match.params.id]), successFn, errorFn);

    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    render() {
        const that = this;
        const fields = [{
            label: "Offer Name",
            key: "title",
            required: true,
            initialValue: this.state.editOfferData ? this.state.editOfferData.title : null,
            type: INPUT_FIELD
        }, {
            label: "Offer Image",
            key: "image",
            required: true,
            initialValue: this.state.editOfferData ? this.state.editOfferData.image : null,
            type: SINGLE_IMAGE_UPLOAD_FIELD,
        }, {
            label: "Content",
            key: "body",
            // required: true,
            initialValue: this.state.editOfferData ? this.state.editOfferData.body : null,
            type: QUILL_TEXT_FIELD,
        },];
        let defaultValues = [{key: "language", value: "ENGLISH"}, {
            key: "category",
            value: "ADVISOR"
        }, {key: "sub_category", value: "Scheme & Offers"}];
        let editformProp;
        if (this.state.editOfferData) {
            defaultValues.push({
                key: "id",
                value: this.state.editOfferData.id
            });
            editformProp = {
                successFn(data) {
                    displayMessage(SUCCESS_MSG_TYPE, "Updated Successfully");
                    that.setState({
                        redirect: true
                    });
                    that.props.loadData();
                    if (that.props.history) {
                        that.props.history.replace('/erp/advisors/offers');
                    }
                },
                errorFn() {

                },
                action: interpolate(WEB_DYNAMIC_SINGLE_CONTENT, [that.state.editOfferData.id]),
                method: "put",

            }
        }
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        const formProp = {
            successFn(data) {
                displayMessage(SUCCESS_MSG_TYPE, "Added Successfully!");
                that.setState({
                    redirect: true
                });
                that.props.loadData();
                if (that.props.history) {
                    that.props.history.replace('/erp/advisors/offers');
                }
            },
            errorFn() {

            },
            action: WEB_DYNAMIC_CONTENT,
            method: "post",
        }


        return (
            <Row>
                <Card>
                    <Route
                        exact
                        path='/erp/advisors/offers/edit/:id'
                        render={() => (this.props.match.params.id ? (
                            <TestFormLayout
                                defaultValues={defaultValues}
                                title="Edit Offer"
                                changeRedirect={this.changeRedirect}
                                formProp={editformProp}
                                fields={fields}
                            />
                        ) : <Redirect to="/erp/advisors/offers"/>)}
                    />
                    <Route
                        exact
                        path='/erp/advisors/offers/add'
                        render={() => (
                            <TestFormLayout
                                title="Add Offer"
                                defaultValues={defaultValues}
                                changeRedirect={this.changeRedirect}
                                formProp={formProp}
                                fields={fields}
                            />
                        )}
                    />
                </Card>
                {this.state.redirect && <Redirect to="/erp/advisors/offers"/>}
            </Row>
        )
    }
}
