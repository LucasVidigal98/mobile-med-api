const ejs = require('ejs');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const routes = express.Router();
app.use(cors());
app.use(express.json());
app.use(routes);

routes.post('/pdf', (req, res) => {

    const data = req.body;
    const record = JSON.parse(data.json);
    const all = data.all;
    
    ejs.renderFile(path.resolve(__dirname, 'template.ejs'), {record, all}, (err, html) => {
        fs.writeFileSync(path.resolve(__dirname, 'html', `${record.id}.html`), html);
    });

    res.json({id: record.id});
});

routes.get('/', (req, res) => {

    const id = req.query.id;
    const html = fs.readFileSync(path.resolve(__dirname, 'html', `${id}.html`));

    res.send(html.toString());
});

routes.get('/get_pdf', async (req, res) => {
    const id = req.query.id;
    const browser = await puppeteer.launch({
        'args' : [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    
    const page = await browser.newPage();
    //https://mobile-med-api.herokuapp.com
    await page.goto(`https://mobile-med-api.herokuapp.com/?id=${id}`, {
        waitUntil: 'networkidle0'
    });

    const pdf = await page.pdf({
        printBackground: true,
        format: 'a2',
        landscape: true,
        margin: {
            top: '0px',
            bottom: '0px',
            left: '0px',
            right: '0px'
        }
    });

    await browser.close();

    res.contentType('application/pdf');

    return res.send(pdf);
});

app.use('/uploads', express.static(path.resolve(__dirname, 'assets', 'icons')));
app.listen(process.env.PORT || 3333);