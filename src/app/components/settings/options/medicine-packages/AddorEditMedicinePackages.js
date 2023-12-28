import React from "react";
import {Form, Card} from "antd";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {
    INPUT_FIELD, MULTI_SELECT_FIELD,
    NUMBER_FIELD,
    SELECT_FIELD,
    SINGLE_IMAGE_UPLOAD_FIELD,
    SUCCESS_MSG_TYPE
} from "../../../../constants/dataKeys";
import {displayMessage, getAPI, interpolate} from "../../../../utils/common";
import {BED_PACKAGES, MEDICINE_PACKAGES, ROOM_TYPE, TAXES} from "../../../../constants/api";

export default class AddorEditMedicinePackages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editPackage: this.props.editPackage ? this.props.editPackage : null,
            taxes: []
        }
    }

    componentDidMount() {
        this.loadRequiredData();
    }

    loadRequiredData = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                taxes: data,
            })
        };
        const errorFn = function () {
        };
        getAPI(interpolate(TAXES, [this.props.active_practiceId]), successFn, errorFn);

    }

    render() {
        const that = this;
        const MedicinePackageForm = Form.create()(DynamicFieldsForm);
        const fields = [{
            label: "Package Name",
            key: 'name',
            required: true,
            initialValue: this.props.editPackage ? this.props.editPackage.name : null,
            type: INPUT_FIELD
        }, {
            label: "Image",
            key: 'image',
            initialValue: this.props.editPackage ? this.props.editPackage.image : null,
            type: SINGLE_IMAGE_UPLOAD_FIELD,
        }, {
            label: "Days of Booking",
            key: 'no_of_days',
            required: true,
            initialValue: this.props.editPackage ? this.props.editPackage.no_of_days : null,
            type: NUMBER_FIELD,
            follow: 'INR'
        }, {
            label: "Add Under",
            key: 'under',
            initialValue: this.props.editPackage ? this.props.editPackage.under : null,
            type: SELECT_FIELD,
            disabled:this.props.editPackage ? this.props.editPackage.children.length :null,
            options:that.props.packages.map(item=>{return {label:item.name,value:item.id}})
        },  {
            label: "Price",
            key: 'price',
            required: true,
            initialValue: this.props.editPackage ? this.props.editPackage.final_price : null,
            type: NUMBER_FIELD,
            follow: 'INR'
        },
        // {
        //     label: "Final Price",
        //     key: 'final_price',
        //     required: true,
        //     initialValue: this.props.editPackage ? this.props.editPackage.final_price : null,
        //     type: NUMBER_FIELD,
        //     follow: 'INR'
        // },
         {
            label: "Same State Taxes",
            key: 'taxes',
            initialValue: this.props.editPackage && this.props.editPackage.taxes ? this.props.editPackage.taxes.map(item => item.id) : [],
            type: MULTI_SELECT_FIELD,
            options: this.state.taxes.map(tax => Object.create({
                label: `${tax.name  }(${  tax.tax_value  }%)`,
                value: tax.id
            }))
        },{
                label: "Other State Taxes",
                key: 'state_taxes',
                initialValue: this.props.editPackage && this.props.editPackage.state_taxes ? this.props.editPackage.state_taxes.map(item => item.id) : [],
                type: MULTI_SELECT_FIELD,
                options: this.state.taxes.map(tax => Object.create({
                    label: `${tax.name  }(${  tax.tax_value  }%)`,
                    value: tax.id
                }))
            }];
        const formProps = {
            method: "post",
            action: interpolate(MEDICINE_PACKAGES, [this.props.active_practiceId]),
            successFn () {
                displayMessage(SUCCESS_MSG_TYPE, "Package Saved Successfully");
                if (that.props.loadData)
                    that.props.loadData();
                that.props.history.replace('/erp/settings/medicine-packages');
            }, errorFn () {

            }
        }
        const defaultValues = [];
        if (this.state.editPackage) {
            defaultValues.push({key: 'id', value: this.state.editPackage.id})
        }
        return (
<div>
            <Card>
                <MedicinePackageForm
                  fields={fields}
                  formProp={formProps}
                  defaultValues={defaultValues}
                  title={this.state.editPackage ? "Edit Medicine Package" : "Add Medicine Packages"}
                  {...this.props}
                />
            </Card>
</div>
)
    }
}
