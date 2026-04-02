import React from 'react'
import { FaRobot } from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/Firebase';
import { ServerURL } from '../App';
import axios from 'axios';
import { motion } from "motion/react"
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';



const Auth = () => {
    const dispatch =useDispatch()

const handleGoogleAuth = async () => {
    try {
        const response = await signInWithPopup(auth,provider)
        console.info("🚀 ~ handleGoogleAuth ~ response:", response)
        // Process the signed-in user's information
        let user = response.user
        let name = user.displayName
        let email = user.email
        // Send the user data to the server for authentication and user creation
        const result = await axios.post(ServerURL + "/api/auth/google", {name,email},{withCredentials:true})
        dispatch(setUserData(result.data))

    } catch (error) {
        console.log(error)
                dispatch(setUserData(null))

    }
}


  return (
    <motion.div 
    initial={{ opacity: 0, y: -40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{duration:1.05}}
    className='w-full min-h-screen bg-[#f3f3f3] flex item-center justify-center px-6 py-20'>
        <motion.div className='w-auto max-w-md p-8 rounded-3xl bg-white shadow-2xl text-center  border border-gray-200 '>
            <div className='flex items-center justify-center gap-3 mb-6'>
                <div className='bg-black text-white p-2 rounded-lg'>
                    <FaRobot size={18} />
                </div>
                <h2 className='font-semibold text-lg'>InterviewIQ.AI </h2>
            </div>
            <h1 className='text-2xl md:text-3xl font-bold text-center leading-snug mb-6'>Continue with<span className='bg-green-100 text-green-600 px-3 py-1
            rounded-full inline-flex items-center gap-2'> <IoSparkles size={16} />
            Ai Smart Interview
</span></h1>
<p className='text-gray-600 mb-8 text-sm text-center md:text-base leading-relaxed'>Sign in to start Ai-powered interviews track your progress, and unlocked detailed performance</p>
      <motion.button onClick={handleGoogleAuth}
      whileFocus={{opacity: 0.9,scale:1.03}}
      whileTap={{opacity:1,scale:0.9}}
      className='w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors duration-300'>
       <FcGoogle size={20} />
       Continue with google

      </motion.button>
      
        </motion.div>
    </motion.div>
  )
}

export default Auth
