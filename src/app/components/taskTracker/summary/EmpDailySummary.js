import { Affix, Card, Col, DatePicker, Icon, Row, Select, Spin, Timeline } from 'antd';
import React from 'react';
import moment from 'moment';
import { getAPI } from '../../../utils/common';
import { EMPLOYEE_TASK_SUMMARY, TASK_ASSIGNEE } from '../../../constants/api';

export default class EmpDailySummary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: moment(),
            selectedEmp: null,
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
        const { selectedDate, selectedEmp, assigneeList } = this.state;
        return <div>
            <h2>
                Employee Daily Summary
            </h2>
            <Card>
                <Row gutter={16}>
                    <Col span={6}></Col>
                    <Col span={6}>
                        <p>Employee</p>
                        <Select style={{ width: '100%' }} value={selectedEmp}
                                showSearch
                                onChange={(value) => this.updateFormValues('selectedEmp', value)}
                                optionFilterProp="children">
                            {assigneeList.map(item => <Select.Option
                                value={item.id}
                                label={item.first_name}>{item.first_name}&nbsp;({item.emp_id})</Select.Option>)}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <p>Date</p>
                        <DatePicker value={selectedDate} format={'DD-MM-YYYY'}
                                    allowClear={false}
                                    onChange={(value) => this.updateFormValues('selectedDate', value)}/>
                    </Col>
                </Row>
            </Card>
            <Card>
                <Spin spinning={this.state.loading}>
                    <Row>
                        <Col span={6}></Col>
                        <Col span={12}>
                            <Timeline progressDot current={1} direction="vertical">
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
