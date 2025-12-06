import './post.scss';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import TextsmsOutlinedIcon from '@mui/icons-material/TextsmsOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Link } from 'react-router-dom';
import Comments from '../comments/Comments';
import { useState, useRef } from 'react';
import moment from 'moment';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { makeRequest } from '../../axios';
import { useContext } from 'react';
import { AuthContext } from '../../context/authContext';

const LIMIT = 7;
let nextPage = 0;

const Post = ({ post }) => {
    const [commentOpen, setCommentOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isEditing, setEditing] = useState(false);
    const [shareTitle, setShareTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [desc, setDesc] = useState(
        post.content.startsWith('http') ? post.title : post.content,
    );

    const { currentUser } = useContext(AuthContext);

    const {
        data: blockStatus,
        isLoading: blockStatusLoading,
        error: blockStatusError,
    } = useQuery(
        ['blockStatus', post.parentPost?.author.id],
        async () => {
            const response = await makeRequest.get(
                `users/blocks/${post.parentPost?.author.id}`,
            );
            const { blockStatus } = response.data;

            return blockStatus;
        },
        {
            enabled: !!post.parentPost?.author.id,
        },
    );

    const { isLoading, error, data } = useQuery(
        ['likes', post.id],
        async () => {
            const res = await makeRequest.get(
                `posts/${post.id}/likes?lastId=${nextPage}&limit=${LIMIT}`,
            );

            if (!res.data) return [];

            const { lastId, likes } = res.data;

            // nextPage = lastId;

            return likes;
        },
    );

    const queryClient = useQueryClient();

    const editMutation = useMutation(
        async ({ selectedFile, desc }) => {
            console.log(selectedFile, desc);
            if (!selectedFile) {
                return await makeRequest.put(`posts/${post.id}`, {
                    content: desc,
                });
            }

            const signResponse = await makeRequest.get('auth/uploadSignature');
            const { data } = signResponse;

            const URL =
                'https://api.cloudinary.com/v1_1/' +
                data.cloudname +
                '/auto/upload';

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('api_key', data.apikey);
            formData.append('timestamp', data.timestamp);
            formData.append('signature', data.signature);
            formData.append('folder', 'SocialMedia');

            const uploadResponse = await fetch(URL, {
                method: 'POST',
                body: formData,
            });
            const responseData = await uploadResponse.text();
            const parsedData = JSON.parse(responseData);

            return await makeRequest.put(`posts/${post.id}`, {
                title: desc,
                content: parsedData.url,
            });
        },
        {
            onSuccess: () => {
                // Invalidate and refetch
                queryClient.invalidateQueries(['comments']);
            },
        },
    );

    const fileInputRef = useRef();

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        fileInputRef.current.click();

        await new Promise((resolve) => {
            const handleFileChange = (event) => {
                resolve(event.target.files[0]);
            };
            fileInputRef.current.onchange = handleFileChange;
        });
    };

    const likeMutation = useMutation(
        (liked) => {
            if (liked) return makeRequest.delete(`posts/${post.id}/likes`);
            return makeRequest.post('posts/likes', { postId: post.id });
        },
        {
            onSuccess: () => {
                // Invalidate and refetch
                queryClient.invalidateQueries(['likes']);
            },
        },
    );

    const deleteMutation = useMutation(
        () => {
            return makeRequest.delete(`posts/${post.id}`);
        },
        {
            onSuccess: () => {
                // Invalidate and refetch
                queryClient.invalidateQueries(['posts']);
            },
        },
    );

    const shareMutation = useMutation(
        ({ shareTitle }) => {
            return makeRequest.post(`posts`, {
                content: shareTitle,
                parentId: post.id,
            });
        },
        {
            onSuccess: () => {
                // Invalidate and refetch
                queryClient.invalidateQueries(['posts']);
            },
        },
    );

    const handleCopyPostContent = async (post) => {
        await navigator.clipboard.writeText(
            JSON.stringify({
                title: post.title,
                content: post.content,
            }),
        );
    };

    const handleLike = () => {
        likeMutation.mutate(
            data.some((like) => like.user_id === currentUser.id),
        );
    };

    const handleDelete = () => {
        deleteMutation.mutate();
    };

    const handleEdit = (e) => {
        e.preventDefault();
        editMutation.mutate({
            selectedFile: selectedFile ?? post.content,
            desc,
        });
        setSelectedFile(null);
        setDesc('');
        setEditing(false);
    };

    const handleShare = () => {
        if (shareTitle.trim() === '') {
            alert('Please enter a title for the shared post.');
            return;
        }

        shareMutation.mutate({
            shareTitle,
        });
        setShareOpen(!shareOpen);
        setShareTitle(''); // Reset the share title input
    };

    return (
        <div className="post">
            <div className="container">
                <div className="user">
                    <div className="userInfo">
                        <img src={post.author.profilePicture} alt="" />
                        <div className="details">
                            <Link
                                to={`/profile/${post.author.id}`}
                                style={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                }}
                            >
                                <span className="name">
                                    {post.author.username}
                                </span>
                            </Link>
                            <span className="date">
                                {moment(post.createdAt).fromNow()}
                            </span>
                        </div>
                    </div>
                    <div>
                        <MoreHorizIcon
                            style={{ cursor: 'pointer' }}
                            onClick={() => setMenuOpen(!menuOpen)}
                        />
                        {menuOpen && post.author.id === currentUser.id && (
                            <button
                                style={{ color: 'pink' }}
                                onClick={handleDelete}
                            >
                                Delete post
                            </button>
                        )}
                        {menuOpen && post.author.id === currentUser.id && (
                            <button onClick={() => setEditing(true)}>
                                Edit post
                            </button>
                        )}
                        {isEditing && (
                            <div className="overlay">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Edit post content"
                                        value={desc}
                                        onChange={(e) =>
                                            setDesc(e.target.value)
                                        }
                                    />
                                    <input
                                        type="file"
                                        style={{ display: 'none' }}
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                    <button
                                        style={{
                                            fontFamily: 'sans-serif',
                                            fontSize: '14px',
                                            padding: '5px 10px',
                                            marginLeft: '200px',
                                            backgroundColor: 'white',
                                            color: 'black',
                                            border: '1px solid black',
                                            borderRadius: '5px',
                                        }}
                                        onClick={handleUpload}
                                    >
                                        Add image
                                    </button>
                                    {selectedFile ? (
                                        <img
                                            className="img-edit"
                                            src={URL.createObjectURL(
                                                selectedFile,
                                            )}
                                            alt=""
                                        />
                                    ) : post.content.startsWith('http') ? (
                                        <img
                                            className="img-edit"
                                            src={post.content}
                                            alt=""
                                        />
                                    ) : (
                                        <img
                                            className="img-edit"
                                            src={
                                                'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Circle-icons-image.svg/768px-Circle-icons-image.svg.png'
                                            }
                                            alt=""
                                        />
                                    )}
                                    <button onClick={handleEdit}>Save</button>
                                    <button onClick={() => setEditing(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        {menuOpen && <button>Copy post link</button>}
                        {menuOpen && (
                            <button onClick={() => handleCopyPostContent(post)}>
                                Copy post content
                            </button>
                        )}
                    </div>
                </div>
                <div className="content">
                    <p>{post.title}</p>
                    {post.content.startsWith('http') ? (
                        <img src={post.content} alt="" />
                    ) : (
                        <p>{post.content}</p>
                    )}
                </div>
                {post.parentPost?.id ? (
                    blockStatus ? (
                        <>
                            <hr></hr>
                            <br></br>
                            <p>This post is blocked</p>
                            <br></br>
                            <hr></hr>
                            <br></br>
                        </>
                    ) : (
                        <>
                            <hr></hr>
                            <br></br>
                            <div className="container">
                                <div className="user">
                                    <div className="userInfo">
                                        <img
                                            src={
                                                post.parentPost.author
                                                    .profilePicture
                                            }
                                            alt=""
                                        />
                                        <div className="details">
                                            <Link
                                                to={`/profile/${post.parentPost.author.id}`}
                                                style={{
                                                    textDecoration: 'none',
                                                    color: 'inherit',
                                                }}
                                            >
                                                <span className="name">
                                                    {
                                                        post.parentPost.author
                                                            .username
                                                    }
                                                </span>
                                            </Link>
                                            <span className="date">
                                                {moment(
                                                    post.parentPost.createdAt,
                                                ).fromNow()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="content">
                                    <p>{post.parentPost.title}</p>
                                    {post.parentPost.content.startsWith(
                                        'http',
                                    ) ? (
                                        <img
                                            src={post.parentPost.content}
                                            alt=""
                                        />
                                    ) : (
                                        <p>{post.parentPost.content}</p>
                                    )}
                                </div>
                            </div>
                            <hr></hr>
                            <br></br>
                        </>
                    )
                ) : null}
                <div className="info">
                    <div className="item">
                        {isLoading ? (
                            'loading'
                        ) : data.some(
                              (like) => like.user_id === currentUser.id,
                          ) ? (
                            <FavoriteOutlinedIcon
                                style={{ color: 'red' }}
                                onClick={handleLike}
                            />
                        ) : (
                            <FavoriteBorderOutlinedIcon onClick={handleLike} />
                        )}
                        {data?.length} Likes
                    </div>
                    <div
                        className="item"
                        onClick={() => setCommentOpen(!commentOpen)}
                    >
                        <TextsmsOutlinedIcon />
                        See Comments
                    </div>
                    <div
                        className="item"
                        onClick={() => setShareOpen(!shareOpen)}
                    >
                        <ShareOutlinedIcon />
                        Share
                    </div>
                    {shareOpen && (
                        <div className="overlay">
                            <div>
                                <input
                                    style={{
                                        padding: '10px',
                                        margin: '20px',
                                    }}
                                    type="text"
                                    placeholder="Add title to shared post"
                                    value={shareTitle}
                                    onChange={(e) =>
                                        setShareTitle(e.target.value)
                                    }
                                />
                                <input
                                    style={{
                                        border: 'none',
                                    }}
                                    readOnly
                                    value={post.title}
                                />
                                {selectedFile ? (
                                    <img
                                        className="img-edit"
                                        src={URL.createObjectURL(selectedFile)}
                                        alt=""
                                    />
                                ) : post.content.startsWith('http') ? (
                                    <img
                                        className="img-edit"
                                        src={post.content}
                                        alt=""
                                    />
                                ) : null}
                                <button onClick={handleShare}>Share</button>
                                <button onClick={() => setShareOpen(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {commentOpen && <Comments postId={post.id} />}
            </div>
        </div>
    );
};

export default Post;
