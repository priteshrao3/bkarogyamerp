import React from "react";
import {Card, Form, Row} from "antd";
import {Redirect, Route} from "react-router";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {displayMessage, getAPI, interpolate} from "../../../../utils/common";
import {INPUT_FIELD, SUCCESS_MSG_TYPE} from "../../../../constants/dataKeys";
import {MEETING_USER, SINGLE_POST} from "../../../../constants/api";

export default class AddOrEditZoomUser extends React.Component{
    constructor(props){
        super(props);
        this.state={
        };

        this.loadData = this.loadData.bind(this);
    }

    componentWillMount() {
        const that=this;
        if (that.props.match.params.id){
            this.loadData();
        }
    }

    changeRedirect(){
        const redirectVar=this.state.redirect;
        this.setState({
            redirect:  !redirectVar,
        })  ;
    }

    loadData(){
        const that =this;
        const successFn = function (data) {
            that.setState({
                editZoomData:data[0],
            })
        };
        const errorFn = function () {

        };
        const reqData={
            id:that.props.match.params.id
        };
        getAPI(MEETING_USER ,successFn, errorFn,reqData);


    }

    render() {
        const that=this;
        const fields=[{
            label:'User Name',
            key:'username',
            type:INPUT_FIELD,
            initialValue:that.state.editZoomData?that.state.editZoomData.username:'',
        },{
            label: 'API key',
            key:'API_Key',
            type: INPUT_FIELD,
            initialValue:this.state.editZoomData?this.state.editZoomData.API_Key:'',
        },{
            label:'API Secret',
            key:'API_Secret',
            type:INPUT_FIELD,
            initialValue:this.state.editZoomData?this.state.editZoomData.API_Secret:'',
        }];
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        let editformProp;

        if(this.state.editZoomData) {
            editformProp = {
                successFn (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "success");
                    that.setState({
                        redirect: true
                    });
                    that.props.loadData();
                    if (that.props.history){
                        that.props.history.replace("/erp/settings/zoom-user");
                    }
                },
                errorFn () {

                },
                action: interpolate(MEETING_USER, [this.props.match.params.id]),
                method: "post",

            }
        }

        const formProp = {
            successFn (data) {
                displayMessage(SUCCESS_MSG_TYPE, "success")

                that.setState({
                    redirect: true
                });
                that.props.loadData();
                if (that.props.history){
                    that.props.history.replace("/erp/settings/zoom-user");
                }
            },
            errorFn () {

            },
            action:MEETING_USER,
            method: "post",
        };
        const defaultValues=[{key:'id',value:this.props.match.params.id}];
        return (
<Row>
            <Card>
                <Route
                  exact
                  path='/erp/settings/zoom-user/edit/:id'
                  render={() =>(this.props.match.params.id? (
<TestFormLayout
  title="Edit Zoom User"
  defaultValues={defaultValues}
  changeRedirect={this.changeRedirect}
  formProp={editformProp}
  fields={fields}
/>
): <Redirect to="/erp/settings/zoom-user" />)}
                />

                <Route
                  exact
                  path='/erp/settings/zoom-user/add'
                  render={() => (
<TestFormLayout
  title="Add Zoom User"
  changeRedirect={this.changeRedirect}
  formProp={formProp}
  fields={fields}
/>
)}
                />

            </Card>
            {this.state.redirect&&    <Redirect to="/erp/settings/zoom-user" />}
</Row>
)
    }
}
