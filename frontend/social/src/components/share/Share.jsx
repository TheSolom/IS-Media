import './share.scss';
import Image from '../../assets/img.png';
import Map from '../../assets/map.png';
import Friend from '../../assets/friend.png';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/authContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from '../../axios';
const Share = () => {
    const [file, setFile] = useState(null);
    const [desc, setDesc] = useState('');

    const upload = async () => {
        const signResponse = await makeRequest.get('auth/uploadSignature');
        const { data } = signResponse;

        const URL =
            'https://api.cloudinary.com/v1_1/' +
            data.cloudname +
            '/auto/upload';

        const formData = new FormData();
        formData.append('file', file);
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

        return parsedData.url;
    };

    const { currentUser } = useContext(AuthContext);

    const queryClient = useQueryClient();

    const mutation = useMutation(
        async (newPost) => {
            if (!newPost.img) {
                return await makeRequest.post(`posts`, {
                    content: newPost.desc,
                });
            }

            return await makeRequest.post('/posts', {
                title: newPost.desc,
                content: newPost.img,
            });
        },
        {
            onSuccess: () => {
                // Invalidate and refetch
                queryClient.invalidateQueries(['posts']);
            },
        },
    );

    const handleClick = async (e) => {
        e.preventDefault();
        let imgUrl = '';
        if (file) imgUrl = await upload();
        mutation.mutate({ desc, img: imgUrl });
        setDesc('');
        setFile(null);
    };

    return (
        <div className="share">
            <div className="container">
                <div className="top">
                    <div className="left">
                        <img src={currentUser.profile_picture} alt="" />
                        <input
                            type="text"
                            placeholder={`What's on your mind ${currentUser.username}?`}
                            onChange={(e) => setDesc(e.target.value)}
                            value={desc}
                        />
                    </div>
                    <div className="right">
                        {file && (
                            <img
                                className="file"
                                alt=""
                                src={URL.createObjectURL(file)}
                            />
                        )}
                    </div>
                </div>
                <hr />
                <div className="bottom">
                    <div className="left">
                        <input
                            type="file"
                            id="file"
                            style={{ display: 'none' }}
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <label htmlFor="file">
                            <div className="item">
                                <img src={Image} alt="" />
                                <span>Add Image</span>
                            </div>
                        </label>
                        <div className="item">
                            <img src={Map} alt="" />
                            <span>Add Place (Not working)</span>
                        </div>
                        <div className="item">
                            <img src={Friend} alt="" />
                            <span>Tag Friends (Not working)</span>
                        </div>
                    </div>
                    <div className="right">
                        <button onClick={handleClick}>Share</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Share;
