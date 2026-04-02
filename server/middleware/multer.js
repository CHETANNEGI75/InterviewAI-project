import multer from 'multer';
// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public');
    },
    // Generate a unique filename using the current timestamp and original filename
    filename: function (req, file, cb) {
        // Create a unique filename using the current timestamp and original filename
        const filename= Date.now() + '-' + file.originalname;
        cb(null, filename);
    }
})
// Create the multer instance with the defined storage and file size limit

export const upload = multer({storage,limits:{fileSize: 5*1024*1024} // 5mb limit   
});