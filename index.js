const { BlobServiceClient } = require("@azure/storage-blob");
const $ = require("./vendors/jquery/jquery-3.5.1");
require("dotenv").config();

$(document).ready(function () {
  $("#feedback").hide();
});

const createContainerButton = document.getElementById(
  "create-container-button"
);
const deleteContainerButton = document.getElementById(
  "delete-container-button"
);
const selectButton = document.getElementById("select-button");
const fileInput = document.getElementById("file-input");
const listButton = document.getElementById("list-button");
const clearData = document.getElementById("clearData");
const fileList = document.getElementById("file-list");
const status = document.getElementById("status");
const feedback = document.getElementById("feedback");

const reportStatus = (message) => {
  status.innerHTML += `${message}<br/>`;
  status.scrollTop = status.scrollHeight;
};

const blobSasUrl =
  "https://wpfileupload.blob.core.windows.net/?sv=2019-10-10&ss=b&srt=sco&sp=rwdlacx&se=2025-06-29T09:16:10Z&st=2020-06-26T01:16:10Z&spr=https&sig=tUV4VcK5jMJJJU5wzIwFyIoe%2F4RJSD2iJ6Od4cZU5HU%3D";

// Create a new BlobServiceClient
const blobServiceClient = new BlobServiceClient(blobSasUrl);

// Create a unique name for the container by
// appending the current time to the file name
// const containerName = "container" + new Date().getTime();
const containerName = "wpfiles";

// Get a container client from the BlobServiceClient
const containerClient = blobServiceClient.getContainerClient(containerName);

clearData.addEventListener("click", clearDiv);

function clearDiv() {
  status.innerHTML = "";
  fileList.innerHTML = "";
  $("#feedback").hide();
}

const listFiles = async () => {
  $("#feedback").show();
  fileList.size = 0;
  fileList.innerHTML = "";
  try {
    reportStatus("Retrieving file list...");
    let iter = containerClient.listBlobsFlat();
    let blobItem = await iter.next();

    while (!blobItem.done) {
      var items = blobItem.value.name;
      fileList.size += 1;
      fileList.innerHTML += `<option>${items}</option>`;
      blobItem = await iter.next();
    }
    if (fileList.size > 0) {
      document.getElementById("status").innerHTML = "";
      reportStatus("File uploaded");
      $("#statusWrapper").hide();
      $("#filesWrapper").show();
    } else {
      document.getElementById("status").innerHTML = "";
      $("#filesWrapper").hide();
      reportStatus("The container does not contain any files.");
    }
  } catch (error) {
    reportStatus(error.message);
  }
};

listButton.addEventListener("click", listFiles);

const uploadFiles = async () => {
  try {
    reportStatus("Uploading files...");
    const promises = [];
    for (const file of fileInput.files) {
      const blockBlobClient = containerClient.getBlockBlobClient(file.name);
      promises.push(blockBlobClient.uploadBrowserData(file));
    }
    await Promise.all(promises);
    reportStatus("File(s) uploaded");
    listFiles();
  } catch (error) {
    reportStatus("An error occured", error.message);
  }
};

selectButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", uploadFiles);
