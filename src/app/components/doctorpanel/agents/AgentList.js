import React from "react";
import {Button, Modal, Card, Form, Icon, Row, Table, Divider, Popconfirm, Tag} from "antd";
import {AGENT_ROLES, MY_AGENTS, PATIENT_PROFILE, PATIENTS_LIST} from "../../../constants/api"
import {Link, Route, Switch} from "react-router-dom";
import {getAPI, displayMessage, interpolate, postAPI, putAPI} from "../../../utils/common";
import AddOrEditAgent from "./AddOrEditAgent";
import CustomizedTable from "../common/CustomizedTable";
import InfiniteFeedLoaderButton from "../common/InfiniteFeedLoaderButton";

class AgentRoles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            visible: false,
            data: null,
            loading: true
        }
        this.loadData = this.loadData.bind(this);
        // this.deleteObject = this.deleteObject.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData(page = 1) {
        var that = this;
        this.setState({
            loading:true
        })
        let successFn = function (data) {
            that.setState({
                data: data.results,
                total: data.count,
                nextPage : data.next,
                loading: false
            })
        };
        let errorFn = function () {
            that.setState({
                loading: false
            })
        };
        let apiParams = {
            agent: true,
            page
        }
         getAPI(interpolate(MY_AGENTS, [this.props.currentPatient.user.id]), successFn, errorFn, apiParams);
    }

    changeRedirect() {
        var redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    handleCancel = () => {
        this.setState({visible: false});
    }

    // editObject(record) {
    //     this.setState({
    //         editAgentData: record,
    //         loading: false
    //     });
    //
    //     this.props.history.push('/settings/agents/' + record.id + '/edit')
    //
    // }
    //
    // deleteObject(record) {
    //     let that = this;
    //     let reqData = {'id': record.id, is_agent: false}
    //     let successFn = function (data) {
    //         that.setState({
    //             loading: false,
    //         })
    //         that.loadData();
    //     }
    //     let errorFn = function () {
    //     };
    //     putAPI(interpolate(PATIENT_PROFILE, [record.id]), reqData, successFn, errorFn)
    // }

    render() {
        let that = this;
        const columns = [{
            title: 'Name',
            dataIndex: 'user.first_name',
            key: 'name',
        }, {
            title: 'Email',
            dataIndex: 'user.email',
            key: 'email'
        }, {
            title: 'Mobile',
            dataIndex: 'user.mobile',
            key: 'mobile'
        }, {
            title: 'Approval Status',
            dataIndex: 'is_approved',
            key: 'is_approved',
            render : (value) =>(
                value ? <Tag color="#87d068">Approved</Tag> : <Tag color="#f50">Pending</Tag>
            )
        }
        // ,{
        //     title: 'Action',
        //     key: 'action',
        //     render: (text, record) => (
        //         <span>
        //       <a onClick={() => this.editObject(record)}>  Edit</a>
        //         <Divider type="vertical"/>
        //             <Popconfirm title="Are you sure delete this item?"
        //                         onConfirm={() => that.deleteObject(record)} okText="Yes" cancelText="No">
        //               <a>Delete</a>
        //           </Popconfirm>
        //       </span>
        //     ),
        // }
        ];

        return <Switch>
            <Route exact path={"/agents/add"}
                   render={(route) => <AddOrEditAgent  {...this.props} title={"Create Advisor"}
                                                       loadData={this.loadData}/>}/>

            <Route exact path={"/agents/:id/edit"}
                   render={(route) => <AddOrEditAgent  {...this.props} {...this.state} title={"Edit Advisor"}
                                                       loadData={this.loadData}/>}/>
            <Route>
                <Card title={<h4>My Advisor <Link to={"/agents/add"}>
                    <Button style={{float: 'right'}} type={"primary"}><Icon type={"plus"}/>
                        Add</Button></Link></h4>}>

                    <CustomizedTable loading={this.state.loading} columns={columns} dataSource={this.state.data} pagination={false}/>
                    <InfiniteFeedLoaderButton loading={this.state.loading} loaderFunction={()=>that.loadData(that.state.nextPage)} hidden={!this.state.nextPage}/>
                </Card>
            </Route>

        </Switch>


    }
}

export default AgentRoles;
