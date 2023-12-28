import React from 'react';
import {Col, Collapse, Divider, List, Result, Row, Select, Spin, Typography} from "antd";
import {displayMessage, getAPI, makeFileURL} from "../../utils/common";
import {ERROR_MSG_TYPE} from "../../constants/dataKeys";
import {CONEVRSION_LIST_API, CONVERSION_MEDICINE_API} from "../../constants/api";
import {ALLOPATH_TEXT} from "../../constants/hardData";

const {Panel} = Collapse;
const {Paragraph, Title} = Typography;
export default class AllopathToAyuveda extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            medicineList: [],
            medicineMappingList: [],
            medicineMappingLoading: false,
            medicineObject: {}
        }
    }

    componentDidMount() {
        this.loadConversionMedicineList()
    }

    loadConversionMedicineList = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                medicineList: data.results,

            })
        }
        const errorFn = function () {

            displayMessage(ERROR_MSG_TYPE, `Medicine List Loading Failed.`);
        }
        getAPI(CONVERSION_MEDICINE_API, successFn, errorFn, {medicine_type: ALLOPATH_TEXT})
    }

    loadAvailableConversion = (id) => {
        this.setState(function (prevState) {
            let selectedMedicine = null;
            prevState.medicineList.forEach(function (item) {
                if (item.id == id) {
                    selectedMedicine = item
                }
            })
            return {selectedMedicine, medicineMappingLoading: true}

        })
        const that = this;
        const successFn = function (data) {
            const medicines = {};
            data.results.forEach(function (mapping) {
                mapping.ayurveda_data.forEach(function (med) {
                    medicines[med.id] = med
                })
            })
            that.setState({
                medicineMappingList: data.results,
                medicineMappingLoading: false,
                medicineObject: medicines
            })
        }
        const errorFn = function () {
            that.setState({
                medicineMappingLoading: false
            })
            displayMessage(ERROR_MSG_TYPE, "Medicine Mapping List Loading Failed.");
        }
        getAPI(CONEVRSION_LIST_API, successFn, errorFn, {allopath: id})
    }

    searchOperation = (type, searchString) => {
        const that = this;
        const successFn = function (data) {
            that.setState(function (prevState) {
                return {medicineList: data.results}
            })
        }
        const errorFn = function () {
            displayMessage(ERROR_MSG_TYPE, "Something went wrong!!");
        }
        const params = {
            medicine_type:type,
            'name_contains': searchString
        }
        getAPI(CONVERSION_MEDICINE_API, successFn, errorFn, params)
    }

    render() {
        const {medicineList, medicineMappingLoading, selectedMedicine, medicineObject} = this.state;
        const medList = Object.keys(medicineObject).map(key => {
            return {...medicineObject[key]}
        });
        return (
            <div>
                <Row gutter={16}>
                    <Col xs={24} sm={24} md={0} lg={0}>
                        <h3>Allopath Medicine</h3>
                    </Col>
                    <Col xs={0} sm={0} md={8} lg={8}>
                        <h3 style={{textAlign: 'right'}}>Allopath Medicine</h3>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12}>
                        <Select
                          style={{width: '100%'}}
                          onChange={(e) => this.loadAvailableConversion(e)}
                          showSearch
                          filterOption={false}
                          onSearch={(value) => this.searchOperation(ALLOPATH_TEXT, value)}
                        >
                            {medicineList.map(item => <Select.Option value={item.id}>{item.name}</Select.Option>)}
                        </Select>
                    </Col>
                </Row>
                <Spin spinning={medicineMappingLoading}>
                    <>
                        {selectedMedicine ? (
                            <div>
                                <Divider />
                                <Title level={3}>{selectedMedicine.name}</Title>
                                <List.Item
                                  key={selectedMedicine.id}
                                  extra={(
                                        <img
                                          width={272}
                                          alt={selectedMedicine.name}
                                          style={{float: 'right'}}
                                          src={makeFileURL(selectedMedicine.image)}
                                        />
                                    )}
                                >
                                    <div>
                                        <Row>
                                            <Col span={24}>
                                                <Title level={4}>Description</Title>
                                                <div dangerouslySetInnerHTML={{__html: selectedMedicine.description}} />
                                            </Col>
                                            <Col span={24}>
                                                <Title level={4}>Side Effects</Title>
                                                <div dangerouslySetInnerHTML={{__html: selectedMedicine.benefit}} />
                                            </Col>
                                        </Row>
                                    </div>
                                </List.Item>
                            </div>
                        ) : null}
                        {medList.length ?
                            <Divider><Title level={3}>Recommended Ayurveda Suggestions</Title></Divider> : (
                                <Result
                                  title="Select Allopath medicine for suggested Ayurveda Medicine"
                                />
                            )}
                        <Collapse
                          accordion
                          bordered={false}
                          className="site-collapse-custom-collapse"
                        >{medList.map(item => (
                            <Panel
                              header={<Title level={3}>{item.name}</Title>}
                              key={item.id}
                              className="site-collapse-custom-panel"
                            >
                                <img
                                  width={272}
                                  alt={item.name}
                                  style={{float: 'right'}}
                                  src={makeFileURL(item.image)}
                                />
                                <Row>
                                    <Col span={24}>
                                        <Title level={4}>Description</Title>
                                        <div dangerouslySetInnerHTML={{__html: item.description}} />
                                    </Col>
                                    <Col span={24}>
                                        <Title level={4}>Benefits</Title>
                                        <div dangerouslySetInnerHTML={{__html: item.benefit}} />
                                    </Col>
                                </Row>
                            </Panel>
                        ))}
                        </Collapse>
                    </>
                </Spin>
            </div>
        )
    }
}
