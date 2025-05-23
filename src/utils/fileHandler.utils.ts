import ImageFiles from "../Models/ImageFile";
import PDFFiles from "../Models/PDFFile";
import axios from "axios";

const NodeCache = require( "node-cache" );
const fileCache = new NodeCache( { stdTTL: 0, checkperiod: 120 } );

export async function processFiles(parts: any[], pdfFiles: PDFFiles[] | null, imageFiles: ImageFiles[] | null){
    if(pdfFiles){
      for (const file of pdfFiles) {
        let data = '';

        // Check if the file is already cached
        if(fileCache.has(`${file.filePath}`)){
            console.log("Cache hit for file: ", file.filePath);
            data = fileCache.get(`${file.filePath}`);
        }
        else{
            console.log("Cache miss for file: ", file.filePath);
            const pdfResp = await axios.get(file.filePath, {
                responseType: "arraybuffer",
              });
            data = Buffer.from(pdfResp.data).toString("base64");
            fileCache.set(`${file.filePath}`, data, 604800);
        }

        parts.push({
          inlineData: {
            mimeType: "application/pdf",
            data: data,
          },
        });
      }
    }

      if(imageFiles){
        for (const file of imageFiles) {
          let data = '';
  
          // Check if the file is already cached
          if(fileCache.has(`${file.filePath}`)){
              console.log("Cache hit for file: ", file.filePath);
              data = fileCache.get(`${file.filePath}`);
          }
          else{
              console.log("Cache miss for file: ", file.filePath);
              const imageResp = await axios.get(file.filePath, {
                  responseType: "arraybuffer",
                });
              data = Buffer.from(imageResp.data).toString("base64");
              fileCache.set(`${file.filePath}`, data, 604800);
          }
  
          parts.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: data,
            },
          });
        }
      }

      return parts;
}