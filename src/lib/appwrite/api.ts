import { ID, ImageGravity, Query } from "appwrite";

import { appwriteConfig, account, databases, storage, avatars } from "./config";
import { IUpdatePost, INewPost, INewUser, IUpdateUser } from "@/types";



export async function CreateNewUser ( user : INewUser){
    try{
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );

        if(!newAccount) throw Error;

        const avatarUrl=avatars.getInitials(user.name);

        const newUser=await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            email:newAccount.email,
            username: user.username,
            imageURL: avatarUrl,

        });

        return newUser;



    }
    catch(error)
    {
        console.log(error);
        return error;
        
    }
}

export async function saveUserToDB(user :{
    accountId: string;
    name: string;
    email: string;
    imageURL: URL;
    username?: string;

    }) {
    try{
        const newUser= await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user

        )
        return newUser;
    }
    catch(error)
    {
        console.log(error);
        
    }
}

// appwrite function that wil be utilized by react query
export async function signInAccount (user : {

    email: string; password:string;
    })
    {
        try{
            const session= await account.createEmailPasswordSession(user.email,user.password);
            return session;
        }
        catch(error)
        {
            console.log(error);
            
        }
    }




export async function getCurrentUser()
{
    try{
        // gets the currently logged in user
        const currentAccount= await account.get();

        if(!currentAccount) throw Error;

        // get the whole currentuser info
        const currentUser= await databases.listDocuments(
            appwriteConfig.databaseId,appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        // return the details of the current logged in user
        return currentUser.documents[0];

    }
    catch(error)
    {
        console.log(error);
        
    }
}

export async function getUserById(userId?: string){
    try{
        if(!userId) throw Error;

        const user= await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId
        );

        if(!user) throw Error;

        return user;
    }
    catch(error)
    {
        console.log(error);
        
    }
}

export async function signOutAccount(){
    try{
        const session= await account.deleteSession("current");

        return session;
    }
    catch(error)
    {
        console.log(error);
        
    }
}

export async function updateUser(user: IUpdateUser)
{
    try{
        const hasFileToUpdate = user.file.length>0;

        
            // profile image update
            let image={
                imageUrl: user.imageUrl,
                imageId: user.imageId
            };

            if(hasFileToUpdate){
                const uploadedFile= await uploadFile(user.file[0]);

                if(!uploadedFile) throw Error;

                // get new file url 
                const fileUrl=await getFilePreview(uploadedFile.$id);

                if(!fileUrl){
                    // delete the uploaded file
                    await deleteFile(uploadedFile.$id);
                    throw Error;
                }

                image={...image, imageUrl: fileUrl, imageId: uploadedFile.$id};
                
                const updatedUser = await databases.updateDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.userCollectionId,
                    user.userId,
                    {
                        name: user.name,
                        bio: user.bio,
                        imageURL: image.imageUrl,
                        imageId: image.imageId,
                        }
                    );

                // failed to update user
                if(!updatedUser)
                {
                    // delete the uploaded file
                    if(hasFileToUpdate){
                        await deleteFile(image.imageId);
                    }
                    // if no new file uploaded,just throw error
                    throw Error;
                }
                // safely delete old file after successful update
                if(user.imageId && hasFileToUpdate){
                    await deleteFile(user.imageId);
                }
                return updatedUser;
                
            }

    }
    catch(error)
    {
        console.log(error);
        
    }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
    try {
    // Upload file to appwrite storage
    console.log(post);
    
    const uploadedFile = await uploadFile(post.file[0]);


    console.log(uploadedFile+" is there");
    
    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    console.log(fileUrl + " file url is there");
    
    if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
    }



    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post
    const newPost = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        ID.unique(),
        {
        creator: post.userId,
        caption: post.caption,
        imageURL: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
        }
    );

    if (!newPost) {
        await deleteFile(uploadedFile.$id);
        throw Error;
    }

    return newPost;
    } catch (error) {
    console.log(error);
    }
}

// ============================== UPLOAD FILE
// storage is used for saving media
export async function uploadFile(file: File) {
    try {
    const uploadedFile = await storage.createFile(
        appwriteConfig.storageId,
        ID.unique(),
        file
    );

    return uploadedFile;
    } catch (error) {
    console.log(error);
    }
}

