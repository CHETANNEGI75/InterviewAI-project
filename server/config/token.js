import jwt from 'jsonwebtoken';
// token generation logic
const genToken = async (userId) => {
    try {
        // generate token with userId and secret key and set expiration time to 7 days
        const token = jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:'7d'})
        return token
    } catch (error) {
       console.log(error) 
    }

}
export default genToken