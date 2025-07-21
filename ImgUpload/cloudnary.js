
require('dotenv').config();

const cloudinary = require('cloudinary').v2;

const path = require('path');


const couldinaryUpload  = async() => {

    // Configuration
    cloudinary.config({
        cloud_name: `${process.env.CLOUD_NAME}`,
        api_key: `${process.env.API_KEY}`,
        api_secret: `${process.env.API_SECRET}`// Click 'View API Keys' above to copy your API secret
    });

    // Upload an image
    try {

        const localFilePath = path.resolve(__dirname, '2sxq2');

        const uploadResult = await cloudinary.uploader
            .upload(
                localFilePath, {
                public_id: 'my-image',
            }
            )
            .catch((error) => {
                console.log(error);
            });

        console.log(uploadResult);

    } catch (error) {
        console.error('Error uploading image:', error);
    }

    // Optimize delivery by resizing and applying auto-format and auto-quality
    // const optimizeUrl = cloudinary.url('shoes', {
    //     fetch_format: 'auto',
    //     quality: 'auto'
    // });

    // console.log(optimizeUrl);

    // // Transform the image: auto-crop to square aspect_ratio
    // const autoCropUrl = cloudinary.url('shoes', {
    //     crop: 'auto',
    //     gravity: 'auto',
    //     width: 500,
    //     height: 500,
    // });

    // console.log(autoCropUrl);
};


couldinaryUpload();



