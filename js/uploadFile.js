import { BlobServiceClient } from "@azure/storage-blob";
 
const CONNECTION_STRING = process.env.NEXT_PUBLIC_AZURE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.NEXT_PUBLIC_AZURE_CONTAINER_NAME;
 
async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ code: "AX01", data: {}, msg: "Method not allowed" });
    return;
  } else {
    try {
      const { base64File } = req.body;
 
      if (!base64File) {
        res
          .status(400)
          .json({ code: "AX03", data: {}, msg: "Invalid request body" });
        return;
      }
 
      const containerName = CONTAINER_NAME;
      //   console.log("Container Name: ", containerName);
 
      const blobServiceClient =
        BlobServiceClient.fromConnectionString(CONNECTION_STRING);
      //   const blobServiceClient = new BlobServiceClient(
      //     `https://${account}.blob.core.windows.net`,
      //     defaultAzureCredential
      //   );
      const containerClient =
        blobServiceClient.getContainerClient(containerName);
      const filename = req.query.filename;
      const fileBuffer = Buffer.from(base64File, "base64");
      const blockBlobClient = containerClient.getBlockBlobClient(filename);
 
      // Determine the content type based on the file extension
      const extension = filename.split(".").pop().toLowerCase();
      let contentType;
 
      switch (extension) {
        case "pdf":
          contentType = "application/pdf";
          break;
        case "jpg":
        case "jpeg":
          contentType = "image/jpeg";
          break;
        case "png":
          contentType = "image/png";
          break;
        case "doc":
        case "docx":
          contentType = "application/msword";
          break;
        case "xlsx":
          contentType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          break;
        // Add more cases for other file types as needed
        default:
          contentType = "application/octet-stream"; // Generic binary type
      }
 
      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: contentType },
      });
      const blobUrl = blockBlobClient.url;
 
      res.status(200).json({
        code: "AX00",
        data: {
          url: blobUrl,
        },
        msg: "File uploaded successfully",
      });
      return;
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ code: "AX02", data: {}, msg: "Internal server error" });
    }
  }
}

const handleUploadAttachment = async (e) => {
    if (e.target.files.length > 0) {
      let file = e.target.files[0];
      let fileName = e.target.files[0].name;
 
      let ext = fileName.split(".").pop();
 
      const base64String = await convertToBase64(file);
 
      try {
        setUploading(true);
        const response = await fetch(`/api/uploadFile?filename=${file.name}`, {
          method: "POST",
          body: JSON.stringify({
            base64File: base64String,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
 
        if (!response.ok) {
          toast.error("Attachment size is too Large");
          setUploading(false);
          throw new Error(`Failed to upload file: ${response.statusText}`);
        }
 
        const data = await response.json();
        if (data.code === "AX00") {
          setEmailCampaignData({
            attachment: data.data.url,
          });
          toast.success("Added Attachment Successfully");
          attachmentDetails.push({
            name: file.name,
            size: file.size,
            attachmentLink: data.data.url,
            extension: ext,
          });
        }
 
        setUploading(false);
      } catch (error) {
        console.error("Error adding attachment:", error);
      }
    }
  };

