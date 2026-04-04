import {findUser, createUser} from "../services/user.service.js";




//auth controller

import genToken from "../config/token.js";
export const GoogleAuth = async (req,res) => {
    try {
        console.log("BODY:", req.body);

        const {name,email} = req.body;
        // check if user already exists
        let user = await findUser({email})
        // if user doesn't exist create a new user
        if(!user){
            user = await createUser({name,email})
        }
        // generate token
        let token = await genToken(user?.data?._id)
       res.cookie("token", token, {
    httpOnly: true,   // ✅ correct
    secure: false,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000
});

            return res.status(200).json(user)
    } catch (error) {
    return res.status(500).json({
        message:`Google authentication failed ${error}`
    }) 
   }
}


// logout controller
export const logOut = async (req,res)=>{
try {
    await res.clearCookie("token")
    return res.status(200).json({
        message:"Logged out successfully"
    })
} catch (error) {
    return res.status(500).json({
        message:`Logout failed ${error}`
    })
}
}