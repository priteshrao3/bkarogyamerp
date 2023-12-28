import React from 'react';
import {Card, Tabs} from "antd";
import TableData from "../../../settings/options/emr/TableData";
import {CONVERSION_DISEASE_API, CONVERSION_SYMPTOM_API, EMR_TREATMENTNOTES} from "../../../../constants/api";
import ManageMedicine from "./ManageMedicine";
import MedicineMapping from "./MedicineMapping";

const {TabPane} = Tabs;
export default class MedicineConversionSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tab: "Medicines"
        }
    }

    changeTab = (value) => {
        this.setState({
            tab: value
        })
    }

    render() {
        const {tab} = this.state;
        return (
            <div>
                <Card>
                    <Tabs onChange={(tab) => this.changeTab(tab)}>
                        {/*<TabPane tab="Diseases" key="Diseases">*/}
                        {/*    {tab == "Diseases" ?*/}
                        {/*        <TableData {...this.props} id={CONVERSION_DISEASE_API} name="Disease" /> : null}*/}
                        {/*</TabPane>*/}
                        {/*<TabPane tab="Symptoms" key="Symptoms">*/}
                        {/*    {tab == "Symptoms" ?*/}
                        {/*        <TableData {...this.props} id={CONVERSION_SYMPTOM_API} name="Symptom" /> : null}*/}
                        {/*</TabPane>*/}
                        <TabPane tab="Medicines" key="Medicines">
                            {tab == "Medicines" ? <ManageMedicine /> : null}
                        </TabPane>
                        <TabPane tab="Medicine Mapping" key="Medicine Mapping">
                            {tab == "Medicine Mapping" ? <MedicineMapping /> : null}
                        </TabPane>
                    </Tabs>
                </Card>
            </div>
        );
    }

}
