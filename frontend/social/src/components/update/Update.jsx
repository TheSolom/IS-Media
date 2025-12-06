import { useState } from 'react';
import { makeRequest } from '../../axios';
import './update.scss';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Update = ({ setOpenUpdate, user }) => {
    const [cover, setCover] = useState(null);
    const [profile, setProfile] = useState(null);
    const [texts, setTexts] = useState({
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        password: user.password,
        birthDate: user.birth_date,
        gender: user.gender,
        about: user.about,
        profilePicture: user.profile_picture,
        coverPicture: user.cover_picture,
        livesIn: user.lives_in ?? undefined,
        worksAt: user.works_at ?? undefined,
        relationship: user.relationship ?? undefined,
    });

    const upload = async (file, type) => {
        const uploadSignResponse = await makeRequest.get(
            'auth/uploadSignature',
        );
        const { data: uploadData } = uploadSignResponse;

        const uploadURL =
            'https://api.cloudinary.com/v1_1/' +
            uploadData.cloudname +
            '/auto/upload';

        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('api_key', uploadData.apikey);
        uploadFormData.append('timestamp', uploadData.timestamp);
        uploadFormData.append('signature', uploadData.signature);
        uploadFormData.append('folder', 'SocialMedia');

        const uploadResponse = await fetch(uploadURL, {
            method: 'POST',
            body: uploadFormData,
        });
        const uploadResponseData = await uploadResponse.text();
        const uploadParsedData = JSON.parse(uploadResponseData);

        return uploadParsedData.url;
    };

    const handleChange = (e) => {
        setTexts((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const queryClient = useQueryClient();

    const mutation = useMutation(
        (user) => {
            return makeRequest.put('/users/profile', user);
        },
        {
            onSuccess: () => {
                // Invalidate and refetch
                queryClient.invalidateQueries(['user']);
            },
        },
    );

    const handleClick = async (e) => {
        e.preventDefault();

        let coverUrl;
        let profileUrl;
        coverUrl = cover ? await upload(cover, 'cover') : user.cover_picture;
        profileUrl = profile
            ? await upload(profile, 'profile')
            : user.profile_picture;

        mutation.mutate({
            ...texts,
            coverPicture: coverUrl,
            profilePicture: profileUrl,
        });
        setOpenUpdate(false);
        setCover(null);
        setProfile(null);
    };

    return (
        <div className="update">
            <div className="wrapper">
                <h1>Update Your Profile</h1>
                <form>
                    <div className="files">
                        <label htmlFor="cover">
                            <span>Cover Picture</span>
                            <div className="imgContainer">
                                <img
                                    src={
                                        cover
                                            ? URL.createObjectURL(cover)
                                            : user.cover_picture
                                    }
                                    alt=""
                                />
                                <CloudUploadIcon className="icon" />
                            </div>
                        </label>
                        <input
                            type="file"
                            id="cover"
                            style={{ display: 'none' }}
                            onChange={(e) => setCover(e.target.files[0])}
                        />
                        <label htmlFor="profile">
                            <span>Profile Picture</span>
                            <div className="imgContainer">
                                <img
                                    src={
                                        profile
                                            ? URL.createObjectURL(profile)
                                            : user.profile_picture
                                    }
                                    alt=""
                                />
                                <CloudUploadIcon className="icon" />
                            </div>
                        </label>
                        <input
                            type="file"
                            id="profile"
                            style={{ display: 'none' }}
                            onChange={(e) => setProfile(e.target.files[0])}
                        />
                    </div>
                    <label>Firstname</label>
                    <input
                        type="text"
                        value={texts.firstname}
                        name="firstname"
                        onChange={handleChange}
                    />
                    <label>Lastname</label>
                    <input
                        type="text"
                        value={texts.lastname}
                        name="lastname"
                        onChange={handleChange}
                    />
                    <label>Username</label>
                    <input
                        type="text"
                        value={texts.username}
                        name="username"
                        onChange={handleChange}
                    />
                    <label>Email</label>
                    <input
                        type="text"
                        value={texts.email}
                        name="email"
                        onChange={handleChange}
                    />
                    <label>Password</label>
                    <input
                        type="text"
                        value={texts.password}
                        name="password"
                        onChange={handleChange}
                    />
                    <label>Birth Date</label>
                    <input
                        type="date"
                        value={texts.birthDate}
                        name="birthDate"
                        onChange={handleChange}
                    />
                    <label>Gender</label>
                    <input
                        type="text"
                        name="gender"
                        value={texts.gender}
                        onChange={handleChange}
                    />
                    <label>About</label>
                    <input
                        type="text"
                        name="about"
                        value={texts.about}
                        onChange={handleChange}
                    />
                    <label>lives in</label>
                    <input
                        type="text"
                        name="livesIn"
                        value={texts.livesIn}
                        onChange={handleChange}
                    />
                    <label>Works at</label>
                    <input
                        type="text"
                        name="worksAt"
                        value={texts.worksAt}
                        onChange={handleChange}
                    />
                    <label>Relationship</label>
                    <input
                        type="text"
                        name="relationship"
                        value={texts.relationship}
                        onChange={handleChange}
                    />
                    <button onClick={handleClick}>Update</button>
                </form>
                <button className="close" onClick={() => setOpenUpdate(false)}>
                    close
                </button>
            </div>
        </div>
    );
};

export default Update;
