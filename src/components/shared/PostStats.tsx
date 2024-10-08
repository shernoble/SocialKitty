import { useUserContext } from '@/context/AuthContext';
import { useDeletePost, useDeleteSavedPost, useGetCurrentUser, useLikePost, useSavePost } from '@/lib/react-query/queriesAndMutations';
import { checkIsLiked } from '@/lib/utils';
import { Models } from 'appwrite'
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Loader } from './Loader';


// basically the prop structure that we are going to deal with in this component
type PostStatsProps={
    post: Models.Document,
    userId: string,
};

export function PostStats({post, userId} : PostStatsProps){

  const location= useLocation();
  // stores all the ids of the users who liked the post
  const likesList=post.likes.map((user:Models.Document) => user.$id);

  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);

  const { mutate: likePost, isPending: isLiking } = useLikePost();
  const { mutate: savePost , isPending: isSaving} = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();

  // gives the current logged in user details- full info , not just id
  const { data:user } = useGetCurrentUser();


  const savedPostRec= user?.save.find(
    (record: Models.Document) => record.post.$id === post.$id
  );

  useEffect(() => {
    // !! = savedPostRec? True: False
    setIsSaved(!!savedPostRec)
  },[user])

  const handleLikePost = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    // doesnt navigate to some other page after like is clicked
    e.stopPropagation();

    let likesArray=[...likes];

    // unlike if already liked
    if(likesArray.includes(userId)){
      likesArray=likesArray.filter(id => id !== userId);
    }
    else{
      likesArray.push(userId);
    }

    setLikes(likesArray);
    likePost({postId : post.$id, likesArray});


  };

  const handleSavePost = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();

    if(savedPostRec){
      setIsSaved(false);
      return deleteSavePost(savedPostRec.$id);
    }
    savePost({postId:post.$id, userId:userId});
    setIsSaved(true);

  } ;

  const containerStyles = location.pathname.startsWith("/profile")
    ? "w-full"
    : "";


  return (
    <div
      className={`flex justify-between items-center z-20 ${containerStyles}`}>
      <div className="flex gap-2 mr-5">
        {isLiking ? <Loader/> :
        <img
          src={`${
            checkIsLiked(likes, userId)
              ? "/assets/icons/liked.svg"
              : "/assets/icons/like.svg"
          }`}
          alt="like"
          width={20}
          height={20}
          onClick={(e) => handleLikePost(e)}
          className="cursor-pointer"
        />
        }
        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>

      <div className="flex gap-2">
        {isSaving? <Loader/>:
        <img
          src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
          alt="share"
          width={20}
          height={20}
          className="cursor-pointer"
          onClick={(e) => handleSavePost(e)}
        />
        }
      </div>
    </div>
  );
};
