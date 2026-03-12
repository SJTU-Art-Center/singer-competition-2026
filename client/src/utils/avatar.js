export const getFullAvatarUrl = (url) => {
    if (!url) return "https://i.pravatar.cc/150";
    if (url.startsWith('http')) return url;
    return `http://${window.location.hostname}:3001${url}`;
};
