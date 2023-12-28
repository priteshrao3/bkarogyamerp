import React from 'react';
import {Card, Tabs} from 'antd';
import DiseaseList from './DiseaseList';
import DiseaseCategory from './DiseaseCategory';
import TableData from '../../../settings/options/emr/TableData';
import {CONVERSION_SYMPTOM_API} from '../../../../constants/api';
import DetailedDisease from './DetailedDisease';
import ManageMedicine from "../medicine-conversion/ManageMedicine";

export default class DiseaseHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tab: 'category'
        }
    }

    changeTab = (value) => {
        this.setState({
            tab: value
        })
    }

    render() {
        const {tab} = this.state;
        return <div>
            <Card>
                <Tabs defaultActiveKey={"category"} onChange={(tab) => this.changeTab(tab)}>
                    <Tabs.TabPane key={'category'} tab={'Disease Category'}>
                        {tab == "category" ? <DiseaseCategory {...this.props}/> : null}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Symptoms" key="Symptoms">
                        {tab == "Symptoms" ?
                            <TableData {...this.props} id={CONVERSION_SYMPTOM_API} name="Symptom"/> : null}
                    </Tabs.TabPane>
                    <Tabs.TabPane key={'list'} tab={'Disease List'}>
                        {tab == "list" ? <DiseaseList {...this.props}/> : null}
                    </Tabs.TabPane>
                    <Tabs.TabPane key={'disease'} tab={'Disease Details'}>
                        {tab == "disease" ? <DetailedDisease {...this.props}/> : null}
                    </Tabs.TabPane>
                </Tabs>
            </Card>
        </div>;
    }
}
