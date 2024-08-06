import React, { Component } from 'react';
import { Context } from '../store/appContext';

class CloudinaryUploadWidget extends Component {
  static contextType = Context;
  componentDidMount() {

      //const cloudName = "du8wenys3";
      const cloudName = "dvvp6cy93"
      const uploadPreset = "ml_default"

      //const uploadPreset = "cdhgx4ba";
    //const uploadPreset = process.env.UPLOAD_PRESET;
   

    var myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        // cropping: true, //add a cropping step
        // showAdvancedOptions: true,  //add advanced options (public_id and tag)
        // sources: [ "local", "url"], // restrict the upload sources to URL and local files
        multiple: false, //restrict upload to a single file
        //folder: "img_talonarios", //upload files to the specified folder
        // tags: ["users", "profile"], //add the given tags to the uploaded files
        // context: {alt: "user_uploaded"}, //add the given context data to the uploaded files
        // clientAllowedFormats: ["images"], //restrict uploading to image files only
        // maxImageFileSize: 2000000,  //restrict file size to less than 2MB
        // maxImageWidth: 2000, //Scales the image down to a width of 2000 pixels before uploading
        // theme: "purple", //change to a purple theme
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          console.log('Done! Here is the image info: ', result.info);
          console.log(result.info);
          this.context.actions.addImageUrl(
            result.info.secure_url,
            result.info.thumbnail_url,
            result.info.public_id,
          );
        }
      },
    );
    document.getElementById('upload_widget').addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        myWidget.open();
      },
      false,
    );
  }

  render() {
    return (
      <div className="d-flex flex-colunm align-items-center justify-content-center">
        <button id="upload_widget" className="btn btn-success mt-2">
          Upload
        </button>
      </div>
    );
  }
}

export default CloudinaryUploadWidget;
