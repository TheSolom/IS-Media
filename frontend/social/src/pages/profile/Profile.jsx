import './profile.scss';
import FacebookTwoToneIcon from '@mui/icons-material/FacebookTwoTone';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import PlaceIcon from '@mui/icons-material/Place';
import LanguageIcon from '@mui/icons-material/Language';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Posts from '../../components/posts/Posts';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { makeRequest } from '../../axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import Update from '../../components/update/Update';
import { useState, useEffect } from 'react';

const Profile = () => {
    const navigate = useNavigate();

    const [openUpdate, setOpenUpdate] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [detailsMenuOpen, setDetailsMenuOpen] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);

    const { currentUser } = useContext(AuthContext);

    const userId = parseInt(useLocation().pathname.split('/')[2]);

    const { isLoading, error, data } = useQuery(
        ['users'],
        async () => {
            const response = await makeRequest.get(`users/${userId}/profile`);

            if (!response.data) return [];

            const { user } = response.data;

            return user;
        },
        {
            enabled: !!userId,
        },
    );

    const {
        isLoading: fIsLoading,
        error: fError,
        data: fData,
    } = useQuery(
        ['followers', userId],
        async () => {
            const response = await makeRequest.get(
                `users/followings/${userId}`,
            );

            const { isFollowing } = response.data;

            return isFollowing;
        },
        {
            enabled: !!userId && userId !== currentUser.id,
        },
    );

    const {
        data: blockStatus,
        isLoading: blockStatusLoading,
        error: blockStatusError,
    } = useQuery(
        ['blockStatus', userId],
        async () => {
            const response = await makeRequest.get(`users/blocks/${userId}`);
            const { blockStatus } = response.data;

            return blockStatus;
        },
        {
            enabled: !!userId && currentUser.id !== userId, // Only run the query if userId is available
        },
    );

    const queryClient = useQueryClient();

    const mutation = useMutation(
        async (following) => {
            if (following) {
                await makeRequest.delete(`users/followings/${userId}`);
            } else {
                await makeRequest.post('users/followings', {
                    followeeId: userId,
                });
            }
        },
        {
            onSuccess: () => {
                // Invalidate and refetch
                queryClient.invalidateQueries(['followers']);
            },
        },
    );

    const blockMutation = useMutation(
        (userId) => {
            return makeRequest.post(`users/blocks`, { blockedId: userId });
        },
        {
            onSuccess: () => {
                // Invalidate and refetch
                queryClient.invalidateQueries(['blocks']);
                setIsBlocked(true);
                alert('Blocked user successfully');
                navigate('/');
            },
        },
    );

    useEffect(() => {
        if (blockStatus !== undefined) {
            setIsBlocked(blockStatus);
        }
    }, [blockStatus]);

    const handleFollow = () => {
        mutation.mutate(fData);
    };

    const handleBlock = () => {
        blockMutation.mutate(userId);
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(
            `${window.location.origin}/profile/${userId || currentUser.id}`,
        );
    };

    if (isBlocked) {
        return <div>You have been blocked from viewing this profile.</div>;
    }

    return (
        <div className="profile">
            {isLoading ? (
                'loading'
            ) : (
                <>
                    <div className="images">
                        <img
                            src={data.cover_picture}
                            alt=""
                            className="cover"
                        />
                        <img
                            src={data.profile_picture}
                            alt=""
                            className="profilePic"
                        />
                    </div>
                    <div className="profileContainer">
                        <div className="uInfo">
                            <div className="left">
                                <EmailOutlinedIcon
                                    style={{
                                        cursor: 'pointer',
                                    }}
                                />
                            </div>
                            <div className="center">
                                <span className="info">
                                    {data.firstname +
                                        ' ' +
                                        data.lastname +
                                        ' @' +
                                        data.username}
                                </span>
                                <div className="info">
                                    <div className="item">
                                        <span>{data.about}</span>
                                    </div>
                                </div>
                                {userId === currentUser.id ? (
                                    <button onClick={() => setOpenUpdate(true)}>
                                        update
                                    </button>
                                ) : fIsLoading ? (
                                    'loading'
                                ) : (
                                    <button onClick={handleFollow}>
                                        {fData === true
                                            ? 'Following'
                                            : 'Follow'}
                                    </button>
                                )}
                            </div>
                            <div className="right">
                                <MoreVertIcon
                                    style={{
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setMenuOpen(!menuOpen)}
                                />
                                {menuOpen && userId !== currentUser.id && (
                                    <button
                                        style={{
                                            color: 'red',
                                            cursor: 'pointer',
                                        }}
                                        onClick={handleBlock}
                                    >
                                        block
                                    </button>
                                )}
                                {menuOpen && (
                                    <button
                                        style={{
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => handleCopy()}
                                    >
                                        Copy profile link
                                    </button>
                                )}
                                {menuOpen && (
                                    <button
                                        style={{
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => setDetailsMenuOpen(true)}
                                    >
                                        Show user details
                                    </button>
                                )}
                                {detailsMenuOpen && (
                                    <div className="overlay">
                                        <div>
                                            <span>
                                                {'Email: ' + data.email}
                                            </span>
                                            <span>
                                                {'Birthdate: ' +
                                                    data.birth_date}
                                            </span>
                                            <span>
                                                {'Gender: ' + data.gender}
                                            </span>
                                            <span>
                                                {'Lives in: ' +
                                                    (data.lives_in !== null
                                                        ? data.lives_in
                                                        : 'N/A')}
                                            </span>
                                            <span>
                                                {'Works at: ' +
                                                    (data.works_at !== null
                                                        ? data.works_at
                                                        : 'N/A')}
                                            </span>
                                            <span>
                                                {'Relationship: ' +
                                                    (data.relationship !== null
                                                        ? data.relationship
                                                        : 'N/A')}
                                            </span>
                                            <span>
                                                {'Online: ' +
                                                    (data.is_active === 1
                                                        ? 'Yes'
                                                        : 'No')}
                                            </span>
                                            <span>
                                                {'Joined: ' +
                                                    data.created_at.split(
                                                        'T',
                                                    )[0]}
                                            </span>
                                            <button
                                                style={{
                                                    cursor: 'pointer',
                                                    marginTop: '10px',
                                                    backgroundColor: 'red',
                                                    color: 'white',
                                                    padding: '5px 10px',
                                                    borderRadius: '5px',
                                                }}
                                                onClick={() =>
                                                    setDetailsMenuOpen(false)
                                                }
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Posts userId={userId} isProfile={true} />
                    </div>
                </>
            )}
            {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={data} />}
        </div>
    );
};

export default Profile;
