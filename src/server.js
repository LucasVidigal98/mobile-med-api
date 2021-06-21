const ejs = require('ejs');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { json } = require('express');
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
    console.log(record.id);
    
    ejs.renderFile('./template.ejs', {record}, (err, html) => {
        //console.log(html);
        fs.writeFileSync(`${record.id}.html`, html);
    });

    res.json({id: record.id});
});

routes.get('/', (req, res) => {

    const id = req.query.id;
    const html = fs.readFileSync(`${id}.html`);

    res.send(html.toString());
});

routes.get('/get_pdf', async (req, res) => {
    const id = req.query.id;
    console.log(id);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`http://localhost:3333/?id=${id}`, {
        waitUntil: 'networkidle0'
    });

    const pdf = await page.pdf({
        printBackground: true,
        format: 'a2',
        margin: {
            top: '20px',
            bottom: '40px',
            left: '5px',
            right: '5px'
        }
    });

    await browser.close();

    res.contentType('application/pdf');

    return res.send(pdf);
});

routes.get('/img', (req, res) => {
    const imageName = req.query.image;
    console.log(imageName);
    const image = fs.readFileSync(path.resolve(__dirname, 'assets', 'icons', 'capsule', `${imageName}.png`));
    //res.contentType('application/png');
    res.send(image.toString());
});

app.use('/uploads', express.static(path.resolve(__dirname, 'assets', 'icons')));
app.listen(3333);


/*ejs.renderFile('./template.ejs', {record}, (err, html) => {
    console.log(html);
    fs.writeFileSync('index.html', html);
});*/