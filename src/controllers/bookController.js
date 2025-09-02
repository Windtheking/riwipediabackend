import promisePool from '../database/conection_credentials.js';

// Obtener todos los libros con información de autor y categoría
const getBooks = async (req, res) => {
    try {
        const query = `
            SELECT 
                b.id, 
                b.title,
                b.is_favorite, 
                b.portrait_url, 
                b.book_url, 
                b.book_language, 
                b.download_count,
                b.created_at,
                b.updated_at,
                a.author_name,
                c.category_name
            FROM books b
            INNER JOIN authors a ON b.id_author = a.id
            INNER JOIN categories c ON b.id_category = c.id
            ORDER BY b.created_at DESC
        `;
        
        const [books] = await promisePool.execute(query);
        res.json({ success: true, books });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener libros' });
    }
};

// Agregar nuevo libro (solo admin)
const addBook = async (req, res) => {
    try {
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ success: false, message: 'Solo administradores pueden agregar libros' });
        }

        const { title, author_name, category_name, description, portrait_url, book_url, book_language } = req.body;
        
        // Validar campos obligatorios
        if (!title || !author_name || !category_name || !book_url) {
            return res.status(400).json({ 
                success: false, 
                message: 'Título, autor, categoría y URL del libro son campos obligatorios' 
            });
        }
        
        // 1. Verificar o crear autor
        let [authorResult] = await promisePool.execute(
            'SELECT id FROM authors WHERE author_name = ?',
            [author_name]
        );
        
        let authorId;
        if (authorResult.length === 0) {
            [authorResult] = await promisePool.execute(
                'INSERT INTO authors (author_name) VALUES (?)',
                [author_name]
            );
            authorId = authorResult.insertId;
        } else {
            authorId = authorResult[0].id;
        }

        // 2. Verificar o crear categoría
        let [categoryResult] = await promisePool.execute(
            'SELECT id FROM categories WHERE category_name = ?',
            [category_name]
        );
        
        let categoryId;
        if (categoryResult.length === 0) {
            [categoryResult] = await promisePool.execute(
                'INSERT INTO categories (category_name) VALUES (?)',
                [category_name]
            );
            categoryId = categoryResult.insertId;
        } else {
            categoryId = categoryResult[0].id;
        }

        // 3. Insertar libro con título y descripción
        const [bookResult] = await promisePool.execute(
            `INSERT INTO books 
            (title, is_favorite, portrait_url, book_url, book_language, id_author, id_category) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, 0, portrait_url || null, book_url, book_language || 'ENG', authorId, categoryId]
        );

        res.json({ 
            success: true, 
            message: 'Libro agregado exitosamente', 
            bookId: bookResult.insertId 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al agregar libro' });
    }
};

// Eliminar libro (solo admin)
const deleteBook = async (req, res) => {
    try {
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ success: false, message: 'Solo administradores pueden eliminar libros' });
        }

        const { bookId } = req.body;
        
        await promisePool.execute('DELETE FROM books WHERE id = ?', [bookId]);
        
        res.json({ success: true, message: 'Libro eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar libro' });
    }
};

// Marcar/desmarcar como favorito
const toggleFavorite = async (req, res) => {
    try {
        const { bookId } = req.body;
        const userId = req.user.id;
        
        // Verificar si ya es favorito
        const [existing] = await promisePool.execute(
            'SELECT * FROM user_favorites WHERE user_id = ? AND book_id = ?',
            [userId, bookId]
        );
        
        if (existing.length > 0) {
            // Quitar de favoritos
            await promisePool.execute(
                'DELETE FROM user_favorites WHERE user_id = ? AND book_id = ?',
                [userId, bookId]
            );
            await promisePool.execute(
                'UPDATE books SET is_favorite = 0 WHERE id = ?',
                [bookId]
            );
            res.json({ success: true, isFavorite: false, message: 'Libro quitado de favoritos' });
        } else {
            // Agregar a favoritos
            await promisePool.execute(
                'INSERT INTO user_favorites (user_id, book_id) VALUES (?, ?)',
                [userId, bookId]
            );
            await promisePool.execute(
                'UPDATE books SET is_favorite = 1 WHERE id = ?',
                [bookId]
            );
            res.json({ success: true, isFavorite: true, message: 'Libro agregado a favoritos' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar favoritos' });
    }
};

export { getBooks, addBook, deleteBook, toggleFavorite };