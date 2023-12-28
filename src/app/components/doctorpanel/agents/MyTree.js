import React from "react";
import {Avatar, Card, Col, Empty, Icon, Row, Tag} from "antd";
import OrgChart from 'react-orgchart';
import 'react-orgchart/index.css';
import {getAPI, interpolate, makeFileURL} from "../../../utils/common";
import {AGENT_TREE} from "../../../constants/api";

const {Meta} = Card;
export default class MyTree extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            agentData: {},
            agentTreeData: {},
        }
        this.loadAgentTree = this.loadAgentTree.bind(this);
    }

    componentDidMount() {
        this.loadAgentTree();
    }


    loadAgentTree() {
        let that = this;
        let successFn = function (data) {
            that.setState({
                agentData: data
            }, function () {
                that.setState({
                    agentTreeData: this.general_list(0, data[0][0]),
                });
            })
        }
        let errorFn = function () {

        };

        getAPI(interpolate(AGENT_TREE, [that.props.currentPatient.id]), successFn, errorFn);
    }

    ref_data_level(user, level) {
        let currentData = this.state.agentData;
        let filterData = currentData[level.toString()] ? currentData[level.toString()].filter(function (item) {
            return item.user.referer == user;
        }) : [];
        return filterData;

    }

    general_list(level, data) {
        let children = this.ref_data_level(data.user.id, level + 1);
        for (let child in children) {
            children[child] = this.general_list(level + 1, children[child]);
        }
        data.children = children;
        return data;
    }

    render() {
        let that = this;
        return (
            <div style={{padding:"20px"}}>
                {/*{[that.state.agentTreeData].length >0 ?*/}

                <h2>Advisor Tree</h2>
                <div style={{width:'100%',overflowX:'scroll'}}>
                    <OrgChart tree={this.state.agentTreeData} NodeComponent={MyNodeComponent}/>
                </div>
                {/*: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}*/}

            </div>
        )
    }

}
const MyNodeComponent = function ({node}) {
    return (
        <div >
            {node.user ? <>
                <Card style={{margin: 'auto', height: 160, width:160}} bodyStyle={{padding:5,overflow:'hidden'}} hoverable>
                    <Row>
                        <Col span={24}>
                            {node.image ? <Avatar src={makeFileURL(node.image)} size={50}/> :
                            <Avatar style={{backgroundColor: '#87d068'}} size={50}>
                                {node.user.first_name ? node.user.first_name.charAt(0) :
                                    <Icon type="user"/>}
                            </Avatar>}
                        </Col>
                        <Col span={24}>
                            {node.user.first_name}
                        </Col>
                        <Col span={24}>
                            <span>{node.is_approved ? <Tag color="#87d068">Approved</Tag> : <Tag color="#f50">Not
                                Approved</Tag>}<br/>{node.user.mobile}<br/>{node.user.email}</span>
                        </Col>
                    </Row>

                </Card>

            </> : null}
        </div>
    );
};
