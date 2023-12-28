import React from "react";
import { Card, Table, DatePicker, Select, Icon, List, Avatar, Row, Button, Spin } from "antd";
import moment from "moment";
import * as _ from "lodash";
import { getAPI, interpolate } from "../../../utils/common";
import { ACTIVITY_API, CATEGORY, SEARCH_PATIENT, SUB_CATEGORY } from "../../../constants/api";
import {loadStaff} from "../../../utils/clinicUtils";
import {ALL} from "../../../constants/dataKeys";
import {MODIFIED_ACTIVITY, CREATE_AT_ACTIVITY, DELETELED_ACTIVITY} from "../../../constants/hardData";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import debounce from "lodash/debounce";
const {RangePicker} = DatePicker;
const dateFormat = 'DD/MM/YYYY';
const {Option} = Select;

export default class ActivityList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activity: [],
            loading: false,
            categoryList: [],
            subCategoryList: [],
            startDate: moment().format(),
            endDate: moment().format(),
            advancedSearch: false,
            practiceStaff: [],
            loadMoreActivity: null,
            doctors: null,
            practice: null,
            selectedCategory: ALL,
            selectedSubCategory: ALL,
            activityType: null,
            patientListData:[]
        }
        this.lastFetchId = 0;
        this.loadActivityLog = this.loadActivityLog.bind(this);
        this.handleSearchPatient = debounce(this.handleSearchPatient, 800);
    }

    componentWillMount = async () => {
        this.loadCategory();
        loadStaff(this);
        this.loadActivityLog();


    }


    loadCategory = async () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                categoryList: data,
                // selectedCategory: data[0],
                loading: false
            })
            // that.loadSubCategory(data[0])
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })

        }
        getAPI(CATEGORY, successFn, errorFn);
    }


    loadSubCategory = async (value) => {
        const {selectedCategory} = this.state;
        const that = this;
        const successFn = function (data) {
            that.setState({
                subCategoryList: data,
                // selectedSubCategory: data[0],
                loading: false
            })
            that.loadActivityLog(1);
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })

        }
        const params = {
            category: value,
        }
        getAPI(SUB_CATEGORY, successFn, errorFn, params);
    }

    activityDateRange(dateString) {
        const that = this;
        this.setState({
                startDate: moment(dateString[0]).format(),
                endDate: moment(dateString[1]).format(),
            }, function () {
                that.loadActivityLog(1)
            }
        );
    }

    loadActivityLog(page = 1) {
        const that = this;
        const {selectedCategory, selectedSubCategory, startDate, endDate, practice, doctors, activityType} = that.state;
        that.setState({
            loading: true,
        })
        const successFn = function (data) {

            if (data.current == 1) {
                that.setState({
                    activity: data.results,
                    total: data.count,
                    loadMoreActivity: data.next,
                    loading: false,

                });
            } else {
                that.setState(function (prevState) {
                    return {
                        total: data.count,
                        activity: [...prevState.activity, ...data.results],
                        loading: false,
                        loadMoreActivity: data.next
                    }
                })
            }


        }
        const errorFn = function () {
            that.setState({
                loading: false,
            })

        }

        const params = {
            page,
            // patient:that.state.patient,
            user: doctors,
            start: moment(startDate).startOf('day').format(),
            end: moment(endDate).endOf('day').format(),
        }
        if (selectedCategory && selectedCategory != ALL) {
            params.category = selectedCategory;
        }

        if (selectedSubCategory && selectedSubCategory != ALL) {
            params.sub_category = selectedSubCategory;
        }
        if (activityType) {
            params.activity = activityType
        }
        if (that.state.patient) {
            params.patient = that.state.patient
        }
        getAPI(ACTIVITY_API, successFn, errorFn, params);
    }


    handleCategoryChange = (value) => {

        const that = this;
        this.setState({
            selectedCategory: value,
            selectedSubCategory: ALL,
        }, function () {
            if (value) {
                that.loadSubCategory(value);
            }
            that.loadActivityLog(1);
        });


    };

    onSubCategoryChange = value => {
        const that = this;
        this.setState({
            selectedSubCategory: value,
        }, function () {
            that.loadActivityLog(1);
        });

    };

    advanceSearch = () => {
        this.setState({
            advancedSearch: !this.state.advancedSearch
        })
    }

    handleSearchPatient = (value)=>{
        const that = this;
        this.lastFetchId += 1;
        const fetchId = this.lastFetchId;
        this.setState(function (prevState) {
            return {
                patientListData:[],
                searchPatientString: value,
                fetchingPatientList:true
            }
        });
        const successFn = function (data) {
            if (fetchId !== that.lastFetchId) {
                // for fetch callback order
                return;
            }
            that.setState(function (prevState) {
                    return {
                        fetchingPatientList:false,
                        patientListData: [...data.results],
                    }
            })
        };
        const errorFn = function (data) {
            that.setState({
                searchPatientString: null,
                fetchingPatientList:false,
            })
        };
        if (value) {
            getAPI(interpolate(SEARCH_PATIENT, [value]), successFn, errorFn,{page_size:5});
        }else{
            that.setState({
                patientListData:[],
                searchPatientString: value,
                fetchingPatientList:false,
                patient:null
            })
        }
    }
    renderFilter = () => {
        const {categoryList, subCategoryList, selectedCategory, selectedSubCategory, practiceStaff,fetchingPatientList} = this.state;
        return (
            <div>
                <Row>
                    <span>Category : </span>
                    <Select
                      defaultValue={ALL}
                      value={selectedCategory}
                      style={{width: 200, paddingLeft: 2, paddingRight: '20px'}}
                      onChange={this.handleCategoryChange}
                    >
                        <Select.Option value={ALL}>{ALL}</Select.Option>
                        {categoryList.map(category => (
                            <Option key={category} value={category}>{category}</Option>
                        ))}
                    </Select>
                    <span>Sub Category : </span>
                    <Select
                      style={{width: 200, paddingLeft: 2, paddingRight: 20}}
                      defaultValue={ALL}
                      value={selectedSubCategory}
                      onChange={this.onSubCategoryChange}
                    >
                        <Select.Option value=''>{ALL}</Select.Option>
                        {subCategoryList.map(subCategory => (
                            <Option key={subCategory} value={subCategory}>{subCategory}</Option>
                        ))}
                    </Select>

                    <span>Doctor/Staff : </span>
                    <Select
                      style={{width: 200, paddingLeft: 2, paddingRight: 20}}
                      allowClear
                        // style={{ width: '300px', maxWidth: '70vw', paddingLeft: 2, paddingRight: 20 }}
                      onChange={(value) => this.handleChangeOption('doctors', value)}
                      value={this.state.doctors}

                    >
                        {practiceStaff.map(item => (
                            <Option key={item.user.id}>{item.user.first_name}</Option>
                        ))}
                    </Select>


                    {/* <a onClick={this.advanceSearch} style={{marginLeft: 30}}>
                    <span>
                        Advance Filter <Icon type='filter'/>
                    </span>
                </a> */}
                    <span>Activity Type : </span>
                    <Select
                      style={{width: 200, paddingLeft: 2, paddingRight: 20}}
                      allowClear
                        // style={{ width: '300px', maxWidth: '70vw', paddingLeft: 2, paddingRight: 20 }}
                      onChange={(value) => this.handleChangeOption('activityType', value)}
                      value={this.state.activityType}

                    >
                        <Select.Option value="Added">Added</Select.Option>
                        <Select.Option value="Modified">Modified</Select.Option>
                        <Select.Option value="Deleted">Deleted</Select.Option>
                    </Select>
                    <span>Patient : </span>
                    <Select

                        style={{width: 200, paddingLeft: 2, paddingRight: 20}}
                        allowClear
                        // style={{ width: '300px', maxWidth: '70vw', paddingLeft: 2, paddingRight: 20 }}
                        onSearch={(value) => this.handleSearchPatient( value)}
                        onSelect={(value) => this.handleChangeOption('patient', value)}
                        onChange={(value) => this.handleChangeOption('patient', value)}
                        value={this.state.patient}
                        showSearch
                        notFoundContent={fetchingPatientList ? <Spin size="small" /> : null}
                        filterOption={false}

                    >
                        {this.state.patientListData.map(item=><Select.Option value={item.id} key={item.id}>{item.user.first_name} ({item.custom_id})</Select.Option>)}

                    </Select>
                </Row>

            </div>
        )
    }

    // renderMSG = (item) => {
    //     return (
    //         <p>
    //             {item.activity} <a> {item.sub_component} </a> for {item.user.first_name} created by {item.record_created_by && item.record_created_by.first_name}
    //         </p>
    //     )
    // }

    handleChangeOption = (type, value) => {
        const that = this;
        this.setState({
            [type]: value,
        }, function () {
            this.loadActivityLog(1);
        })

    }


    resetAdvanceSearch = () => {
        this.setState({
            doctors: '',
            practice: ''
        }, function () {
            this.loadActivityLog(1);
        })

    }

    renderAdvaceSearch = () => {
        const {categoryList, subCategoryList, selectedCategory, selectedSubCategory, practiceDoctors} = this.state;
        return (
            <div>
                {/* <span>Practice : </span>
                <Select
                    onChange={(value) => this.handleChangeOption('practice', value)}
                    defaultValue={this.props.active_practiceId}
                    value={this.state.practice}
                    style={{width: '300px', maxWidth: '70vw', paddingLeft: 2, paddingRight: 20}}
                >
                    {this.props.practiceList && this.props.practiceList.map((option) => (
                        <Select.Option
                            key={option.practice.id}
                            value={option.practice.id}
                        >{option.practice.name}
                        </Select.Option>
                    ))}
                </Select>


                <span>Doctor : </span>
                <Select
                    style={{width: '300px', maxWidth: '70vw', paddingLeft: 2, paddingRight: 20}}
                    onChange={(value) => this.handleChangeOption('doctors', value)}
                    value={this.state.doctors}

                >
                    {practiceDoctors.map(item => (
                        <Option key={item.id}>{item.user.first_name}</Option>
                    ))}
                </Select> */}


                <a onClick={this.resetAdvanceSearch} style={{marginLeft: 30}}>
                    <span>
                        <Icon type='undo' />reset
                    </span>
                </a>


            </div>
        )
    }

    isDateChanges = (lastDate, nowdate) => {
        return !!((_.isNull(lastDate) || lastDate.format('YMD') != moment(nowdate).format('YMD')))
    }


    renderActivity = (item) => {

        switch (item.activity) {

            case MODIFIED_ACTIVITY:
                return (
                    <List.Item key={item.id} style={{marginLeft: '40px', borderBottom: 0, padding: 0}}>

                        <List.Item.Meta
                          title={item.component}
                          description={(
                                <p>
                                    {item.activity} <b> {item.sub_component} </b> {item.patient ? (
                                    <span>for <a
                                      href={`/erp/patient/${item.patient.id}/profile/`}
                                    >{item.patient.user.first_name}
                                              </a>
                                    </span>
                                ) : '--'} {item.record_created_by ?
                                    <span> created by {item.record_created_by.first_name}</span> : '--'}
                                </p>
                            )}
                        />
                        <div
                          style={{paddingRight: 50}}
                        > {moment(item.created_at).format('LT')} From <b>{item.os}</b> / <b>{item.agent}</b>
                            <br />By <b>{item.user ? item.user.first_name : '--'}</b>
                        </div>

                    </List.Item>
                )
                break;

            case CREATE_AT_ACTIVITY:
                return (
                    <List.Item key={item.id} style={{marginLeft: '40px', borderBottom: 0, padding: 0}}>

                        <List.Item.Meta
                          title={item.component}
                          description={(
                                <p>
                                    {item.activity} <b> {item.sub_component} </b> {item.patient ? (
                                    <span>for <a
                                      href={`/erp/patient/${item.patient.id}/profile/`}
                                    >{item.patient.user.first_name}
                                              </a>
                                    </span>
                                ) : '--'}
                                </p>
                            )}
                        />
                        <div
                          style={{paddingRight: 50}}
                        >  {moment(item.created_at).format('LT')} From <b>{item.os}</b> / <b>{item.agent}</b>
                            <br />By <b>{item.user ? item.user.first_name : null}</b>
                        </div>

                    </List.Item>
                )
                break;

            case DELETELED_ACTIVITY:
                return (
                    <List.Item key={item.id} style={{marginLeft: '40px', borderBottom: 0, padding: 0}}>

                        <List.Item.Meta
                          title={item.component}
                          description={(
                                <p>
                                    {item.activity} <b> {item.sub_component} </b> {item.patient ? (
                                    <span>for <a
                                      href={`/erp/patient/${item.patient.id}/profile/`}
                                    >{item.patient.user.first_name}
                                              </a>
                                    </span>
                                ) : '--'}
                                </p>
                            )}
                        />
                        <div
                          style={{paddingRight: 50}}
                        >  {moment(item.created_at).format('LT')} From <b>{item.os}</b> / <b>{item.agent}</b>
                            <br />By <b>{item.user ? item.user.first_name : null}</b>
                        </div>

                    </List.Item>

                )
                break;

        }
    }

    render() {
        const {activity, loadMoreActivity, loading} = this.state;

        const timelineActivity = [];
        let lastDate = null;
        _.map(activity, (item) => {

            if (this.isDateChanges(lastDate, _.get(item, 'created_at'))) {
                lastDate = moment(_.get(item, 'created_at'));
                timelineActivity.push({type: "Time", date: _.get(item, 'created_at'),})
            }

            timelineActivity.push(item);
        })


        const loadMore =
            loadMoreActivity ? (
                <div
                  style={{
                        textAlign: 'center',
                        marginTop: 12,
                        height: 32,
                        lineHeight: '32px',
                    }}
                >
                    <Button loading={loading} type="primary" onClick={() => this.loadActivityLog(loadMoreActivity)}>Load
                        More
                    </Button>
                </div>
            ) : null;


        return (
            <div>

                <Row>
                    <Card>
                        {this.renderFilter()}
                    </Card>
                    {/* <br/> */}
                </Row>

                <Row>
                    <Card
                      title="Activity Log"
                      extra={(
                            <RangePicker
                              allowClear={false}
                              defaultValue={[moment(), moment()]}
                              onChange={(date, dateString) => this.activityDateRange(date)}
                              format={dateFormat}
                            />
                        )}
                    >

                        {/* <Table rowKey={record => record.id} loading={this.state.loading} dataSource={this.state.activity} /> */}
                        <List
                          header={this.state.advancedSearch ? this.renderAdvaceSearch() : null}
                          dataSource={timelineActivity}
                          loading={loading}
                            // loadMore={loadMore}
                            // locale={{ emptyText: 'No Data' }}
                          renderItem={item => (
                                <>

                                    {item.type == 'Time' ? (
                                        <p style={{
                                            borderBottom: '1px solid #e8e8e8',
                                            paddingBottom: '15px',
                                            paddingTop: '15px'
                                        }}
                                        ><b>{moment(item.date).format("dddd, MMMM Do YYYY")}</b>
                                        </p>
                                      ) :

                                        this.renderActivity(item)}
                                </>


                            )}
                        />
                        <InfiniteFeedLoaderButton
                          loaderFunction={() => this.loadActivityLog(loadMoreActivity)}
                          loading={this.state.loading}
                          hidden={!loadMoreActivity}
                        />
                    </Card>
                </Row>
            </div>
        )
    }
}
