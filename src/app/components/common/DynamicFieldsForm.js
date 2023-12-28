import React from "react";
import {
    Button,
    Checkbox,
    DatePicker,
    Divider,
    Form,
    Icon,
    Input,
    InputNumber,
    message,
    Modal,
    Radio,
    Select,
    Tag,
    TimePicker,
    Upload,
    Avatar, Rate,
} from "antd";
import moment from "moment";
import SwatchesPicker from 'react-color/lib/Swatches';
import WebCamField from "./WebCamField";
import {Editor} from 'react-draft-wysiwyg';
import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {ContentState, convertToRaw, EditorState} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import {EXTRA_DATA, FILE_UPLOAD_API, FILE_UPLOAD_BASE64, MULTIPLE_FILE_UPLOAD_API} from "../../constants/api";
import {REQUIRED_FIELD_MESSAGE} from "../../constants/messages";
import {
    CHECKBOX_FIELD,
    CITY_FIELD,
    COLOR_PICKER,
    COUNTRY_FIELD,
    DATE_PICKER,
    DATE_TIME_PICKER,
    DIVIDER_FIELD,
    EMAIL_FIELD, ERROR_MSG_TYPE,
    INPUT_FIELD, LABEL_FIELD,
    MAIL_TEMPLATE_FIELD,
    MULTI_IMAGE_UPLOAD_FIELD,
    MULTI_SELECT_FIELD,
    NUMBER_FIELD,
    PASSWORD_FIELD,
    QUILL_TEXT_FIELD,
    RADIO_FIELD, RATE_FIELD, SEARCH_FIELD,
    SELECT_FIELD,
    SINGLE_CHECKBOX_FIELD,
    SINGLE_IMAGE_UPLOAD_FIELD,
    SMS_FIELD,
    STATE_FIELD,
    SUCCESS_MSG_TYPE,
    TEXT_FIELD,
    TIME_PICKER, FRAME_VIEW
} from "../../constants/dataKeys";
import {displayMessage, getAPI, makeFileURL, makeURL, postAPI, putAPI} from "../../utils/common";
// import SwatchesPicker from 'react-color/lib/Swatches';
// import {EXTRA_DATA, FILE_UPLOAD_API, FILE_UPLOAD_BASE64, MULTIPLE_FILE_UPLOAD_API} from "../../constants/api";
// import WebCamField from "./WebCamField";
// import {Editor} from 'react-draft-wysiwyg';
import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
// import {ContentState, convertToRaw, EditorState} from 'draft-js';
// import draftToHtml from 'draftjs-to-html';
// import htmlToDraft from 'html-to-draftjs';

const {TextArea} = Input;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;


class DynamicFieldsForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fields: this.props.fields, // Fields data to create the form
            formData: {},
            formProp: {authorisation: true, ...this.props.formProp},    // Form data to send on form submission
            disabled: false,
            loading: false,
            countryOptions: [],
            stateOptions: [],
            cityOptions: [],
            smsFields: {},
            urlInitialValues: {},
            webCamState: {},
            editorState: {},
            searchResults: {},
            searchFields: {},
            formErrors: {}
        }
        this.resetFormData = this.resetFormData.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.colorChange = this.colorChange.bind(this);
        this.loadCountryData = this.loadCountryData.bind(this);
        this.addSMSTag = this.addSMSTag.bind(this);
        // this.onFormFieldDataChange = this.onFormFieldDataChange.bind(this)
    }

    componentWillReceiveProps(nextProps) {
    }

    fieldDecorators = (field, formData) => {
        const {urlInitialValues} = this.state;
        if (field.type == MULTI_SELECT_FIELD) {
            return {
                initialValue: formData[field.key] ? formData[field.key] : (urlInitialValues[field.key] ? urlInitialValues[field.key] : formData[field.key]),
                rules: [{
                    required: field.required,
                    message: REQUIRED_FIELD_MESSAGE,
                    type: 'array'
                }]
            }
        }

        return {
            initialValue: formData[field.key] ? formData[field.key] : (urlInitialValues[field.key] ? urlInitialValues[field.key] : formData[field.key]),
            rules: [{
                required: field.required,
                message: REQUIRED_FIELD_MESSAGE
            }]
        }
    }

    componentDidMount() {
        const that = this;
        this.resetFormData();
        this.props.fields.forEach(function (field) {
            if (field.type == COUNTRY_FIELD) {
                that.loadCountryData();
            }
            if (field.type == SEARCH_FIELD) {
                that.setState(function (prevState) {
                    return {
                        searchResults: {...prevState.searchResults, [field.key]: field.searchInitialFields || []},
                        searchFields: {...prevState.searchFields, [field.key]: field}
                    }
                })
            }
        });
        if (this.props.history && this.props.history.location.search) {
            const pairValueArray = this.props.history.location.search.substr(1).split('&');
            if (pairValueArray.length) {
                const urlInitialValue = {};
                pairValueArray.forEach(function (item) {
                    const keyValue = item.split('=');
                    if (keyValue && keyValue.length == 2) {
                        if (!isNaN(keyValue[1]) && keyValue[1].toString().indexOf('.') != -1) {
                            urlInitialValue[keyValue[0]] = parseFloat(keyValue[1]);
                        } else if (!isNaN(keyValue[1])) {
                            urlInitialValue[keyValue[0]] = parseInt(keyValue[1]);
                        } else {
                            urlInitialValue[keyValue[0]] = keyValue[1];
                        }
                    }
                });
                this.setState({
                    urlInitialValues: urlInitialValue
                })
            }
        }
    }

    resetFormData() {
        const formData = {};
        this.state.fields.forEach(function (field) {
            formData[field.key] = field.initialValue
        });
        this.setState({
            formData
        })
    }

    // onFormFieldDataChange() {
    //     if (this.props.formProp.onFieldsDataChange) {
    //         let values = this.props.form.getFieldsValue();
    //         console.log(values);
    //         this.props.formProp.onFieldsDataChange(values);
    //     }
    // }

    handleSubmit = (e) => {
        const that = this;
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                if (this.props.defaultValues) {
                    console.log(this.props.defaultValues)
                    this.props.defaultValues.forEach(function (object) {
                        // values[object.key] = object.value;
                        values = {[object.key]: object.value, ...values}
                    })
                }
                if (this.state.colorPickerKey) {
                    values[this.state.colorPickerKey] = this.state.colorPickerColor;
                }
                that.props.fields.forEach(function (formFields) {
                    if (formFields.type == SINGLE_IMAGE_UPLOAD_FIELD) {
                        const {key} = formFields;
                        if (values[key] && values[key].file && values[key].file.response)
                            values[key] = values[key].file.response.image_path;
                        else
                            values[key] = formFields.initialValue;
                    } else if (formFields.type == MULTI_IMAGE_UPLOAD_FIELD) {
                        const {key} = formFields;
                        if (values[key] && values[key].file && values[key].file.response)
                            values[key] = values[key].fileList.map(file => file.response.image_path);
                        else
                            values[key] = formFields.initialValue;
                    } else if (formFields.type == TIME_PICKER || formFields.type == DATE_PICKER || formFields.type == DATE_TIME_PICKER) {
                        const {key} = formFields;
                        if (formFields.format) {
                            values[key] = moment(values[key]).isValid() ? moment(values[key]).format(formFields.format) : null;
                        }
                    } else if (formFields.type == QUILL_TEXT_FIELD) {
                        const {key} = formFields;
                        values[key] = that.state.editorState[key] ? draftToHtml(convertToRaw(that.state.editorState[key].getCurrentContent())) : formFields.initialValue;
                    }
                });
                if (that.state.formProp.beforeSend) {
                    values = that.state.formProp.beforeSend(values);
                }
                if (that.state.formProp.confirm) {
                    Modal.confirm({
                        title: that.state.formProp.confirmText || "Are you sure to submit?",
                        onOk() {
                            that.submitForm(values);
                        },
                        onCancel() {

                        }
                    })
                } else {
                    that.submitForm(values);
                }

            }
        });
    }

    submitForm(data) {
        const that = this;
        this.setState({
            disabled: true,
            loading: true,
        });
        const successFn = function (data) {
            that.state.formProp.successFn(data);
            that.setState({
                disabled: false,
                loading: false,
            });
            if (that.props.changeRedirect) {
                that.props.changeRedirect();
            }
        };
        const errorFn = function (errors) {
            that.handleBackendErrors(errors);
            that.state.formProp.errorFn(errors);
            that.setState({
                disabled: false,
                loading: false,
            });
        };
        const headers = {};
        if (!that.state.formProp.authorisation) {
            headers.Authorization = undefined;
        }
        if (this.props.formProp.method == "post") {
            postAPI(this.props.formProp.action, data, successFn, errorFn, {...headers});
        } else if (this.props.formProp.method == "put") {
            putAPI(this.props.formProp.action, data, successFn, errorFn, {...headers});
        } else if (this.props.formProp.method == "get") {
            getAPI(this.props.formProp.action, successFn, errorFn, data, {...headers});
        }
    }

    colorChange(color, key) {
        const that = this;
        this.setState({
            colorPickerKey: key,
            colorPickerColor: color.hex,
        }, function () {
            that.props.form.setFieldsValue({[key]: color.hex})
        });
    }

    setAddressField(type, value) {
        if (type == 'country') {
            this.setState(function (prevState) {
                let states = []
                prevState.countryOptions.forEach(function (country) {
                    if (country.id == value) {
                        states = country.states
                    }
                })
                return {stateOptions: states}
            })
        } else {
            this.setState(function (prevState) {
                let cities = [];
                prevState.stateOptions.forEach(function (state) {
                    if (state.id == value) {
                        cities = state.cities
                    }
                })
                return {cityOptions: cities}
            })
        }
    }

    loadCountryData() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                countryOptions: data.country,
            })
        };
        const errorFn = function () {
        };
        getAPI(EXTRA_DATA, successFn, errorFn);
    }

    addSMSTag(key, value) {
        const that = this;
        const prevValue = that.props.form.getFieldValue(key) || '';
        that.props.form.setFieldsValue({
            [key]: prevValue + value
        });
    }

    addMailTemplateTag = (key, value) => {
        const that = this;
        this.setState(function (prevState) {
            let currentHtml = prevState.editorState[key] ? draftToHtml(convertToRaw(prevState.editorState[key].getCurrentContent())) : '';
            currentHtml += value;
            return {
                editorState: {
                    ...prevState.editorState,
                    [key]: EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(currentHtml)))
                }
            }
        })
    }

    toggleWebCam = (type, value) => {
        this.setState(function (prevState) {
            return {
                webCamState: {...prevState.webCamState, [type]: value}
            }
        })
    }

    getImageandUpload = (fieldKey, image) => {
        const that = this;
        const reqData = new FormData();

        reqData.append('image', image);
        reqData.append('name', 'file');

        const successFn = function (data) {
            that.props.form.setFieldsValue({[fieldKey]: {file: {response: data}}});
            displayMessage(SUCCESS_MSG_TYPE, "Image Captured and processed.");
            that.setState(function (prevState) {
                return {
                    webCamState: {...prevState.webCamState, [fieldKey]: false}
                }
            })
        }
        const errorFn = function () {

        }
        postAPI(FILE_UPLOAD_BASE64, reqData, successFn, errorFn, {
            'content-type': 'multipart/form-data'
        });

    }

    onEditorStateChange = (key, editorState) => {
        this.setState(function (prevState) {
            return {
                editorState: {...prevState.editorState, [key]: editorState}

            }
        });
    };

    searchOperation = (key, searchString) => {
        const that = this;
        const {searchFields} = this.state;
        const field = searchFields[key];
        const successFn = function (data) {
            that.setState(function (prevState) {
                return {searchResults: {...prevState.searchResults, [key]: data.results}}
            })
        }
        const errorFn = function (erros) {
            displayMessage(ERROR_MSG_TYPE, "Something went wrong!!");
        }
        const params = {
            ...field.searchDefaultParams,
            [field.searchKey]: searchString
        }
        getAPI(field.searchAPI, successFn, errorFn, params)
    }

    handleBackendErrors = (errors) => {
        const that = this;
        if (this.state.fields) {
            let errorsMessages = {};
            this.state.fields.forEach(function (field) {
                if (errors[field.key] && errors[field.key].length) {
                    errorsMessages[field.key] = errors[field.key][0];
                }
            });
            this.setState({
                formErrors: errorsMessages
            }, function () {
                that.props.form.validateFieldsAndScroll();
            })
        }
    }

    render() {
        const that = this;
        const formItemLayout = (this.props.formLayout ? this.props.formLayout : {
            labelCol: {span: 8},
            wrapperCol: {span: 14},
        });
        const {getFieldDecorator} = this.props.form;
        const {searchResults, formErrors} = this.state;
        return (
            <div>
                <Form onSubmit={this.handleSubmit}>
                    {this.props.title ? <h2>{this.props.title}</h2> : null}
                    {this.state.fields ? this.state.fields.map(function (field) {
                        switch (field.type) {
                            case PASSWORD_FIELD:
                                return (
                                    <Form.Item
                                        key={field.key}
                                        label={field.label}
                                        {...formItemLayout}
                                        extra={field.extra}
                                        help={formErrors[field.key]}
                                        {...(formErrors[field.key] ? {validateStatus: "error"} : null)}
                                    >
                                        {getFieldDecorator(field.key, that.fieldDecorators(field, that.state.formData))(
                                            <Input
                                                prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                                type="password"
                                                placeholder={field.placeholder}
                                                onChange={(e) => function () {
                                                    if (field.onChange)
                                                        field.onChange(e)
                                                }}
                                                disabled={field.disabled ? field.disabled : that.state.disabled}
                                            />
                                        )}
                                    </Form.Item>
                                );
                            case INPUT_FIELD:
                                return (
                                    <FormItem
                                        key={field.key}
                                        label={field.label}
                                        {...formItemLayout}
                                        extra={field.extra}
                                        help={formErrors[field.key]}
                                        {...(formErrors[field.key] ? {validateStatus: "error"} : null)}
                                    >
                                        {getFieldDecorator(field.key, that.fieldDecorators(field, that.state.formData))(
                                            <Input
                                                placeholder={field.placeholder}
                                                onChange={(e) => function () {
                                                    if (field.onChange)
                                                        field.onChange(e)
                                                }}
                                                disabled={field.disabled ? field.disabled : that.state.disabled}
                                            />
                                        )}
                                        {field.follow ? <span className="ant-form-text">{field.follow}</span> : null}
                                    </FormItem>
                                );
                            case SEARCH_FIELD:
                                return (
                                    <FormItem
                                        key={field.key}
                                        {...formItemLayout}
                                        label={field.label}
                                        extra={field.extra}
                                        help={formErrors[field.key]}
                                        {...(formErrors[field.key] ? {validateStatus: "error"} : null)}

                                    >
                                        {getFieldDecorator(field.key, that.fieldDecorators(field, that.state.formData))(
                                            <Select
                                                onSearch={(value) => that.searchOperation(field.key, value)}
                                                placeholder={field.placeholder}
                                                filterOption={false}
                                                showSearch
                                                disabled={field.disabled ? field.disabled : that.state.disabled}
                                                mode={field.mode ? field.mode : "default"}
                                            >
                                                {searchResults[field.key] && searchResults[field.key].map((option) => (
                                                    <Select.Option
                                                        value={option[field.options.value]}
                                                    >
                                                        {option[field.options.label]}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                        {field.follow ? <span className="ant-form-text">{field.follow}</span> : null}
                                    </FormItem>
                                );
                            case SELECT_FIELD:
                                return (
                                    <FormItem
                                        key={field.key}
                                        {...formItemLayout}
                                        label={field.label}
                                        extra={field.extra}
                                        help={formErrors[field.key]}
                                        {...(formErrors[field.key] ? {validateStatus: "error"} : null)}
                                    >
                                        {getFieldDecorator(field.key, that.fieldDecorators(field, that.state.formData))(
                                            <Select
                                                style={{width:field.width}}
                                                placeholder={field.placeholder}
                                                disabled={field.disabled ? field.disabled : that.state.disabled}
                                                mode={field.mode ? field.mode : "default"}
                                                optionFilterProp="children"
                                                showSearch
                                            >
                                                {field.options.map((option) => (
                                                    <Select.Option
                                                        label={option.label}
                                                        value={option.value}
                                                    >{option.label}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                        {field.follow ? <span className="ant-form-text">{field.follow}</span> : null}
                                    </FormItem>
                                );
                            case MULTI_SELECT_FIELD:
                                return (
                                    <FormItem
                                        key={field.key}
                                        {...formItemLayout}
                                        label={field.label}
                                        extra={field.extra}
                                        help={formErrors[field.key]}
                                        {...(formErrors[field.key] ? {validateStatus: "error"} : null)}
                                    >
                                        {getFieldDecorator(field.key, {...that.fieldDecorators(field, that.state.formData)})(
                                            <Select
                                                mode="multiple"
                                                placeholder={field.placeholder}
                                                showSearch={field.showSearch ? field.showSearch : null}
                                                disabled={field.disabled ? field.disabled : that.state.disabled}
                                                optionFilterProp="label"
                                            >
                                                {field.options.map((option) => (
                                                    <Select.Option
                                                        label={option.label}
                                                        value={option.value}
                                                    >{option.label}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                        {field.follow ? <span className="ant-form-text">{field.follow}</span> : null}
                                    </FormItem>
                                );
                            case RADIO_FIELD:
                                return (
                                    <FormItem
                                        key={field.key}
                                        label={field.label}
                                        {...formItemLayout}
                                        extra={field.extra}
                                        help={formErrors[field.key]}
                                        {...(formErrors[field.key] ? {validateStatus: "error"} : null)}
                                    >
                                        {getFieldDecorator(field.key, that.fieldDecorators(field, that.state.formData))(
                                            <RadioGroup
                                                disabled={field.disabled ? field.disabled : that.state.disabled}
                                            >
                                                {field.options.map((option) => (
                                                    <Radio
                                                        value={option.value}
                                                    >{option.label}
                                                    </Radio>
                                                ))}
                                            </RadioGroup>
                                        )}
                                    </FormItem>
                                );
                            case CHECKBOX_FIELD:
                                return (
                                    <FormItem
                                        key={field.key}
                                        label={field.label}
                                        {...formItemLayout}
                                        extra={field.extra}
                                        help={formErrors[field.key]}
                                        {...(formErrors[field.key] ? {validateStatus: "error"} : null)}
                                    >
                                        {getFieldDecorator(field.key, that.fieldDecorators(field, that.state.formData))(
                                            <CheckboxGroup
                                                options={field.options}
                                                disabled={field.disabled ? field.disabled : that.state.disabled}
                                            />
                                        )}
                                    </FormItem>
                                );
                            case SINGLE_CHECKBOX_FIELD:
                                return (
                                    <FormItem
                                        key={field.key}
                                        label={field.label}
                                        {...formItemLayout}
                                        extra={field.extra}
                                        help={formErrors[field.key]}
                                        {...(formErrors[field.key] ? {validateStatus: "error"} : null)}
                                    >
                                        {getFieldDecorator(field.key, {
                                                valuePropName: 'checked',
                                                initialValue: field.initialValue
                                            },
                                            {
                                                rules: [{required: field.required, message: REQUIRED_FIELD_MESSAGE}],
                                            })(
                                            <Checkbox
                                                disabled={field.disabled ? field.disabled : that.state.disabled}
                                            >{field.follow}
                                            </Checkbox>
                                        )}
                                    </FormItem>
                                );
                            case NUMBER_FIELD:
                                return (
                                    <FormItem
                                        key={field.key}
                                        {...formItemLayout}
                                        label={field.label}
                                        extra={field.extra}
                                        help={formErrors[field.key]}
                                        {...(formErrors[field.key] ? {validateStatus: "error"} : null)}
                                    >
                                        {getFieldDecorator(field.key, that.fieldDecorators(field, that.state.formData))(
                                            <InputNumber
                                                min={field.min}
                                                max={field.max}
                                                disabled={field.disabled ? field.disabled : that.state.disabled}
                                            />
                                        )}
                                        <span className="ant-form-text">{field.follow}</span>
                                    </FormItem>
                                );
                            case DATE_PICKER:
                                return (
                                    <FormItem
                                        key={field.key}
                                        label={field.label}
                                        {...formItemLayout}
                                        extra={field.extra}
                                        help={formErrors[field.key]}
                                        {...(formErrors[field.key] ? {validateStatus: "error"} : null)}
                                    >
                                        {getFieldDecorator(field.key,
                                            {
                                                initialValue: field.initialValue ? moment(field.initialValue) : null,
                                                rules: [{required: field.required, message: REQUIRED_FIELD_MESSAGE}],
                                            })(
                                            <DatePicker format={field.format} allowClear={false}/>
                                        )}
                                    </FormItem>
                                );
                            case DATE_TIME_PICKER:
                                return (
                                    <FormItem
                                        key={field.key}
                                        label={field.label}
                                        {...formItemLayout}
                                        extra={field.extra}
                                        help={formErrors[field.key]}
                                        {...(formErrors[field.key] ? {validateStatus: "error"} : null)}
                                    >
                                        {getFieldDecorator(field.key,
                                            {initialValue: field.initialValue ? moment(field.initialValue) : null},
                                            {
                                                rules: [{required: field.required, message: REQUIRED_FIELD_MESSAGE}],
                                            })(
                                            <DatePicker
                                                format={field.format}
                                                showTime
                                                onChange={(e) => (field.onChange ?
                                                    field.onChange(e) :
                                                    function () {
                                                    })}
                                            />
                                        )}
                                    </FormItem>
                                );
                            case TEXT_FIELD:
                                return (
                                    <div key={field.key}>
                                        <FormItem
                                            key={field.key}
                                            label={field.label}
                                            {...formItemLayout}
                                            extra={field.extra}
                                            help={formErrors[field.key]}
                                            {...(formErrors[field.key] ? {validateStatus: "error"} : null)}
                                        >
                                            {getFieldDecorator(field.key, that.fieldDecorators(field, that.state.formData))(
                                                <TextArea
                                                    autosize={{minRows: field.minRows, maxRows: field.maxRows}}
                                                    placeholder={field.placeholder}
                                                    disabled={field.disabled ? field.disabled : that.state.disabled}
                                                    onChange={that.inputChange}
                                                />
                                            )}

                                        </FormItem>
                                    </div>
                                );
                            case SMS_FIELD:
                                return (
                                    <div>
                                        <FormItem
                                            key={field.key}
                                            label={field.label}
                                            {...formItemLayout}
                                            extra={field.extra}
                                            help={formErrors[field.key]}
                                            {...(formErrors[field.key] ? {validateStatus: "error"} : null)}
                                        >
                                            {getFieldDecorator(field.key, that.fieldDecorators(field, that.state.formData))(
                                                <TextArea
                                                    autosize={{minRows: field.minRows, maxRows: field.maxRows}}
                                                    placeholder={field.placeholder}
                                                    disabled={field.disabled ? field.disabled : that.state.disabled}
                                                />
                                            )}
                                            {field.options && field.options.map(item => (
                                                <Tag
                                                    color="#108ee9"
                                                    onClick={() => that.addSMSTag(field.key, item.value)}
                                                >{item.label}
                                                </Tag>
                                            ))}
                                        </FormItem>
                                    </div>
                                );
                            case MAIL_TEMPLATE_FIELD:
                                return (
                                    <div>
                                        <FormItem
                                            key={field.key}
                                            label={field.label}
                                            {...formItemLayout}
                                            extra={field.extra}
                                        >
                                            {getFieldDecorator(field.key, {
                                                initialValue: (field.initialValue && field.initialValue.length ? field.initialValue : ''),
                                                rules: [{
                                                    required: field.required,
                                                    message: REQUIRED_FIELD_MESSAGE
                                                }]
                                            })(
                                                <div style={{border: '1px solid #eee'}}>
                                                    <Editor
                                                        editorState={(that.state.editorState[field.key] ? that.state.editorState[field.key] : (field.initialValue ? EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(field.initialValue))) : EditorState.createEmpty()))}
                                                        onEditorStateChange={(editorState) => that.onEditorStateChange(field.key, editorState)}
                                                    />
                                                    {/* // <ReactQuill theme="snow" placeholder={field.placeholder}/> */}
                                                </div>
                                            )}
                                            {field.options && field.options.map(item => (
                                                <Tag
                                                    color="#108ee9"
                                                    onClick={() => that.addMailTemplateTag(field.key, item.value)}
                                                >{item.label}
                                                </Tag>
                                            ))}
                                            {field.preview ? (
                                                <div>
                                                    <Divider>Preview</Divider>
                                                    <div
                                                        style={{maxHeight: 200, overflowY: 'scroll'}}
                                                        dangerouslySetInnerHTML={{__html: `${that.state.editorState[field.key] ? draftToHtml(convertToRaw(that.state.editorState[field.key].getCurrentContent())) : field.initialValue}` || ''}}
                                                    />
                                                    <Divider/>
                                                </div>
                                            ) : null}
                                            {/* <div dangerouslySetInnerHTML={{__html: field.initialValue}}/> */}
                                        </FormItem>
                                        {field.iframe ?
                                            <iframe
                                                src={field.iframe_url}
                                                style={{
                                                    marginLeft: "50px",
                                                    width: '70%',
                                                    height: '70%',
                                                    minHeight: '600px',
                                                    boxShadow: '-2px 0px 4px #B8B8B8'
                                                }}/>
                                            : null
                                        }
                                    </div>
                                );
                            case FRAME_VIEW:
                                return (
                                    <div>
                                        <FormItem
                                            key={field.key}
                                            label={field.label}
                                            {...formItemLayout}
                                            extra={field.extra}
                                        >
                                            {getFieldDecorator(field.key, {
                                                initialValue: (field.initialValue && field.initialValue.length ? field.initialValue : ''),
                                                rules: [{
                                                    required: field.required,
                                                    message: REQUIRED_FIELD_MESSAGE
                                                }]
                                            })}
                                        </FormItem>
                                        {field.iframe ?
                                            <iframe
                                                src={field.iframe_url}
                                                style={{
                                                    marginLeft: "50px",
                                                    width: '70%',
                                                    height: '70%',
                                                    minHeight: '600px',
                                                    boxShadow: '-2px 0px 4px #B8B8B8'
                                                }}/>
                                            : null
                                        }
                                    </div>
                                );
                            case QUILL_TEXT_FIELD:
                                return (
                                    <div>
                                        <FormItem
                                            key={field.key}
                                            label={field.label}
                                            {...formItemLayout}
                                            extra={field.extra}
                                            help={formErrors[field.key]}
                                            {...(formErrors[field.key] ? {validateStatus: "error"} : null)}
                                        >
                                            {getFieldDecorator(field.key, {
                                                initialValue: (field.initialValue && field.initialValue.length ? field.initialValue : ''),
                                                rules: []
                                            })(
                                                <div style={{border: '1px solid #eee'}}>
                                                    <Editor
                                                        editorState={(that.state.editorState[field.key] ? that.state.editorState[field.key] : (field.initialValue ? EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(field.initialValue))) : EditorState.createEmpty()))}
                                                        onEditorStateChange={(editorState) => that.onEditorStateChange(field.key, editorState)}
                                                    />
                                                    {/* // <ReactQuill theme="snow" placeholder={field.placeholder}/> */}
                                                </div>
                                            )}
                                            {field.preview ? (
                                                <div>
                                                    <Divider>Preview</Divider>
                                                    <div
                                                        style={{maxHeight: 200, overflowY: 'scroll'}}
                                                        dangerouslySetInnerHTML={{__html: `${that.state.editorState[field.key] ? draftToHtml(convertToRaw(that.state.editorState[field.key].getCurrentContent())) : field.initialValue}` || ''}}
                                                    />
                                                    <Divider/>
                                                </div>
                                            ) : null}
                                            {/* <div dangerouslySetInnerHTML={{__html: field.initialValue}}/> */}
                                        </FormItem>
                                    </div>
                                );
                            case TIME_PICKER:
                                return (
                                    <FormItem
                                        key={field.key}
                                        label={field.label}
                                        {...formItemLayout}
                                        extra={field.extra}
                                        help={formErrors[field.key]}
                                        {...(formErrors[field.key] ? {validateStatus: "error"} : null)}
                                    >
                                        {getFieldDecorator(field.key, {
                                            initialValue: field.initialValue ? moment(field.initialValue, field.format) : null,
                                            rules: [{required: field.required, message: REQUIRED_FIELD_MESSAGE}],
                                        })(
                                            <TimePicker format={field.format}/>
                                        )}
                                    </FormItem>
                                );
                            case COLOR_PICKER:
                                return (
                                    <FormItem
                                        key={field.key}
                                        label={field.label}
                                        {...formItemLayout}
                                        extra={field.extra}
                                        help={formErrors[field.key]}
                                        {...(formErrors[field.key] ? {validateStatus: "error"} : null)}
                                    >
                                        {getFieldDecorator(field.key, that.fieldDecorators(field, that.state.formData))(
                                            <div>
                                                <SwatchesPicker
                                                    style={{width: '100%'}}
                                                    onChange={(color) => that.colorChange(color, field.key)}
                                                />
                                                {that.state.colorPickerKey ? (
                                                    <div style={{
                                                        margin: '10px',
                                                        backgroundColor: that.state.colorPickerColor,
                                                        height: '40px',
                                                        width: '40px'
                                                    }}
                                                    />
                                                ) : (that.state.formData[field.key] ? (
                                                    <div style={{
                                                        margin: '10px',
                                                        backgroundColor: that.state.formData[field.key],
                                                        height: '40px',
                                                        width: '40px'
                                                    }}
                                                    />
                                                ) : null)}
                                            </div>
                                        )}
                                    </FormItem>
                                );
                            case SINGLE_IMAGE_UPLOAD_FIELD:
                                const singleUploadprops = {
                                    name: 'image',
                                    data: {
                                        name: 'hello'
                                    },
                                    action: makeURL(FILE_UPLOAD_API),
                                    headers: {
                                        authorization: 'authorization-text',
                                    },
                                    onChange(info) {
                                        if (info.file.status !== 'uploading') {
                                        }
                                        if (info.file.status === 'done') {
                                            message.success(`${info.file.name} file uploaded successfully`);
                                        } else if (info.file.status === 'error') {
                                            message.error(`${info.file.name} file upload failed.`);
                                        }
                                    },
                                };
                                return (
                                    <Form.Item key={field.key} {...formItemLayout} label={field.label}
                                               help={formErrors[field.key]}

                                               {...(formErrors[field.key] ? {validateStatus: "error"} : null)}>
                                        {getFieldDecorator(field.key, that.fieldDecorators(field, that.state.formData), {valuePropName: field.key,})(
                                            <Upload {...singleUploadprops}>
                                                <Button>
                                                    <Icon type="upload"/> Select File
                                                </Button>
                                                {field.initialValue ?
                                                    // <img src={makeFileURL(field.initialValue)}
                                                    //      style={{maxWidth: '100%'}}/>
                                                    <Avatar size={64} src={makeFileURL(field.initialValue)}/>
                                                    : null}
                                            </Upload>
                                        )}
                                        {field.allowWebcam ? (
                                            <span className="ant-form-text">
                                                <a onClick={() => that.toggleWebCam(field.key, Math.random())}>
                                                    Open Webcam
                                                </a>
                                            </span>
                                        ) : null}
                                        <Modal
                                            footer={null}
                                            onCancel={() => that.toggleWebCam(field.key, false)}
                                            visible={!!that.state.webCamState[field.key]}
                                            width={680}
                                            key={that.state.webCamState[field.key]}
                                        >
                                            <WebCamField
                                                getScreenShot={(value) => that.getImageandUpload(field.key, value)}
                                            />
                                        </Modal>
                                    </Form.Item>
                                );
                            case MULTI_IMAGE_UPLOAD_FIELD:
                                const multiuploadprops = {
                                    name: 'image',
                                    multiple: true,
                                    data: {
                                        name: 'hello'
                                    },
                                    action: makeURL(FILE_UPLOAD_API),
                                    headers: {
                                        authorization: 'authorization-text',
                                    },
                                    onChange(info) {
                                        if (info.file.status !== 'uploading') {
                                            // console.log(info.file, info.fileList);
                                        }
                                        if (info.file.status === 'done') {
                                            message.success(`${info.file.name} file uploaded successfully`);
                                        } else if (info.file.status === 'error') {
                                            message.error(`${info.file.name} file upload failed.`);
                                        }
                                    },
                                };
                                return (
                                    <Form.Item key={field.key} {...formItemLayout} label={field.label}
                                               help={formErrors[field.key]}
                                               {...(formErrors[field.key] ? {validateStatus: "error"} : null)}>
                                        {getFieldDecorator(field.key, {valuePropName: field.key,})(
                                            <Upload {...multiuploadprops} multiple={true}>
                                                <Button>
                                                    <Icon type="upload"/> Select Multiple File
                                                </Button>
                                                {field.initialValue && field.initialValue.length ?
                                                    field.initialValue.map(img => (
                                                        <img
                                                            src={img}
                                                            style={{maxWidth: '100%'}}
                                                        />
                                                    )) : null}
                                            </Upload>
                                        )}
                                    </Form.Item>
                                );
                            case COUNTRY_FIELD:
                                return (
                                    <FormItem
                                        key={field.key}
                                        {...formItemLayout}
                                        label={field.label}
                                        extra={field.extra}
                                    >
                                        {getFieldDecorator(field.key, that.fieldDecorators(field, that.state.formData))(
                                            <Select
                                                placeholder={field.placeholder}
                                                disabled={field.disabled ? field.disabled : that.state.disabled}
                                                mode={field.mode ? field.mode : "default"}
                                                onChange={(value) => that.setAddressField('country', value)}
                                            >
                                                {that.state.countryOptions.map((option) => (
                                                    <Select.Option
                                                        value={option.id}
                                                    >{option.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    </FormItem>
                                );
                            case STATE_FIELD:
                                return (
                                    <FormItem
                                        key={field.key}
                                        {...formItemLayout}
                                        label={field.label}
                                        extra={field.extra}
                                    >
                                        {getFieldDecorator(field.key, that.fieldDecorators(field, that.state.formData))(
                                            <Select
                                                placeholder={field.placeholder}
                                                disabled={field.disabled ? field.disabled : that.state.disabled}
                                                mode={field.mode ? field.mode : "default"}
                                                onChange={(value) => that.setAddressField('state', value)}
                                            >
                                                {that.state.stateOptions.map((option) => (
                                                    <Select.Option
                                                        value={option.id}
                                                    >{option.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    </FormItem>
                                );

                            case EMAIL_FIELD:
                                return (
                                    <Form.Item
                                        key={field.key}
                                        {...formItemLayout}
                                        label={field.label}
                                        extra={field.extra}
                                    >
                                        {getFieldDecorator(field.key, {
                                            initialValue: that.state.formData[field.key],
                                            rules: [{
                                                type: 'email', message: 'The input is not valid E-mail!',
                                            }, {
                                                required: true, message: 'Please input your E-mail!',
                                            }],
                                        })(
                                            <Input
                                                placeholder={field.placeholder}
                                                disabled={field.disabled ? field.disabled : that.state.disabled}
                                                onChange={that.inputChange}
                                            />
                                        )}
                                    </Form.Item>
                                )

                            case CITY_FIELD:
                                return (
                                    <FormItem
                                        key={field.key}
                                        {...formItemLayout}
                                        label={field.label}
                                        extra={field.extra}
                                    >
                                        {getFieldDecorator(field.key, that.fieldDecorators(field, that.state.formData))(
                                            <Select
                                                placeholder={field.placeholder}
                                                disabled={field.disabled ? field.disabled : that.state.disabled}
                                                mode={field.mode ? field.mode : "default"}
                                            >
                                                {that.state.cityOptions.map((option) => (
                                                    <Select.Option
                                                        value={option.id}
                                                    >{option.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    </FormItem>
                                );
                            case DIVIDER_FIELD:
                                return <Divider style={{margin: 4}}/>


                            case LABEL_FIELD:
                                return (
                                    <FormItem
                                        key={field.key}
                                        {...formItemLayout}
                                        label={field.label}
                                        extra={field.extra}
                                    >

                                        {field.follow ? <span className="ant-form-text">{field.follow}</span> : null}

                                    </FormItem>
                                );
                            case RATE_FIELD:
                                return (
                                    <Form.Item
                                        key={field.key}
                                        {...formItemLayout}
                                        label={field.label}
                                        extra={field.extra}
                                        help={formErrors[field.key]}
                                        {...(formErrors[field.key] ? {validateStatus: "error"} : null)}
                                    >
                                        {getFieldDecorator(field.key, that.fieldDecorators(field, that.state.formData))
                                        (<Rate allowHalf={field.allowHalf}/>)}
                                        {field.follow ? <span className="ant-form-text">{field.follow}</span> : null}
                                    </Form.Item>
                                )
                            default:
                                return null;
                        }
                    }) : null}
                    <FormItem {...{...formItemLayout, wrapperCol: {offset: 8, span: 16}}}>
                        {/* <Button onClick={this.resetFormData}>Reset</Button> */}
                        <Button loading={that.state.loading} type="primary" htmlType="submit" style={{margin: 5}}>
                            Submit
                        </Button>
                        {that.props.history ? (
                            <Button style={{margin: 5}} onClick={() => that.props.history.goBack()}>
                                Cancel
                            </Button>
                        ) : null}
                    </FormItem>
                </Form>
            </div>
        )
    }
}

export default DynamicFieldsForm;
