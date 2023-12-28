import {Card, Layout, Tabs} from "antd";
import React from 'react';
import AllopathToAyurveda from "./AllopathToAyurveda";
import DiseaseToAyurveda from "./DiseaseToAyurveda";
import AyurvedaDetail from "./AyurvedaDetail";

const {Content} = Layout;
const {TabPane} = Tabs;

export default class ConversionHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
            <Content
              className="main-container"
              style={{
                    margin: '24px 16px',
                    // padding: 24,
                    minHeight: 280,
                    // marginLeft: '200px'
                }}
            >
                <div>
                    <h2>Allopath to Ayurveda Conversion Panel</h2>
                    <Card>
                        <Tabs size="large">
                            <TabPane tab="Search by Allopath" key={1}>
                                <AllopathToAyurveda />
                            </TabPane>
                            <TabPane tab="Search by Disease" key={2}>
                                <DiseaseToAyurveda />
                            </TabPane>
                            <TabPane tab="Search by Ayurveda" key={3}>
                                <AyurvedaDetail />
                            </TabPane>
                        </Tabs>

                    </Card>
                </div>
            </Content>
        )
    }
}
