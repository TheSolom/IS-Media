import Post from '../post/Post';
import './posts.scss';
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from '../../axios';
import { useContext } from 'react';
import { AuthContext } from '../../context/authContext';

const LIMIT = 7;
let nextPage = 0;

const Posts = ({ userId, isProfile }) => {
    const { currentUser } = useContext(AuthContext);

    const { isLoading, error, data } = useQuery(['posts'], async () => {
        let response;
        if (userId === currentUser.id || isProfile) {
            response = await makeRequest.get(
                `posts/user?userId=${userId}&lastId=${nextPage}&limit=${LIMIT}`,
            );
        } else {
            response = await makeRequest.get(
                `posts/feed?lastId=${nextPage}&limit=${LIMIT}`,
            );
        }

        if (!response.data) return [];

        const { lastId, posts } = response.data;

        // nextPage = lastId;

        return posts;
    });

    return (
        <div className="posts">
            {error
                ? 'Something went wrong!'
                : isLoading
                ? 'loading'
                : data.map((post) => <Post post={post} key={post.id} />)}
        </div>
    );
};

export default Posts;
