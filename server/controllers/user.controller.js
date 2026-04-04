import {finduserById} from "../services/user.service.js";


export const getCurrentUser = async (req,res) => {
try {
    // user ki id nikal ke user ki details nikalenge
    const userId = req.userId
    const user = await finduserById(userId);
    if(!user){
        return res.status(404).json({
            message:"User not found"
        })
    }
    return res.status(200).json(user)
} catch (error) {
    return res.status(500).json({
        message:`Get current user failed ${error}`
    })
}



}