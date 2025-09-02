//MIDDLEWARE DE AUTENTICACIÓN
/*El middleware de autenticación es una pieza de software que se inserta en el ciclo de 
procesamiento de una solicitud HTTP para verificar si un usuario ha iniciado sesión y tiene 
los permisos necesarios para acceder a un recurso. Actúa como un guarda o filtro que intercepta 
las peticiones entrantes antes de que lleguen a los controladores, validando credenciales, 
tokens o la sesión activa. Si la autenticación falla, puede redirigir al usuario a una página de inicio de sesión,
mientras que si tiene éxito, permite que la petición continúe hacia el controlador o la ruta deseada.  */

import jwt from 'jsonwebtoken';
import promisePool from '../database/conection_credentials.js';

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Acceso denegado. Token requerido.' 
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar si el usuario aún existe en la BD
        const [users] = await promisePool.execute(
            'SELECT id, email, rol FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuario no existe.' 
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        console.error('Error en autenticación:', error);
        return res.status(403).json({ 
            success: false, 
            message: 'Token inválido o expirado.' 
        });
    }
};

export default authenticateToken;