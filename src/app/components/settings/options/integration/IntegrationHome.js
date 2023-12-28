import React from "react";
import {Card, Icon, Row, Tabs,Form} from "antd";
import {INPUT_FIELD, PASSWORD_FIELD} from "../../../../constants/dataKeys";

import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {getAPI, interpolate} from "../../../../utils/common";
import {EXPENSE_TYPE, SAVE_CREDENTIALS} from "../../../../constants/api";

const {TabPane} = Tabs;
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
       const that=this;
        if (that.props){
            this.loadData();
        }

    }

    loadData(){
        const that=this;
        const successFn=function (data) {
            that.setState({
                integrateData:data,
                loading:false
            })
        }
        const errorFn=function () {
            that.setState({
                loading:false
            })
        }
        getAPI(interpolate(SAVE_CREDENTIALS,[that.props.user.id]),successFn ,errorFn)
    }

    render() {
        const that = this;
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
            successFn(data){
                that.loadData();
            },
            errorFn (){

            },
            action: interpolate(SAVE_CREDENTIALS, [this.props.user.id]),
        };
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        return (
<Row>
            <Card>
                <h2>My Integrations</h2>
                <Tabs>
                    <TabPane tab={<span><Icon type="check-circle" />Task Tracker</span>} key="Complaints">
                        <TestFormLayout fields={taskIntegrateFormFields} formProp={taskIntegrateFormProp} />
                    </TabPane>
                    {/* <TabPane tab={<span><Icon type="phone"/>Calling</span>} key="observations"> */}
                    {/*    /!*<TableData {...this.props} id={EMR_OBSERVATIONS} name="Observations"/>*!/ */}
                    {/* </TabPane> */}
                </Tabs>

            </Card>
</Row>
)
    }
}
