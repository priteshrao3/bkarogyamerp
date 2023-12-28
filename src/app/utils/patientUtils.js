
export const patientInvoiceDetailsInString = function (invoiceObj) {
    let invoiceDetailsString = '';
    if (invoiceObj.type != "Invoice")
        invoiceDetailsString += `${invoiceObj.type  }, `;
    if (invoiceObj.procedure)
        invoiceObj.procedure.forEach(function (proc) {
            if (proc.procedure_data)
                invoiceDetailsString += `${proc.procedure_data.name  }, `
        });
    if (invoiceObj.inventory)
        invoiceObj.inventory.forEach(function (proc) {
            if (proc.inventory_item_data)
                invoiceDetailsString += `${proc.inventory_item_data.name  }, `
        });
    if (invoiceObj.reservation)
        invoiceDetailsString += `${invoiceObj.type  },`;
    if (invoiceObj.reservation_data && invoiceObj.reservation_data.medicines)
        invoiceObj.reservation_data.medicines.forEach(function (proc) {
            invoiceDetailsString += `${proc.name  },`
        });

    return invoiceDetailsString.trim(',');

}

export const patientPaymentDetailsInString = function (paymentObj) {
    let paymentDetailsString = '';
    if (paymentObj.invoices)
        paymentObj.invoices.forEach(function (inv) {
            if (inv.invoice)
                paymentDetailsString += `${inv.invoice.invoice_id  }, `
        })
    return paymentDetailsString;
}

export const patientReturnInvoiceDetailsInString = function (payObj) {
    let paymentDetailsString = '';
    if (payObj.procedure)
        payObj.procedure.forEach(function (proc) {
            if (proc.procedure_data)
                paymentDetailsString += `${proc.procedure_data.name  }, `
        });
    if (payObj.inventory)
        payObj.inventory.forEach(function (proc) {
            paymentDetailsString += `${proc.name  }, `
        });
    if (payObj.reservation)
        paymentDetailsString += `${payObj.type  },`;
    if (payObj.reservation_data && payObj.reservation_data.medicines)
        payObj.reservation_data.medicines.forEach(function (proc) {
            paymentDetailsString += `${proc.name  },`
        });

    return paymentDetailsString.trim(',');

}
