import { Affix, Card, Col, DatePicker, Icon, Row, Select, Spin, Timeline } from 'antd';
import React from 'react';
import moment from 'moment';
import { getAPI } from '../../../utils/common';
import { EMPLOYEE_TASK_SUMMARY, TASK_ASSIGNEE } from '../../../constants/api';

export default class MyDailySummary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: moment(),
            selectedEmp: this.props.user.id,
            assigneeList: [],
            summary: [],
            loading: false,
        };
    }

    componentDidMount() {
        this.loadAssignee();
    }

    updateFormValues = (type, value) => {
        const that = this;
        this.setState({
            [type]: value,
        }, function() {
            that.loadSummary();
        });
    };

    loadAssignee = () => {
        const that = this;
        const successFn = function(data) {
            that.setState({
                assigneeList: data,
            });
        };
        const errorFn = function() {

        };
        getAPI(TASK_ASSIGNEE, successFn, errorFn);
    };

    loadSummary = () => {
        const that = this;
        that.setState({
            loading: true,
        });
        const successFn = function(data) {
            let lastHour = 23;
            let timelineData = [];
            that.setState(function() {
                data.forEach(function(item) {
                    if (lastHour != moment(item.time).format('HH')) {
                        lastHour = moment(item.time).format('HH');
                        timelineData.push({ type: 'Time', time: item.time });
                    }
                    timelineData.push(item);
                });

                return {
                    summary: timelineData,
                    loading: false,
                };
            });
        };
        const errorFn = function() {
            that.setState({
                loading: false,
            });
        };
        const apiParams = {
            date: this.state.selectedDate.format('YYYY-MM-DD'),
            user: this.state.selectedEmp,
        };
        if (this.state.selectedEmp && this.state.selectedDate)
            getAPI(EMPLOYEE_TASK_SUMMARY, successFn, errorFn, apiParams);
    };

    render() {
        const { selectedDate, selectedEmp, assigneeList, loading } = this.state;
        return <div>
            <h2>
                Employee Daily Summary
                <DatePicker value={selectedDate} format={'DD-MM-YYYY'}
                            allowClear={false}
                            style={{ float: 'right' }}
                            onChange={(value) => this.updateFormValues('selectedDate', value)}/>
            </h2>
            <Card>
                <Spin tip={'Loading...'} spinning={loading}>
                    <Row>
                        <Col span={6}></Col>
                        <Col span={12}>
                            <Timeline  current={1} direction="vertical" mode={'left'}>
                                {/* remove from the above timeline component = progressDot */}
                                {this.state.summary.length ? this.state.summary.map(item => (
                                    <Timeline.Item dot={item.type == 'Time' ? (
                                        <Icon
                                            type="clock-circle-o"
                                            style={{ fontSize: '25px' }}
                                        />
                                    ) : null}
                                    >
                                        {item.type == 'Time' ? (
                                            <span>
                                    <Affix top={20} offsetTop={10}>
                                        <h2 style={{
                                            marginLeft: '10px',
                                            padding: '5px',
                                            backgroundImage: 'linear-gradient(to right, #ddd , white)',
                                            borderRadius: '4px',
                                        }}
                                        >
                                            {moment(item.time).startOf('hour').format('LT')}
                                            &nbsp;-&nbsp;
                                            {moment(item.time).endOf('hour').format('LT')}
                                        </h2>
                                    </Affix>
                                </span>
                                        ) : <><small>{moment(item.time).format('HH:MM A')}</small><p>{item.log}</p> </>}

                                    </Timeline.Item>
                                )) : <h4 style={{ textAlign: 'center' }}>No Updates</h4>}
                            </Timeline>
                        </Col>
                    </Row>
                </Spin>
            </Card>
        </div>;
    }
}
