import {
    BK_AROGYAM_TRANSLATIONS_HEAD,
    BK_WEBSITE_LANG_OPTIONS,
    BK_WEBSITE_TRANSALTION_CATEGORY,
    BK_WEBSITE_TRANSLATION_CATEGORY,
} from '../../../../constants/websites';
import { Button, Card, Form, Modal, Select, Table } from 'antd';
import React from 'react';
import { WEB_DYNAMIC_CONTENT, WEB_DYNAMIC_SINGLE_CONTENT } from '../../../../constants/api';
import { displayMessage, getAPI, interpolate } from '../../../../utils/common';
import DynamicFieldsForm from '../../../common/DynamicFieldsForm';
import {
    ERROR_MSG_TYPE, INPUT_FIELD,
    LABEL_FIELD,
    QUILL_TEXT_FIELD,
    SUCCESS_MSG_TYPE
} from "../../../../constants/dataKeys";

export default class Translations extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            translations: [],
            loading: false,
            editOptions: null,
            translationLanguage: 'ENGLISH',
        };
    }

    componentDidMount() {
        let translations = {};
        BK_AROGYAM_TRANSLATIONS_HEAD.forEach(function(key) {
            translations[key] = null;
        });
        this.setState({
            translations,
        });
        this.loadData();
    }

    loadData = () => {
        let that = this;
        that.setState({
            loading: true,
        });
        let successFn = function(data) {
            that.setState(function(prevState) {
                let newTranslations = {  };
                BK_AROGYAM_TRANSLATIONS_HEAD.forEach(function(key) {
                    newTranslations[key] = null;
                });
                data.results.forEach(function(transData) {
                    newTranslations[transData.title] = transData;
                });
                return {
                    translations: newTranslations,
                    loading: false,
                };
            });
        };
        let errorFn = function() {
            that.setState({
                loading: false,
            });
        };
        let apiParams = {
            category: BK_WEBSITE_TRANSLATION_CATEGORY,
            page_size: 200,
            language: that.state.translationLanguage,
        };
        getAPI(WEB_DYNAMIC_CONTENT, successFn, errorFn, apiParams);
    };
    toggleEditModal = options => {
        this.setState({
            editOptions: options,
        });
    };
    changeLang = lang => {
        let that = this;
        this.setState(
            {
                translationLanguage: lang,
            },
            function() {
                that.loadData();
            },
        );
    };
    render() {
        const { translations, loading, editOptions, translationLanguage } = this.state;
        let i = 1;
        const that = this;
        const columns = [
            {
                title: 'SNo',
                dataIndex: 's',
                key: 's',
                align: 'right',
                render: value => <span>{i++}.</span>,
            },
            {
                title: 'Head',
                dataIndex: 'title',
                key: 'title',
            },
            {
                title: 'Value',
                dataIndex: 'body',
                key: 'body',
                render:(value)=><div dangerouslySetInnerHTML={{__html:value}}/>
            },
            {
                title: 'Actions',
                dataIndex: 'actions',
                key: 'actions',
                render: (value, record) => (
                    <span>
                        <Button
                            type={'link'}
                            size={'small'}
                            onClick={() => that.toggleEditModal(record)}
                        >
                            Edit
                        </Button>
                    </span>
                ),
            },
        ];
        let translationsArray = Object.keys(translations).map(key =>
            translations[key]
                ? translations[key]
                : { title: key, language: translationLanguage },
        );
        const EditForm = Form.create()(DynamicFieldsForm);
        const formFields = [
            {
                label: 'Type',
                type: LABEL_FIELD,
                key: 'title',
                follow: editOptions ? editOptions.title : null,
            },
            {
                label: 'Language',
                type: LABEL_FIELD,
                key: 'language',
                follow: editOptions ? editOptions.language : null,
                required: true,
            },
            {
                label: 'Value',
                type: editOptions && editOptions["title"].includes("Head")&& !editOptions["title"].includes("Content") ? INPUT_FIELD : QUILL_TEXT_FIELD,
                key: 'body',
                initialValue: editOptions ? editOptions.body : null,
                required: true,
            },
        ];
        const formProps = {
            action:
                editOptions && editOptions.id
                    ? interpolate(WEB_DYNAMIC_SINGLE_CONTENT, [editOptions.id])
                    : WEB_DYNAMIC_CONTENT,
            method: editOptions && editOptions.id ? 'put' : 'post',
            successFn: function() {
                that.loadData();
                displayMessage(SUCCESS_MSG_TYPE, 'Translations recorded successfully!!');
                that.toggleEditModal(null);
            },
            errorFn: function() {
                displayMessage(ERROR_MSG_TYPE, 'Something went wrong !!');
            },
        };
        const defaultFields = [
            { key: 'language', value: translationLanguage },
            { key: 'category', value: BK_WEBSITE_TRANSLATION_CATEGORY },
            { key: 'title', value: editOptions ? editOptions.title : null },
            { key: 'id', value: editOptions ? editOptions.id : null },
        ];
        return (
            <Card
                title={'BK Arogyam Website Translations'}
                extra={
                    <Select
                        value={translationLanguage}
                        style={{ width: 200 }}
                        onChange={e => this.changeLang(e)}
                    >
                        {BK_WEBSITE_LANG_OPTIONS.map(item => (
                            <Select.Option value={item.value}>{item.label}</Select.Option>
                        ))}
                    </Select>
                }
            >
                <Table
                    columns={columns}
                    dataSource={translationsArray}
                    pagination={false}
                    loading={loading}
                />
                <Modal
                    visible={!!editOptions}
                    footer={null}
                    width={1000}
                    onCancel={() => this.toggleEditModal(null)}
                >
                    <EditForm
                        fields={formFields}
                        formProp={formProps}
                        defaultValues={defaultFields}
                    />
                </Modal>
            </Card>
        );
    }
}
