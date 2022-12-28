'use strict';

const { v4 } = require("uuid");
const fse = require('fs-extra');
const moment = require('moment');
const attributeName = "invoices";
const { getConnection } = require('./../database');
moment.locale('es');

const deleteInvoice = async (req, res) => {
    const { id } = req.params;
    await deleteInvoiceRecord(id);
    res.redirect('/invoices');
}


const deleteInvoiceRecord = async (id) => {
    await getConnection()
        .get(attributeName)
        .remove({ id })
        .write();
}

const saveInvoice = async (req, res) => {
    let { id, name, amount, price, client } = req.body;
    await deleteInvoiceRecord(id);
    const rows = [];
    for (let index = 0; index < name.length; index++) {
        rows.push({
            name: name[index],
            amount: amount[index],
            price: price[index],
        });
    }

    id = id != 0 ? id : v4();
    const newDocument = {
        id,
        client,
        rows,
        date: moment().toISOString(),
        formatedDate: moment().format('DD-MM-YYYY hh:mm a'),
    };
    await getConnection()
        .get(attributeName)
        .push(newDocument)
        .write();
    res.redirect('/invoices');
};

const getInvoice = async (req, res) => {
    const { id } = req.params;
    const invoice = await findInvoice(id);
    return res.json(invoice);
}

const findInvoice = async (id) => {
    let invoices = await getConnection()
        .get(attributeName);
    let invoice;
    if (id) {
        invoice = invoices
            .filter(d => d.id == id);
            invoice = invoice.value();
    }
    return Array.isArray(invoice) && invoice.length > 0 ? invoice[0] : null;
}

const getInvoices = async (req, res) => {

    const id = req.params.id || 0;
    let client = '';
    let search = req.query.search;
    let invoices = await getConnection()
        .get(attributeName);

    if (search) {
        search = search.toString().toLowerCase();
        invoices = invoices
            .filter(d => d.name.toLowerCase().includes(search))
    }

    const invoice = await findInvoice(id);
    if (invoice) {
        client = invoice.client;
    }

    invoices = invoices.value() || [];
    invoices = invoices.sort((a, b) => {
        const dateA = new Date(a.date), dateB = new Date(b.date);
        return dateB - dateA;
    });
    res.render('invoice/invoice.hbs', { invoices, search, id, client });
};

const generateInvoice = async function (req, res) {
    let result = null;
    const id = req.params.id || 0;
    if (id) {
        result = await findInvoice(id);
    }

    if (!result) return res.send('');

    let tbody = '';
    let total = 0;
    result.rows.forEach((r) => {
        r.total = (+r.price) * (+r.amount);
        total += r.total;
        tbody += `
        <tr>
            <td>${r.name}</td>
            <td class="text-center">${r.amount}</td>
            <td class="text-right">$${formatNumber(r.price)}</td>
            <td class="text-right">$${formatNumber(r.total)}</td>
        </tr>`;
    });

    tbody += `
        <tr>
            <td class="text-right" colspan="3"><b>Total</b></td>
            <td class="text-right">$${formatNumber(total)}</td>
        </tr>`;


    let table = `
        <div class="row">
            <div class="col-sm-6">
                <h5 style="margin-bottom: 0px;"><b>Cliente</b>: ${result.client}</h5> 
            </div> 
            <div class="col-sm-6 text-right">
                <span><b>Fecha</b>: ${result.formatedDate}</span> 
            </div> 
        </div> 
        <table class="table table-bordered"cellspacing="0" role="grid" aria-describedby="dataTable_info" style="width: 100%; margin-top: 10px;">
            <thead>
                <tr>
                    <th width="50%">
                        Producto
                    </th>
                    <th width="10%" class="text-center">
                        Cantidad
                    </th>
                    <th class="text-right">
                        Precio
                    </th>
                    <th class="text-right">
                        Total
                    </th>
                </tr>
            </thead>
            <tbody>
                ${tbody}
            </tbody>
        </table>
    `;
    return res.send(table);
}

function formatNumber(number) {
    return new Intl.NumberFormat("es-CO").format(number)
}

module.exports = { getInvoices, getInvoice, saveInvoice, deleteInvoice, generateInvoice, generateInvoice }