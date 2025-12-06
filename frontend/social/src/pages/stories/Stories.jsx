import './stories.scss';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { makeRequest } from '../../axios';
import { useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import { useState } from 'react';
import moment from 'moment';
import 'moment-timezone';

const LIMIT = 21;
let nextPage1 = 0,
    nextPage2 = 0;

const Stories = () => {
    const [menuOpen, setMenuOpen] = useState({});

    const { currentUser } = useContext(AuthContext);

    const {
        isLoading: isLoading1,
        error: error1,
        data: data1,
    } = useQuery(
        ['activeStories'],
        async () => {
            const response = await makeRequest.get(
                `stories/user?active=true&lastId=${nextPage1}&limit=${LIMIT}`,
            );

            if (!response.data) return [];

            const { lastId, stories } = response.data;

            // nextPage1 = lastId;

            return stories;
        },
        {
            enabled: !!currentUser,
        },
    );

    const {
        isLoading: isLoading2,
        error: error2,
        data: data2,
    } = useQuery(
        ['pastStories'],
        async () => {
            const response = await makeRequest.get(
                `stories/user?active=false&lastId=${nextPage2}&limit=${LIMIT}`,
            );

            if (!response.data) return [];

            const { lastId, stories } = response.data;

            // nextPage2 = lastId;

            return stories;
        },
        {
            enabled: !!currentUser,
        },
    );

    const queryClient = useQueryClient();

    const deleteMutation = useMutation(
        (storyId) => {
            return makeRequest.delete(`stories/${storyId}`);
        },
        {
            onSuccess: () => {
                // Invalidate and refetch
                queryClient.invalidateQueries(['activeStories']);
            },
        },
    );

    const handleDelete = (storyId) => {
        deleteMutation.mutate(storyId);
    };

    const toggleMenu = (id) => {
        setMenuOpen((prevState) => ({ ...prevState, [id]: !prevState[id] }));
    };

    return (
        <div>
            {isLoading1 ? (
                'loading'
            ) : (
                <>
                    <span
                        style={{
                            fontSize: '30px',
                            fontWeight: 'bold',
                            width: '100%',
                            display: 'block',
                        }}
                    >
                        Active stories
                    </span>
                    <br></br>
                    <div className="stories">
                        {error1
                            ? 'Something went wrong!'
                            : isLoading1
                            ? 'loading'
                            : data1.length
                            ? data1.map((story) => (
                                  <div key={story.id} className="stories">
                                      <div className="story" key={story.id}>
                                          {story.content.startsWith('http') ? (
                                              <img
                                                  src={story.content}
                                                  alt=""
                                                  className="text-story"
                                              />
                                          ) : (
                                              <div className="text-story">
                                                  {story.content}
                                              </div>
                                          )}
                                          <span>
                                              {moment(
                                                  story.createdAt,
                                              ).fromNow()}
                                          </span>
                                      </div>
                                      <MoreVertIcon
                                          style={{
                                              cursor: 'pointer',
                                              position: 'absolute',
                                          }}
                                          onClick={() => toggleMenu(story.id)}
                                      />
                                      {menuOpen[story.id] && (
                                          <button
                                              onClick={() =>
                                                  handleDelete(story.id)
                                              }
                                          >
                                              Delete
                                          </button>
                                      )}
                                  </div>
                              ))
                            : 'No active stories!'}
                    </div>
                </>
            )}
            <br></br>
            <br></br>
            {isLoading2 ? (
                'loading'
            ) : (
                <>
                    <span
                        style={{
                            fontSize: '30px',
                            fontWeight: 'bold',
                            width: '100%',
                            display: 'block',
                        }}
                    >
                        Past stories
                    </span>
                    <br></br>
                    <div className="stories">
                        {error2
                            ? 'Something went wrong!'
                            : isLoading2
                            ? 'loading'
                            : data2.length
                            ? data2.map((story) => (
                                  <div key={story.id} className="stories">
                                      <div className="story" key={story.id}>
                                          {story.content.startsWith('http') ? (
                                              <img
                                                  src={story.content}
                                                  alt=""
                                                  className="text-story"
                                              />
                                          ) : (
                                              <div className="text-story">
                                                  {story.content}
                                              </div>
                                          )}
                                          <span>
                                              {moment(
                                                  story.createdAt,
                                              ).fromNow()}
                                          </span>
                                      </div>
                                  </div>
                              ))
                            : 'No past stories!'}
                    </div>
                </>
            )}
        </div>
    );
};

export default Stories;
