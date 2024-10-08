import GridPostList from "@/components/shared/GridPostList";
import { Loader } from "@/components/shared/Loader";
import useDebounce from "@/hooks/useDebounce";
import { useGetPosts, useSearchPosts } from "@/lib/react-query/queriesAndMutations";
import { useEffect, useState } from "react"
import { InView, useInView } from "react-intersection-observer";
import { Input } from "@/components/ui/input";


export type SearchResultProps = {
  isSearchFetching: boolean;
  searchedPosts: any;
};

const SearchResults = ({ isSearchFetching, searchedPosts }: SearchResultProps) => {
  if (isSearchFetching) {
    return <Loader/>;
  } else if (searchedPosts && searchedPosts.documents.length > 0) {
    return <GridPostList posts={searchedPosts.documents} />;
  } else {
    return (
      <p className="text-light-4 mt-10 text-center w-full">No results found</p>
    );
  }
};


const Explore = () => {

  const {ref, inView} = useInView();
  // posts: the fetched posts
  // fetchNextPage: function to load more pages
  // hasnextpage: boolean to check if more pages are there to load
  const {data: posts, fetchNextpage, hasNextPage} = useGetPosts();

  const [searchVal, setSearchVal]= useState('');

  // debouncing,if we directly pass the search term, then the api will be called for every single key stroke made
  // therefore use debouncing which will set a time limit after which it will make api call
  // 500 is the delay
  const debouncedSearch = useDebounce(searchVal, 500);
  
  // optimized using debounce
  const {data: searchedPosts, isFetching: isSearchFetching} = useSearchPosts(debouncedSearch);


  useEffect(() => {
    if(inView && !searchVal){
      fetchNextpage();
    }
  },[InView, searchVal]);

  if (!posts)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const shouldShowSearchRes= searchVal !== "";
  const shouldShowPosts = !shouldShowSearchRes &&
    posts.pages.every((item) => item?.documents.length === 0);

    return (
      <div className="explore-container">
        <div className="explore-inner_container">
          <h2 className="h3-bold md:h2-bold w-full">Search Posts</h2>
          <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
            <img
              src="/assets/icons/search.svg"
              width={24}
              height={24}
              alt="search"
            />
            <Input
              type="text"
              placeholder="Search"
              className="explore-search"
              value={searchVal}
              onChange={(e) => {
                const { value } = e.target;
                setSearchVal(value);
              }}
            />
          </div>
        </div>
  
        <div className="flex-between w-full max-w-5xl mt-16 mb-7">
          <h3 className="body-bold md:h3-bold">Popular Today</h3>
  
          <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
            <p className="small-medium md:base-medium text-light-2">All</p>
            <img
              src="/assets/icons/filter.svg"
              width={20}
              height={20}
              alt="filter"
            />
          </div>
        </div>
  
        <div className="flex flex-wrap gap-9 w-full max-w-5xl">
          {shouldShowSearchRes ? (
            <SearchResults
              isSearchFetching={isSearchFetching}
              searchedPosts={searchedPosts}
            />
          ) : shouldShowPosts ? (
            <p className="text-light-4 mt-10 text-center w-full">End of posts</p>
          ) : (
            posts.pages.map((item, index) => (
              <GridPostList key={`page-${index}`} posts={item.documents} />
            ))
          )}
        </div>
  
        {hasNextPage && !searchVal && (
          <div ref={ref} className="mt-10">
            <Loader />
          </div>
        )}
      </div>
    );
  };

export default Explore