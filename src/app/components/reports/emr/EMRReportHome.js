import React from "react";
import {Button, Card, Checkbox, Col, Icon, Radio, Row, Select} from "antd";
import {EMR_RELATED_REPORT} from "../../../constants/hardData";
import TreatmentForEachDoctor from "./TreatmentForEachDoctor";
import {
    ALL_TREATMENTS,
    DAILY_TREATMENT_COUNT,
    MONTHLY_TREATMENT_COUNT, TREATMENT_FOR_EACH_CATEGORY,
    TREATMENTS_FOR_EACH_DOCTOR
} from "../../../constants/dataKeys";
import DailyTreatmentsCount from "./DailyTreatmentsCount";
import AllTreatmentPerformed from "./AllTreatmentPerformed";
import MonthlyTreatmentCount from "./MonthlyTreatmentCount";
import TreatmentForEachCategory from "./TreatmentForEachCategory";
import {loadDoctors} from "../../../utils/clinicUtils";
import TotalAmountDue from "../amountdue/TotalAmountDue";

export default class EMRReportHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            type:'ALL',
            loading:true,
            sidePanelColSpan:4,
            advancedOptionShow: true,
            practiceDoctors:[],
        };
        loadDoctors(this);

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
            <h2>EMR Report <Button
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
                        {this.state.type==ALL_TREATMENTS?<AllTreatmentPerformed {...this.state} {...this.props} />:null}

                        {this.state.type==DAILY_TREATMENT_COUNT ?<DailyTreatmentsCount {...this.state} {...this.props} />:null}

                        {this.state.type==TREATMENTS_FOR_EACH_DOCTOR?<TreatmentForEachDoctor {...this.state} {...this.props} />:null}

                        {this.state.type==MONTHLY_TREATMENT_COUNT?<MonthlyTreatmentCount {...this.state} {...this.props} />:null}

                        {this.state.type==TREATMENT_FOR_EACH_CATEGORY?<TreatmentForEachCategory {...this.state} {...this.props} />:null}
                    </Col>
                    <Col span={this.state.sidePanelColSpan}>
                        <Radio.Group buttonStyle="solid" defaultValue={ALL_TREATMENTS} onChange={(value)=>this.onChangeHandle('type',value)}>
                            <h2>Treatments</h2>
                            <Radio.Button
                              style={{width: '100%', backgroundColor: 'transparent', border: '0px'}}
                              value={ALL_TREATMENTS}
                            >
                                All Treatments Performed
                            </Radio.Button>
                            <p><br /></p>
                            <h2>Related Reports</h2>
                            {EMR_RELATED_REPORT.map((item) => (
<Radio.Button
  style={{width: '100%', backgroundColor: 'transparent'}}
  value={item.value}
>
                                {item.name}
</Radio.Button>
))}
                        </Radio.Group>

                        <br />
                        <br />
                        {this.state.advancedOptionShow?(
<>
                            <Button type="link" onClick={(value)=>this.advancedOption(false)}>Hide Advanced Options </Button>
                            <Col> <br />
                                <h4>Doctors</h4>
                                <Select
                                  style={{minWidth: '200px'}}
                                  mode="multiple"
                                  placeholder="Select Doctors"
                                  onChange={(value)=>this.handleChangeOption('doctors',value)}
                                >
                                    {this.state.practiceDoctors.map((item) => (
<Select.Option value={item.id}>
                                        {item.user.first_name}
</Select.Option>
))}
                                </Select>

                                <br />
                                <br />
                                <Checkbox onChange={(e)=>this.onChangeCheckbox(e)}> Only Completed</Checkbox>
                            </Col>
</>
): <Button type="link" onClick={(value)=>this.advancedOption(true)}>Show Advanced Options </Button>}
                    </Col>
                </Row>
            </Card>
</div>
)
    }
}
