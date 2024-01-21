const jwt = require('jsonwebtoken');

exports.verify = (req, res, next) => {
    let token = req.headers['authorization'];
    token = token.replace(/^Bearer\s+/, '');

    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.json({
                    success: false,
                    msg: 'Token no valido'
                });
            }
            req.decoded = decoded;
            next();
        });
    } else {
        return res.json({
            success: false,
            msg: 'Token no encontrado'
        });
    }
}