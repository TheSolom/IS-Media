const storyMapper = (storyRow) => ({
    id: storyRow.id,
    content: storyRow.content,
    createdAt: storyRow.created_at,
    author: {
        id: storyRow.author_id,
        username: storyRow.username,
        profilePicture: storyRow.profile_picture,
    },
});

export default storyMapper;
