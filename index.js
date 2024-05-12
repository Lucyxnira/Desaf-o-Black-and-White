const express = require('express');
const app = express();
const path = require('path');
const Jimp = require('jimp');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// Middleware para carpeta Temp
app.use('/temp', express.static(path.join(__dirname, 'temp')));

// Middleware para formularios
app.use(express.urlencoded({ extended: true }));

// Ruta raíz que devuelve el formulario HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Envío del formulario
app.post('/procesar', async (req, res) => {
    const imageUrl = req.body.imageURL;
    
    try {
        // Descargar la imagen desde la URL
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');

        // Cargar la imagen
        const image = await Jimp.read(imageBuffer);
        
        // Procesar la imagen (convertir a escala de grises y redimensionar)
        image
            .greyscale()
            .resize(350, Jimp.AUTO);
        
        // Generar un nombre único para el archivo
        const uniqueFilename = `${uuidv4()}.jpg`;
        
        // Guardar la imagen
        const tempImagePath = path.join(__dirname, 'temp', uniqueFilename);
        await image.writeAsync(tempImagePath);
        
        // Enviar la imagen
        res.send(`<img src="/temp/${uniqueFilename}" alt="Imagen procesada">`);
    } catch (error) {
        console.error('Error al procesar la imagen:', error);
        res.status(500).send('Error al procesar la imagen. Por favor, verifica la URL e intenta nuevamente.');
    }
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
