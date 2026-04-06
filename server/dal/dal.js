export const find = async (model,filter={})=>{
    try {
        const data = await model.find(filter);
        if(!data){
            return {data:null,success:false,message:"Data not found"}
        }
        return {data,success:true,message:"Data found"}

    } catch (error) {
        
    }
}

export const findOne = async (model,filter={})=>{
    try {
        const data = await model.findOne(filter);
        if(!data){
            return {data:null,success:false,message:"Data not found"}
        }
        return {data,success:true,message:"Data found"}

    } catch (error) {
        return {data:null,success:false,message:"An error occurred while fetching the data"}    
    }
}

export const create = async(model,data)=>{
    try {
        const newData = await model.create(data);
        if(!newData){
            return {data:null,success:false,message:"Data not created"}
        }
        return {data:newData,success:true,message:"Data created successfully"}
    } catch (error) {
        return {data:null,success:false,message:"An error occurred while creating the data"}
    }

}

export const update = async(model,filter,data)=>{
    try {
        const updatedData = await model.findOneAndUpdate(filter,data,{new:true});
        if(!updatedData){
            return {data:null,success:false,message:"Data not updated"}
        }
        return {data:updatedData,success:true,message:"Data updated successfully"}
    } catch (error) {
        return {data:null,success:false,message:"An error occurred while updating the data"}
    }
}

export const deleteOne = async(model,filter)=>{
    try {
        const deletedData = await model.findOneAndDelete(filter);
        if(!deletedData){
            return {data:null,success:false,message:"Data not deleted"}
        }
        return {data:deletedData,success:true,message:"Data deleted successfully"}
    } catch (error) {
        return {data:null,success:false,message:"An error occurred while deleting the data"}
    }
}