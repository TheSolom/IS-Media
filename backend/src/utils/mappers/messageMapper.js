const messageMapper = (messageRow) => ({
    id: messageRow.id,
    content: messageRow.content,
    image: messageRow.image,
    createdAt: messageRow.created_at,
    updatedAt: messageRow.updated_at,
    deletedAt: messageRow.deleted_at,
    author: {
        id: messageRow.sender_id,
        username: messageRow.username,
        profilePicture: messageRow.profile_picture
    },
    parentMessage: messageRow.parent_id ? {
        id: messageRow.parent_id,
        content: messageRow.parent_content,
        image: messageRow.parent_image,
        createdAt: messageRow.parent_created_at,
        author: {
            id: messageRow.parent_sender_id,
            username: messageRow.parent_username,
            profilePicture: messageRow.parent_profile_picture
        }
    } : null
});

export default messageMapper;