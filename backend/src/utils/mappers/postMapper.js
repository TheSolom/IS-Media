const postMapper = (postRow) => ({
    id: postRow.id,
    title: postRow.title,
    content: postRow.content,
    createdAt: postRow.created_at,
    updatedAt: postRow.updated_at,
    author: {
        id: postRow.author_id,
        username: postRow.username,
        profilePicture: postRow.profile_picture,
    },
    parentPost: postRow.parent_id
        ? {
              id: postRow.parent_id,
              title: postRow.parent_title,
              content: postRow.parent_content,
              createdAt: postRow.parent_created_at,
              author: {
                  id: postRow.parent_author_id,
                  username: postRow.parent_username,
                  profilePicture: postRow.parent_profile_picture,
              },
          }
        : null,
});

export default postMapper;
