import React, { Component } from "react";
import { Row, Card, Tabs, Badge } from "antd";

const { TabPane } = Tabs;


export default class DepartmentDescription extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <Row>
                <Card>
                    <Tabs defaultActiveKey="1">
                        <TabPane
                          key="1"
                          tab={(
<span>
                                <Badge
                                  count={4}
                                  style={{ backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset', marginRight: 5 }}
                                />
                                All
</span>
)}
                        >
                            <p>All</p>
                        </TabPane>
                        <TabPane
                          key="2"
                          tab={(
<span>
                                <Badge
                                  count={4}
                                  style={{ backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset', marginRight: 5 }}
                                />
                                Todos
</span>
)}
                        >
                            <p>Todos</p>
                        </TabPane>

                        <TabPane
                          key="3"
                          tab={(
<span>
                                <Badge
                                  count={4}
                                  style={{ backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset', marginRight: 5 }}
                                />
                                Inprogress
</span>
)}
                        >
                            <p>Inprogress</p>
                        </TabPane>
                        <TabPane
                          key="4"
                          tab={(
<span>
                                <Badge
                                  count={4}
                                  style={{ backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset', marginRight: 5 }}
                                />
                                Today
</span>
)}
                        >
                            <p>Today</p>
                        </TabPane>
                    </Tabs>
                </Card>
            </Row>
        );
    }


}