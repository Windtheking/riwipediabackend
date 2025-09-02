import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import endpoints from '../src/routes/endpoints.js';

dotenv.config();

const app = express();
app.use(cors({
    origin: ['https://riwiwpedia-frontend.vercel.app/'],
    credentials: true
}));
app.use(express.json());
app.use('/api', endpoints);

app.get('/', (req, res) => {
    res.json({ message: 'API de Biblioteca Online funcionando' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
    });
});

// Exportar el handler para Vercel
export default app;
