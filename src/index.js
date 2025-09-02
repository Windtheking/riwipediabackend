// 1. Importar dependencias
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import endpoints from './routes/endpoints.js';

dotenv.config();


// 2. Configurar servidor
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 3. Conectar rutas
app.use('/api', endpoints);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API de Biblioteca Online funcionando' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📋 Rutas disponibles:`);
    console.log(`   - GET  http://localhost:${PORT}/api/test`);
    console.log(`   - POST http://localhost:${PORT}/api/register`);
    console.log(`   - POST http://localhost:${PORT}/api/login`);
});

export default app;