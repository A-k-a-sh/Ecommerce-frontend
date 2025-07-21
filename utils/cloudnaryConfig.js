 const cloudinary = require('cloudinary').v2;
 const fs = require('fs').promises;
 module.exports =  couldinaryUpload  = async(req , res , next) => {

    // Configuration
    cloudinary.config({
        cloud_name: `${process.env.CLOUD_NAME}`,
        api_key: `${process.env.API_KEY}`,
        api_secret: `${process.env.API_SECRET}`// Click 'View API Keys' above to copy your API secret
    });

    // Upload an image
    try {

        //const localFilePath = path.resolve(__dirname, `../public/uploads/${req.file.filename}`);

        const uploadResult = await cloudinary.uploader
            .upload(
                req.file.path, {
                public_id: `${req.file.originalname}`,
            }
            )
            .catch((error) => {
                console.log(error);
            });

        await fs.unlink(req.file.path);

        //console.log(uploadResult);
        req.image = uploadResult.secure_url;
        next();

    } catch (error) {
        //console.error('Error uploading image:', error);
        req.flash('error', error.message);
        return res.redirect('/listings/new');
        //next();
    }

};