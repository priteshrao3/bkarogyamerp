import React from "react";
import {Avatar, Card, Form, Row} from "antd";
import {Route} from "react-router";
import {Redirect} from "react-router-dom";
import {INPUT_FIELD, QUILL_TEXT_FIELD ,SUCCESS_MSG_TYPE, SINGLE_IMAGE_UPLOAD_FIELD, NUMBER_FIELD} from "../../../../constants/dataKeys";
import {displayMessage, getAPI, interpolate, makeFileURL} from "../../../../utils/common";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {MISSION_MANAGE_PRODUCT, MISSION_MANAGE_SINGLE_PRODUCT} from "../../../../constants/api";


export default class AddManageProduct extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editProductData: this.props.editProductData ? this.props.editProductData : null
        }
    }

    componentDidMount() {
        if (this.props.match.params.id) {
            if (!this.state.editProductData) {
                this.loadData();
            }
        }
    }

    loadData() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                editProductData: data,
            })
        }
        const errorFn = function () {

        }
        getAPI(interpolate(MISSION_MANAGE_SINGLE_PRODUCT, [this.props.match.params.id]), successFn, errorFn);

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
            label: "Product Name",
            key: "title",
            required : true,
            initialValue: this.state.editProductData ? this.state.editProductData.title : null,
            type: INPUT_FIELD
        },{
            label: "Product Price",
            key: "price",
            required : true,
            initialValue: this.state.editProductData ? this.state.editProductData.price : null,
            type: NUMBER_FIELD
        }, {
            label: "Product Image",
            key: "image",
            type: SINGLE_IMAGE_UPLOAD_FIELD,
            initialValue:this.state.editProductData ? this.state.editProductData.image : null,
        },{
            label: "Content",
            key: "content",
            initialValue: this.state.editProductData? this.state.editProductData.content : null,
            required : true,
            type: QUILL_TEXT_FIELD,

        },];

        let editformProp;
        if (this.state.editProductData) {
            editformProp = {
                successFn (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "success");
                        that.setState({
                        redirect: true
                    });
                    that.props.loadData();
                    if (that.props.history){
                        that.props.history.replace('/mission/manageproduct');
                    };
                },
                errorFn () {

                },
                action: interpolate(MISSION_MANAGE_SINGLE_PRODUCT, [this.props.match.params.id]),
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
                    that.props.history.replace('/mission/manageproduct');
                };
            },
            errorFn () {

            },
            action: MISSION_MANAGE_PRODUCT,
            method: "post",
        }
        const defaultValues = [];

        return (
<Row>
            <Card>
                <Route
                  exact
                  path='/mission/manageproduct/edit/:id'
                  render={() => (this.props.match.params.id ? (
                           <TestFormLayout
                             defaultValues={defaultValues}
                             title="Edit Product"
                             changeRedirect={this.changeRedirect}
                             formProp={editformProp}
                             fields={fields}
                           />
                         ) : <Redirect to="/mission/manageproduct" />)}
                />
                <Route
                  exact
                  path='/mission/manageproduct/add'
                  render={() => (
<TestFormLayout
  title="Add Product"
  defaultValues={defaultValues}
  changeRedirect={this.changeRedirect}
  formProp={formProp}
  fields={fields}
/>
)}
                />
            </Card>
            {this.state.redirect && <Redirect to="/mission/manageproduct" />}
</Row>
)
    }
}
