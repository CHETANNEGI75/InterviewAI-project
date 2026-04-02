import { verify } from "crypto"
import jwt from "jsonwebtoken";


//token mai se user ki id nikal ke user ko authenticate karne wala middleware
const isAuth= async (req,res,next)=>{
    try {
        let {token} = req.cookies
        if(!token){
            return res.status(400).json({
                message:"User does not have token "
            })
        }
        // token verify kar ke user ki id nikalenge
        const verifyToken = jwt.verify(token,process.env.JWT_SECRET)
        if(!verifyToken){
            return res.status(400).json({
                message:"User does not have valid token "
            })
        }
        req.userId= verifyToken.userId
        next()
    } catch (error) {
        return res.status(500).json({
            message:` isAuth Authentication failed ${error}`
        })  
    }
}
export default isAuth