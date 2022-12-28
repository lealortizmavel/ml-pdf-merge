'use strict';

const { v4 } = require("uuid");
const fse = require('fs-extra');
const moment = require('moment');
const attributeName = "documents";
const { getConnection } = require('./../database');
const _pdfTransformationController = require('./pdf-transformation.controller');
moment.locale('es');

const deleteDocument = async (req, res) => {
    const { id } = req.params;
    await getConnection()
        .get(attributeName)
        .remove({ id })
        .write();
    const folder = 'src/public/documents/' + id;
    fse.remove(folder);
    res.redirect('/');
}

const saveDocument = async (req, res) => {
    let { id, name, repeatHalf } = req.body;
    id = id ? id : v4();
    const files = req.files.map(f => f.originalname);
    const filename = await _pdfTransformationController.merge(files, id, name, repeatHalf == "true");
    const newDocument = {
        id,
        name,
        date: moment().toISOString(),
        formatedDate: moment().format('DD-MM-YYYY hh:mm a'),
        files,
        filename
    };
    await getConnection()
        .get(attributeName)
        .push(newDocument)
        .write();
    res.redirect('/');
};

const getDocuments = async (req, res) => {

    let search = req.query.search;
    let pdfs = await getConnection()
        .get(attributeName);

    if (search) {
        search = search.toString().toLowerCase();
        pdfs = pdfs
            .filter(d => d.name.toLowerCase().includes(search))
    }
    pdfs = pdfs.value();
    pdfs = pdfs.sort((a, b) => {
        const dateA = new Date(a.date), dateB = new Date(b.date);
        return dateB - dateA;
    });
    res.render('pdf/pdf.hbs', { pdfs, search });
};

module.exports = { getDocuments, saveDocument, deleteDocument }