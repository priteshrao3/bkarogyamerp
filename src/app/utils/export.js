import jsPDF from 'jspdf';
import "jspdf-autotable";


export const exportToExcel = function (columns, dataArray, fileName = "download") {
    const str = makeCSVString(columns, dataArray);
    downloadCSV(str, fileName)
}

export const makeCSVString = function (columns, dataArray, printColumn = true) {
    let str = '';
    let line = [];
    if (printColumn) {
        columns.forEach(function (column) {
            line.push(column);
        });
        str += line.join(',');
        str += '\r\n';
    }
    dataArray.forEach(function (dataRow) {
        line = [];
        columns.forEach(function (column) {
            if (dataRow[column])
                line.push(dataRow[column]);
            else
                line.push('--');
        });

        str += line.join(',');
        str += '\r\n';
    });
    return str;
}

export const downloadCSV = function (str, fileName) {
    const fName = `${fileName}.csv`;
    let cCode; const bArr = [];
    bArr.push(255, 254);
    for (let i = 0; i < str.length; ++i) {
        cCode = str.charCodeAt(i);
        // eslint-disable-next-line
        bArr.push(cCode & 0xff);
        // eslint-disable-next-line
        bArr.push(cCode / 256 >>> 0);
    }

    const blob = new Blob([new Uint8Array(bArr)], { type: 'text/csv;charset=UTF-16LE;' });
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, fName);
    } else {
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = window.URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", fName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    }
    // window.open("data:text/csv;charset=utf-8," + encodeURI(str));
}

export const exportToPDF = function (columns, dataArray, fileName) {
    // eslint-disable-next-line
    const pdf = new jsPDF('p', 'mm', 'a4');
    addPDFHeader(pdf);


    const rows = Object.create(dataArray);
    pdf.autoTable(columns, rows, {
        margin: { top: 35 },
        startY: pdf.autoTableEndPosY() + 20,
        headerStyle: {
            overflow: 'linebreak'
        },
        bodyStyles: {
            overflow: 'linebreak'
        }
    });
    addPDFFooter(pdf);
    pdf.save(`${fileName}.pdf`)
}

function addPDFHeader(pdf) {
    pdf.line(10, 20, 200, 20);
}


function addPDFFooter(pdf) {
    pdf.line(10, 270, 200, 270);
    pdf.setFontSize(8);
    pdf.text(10, 275, 'This is a computer generated report.');
}


