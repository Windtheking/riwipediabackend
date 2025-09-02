import express from 'express';
import { registerUser, loginUser } from '../controllers/controllers.js';
import authenticateToken from '../middleware/auth.js';
import { getBooks, addBook, deleteBook, toggleFavorite } from '../controllers/bookController.js';

const router = express.Router();

// Rutas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'API funciona' });
});

// Rutas de libros
router.get('/books', authenticateToken, getBooks);
router.post('/books', authenticateToken, addBook);
router.delete('/books/delete', authenticateToken, deleteBook);
router.post('/books/favorite', authenticateToken, toggleFavorite);

// Ruta de perfil
router.get('/profile', authenticateToken, (req, res) => {
    res.json({ success: true, user: req.user });
});

export default router;