import './blocks.scss';
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

const Blocks = () => {
    const [menuOpen, setMenuOpen] = useState({});

    const { currentUser } = useContext(AuthContext);

    const { isLoading, error, data } = useQuery(
        ['blocks'],
        async () => {
            const response = await makeRequest.get(
                `users/blocks?lastId=${nextPage}&limit=${LIMIT}`,
            );

            if (!response.data) return [];

            const { lastId, blocks } = response.data;

            // nextPage = lastId;

            return blocks;
        },
        {
            enabled: !!currentUser,
        },
    );

    const queryClient = useQueryClient();

    const blockMutation = useMutation(
        (userId) => {
            return makeRequest.delete(`users/blocks/${userId}`);
        },
        {
            onSuccess: () => {
                // Invalidate and refetch
                queryClient.invalidateQueries(['blocks']);
            },
        },
    );

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
                            Blocked users
                        </span>
                        <br></br>
                        <br></br>
                        {error
                            ? 'Something went wrong!'
                            : isLoading
                            ? 'loading'
                            : data.length
                            ? data.map((blockedUser) => (
                                  <div
                                      style={{ height: '10px' }}
                                      key={blockedUser.id}
                                      className="uInfo"
                                  >
                                      <div className="left"></div>
                                      <div className="center">
                                          <div className="info">
                                              <img
                                                  src={
                                                      blockedUser.profile_picture
                                                  }
                                                  alt=""
                                                  className="images"
                                                  style={{
                                                      width: '100px',
                                                      height: '100px',
                                                  }}
                                              />
                                              <span>
                                                  {blockedUser.username}
                                              </span>
                                              <span
                                                  style={{
                                                      fontSize: '20px',
                                                      fontFamily: 'monospace',
                                                  }}
                                              >
                                                  {'He is blocked from: '}
                                                  {moment(
                                                      blockedUser.created_at,
                                                  ).fromNow()}
                                              </span>
                                              <MoreVertIcon
                                                  style={{ cursor: 'pointer' }}
                                                  onClick={() =>
                                                      toggleMenu(blockedUser.id)
                                                  }
                                              />
                                              {menuOpen[blockedUser.id] && (
                                                  <button
                                                      onClick={() =>
                                                          handleCopy(
                                                              blockedUser.blocked_id,
                                                          )
                                                      }
                                                  >
                                                      Copy profile link
                                                  </button>
                                              )}
                                              {menuOpen[blockedUser.id] && (
                                                  <button
                                                      onClick={() =>
                                                          handleBlock(
                                                              blockedUser.blocked_id,
                                                          )
                                                      }
                                                  >
                                                      unBlock
                                                  </button>
                                              )}
                                          </div>
                                      </div>
                                      <div className="right"></div>
                                  </div>
                              ))
                            : 'No blocked users yet!'}
                    </div>
                </>
            )}
        </div>
    );
};

export default Blocks;
