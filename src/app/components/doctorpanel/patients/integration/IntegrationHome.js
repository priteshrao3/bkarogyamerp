import React from "react";
import {Card, Icon, Row, Tabs} from "antd";
import {INPUT_FIELD, PASSWORD_FIELD} from "../../../../constants/dataKeys";
import {Form} from "antd/lib/index";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {getAPI, interpolate} from "../../../../utils/common";
import { SAVE_CREDENTIALS} from "../../../../constants/api";

const TabPane = Tabs.TabPane;
export default class IntegrationHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            integrateData: [],
            loading: true,
        }
        this.loadData = this.loadData.bind(this);
    }
    componentWillMount() {
       let that=this;
        if (that.props){
            this.loadData();
        }

    }

    loadData(){
        let that=this;
        let successFn=function (data) {
            that.setState({
                integrateData:data,
                loading:false
            })
        }
        let errorFn=function () {
            that.setState({
                loading:false
            })
        }
        getAPI(interpolate(SAVE_CREDENTIALS,[that.props.user.user.id]),successFn ,errorFn)
    }
    render() {
        let that = this;
        const taskIntegrateFormFields = [{
            key: 'login',
            type: INPUT_FIELD,
            initialValue: this.state.integrateData.login,
            required: true,
            label: "Email Id"
        }, {
            key: 'password',
            type: PASSWORD_FIELD,
            initialValue: this.state.integrateData.password,
            required: true,
            label: "Password"
        }];
        const taskIntegrateFormProp = {
            method : 'post',
            successFn : function(data){
                that.loadData();
            },
            errorFn : function (){

            },
            action: interpolate(SAVE_CREDENTIALS, [this.props.user.user.id]),
        };
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        return <Row>
            <Card>
                <h2>My Integrations</h2>
                <Tabs>
                    <TabPane tab={<span><Icon type="check-circle"/>Task Tracker</span>} key="Complaints">
                        <TestFormLayout fields={taskIntegrateFormFields} formProp={taskIntegrateFormProp}/>
                    </TabPane>
                    {/*<TabPane tab={<span><Icon type="phone"/>Calling</span>} key="observations">*/}
                    {/*    /!*<TableData {...this.props} id={EMR_OBSERVATIONS} name="Observations"/>*!/*/}
                    {/*</TabPane>*/}
                </Tabs>

            </Card>
        </Row>
    }
}