// GET FILE URL
export function getFilePreview(fileId: string) {
    try{
        const fileUrl= storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            ImageGravity.Top,
            100

        );

        if(!fileUrl) throw Error;

        return fileUrl;


    }
    catch(error)
    {
        console.log(error);
        
    }
}

export async function deleteFile(fileId: string)
{
    try{
        await storage.deleteFile(appwriteConfig.storageId, fileId);
        return {status: "ok"};

    }
    catch(error)
    {
        console.log(error);
        
    }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm: string) {

    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.search("caption", searchTerm)]
        );

        if (!posts) throw Error;

        return posts;
        } catch (error) {
        console.log(error);
        }
    }


// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
    if (!postId) throw Error;

    try {
    const post = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        postId
    );

    if (!post) throw Error;

    return post;
    } catch (error) {
    console.log(error);
    }
}

export async function getRecentPosts(){
    try{
        const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [Query.orderDesc('$createdAt'),Query.limit(20)]
    )

    if(!posts) throw Error;

    return posts;
    }catch(error)
    {
        console.log(error);
        
    }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
    if (!postId || !imageId) return;
    
        try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        );
    
        if (!statusCode) throw Error;
    
        await deleteFile(imageId);
    
        return { status: "Ok" };
        } catch (error) {
        console.log(error);
        }
    }

export async function likePost(postId : string, likesArray: string[]){
    try{
        console.log(postId);
        
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray
            }
        )

        if(!updatedPost) throw Error;

        return updatedPost;
    }
    catch(error){
        console.log(error);
        
    }
}

export async function savePost(postId : string, userId: string){
    try{
        const updatedPost = await databases.createDocument(appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                users: userId,
                post: postId,
            }
        )

        if(!updatedPost) throw Error;

        return updatedPost;
    }
    catch(error){
        console.log(error);
        
    }
}

// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {

    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId
        );
    
        if (!statusCode) throw Error;
    
        return { status: "Ok" };
        } catch (error) {
        console.log(error);
        }
    }

export async function updatePost(post: IUpdatePost)
{
    try{
        const hasFileToUpdate = post.file.length>0;

        
            // profile image update
            let image={
                imageUrl: post.imageUrl,
                imageId: post.imageId
            };

            if(hasFileToUpdate){
                const uploadedFile= await uploadFile(post.file[0]);

                if(!uploadedFile) throw Error;

                // get new file url 
                const fileUrl=await getFilePreview(uploadedFile.$id);

                if(!fileUrl){
                    // delete the uploaded file
                    await deleteFile(uploadedFile.$id);
                    throw Error;
                }

                image={...image, imageUrl: fileUrl, imageId: uploadedFile.$id};
                const tags = post.tags?.replace(/ /g, "").split(",") || [];
                
                const updatedPost = await databases.updateDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.postCollectionId,
                    post.postId,
                    {
                        caption: post.caption,
                        imageUrl: image.imageUrl,
                        imageId: image.imageId,
                        location: post.location,
                        tags: tags,
                    }
                    );

                // failed to update user
                if(!updatedPost)
                {
                    // delete the uploaded file
                    if(hasFileToUpdate){
                        await deleteFile(image.imageId);
                    }
                    // if no new file uploaded,just throw error
                    throw Error;
                }
                // safely delete old file after successful update
                if(post.imageId && hasFileToUpdate){
                    await deleteFile(post.imageId);
                }
                return updatedPost;
                
            }

    }
    catch(error)
    {
        console.log(error);
        
    }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
    if (!userId) return;
    
        try {
        const post = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
        );
    
        if (!post) throw Error;
    
        return post;
        } catch (error) {
        console.log(error);
        }
    }


export async function  getInfinitePosts({pageParam} : {pageParam: number})
{
    const queries= [Query.orderDesc('$updatedAt'), Query.limit(10)];

    if(pageParam){
        // number of queries you want to skip
        // if in page 2, skip the first 10 
        queries.push(Query.cursorAfter(pageParam.toString()));

    }

    try{
        // fetch all the posts
        const posts= await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            queries
        );
        if(!posts) throw Error;
        return posts;

    }
    catch(error)
    {
        console.log(error);
        
    }
}
