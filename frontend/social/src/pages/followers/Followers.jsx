import './followers.scss';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { makeRequest } from '../../axios';
import { useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import { useState } from 'react';
import moment from 'moment';

const LIMIT = 7;
let nextPage = 0;
const Followers = () => {
    const [menuOpen, setMenuOpen] = useState({});

    const { currentUser } = useContext(AuthContext);

    const { isLoading, error, data } = useQuery(
        ['followers'],
        async () => {
            const response = await makeRequest.get(
                `users/followers?lastId=${nextPage}&limit=${LIMIT}`,
            );

            if (!response.data) return { followers: [], followersState: {} };

            const { lastId, followers } = response.data;

            // nextPage = lastId;

            const followersState = {};

            // Loop over each follower to fetch their following status
            for (const follower of followers) {
                const response = await makeRequest.get(
                    `users/followings/${follower.follower_id}`,
                );

                const { isFollowing } = response.data;
                followersState[follower.follower_id] = isFollowing;
            }

            return { followers, followersState };
        },
        {
            enabled: !!currentUser,
        },
    );

    const queryClient = useQueryClient();

    const mutation = useMutation(
        async (userId) => {
            if (data.followersState[userId]) {
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
                alert('Blocked user successfully');
            },
        },
    );

    const handleFollow = (userId) => {
        mutation.mutate(userId);
    };

    const handleBlock = (userId) => {
        blockMutation.mutate(userId);
    };

    const handleCopy = async (userId) => {
        await navigator.clipboard.writeText(
            `${window.location.origin}/profile/${userId || currentUser.id}`,
        );
    };

    const toggleMenu = (id) => {
        setMenuOpen((prevState) => ({ ...prevState, [id]: !prevState[id] }));
    };

    return (
        <div className="profile">
            {isLoading ? (
                'loading'
            ) : (
                <>
                    <div className="profileContainer">
                        <span style={{ fontSize: '30px', fontWeight: 'bold' }}>
                            Followers
                        </span>
                        <br></br>
                        <br></br>
                        {error
                            ? 'Something went wrong!'
                            : isLoading
                            ? 'loading'
                            : data.followers.length
                            ? data.followers.map((follower) => (
                                  <div
                                      style={{ height: '10px' }}
                                      key={follower.id}
                                      className="uInfo"
                                  >
                                      <div className="left">
                                          {data.followers.length ? (
                                              <EmailOutlinedIcon
                                                  style={{
                                                      cursor: 'pointer',
                                                  }}
                                              />
                                          ) : null}
                                      </div>
                                      <div className="center">
                                          <div className="info">
                                              <img
                                                  src={follower.profile_picture}
                                                  alt=""
                                                  className="images"
                                                  style={{
                                                      width: '100px',
                                                      height: '100px',
                                                  }}
                                              />
                                              <span>{follower.username}</span>
                                              <span
                                                  style={{
                                                      fontSize: '20px',
                                                      fontFamily: 'monospace',
                                                  }}
                                              >
                                                  {'He is a follower from: '}
                                                  {moment(
                                                      follower.created_at,
                                                  ).fromNow()}
                                              </span>
                                              <MoreVertIcon
                                                  style={{ cursor: 'pointer' }}
                                                  onClick={() =>
                                                      toggleMenu(follower.id)
                                                  }
                                              />
                                              {menuOpen[follower.id] && (
                                                  <button
                                                      onClick={() =>
                                                          handleCopy(
                                                              follower.follower_id,
                                                          )
                                                      }
                                                  >
                                                      Copy profile link
                                                  </button>
                                              )}
                                              {menuOpen[follower.id] && (
                                                  <button
                                                      onClick={() =>
                                                          handleBlock(
                                                              follower.follower_id,
                                                          )
                                                      }
                                                  >
                                                      block
                                                  </button>
                                              )}
                                              {menuOpen[follower.id] && (
                                                  <button
                                                      onClick={() =>
                                                          handleFollow(
                                                              follower.follower_id,
                                                          )
                                                      }
                                                  >
                                                      {data.followersState[
                                                          follower.follower_id
                                                      ]
                                                          ? 'Following'
                                                          : 'Follow'}
                                                  </button>
                                              )}
                                          </div>
                                      </div>
                                      <div className="right"></div>
                                  </div>
                              ))
                            : 'No followers yet!'}
                    </div>
                </>
            )}
        </div>
    );
};

export default Followers;
