import React from "react";
import {MY_AGENTS} from "../../../../constants/api";
import {getAPI, interpolate} from "../../../../utils/common";
import {Button, Card, Icon} from "antd";
import CustomizedTable from "../../common/CustomizedTable";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import {Link} from "react-router-dom";

export default class MyPatients extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            patientList:[]
        }
    }

    componentDidMount() {
        this.loadPatients();
    }

    loadPatients = (page = 1) => {
        let that = this;
        that.setState({
            loading: true
        });
        let successFn = function (data) {
            that.setState(function (prevState) {
                if (data.current == 1) {
                    return {
                        patientList: data.results,
                        nextPage: data.next,
                        loading: false
                    }
                }else{
                    return {
                        patientList: [...prevState.patientList,...data.results],
                        nextPage: data.next,
                        loading: false
                    }
                }
            })
        }
        let errorFn = function () {
            that.setState({
                loading: false
            })
        }
        let apiParams = {
            // agent: false,
            page
        }
        getAPI(interpolate(MY_AGENTS, [this.props.currentPatient.user.id]), successFn, errorFn, apiParams);
    }

    render() {
        let columns = [{
            title: "Id",
            dataIndex: 'custom_id',
            key: 'id'
        },{
            title:'Name',
            dataIndex:'user.first_name',
            key:'name'
        },{
            title:'City',
            dataIndex:'city_data',
            key:'city',
            render:(value)=>value ? value.name : '--'
        },{
            title:'State',
            dataIndex:'state_data',
            key:'state',
            render:(value)=>value ? value.name : '--'
        },{
            title:'PinCode',
            dataIndex:'pincode',
            key:'pincode',
        }];
        return <Card title={"My Patients"} extra={<Link to={"/add-patient"}><Button type={"primary"}><Icon type={"plus"}/>Add Patient</Button></Link>}>
            <CustomizedTable pagination={false} dataSource={this.state.patientList} columns={columns} hideReport={true}/>
            <InfiniteFeedLoaderButton loading={this.state.loading}
                                      loaderFunction={() => this.loadPatients(this.state.nextPage)}
                                      hidden={!this.state.nextPage}/>
        </Card>
    }
}