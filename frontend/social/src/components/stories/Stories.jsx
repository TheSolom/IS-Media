import { useContext, useState, useRef } from 'react';
import './stories.scss';
import { AuthContext } from '../../context/authContext';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { makeRequest } from '../../axios';

const LIMIT = 7;
let nextPage = 0;

const Stories = () => {
    const { currentUser } = useContext(AuthContext);
    const [isUploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [desc, setDesc] = useState('');

    const fileInputRef = useRef();

    const { isLoading, error, data } = useQuery(['stories'], async () => {
        const response = await makeRequest.get(
            `stories/feed?lastId=${nextPage}&limit=${LIMIT}`,
        );

        if (!response.data) return [];

        const { lastId, stories } = response.data;

        // nextPage = lastId;

        return stories;
    });

    const queryClient = useQueryClient();

    const mutation = useMutation(
        async ({ selectedFile, desc }) => {
            if (!selectedFile) {
                return await makeRequest.post('stories', {
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

            await makeRequest.post('stories', {
                content: parsedData.url,
            });
        },
        {
            onSuccess: () => {
                // Invalidate and refetch
                queryClient.invalidateQueries(['stories']);
                alert('Story created successfully!');
            },
        },
    );

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUploadFile = async () => {
        fileInputRef.current.click();

        await new Promise((resolve) => {
            const handleFileChange = (event) => {
                resolve(event.target.files[0]);
            };
            fileInputRef.current.onchange = handleFileChange;
        });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        mutation.mutate({ selectedFile, desc });
        setSelectedFile(null);
        setDesc('');
        setUploading(false);
    };

    return (
        <div className="stories">
            <div className="story">
                <img src={currentUser.profile_picture} alt="" />
                <span>{'Create story'}</span>

                <button onClick={() => setUploading(true)}>+</button>
                {isUploading && (
                    <div className="overlay">
                        <div className="">
                            <input
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    border: '1px solid black',
                                }}
                                type="text"
                                placeholder="Write text story content"
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
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
                                    fontSize: '13px',
                                    padding: '5px 10px',
                                    margin: '50px 10px 0px 0px',
                                    backgroundColor: 'white',
                                    color: 'black',
                                    border: '1px solid black',
                                    borderRadius: '5px',
                                }}
                                onClick={handleUploadFile}
                            >
                                Or media story
                            </button>
                            {selectedFile ? (
                                <img
                                    className="img-edit"
                                    src={URL.createObjectURL(selectedFile)}
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
                            <button onClick={handleUpload}>Upload</button>
                            <button onClick={() => setUploading(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {error ? (
                'Something went wrong'
            ) : isLoading ? (
                'loading'
            ) : data.length > 0 ? (
                data.map((story) => (
                    <div className="story" key={story.id}>
                        {story.content.startsWith('http') ? (
                            <img
                                src={story.content}
                                alt=""
                                className="text-story"
                            />
                        ) : (
                            <div className="text-story">{story.content}</div>
                        )}
                        <span>{story.author.username}</span>
                    </div>
                ))
            ) : (
                <div>No stories yet.</div>
            )}
        </div>
    );
};

export default Stories;
