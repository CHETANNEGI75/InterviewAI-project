import {findOne,create} from "../dal/dal.js";
import User from "../model/userModel.js";

export const finduserById = async (userId) => {
    try {
        const user = await findOne(User, { _id: userId });
        if (!user.success) {
            return null;
        }
        return user;
    } catch (error) {
        return null;
    }
}

export const findUser = async (filter) => {
    try {
        const user = await findOne(User, filter);   
        if (!user.success) {
            return null;
        }
        return user;
    } catch (error) {
        return null;
    }
}

export const createUser = async (data) => {
    try {
        const newUser = await create(User, data);
        if (!newUser) {
            return null;
        }
        return newUser;
    } catch (error) {
        return null;
    }
}

