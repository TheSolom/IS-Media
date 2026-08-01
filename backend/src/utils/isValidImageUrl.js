const checkImageUrl = async (url) => {
    const result = await fetch(url, { method: 'HEAD' });
    const buff = await result.blob();

    return buff.type.startsWith('image/');
};

export default checkImageUrl;
