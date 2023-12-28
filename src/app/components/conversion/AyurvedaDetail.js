import React from 'react';
import {Col, Collapse, Divider, List, Result, Row, Select, Spin, Typography} from "antd";
import {displayMessage, getAPI, makeFileURL} from "../../utils/common";
import {ERROR_MSG_TYPE} from "../../constants/dataKeys";
import {CONEVRSION_LIST_API, CONVERSION_MEDICINE_API} from "../../constants/api";
import {ALLOPATH_TEXT, AYURVEDA_TEXT} from "../../constants/hardData";

const {Panel} = Collapse;
const {Paragraph, Title} = Typography;
export default class AyurvedaDetail extends React.Component {
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
        getAPI(CONVERSION_MEDICINE_API, successFn, errorFn, {medicine_type: AYURVEDA_TEXT})
    }

    loadAvailableConversion = (id) => {
        this.setState(function (prevState) {
            let selectedMedicine = null;
            prevState.medicineList.forEach(function (item) {
                if (item.id == id) {
                    selectedMedicine = item
                }
            })
            return {selectedMedicine}

        })
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
        const {medicineList, medicineMappingLoading, selectedMedicine} = this.state;
        return (
            <div>
                <Row gutter={16}>
                    <Col xs={24} sm={24} md={0} lg={0}>
                        <h3>Ayurveda Medicine</h3>
                    </Col>
                    <Col xs={0} sm={0} md={8} lg={8}>
                        <h3 style={{textAlign: 'right'}}>Ayurveda Medicine</h3>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12}>
                        <Select style={{width: '100%'}} onChange={(e) => this.loadAvailableConversion(e)} showSearch onSearch={(value) => this.searchOperation(AYURVEDA_TEXT, value)} filterOption={false}>
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
                                                <Title level={4}>Benefits</Title>
                                                <div dangerouslySetInnerHTML={{__html: selectedMedicine.benefit}} />
                                            </Col>
                                        </Row>
                                    </div>
                                </List.Item>
                            </div>
                        ) : (
                            <Result
                              title="Select Ayurveda medicine for details"
                            />
                        )}
                    </>
                </Spin>
            </div>
        )
    }
}
