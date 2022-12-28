const fs = require('fs');
const path = require('path');
const { v4 } = require("uuid");
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const { createConnection } = require('./database');

const multer = require('multer');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		let stat = null;
		const id = req.body.id ? req.body.id : v4();
		const dest = 'src/public/documents/' + id;
		req.body.id = id;
		try {
			stat = fs.statSync(dest);
		} catch (err) {
			try {
				fs.mkdirSync(dest);
			} catch (err) {
				console.error(err)
			}
		}
		if (stat && !stat.isDirectory()) {
			throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
		}
		cb(null, dest);
	},
	filename: (req, file, callback) => {
		//originalname is the uploaded file's name with extn
		callback(null, file.originalname);
	}
});
const upload = multer({ dest: 'src/public/documents/', storage });

// App init
const app = express();
createConnection();

// Controllers
const _documentController = require('./controllers/document.controller');
const _invoiceController = require('./controllers/invoice.controller');

// settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine(
	'.hbs',
	exphbs({
		defaultLayout: 'main',
		layoutsDir: path.join(app.get('views'), 'layouts'),
		partialsDir: path.join(app.get('views'), 'partials'),
		extname: '.hbs',
		helpers: {
			section: function (name, options) {
				if (!this._sections) this._sections = {};
				this._sections[name] = options.fn(this);
				return null;
			}
		}
	})
);
app.set('view engine', '.hbs');

// Middlewares
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Routes

// app.use(require('./routes/authentication'));
app.get('/', _documentController.getDocuments);
app.get('/invoices', _invoiceController.getInvoices);
app.get('/invoices/:id', _invoiceController.getInvoices);
app.get('/invoices/delete/:id', _invoiceController.deleteInvoice);
app.get('/api/invoices/:id', _invoiceController.getInvoice);
app.get('/api/invoices/:id/generate', _invoiceController.generateInvoice);
app.get('/delete/:id', _documentController.deleteDocument);
app.post('/save-document', upload.array('pdfs'), _documentController.saveDocument);
app.post('/save-invoice', upload.array('pdfs'), _invoiceController.saveInvoice);


// Public
app.use(express.static(path.join(__dirname, 'public')));

// 404
app.use((req, res, next) => {
	res.status(404).render('layouts/404', { layout: '404' });
});

// 500
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).render('layouts/500', { layout: '500' });
});

// Server start
app.listen(app.get('port'), () => {
	console.log('server is running on http://localhost:' + app.get('port') + '/');
});
