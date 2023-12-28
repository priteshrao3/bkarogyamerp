import React from "react";
import {Button, Card, Checkbox, Col, Radio, Row, Select} from "antd";
import {EMR_RELATED_REPORT, SUGGESTIONS_STATUS} from "../../../constants/hardData";
import {
    ALL,
} from "../../../constants/dataKeys";
import Suggestions from "./Suggestions";

export default class SuggestionHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type:'ALL',
            loading:true,
            sidePanelColSpan:4,
            advancedOptionShow: true,
        };

    }


    onChangeHandle =(type,value)=>{
        const that=this;
        this.setState({
            [type]:value.target.value,
        })
    };

    advancedOption(value){
        this.setState({
            advancedOptionShow:value,
        })
    }

    changeSidePanelSize = (sidePanel) => {
        this.setState({
            sidePanelColSpan: sidePanel ? 0 : 4
        })
    };

    handleChangeOption = (type,value) => {
        const that = this;
        this.setState({
            [type]: value,
        })
    };

    onChangeCheckbox=(e)=>{
        this.setState({
            is_complete: !this.state.is_complete,
        });
    };

    render() {

        return (
<div>
            <h2>Suggestions Report <Button
              type="primary"
              shape="round"
              icon={this.state.sidePanelColSpan ? "double-right" : "double-left"}
              style={{float: "right"}}
              onClick={() => this.changeSidePanelSize(this.state.sidePanelColSpan)}
            >Panel
                                   </Button>
            </h2>
            <Card>
                <Row gutter={16}>
                    <Col span={(24 - this.state.sidePanelColSpan)}>
                        {this.state.type==ALL?<Suggestions {...this.state} {...this.props} />:null}
                    </Col>
                    <Col span={this.state.sidePanelColSpan}>
                        <Radio.Group buttonStyle="solid" defaultValue={ALL} onChange={(value)=>this.onChangeHandle('type',value)}>
                            <h2>Suggestions</h2>
                            <Radio.Button
                              style={{width: '100%', backgroundColor: 'transparent', border: '0px'}}
                              value={ALL}
                            >
                                All Suggestions
                            </Radio.Button>
                            <p><br /></p>
                            <h2>Related Reports</h2>

                        </Radio.Group>

                        {/* <br/> */}
                        {/* <br/> */}
                        {/* {this.state.advancedOptionShow?<> */}
                        {/*    <Button type="link" onClick={(value)=>this.advancedOption(false)}>Hide Advanced Options </Button> */}
                        {/*    <Col> <br/> */}
                        {/*        <h4>Status</h4> */}
                        {/*        <Select style={{minWidth: '200px'}} mode="multiple" placeholder="Select Status" */}
                        {/*                onChange={(value)=>this.handleChangeOption('status',value)}> */}
                        {/*            {SUGGESTIONS_STATUS.map((item) => <Select.Option value={item.value}> */}
                        {/*                {item.label}</Select.Option>)} */}
                        {/*        </Select> */}

                        {/*        <br/> */}
                        {/*    </Col> */}
                        {/* </>: <Button type="link" onClick={(value)=>this.advancedOption(true)}>Show Advanced Options </Button>} */}
                    </Col>
                </Row>
            </Card>
</div>
)
    }
}
