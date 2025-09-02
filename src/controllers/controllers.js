import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import promisePool from '../database/conection_credentials.js';

// Función para verificar si email existe
async function checkEmailExists(email) {
    try {
        const [rows] = await promisePool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        return rows.length > 0;
    } catch (error) {
        console.error('Error checking email:', error);
        throw error;
    }
}

// Controlador de registro
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        console.log('Datos recibidos en registro:', { email });

        // Validar campos vacíos
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email y contraseña son obligatorios' 
            });
        }

        // Verificar si el email ya existe
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
            return res.status(400).json({ 
                success: false, 
                message: 'El correo electrónico ya está registrado' 
            });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario en la BD
        const [result] = await promisePool.execute(
            'INSERT INTO users (username, email, user_password, rol) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, 'user']
        );

        console.log('Usuario registrado exitosamente:', username);

        res.status(201).json({ 
            success: true, 
            message: 'Usuario registrado exitosamente',
            username: username
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor' 
        });
    }
};

// Controlador de login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Intentando login con:', email);

        // Validar campos vacíos
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email y contraseña son obligatorios' 
            });
        }

        // Buscar usuario en la BD
        const [users] = await promisePool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Credenciales incorrectas' 
            });
        }

        const user = users[0];

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.user_password);
        if (!validPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Credenciales incorrectas' 
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                rol: user.rol 
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        console.log('Login exitoso para usuario:', user.username);

        res.json({ 
            success: true, 
            message: 'Login exitoso',
            token: token,
            user: { 
                id: user.id, 
                email: user.email, 
                rol: user.rol 
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor' 
        });
    }
};

// Exportar las funciones
export { registerUser, loginUser };