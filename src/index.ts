import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generateRandomString } from "./utils";
import fs from "fs";
import path from "path";
import { S3 } from "aws-sdk";
import { createClient } from "redis";

// async function initializeRedis() {
//     const publisher = createClient();
//     publisher.on('error', err => console.log('Redis Client Error', err));
//     await publisher.connect();
//     return publisher;
// }

// const publisher = initializeRedis();


const client = createClient();
client.connect();


export const getAllFiles = (folderPath: string) => {
    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);
    
    allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath))
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}



// replace with your own credentials
const s3 = new S3({
    accessKeyId: "7434251e432c27bf847764f7f13b9c37",
    secretAccessKey: "ed10036fee26d6138b2bb46a01bc41736f13cd9ff4ea44b5d294ac4c903ee08b",
    endpoint: "https://c582d284e56041fb53d159e83ed1cd36.r2.cloudflarestorage.com"
})

// fileName => output/12312/src/App.jsx
// filePath => /Users/harkiratsingh/vercel/dist/output/12312/src/App.jsx
export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel",
        Key: fileName,
    }).promise();
    console.log(response);
}

const app = express();
app.use(cors());
app.use(express.json());

 app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generateRandomString(7);
    await simpleGit().clone(repoUrl, path.join(__dirname, `./output/${id}`));

    const files = getAllFiles(path.join(__dirname, `output/${id}`));

    files.forEach(async file => {
        await uploadFile(file.slice(__dirname.length + 1), file);
    })

    // publisher.lPush("build-queue", id);
    client.lPush('build-queue', id);
    res.json({id});
});

app.listen(3000);