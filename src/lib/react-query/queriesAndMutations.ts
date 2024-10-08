import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { useQuery,useMutation,useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { CreateNewUser, createPost, deletePost, deleteSavedPost, getCurrentUser, getInfinitePosts, getPostById, getRecentPosts, getUserById, getUserPosts, likePost, savePost, searchPosts, signInAccount, signOutAccount, updatePost, updateUser } from "../appwrite/api";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";

// mutation function perform the server request
// create a mutation function so that react query knows what we are doing

// invalidating queries:
//invalidating a query-> triggers React Query to refetch the query, ensuring that the UI is updated witht the latest post data

// FOR USER SESSIONS

// will be used as a hook
export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) => CreateNewUser(user)
    })
}

// for sesions -sign in 
export const useSignInAccount = () => {
    return useMutation({
        mutationFn: (user: {
            email: string;
            password: string;
        }) => signInAccount(user)
    })
}

export const useSignOutAccount = () => {
    return useMutation({
        mutationFn:signOutAccount
    });
}

// POSTS

export const useSearchPosts = (searchTerm: string) => {
    return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm,
    });
};

// exposes getRecentPosts function to be called from the client side
export const useGetRecentPosts = () => {
    return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts
    });
};

export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
        queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        });
    },
    });
};

export const useGetPostById = (postId?: string) => {
    return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),

    // Set this to false or a function that returns false to disable automatic refetching when the query mounts or changes query keys. 
    enabled: !!postId,
    });
};

export const useGetUserPosts = (userId?: string) => {
    return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
    });
};

export const useUpdatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data) => {
        queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
        });
    },
    });
};

export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
    mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
        deletePost(postId, imageId),
    onSuccess: () => {
        queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        });
    },
    });
};


export const useLikePost = () => {
    const queryClient= useQueryClient();

    return useMutation({
        mutationFn: ({postId, likesArray} : {postId: string, likesArray : string[]}) =>
            likePost(postId, likesArray),
        onSuccess: (data) => {
            // need to check if any updates were made on the post, like count change, saved, edited, etc.
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useSavePost = () => {
    const queryClient= useQueryClient();

    return useMutation({
        mutationFn: ({postId, userId} : {postId: string, userId : string}) =>
            savePost(postId, userId),
        onSuccess: () => {
            // need to check if any updates were made on the post, like count change, saved, edited, etc.
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}


export const useDeleteSavedPost = () => {
    const queryClient= useQueryClient();

    return useMutation({
        mutationFn: (savedRecordId : string) =>
            deleteSavedPost(savedRecordId),
        onSuccess: () => {
            // need to check if any updates were made on the post, like count change, saved, edited, etc.
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useGetPosts=() => {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
        queryFn:getInfinitePosts,
        getNextPageParam: (lastPage) => {
            if(lastPage && lastPage.documents.length === 0) return null;

            const lastId = lastPage?.documents[lastPage?.documents.length - 1].$id;
            return lastId;
        }
    })
}


// ============================================================
// USER QUERIES
// ============================================================

export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn:getCurrentUser,
    })
};

export const useGetUserById = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
        queryFn: () => getUserById(userId),
        enabled: !!userId,
    });
};

export const useUpdateUser = () => {
    const queryClient= useQueryClient();

    return useMutation({
        mutationFn: (user: IUpdateUser) => updateUser(user),
        onSuccess:(data) => {
            queryClient.invalidateQueries({
                queryKey:[QUERY_KEYS.GET_CURRENT_USER],
            });
            queryClient.invalidateQueries({
                queryKey:[QUERY_KEYS.GET_USER_BY_ID, data?.$id],
            });
        },
    });
};