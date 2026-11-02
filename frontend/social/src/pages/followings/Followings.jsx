import './followings.scss';
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
const Followings = () => {
    const [menuOpen, setMenuOpen] = useState({});

    const { currentUser } = useContext(AuthContext);

    const { isLoading, error, data } = useQuery(
        ['followings'],
        async () => {
            const response = await makeRequest.get(
                `users/followings?lastId=${nextPage}&limit=${LIMIT}`,
            );

            if (!response.data) return [];

            const { followings } = response.data;

            // nextPage = lastId;

            return followings;
        },
        {
            enabled: !!currentUser,
        },
    );

    const queryClient = useQueryClient();

    const mutation = useMutation(
        async (userId) => {
            await makeRequest.delete(`users/followings/${userId}`);
        },
        {
            onSuccess: () => {
                // Invalidate and refetch
                queryClient.invalidateQueries(['followings']);
            },
        },
    );

    const blockMutation = useMutation(
        (userId) => {
            return makeRequest.post(`users/block`, { blockedId: userId });
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
                            Followings
                        </span>
                        <br></br>
                        <br></br>
                        {error
                            ? 'Something went wrong!'
                            : isLoading
                            ? 'loading'
                            : data.length
                            ? data.map((followee) => (
                                  <div
                                      style={{ height: '10px' }}
                                      key={followee.id}
                                      className="uInfo"
                                  >
                                      <div className="left">
                                          {data.length ? (
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
                                                  src={followee.profile_picture}
                                                  alt=""
                                                  className="images"
                                                  style={{
                                                      width: '100px',
                                                      height: '100px',
                                                  }}
                                              />
                                              <span>{followee.username}</span>
                                              <span
                                                  style={{
                                                      fontSize: '20px',
                                                      fontFamily: 'monospace',
                                                  }}
                                              >
                                                  {'You are a follower from: '}
                                                  {moment(
                                                      followee.created_at,
                                                  ).fromNow()}
                                              </span>
                                              <MoreVertIcon
                                                  style={{ cursor: 'pointer' }}
                                                  onClick={() =>
                                                      toggleMenu(followee.id)
                                                  }
                                              />
                                              {menuOpen[followee.id] && (
                                                  <button
                                                      onClick={() =>
                                                          handleCopy(
                                                              followee.user_id,
                                                          )
                                                      }
                                                  >
                                                      Copy profile link
                                                  </button>
                                              )}
                                              {menuOpen[followee.id] && (
                                                  <button
                                                      onClick={() =>
                                                          handleBlock(
                                                              followee.user_id,
                                                          )
                                                      }
                                                  >
                                                      block
                                                  </button>
                                              )}
                                              {menuOpen[followee.id] && (
                                                  <button
                                                      onClick={() =>
                                                          handleFollow(
                                                              followee.user_id,
                                                          )
                                                      }
                                                  >
                                                      Unfollow
                                                  </button>
                                              )}
                                          </div>
                                      </div>
                                      <div className="right"></div>
                                  </div>
                              ))
                            : 'No followings yet!'}
                    </div>
                </>
            )}
        </div>
    );
};

export default Followings;
