import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);


const bucketName = process.env.SUPABASE_BUCKET_NAME;



export const uploadFile = async (
  file,
  path
) => {

  const { error } = await supabase
    .storage
    .from(bucketName)
    .upload(
      path,
      file.buffer,
      {
        contentType: file.mimetype,
        upsert: true,
      }
    );


  if (error) {
    throw new Error(
      `File upload failed: ${error.message}`
    );
  }


  const {
    data,
  } = supabase
    .storage
    .from(bucketName)
    .getPublicUrl(path);


  return data.publicUrl;
};



export const deleteFile = async (
  path
) => {

  const {
    error,
  } = await supabase
    .storage
    .from(bucketName)
    .remove([
      path
    ]);


  if (error) {
    throw new Error(
      `File deletion failed: ${error.message}`
    );
  }

};