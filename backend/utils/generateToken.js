
import jwt from 'jsonwebtoken';

const genToken = (id) => {
    return jwt.sign({id}, process.env.secret, {expiresIn : '7d'})
};

export default genToken;




