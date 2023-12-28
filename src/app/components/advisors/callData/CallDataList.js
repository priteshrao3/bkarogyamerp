import { Button, Card, Col, Input, Row, Select, Statistic, Table, Tag } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { getAPI } from '../../../utils/common';
import { CALL_DATA, CITY, COUNTRY, STATE } from '../../../constants/api';
import CustomizedTable from '../../common/CustomizedTable';
import InfiniteFeedLoaderButton from '../../common/InfiniteFeedLoaderButton';


export default class CallDataList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchString: {},
            countrylist: [],
            stateList: [],
            cityList: [],
        };
    }

    componentDidMount() {
        this.loadData();
        this.getCountry();
    }

    loadData = (page = 1) => {
        let that = this;
        that.setState({
            loading: true,
        });
        let successFn = function(data) {
            that.setState(function(prevState) {
                if (data.current == 1) {
                    return {
                        callCount: data.count,
                        callList: data.results,
                        nextPage: data.next,
                        loading: false,
                    };
                } else {
                    return {
                        callCount: data.count,
                        callList: [...prevState.callList, ...data.results],
                        nextPage: data.next,
                        loading: false,
                    };
                }
            });
        };
        let errorFn = function() {
            that.setState({
                loading: false,
            });
        };
        let apiParams = { ...this.state.searchString };
        getAPI(CALL_DATA, successFn, errorFn, apiParams);
    };

    changeSearchString = (type, value) => {
        let that = this;
        this.setState(function(prevState) {
            return {
                searchString: { ...prevState.searchString, [type]: value },
            };
        }, function() {
            that.loadData();
        });
    };

    onChangeValue = (type, value) => {
        let that = this;
        this.setState(function(prevState) {
            let newSearchString = { ...prevState.searchString };
            if (type == 'country') {
                newSearchString.state = null;
            }
            newSearchString.city = null;
            return {
                searchString: { ...newSearchString, [type]: value },
                stateList: (type == 'country' && value == null ? [] : prevState.stateList),
                cityList: ((type == 'country' || type == 'state') && value == null ? [] : prevState.cityList),
            };
        }, function() {
            if (type == 'country' && value) {
                that.getState(value);
            }
            if (type == 'state' && value) {
                that.getCity(value);
            }
            that.loadData();
        });
    };

    getCountry() {
        let that = this;
        let successFn = function(data) {
            that.setState({
                countrylist: data,
            });
        };
        let errorFun = function() {

        };
        getAPI(COUNTRY, successFn, errorFun);
    }

    getState(countryId) {
        let that = this;
        let successFn = function(data) {
            that.setState({
                stateList: data,
            });

        };
        let errorFn = function() {

        };
        getAPI(STATE, successFn, errorFn, { country: countryId });
    }

    getCity(stateId) {
        let that = this;
        let successFn = function(data) {
            that.setState({
                cityList: data,
            });

        };
        let errorFn = function() {

        };
        getAPI(CITY, successFn, errorFn, { state: stateId });

    }

    render() {
        let columns = [{
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'Mobile',
            dataIndex: 'mobile',
            key: 'mobile',
        }, {
            title: 'City',
            dataIndex: 'city',
            key: 'city',
            render: (value) => value ? value.name : '--',
        }, {
            title: 'State',
            dataIndex: 'state',
            key: 'state',
            render: (value) => value ? value.name : '--',
        }, {
            title: 'PinCode',
            dataIndex: 'pincode',
            key: 'pincode',
        }, {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        }, {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
        }, {
            title: 'Medical History',
            dataIndex: 'medical_history',
            key: 'medical_history',
            render: (value, record) => value ? value.map(item => <Tag>{item.name}</Tag>) : null,
        }, {
            title: 'Advisor',
            dataIndex: 'created_advisor',
            key: 'created_advisor',
            render: (value, record) => value ? value.user.first_name +" ("+value.custom_id+")" : null,
        }, {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (value, record) => <Link to={`/erp/advisors/calldata/${record.id}/edit`}>Edit</Link>,
        }];
        return <div>
            <h2>Advisor Call Data
                <Link to={'/erp/advisors/calldata/add'}>
                    <Button style={{ float: 'right' }} type={'primary'} icon={'plus'}>Add</Button>
                </Link>
            </h2>
            <Card>
                <Row gutter={16}>
                    <Col sm={24} md={12} lg={5} style={{ marginBottom: 20 }}>
                        <h4>Country</h4>
                        <Select value={this.state.searchString.country} allowClear={true}
                                onChange={(value) => this.onChangeValue('country', value)} style={{ width: '100%' }}>
                            {this.state.countrylist.map((option) => <Select.Option
                                value={option.id}>{option.name}</Select.Option>)}
                        </Select>
                    </Col>
                    <Col sm={24} md={12} lg={5} style={{ marginBottom: 20 }}>
                        <h4>State</h4>
                        <Select value={this.state.searchString.state} allowClear={true}
                                onChange={(value) => this.onChangeValue('state', value)} style={{ width: '100%' }}>
                            {this.state.stateList.map((option) => <Select.Option
                                value={option.id}>{option.name}</Select.Option>)}
                        </Select>
                    </Col>
                    <Col sm={24} md={12} lg={5} style={{ marginBottom: 20 }}>
                        <h4>City</h4>
                        <Select value={this.state.searchString.city} allowClear={true} style={{ width: '100%' }}
                                onChange={(value) => this.onChangeValue('city', value)}>
                            {this.state.cityList.map((option) => <Select.Option
                                value={option.id}>{option.name}</Select.Option>)}
                        </Select>
                    </Col>
                    <Col sm={24} md={12} lg={5} style={{ marginBottom: 20 }}>
                        <h4>Patient Mobile</h4>
                        <Input style={{ width: '100%' }}
                               value={this.state.searchString.mobile}
                               onChange={(e) => this.changeSearchString('mobile', e.target.value)}/>
                    </Col>
                    <Col sm={24} md={24} lg={4} style={{ textAlign: 'center', marginBottom: 20 }}>
                        <Statistic title={'Total Count'} value={this.state.callCount}/>
                    </Col>
                </Row>
                <CustomizedTable pagination={false} dataSource={this.state.callList} columns={columns}
                                 hideReport={true}/>
                <InfiniteFeedLoaderButton loading={this.state.loading}
                                          loaderFunction={() => this.loadData(this.state.nextPage)}
                                          hidden={!this.state.nextPage}/>
            </Card>
        </div>;
    }
}
