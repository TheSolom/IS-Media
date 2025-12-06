import { useContext, useState, useRef } from 'react';
import './comments.scss';
import { AuthContext } from '../../context/authContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from '../../axios';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import moment from 'moment';

const LIMIT = 3;
let nextPage = 0;

const Comments = ({ postId }) => {
    const [desc, setDesc] = useState('');
    const [menuOpen, setMenuOpen] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);

    const { currentUser } = useContext(AuthContext);

    const fileInputRef = useRef();

    const { isLoading, error, data } = useQuery(['comments'], async () => {
        const response = await makeRequest.get(
            `posts/${postId}/comments?lastId=${nextPage}&limit=${LIMIT}`,
        );

        if (!response.data) return [];

        const { lastId, comments } = response.data;

        nextPage = lastId;

        return comments;
    });

    const queryClient = useQueryClient();

    const mutation = useMutation(
        async ({ selectedFile, desc, postId }) => {
            if (!selectedFile)
                return await makeRequest.post('posts/comments', {
                    content: desc,
                    postId,
                });

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

            return await makeRequest.post('posts/comments', {
                title: desc,
                content: parsedData.url,
                postId,
            });
        },
        {
            onSuccess: () => {
                // Invalidate and refetch
                queryClient.invalidateQueries(['comments']);
            },
        },
    );

    const deleteMutation = useMutation(
        (commentId) => {
            return makeRequest.delete(`posts/comments/${commentId}`);
        },
        {
            onSuccess: () => {
                // Invalidate and refetch
                queryClient.invalidateQueries(['comments']);
            },
        },
    );

    const handleDelete = (commentId) => {
        deleteMutation.mutate(commentId);
    };

    const handleCopy = async (comment) => {
        await navigator.clipboard.writeText(
            JSON.stringify({
                title: comment.title,
                content: comment.content,
            }),
        );
    };

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

    const handleClick = async (e) => {
        e.preventDefault();
        mutation.mutate({ selectedFile, desc, postId });
        setSelectedFile(null);
        setDesc('');
    };

    const toggleMenu = (id) => {
        setMenuOpen((prevState) => ({ ...prevState, [id]: !prevState[id] }));
    };

    return (
        <div className="comments">
            <div className="write">
                <img src={currentUser.profile_picture} alt="" />
                <input
                    type="text"
                    placeholder="Write a comment"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />
                <button onClick={handleClick}>Send</button>
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
                        marginRight: '-15px',
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
                    <img src={URL.createObjectURL(selectedFile)} alt="" />
                ) : (
                    <img
                        src={
                            'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Circle-icons-image.svg/768px-Circle-icons-image.svg.png'
                        }
                        alt=""
                    />
                )}
            </div>
            {error
                ? 'Something went wrong'
                : isLoading
                ? 'loading'
                : data.map((comment) => (
                      <div key={comment.id} className="comment">
                          <img src={comment.profile_picture} alt="" />
                          <div className="info">
                              <span>{comment.username}</span>
                              <p>{comment.title}</p>
                              {comment.content.startsWith('http') ? (
                                  <img
                                      className="comment-image"
                                      src={comment.content}
                                      alt=""
                                  />
                              ) : (
                                  <p>{comment.content}</p>
                              )}
                          </div>
                          <span className="date">
                              {moment(comment.created_at).fromNow()}
                          </span>
                          <MoreHorizIcon
                              style={{ cursor: 'pointer' }}
                              onClick={() => toggleMenu(comment.id)}
                          />
                          {menuOpen[comment.id] &&
                              comment.author_id === currentUser.id && (
                                  <button
                                      style={{ color: 'pink' }}
                                      onClick={() => handleDelete(comment.id)}
                                  >
                                      Delete comment
                                  </button>
                              )}
                          {menuOpen[comment.id] && (
                              <button onClick={() => handleCopy(comment)}>
                                  Copy comment
                              </button>
                          )}
                      </div>
                  ))}
        </div>
    );
};

export default Comments;
