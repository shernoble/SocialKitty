import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { useQuery,useMutation,useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { CreateNewUser, createPost, getRecentPosts, signInAccount, signOutAccount } from "../appwrite/api";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";

// create a mutation function so that react query knows what we are doing

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
