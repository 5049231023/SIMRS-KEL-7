const express = require('express');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/pendaftaran', (req, res) => {
    res.sendFile(path.join(__dirname, 'pendaftaran.html'));
});

app.post('/proses-daftar', (req, res) => {
    const data = req.body;
    console.log("Data Pasien Masuk:", data);
    res.send("Pendaftaran Sukses! Cek terminal VS Code untuk melihat datanya. <br><br> <a href='/pendaftaran'>Input Lagi</a> | <a href='/'>Ke Menu Utama</a>");
});

app.listen(3000, () => {
    console.log('Server SIM RS nyala! Buka http://localhost:3000 di browser');
});