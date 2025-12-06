import './navbar.scss';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { DarkModeContext } from '../../context/darkModeContext';
import { AuthContext } from '../../context/authContext';
import { makeRequest } from '../../axios';

const LIMIT = 7;
const Navbar = () => {
    const { toggle, darkMode } = useContext(DarkModeContext);
    const { currentUser } = useContext(AuthContext);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (searchText) {
                const response = await makeRequest.get(
                    `users/${searchText}/search?limit=${LIMIT}`,
                );

                if (!response.data) {
                    setSearchResults([]);
                    return;
                }

                const { users } = response.data;

                setSearchResults(users);
            } else {
                setSearchResults([]);
            }
        };

        fetchSearchResults();
    }, [searchText]);

    return (
        <div className="navbar">
            <div className="left">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <span>IS Media</span>
                </Link>
                {darkMode ? (
                    <WbSunnyOutlinedIcon onClick={toggle} />
                ) : (
                    <DarkModeOutlinedIcon
                        style={{ cursor: 'pointer' }}
                        onClick={toggle}
                    />
                )}
                <GridViewOutlinedIcon />
                <div className="search">
                    <SearchOutlinedIcon />
                    <input
                        type="text"
                        placeholder="Search with username..."
                        value={searchText}
                        onChange={handleSearchChange}
                    />
                    {searchResults.length > 0 && (
                        <div className="search-results">
                            {searchResults.map((user) => (
                                <Link to={`/profile/${user.id}`} key={user.id}>
                                    <div className="search-item">
                                        <img
                                            src={user.profile_picture}
                                            alt=""
                                        />
                                        <span>{user.username}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="right">
                <button
                    className="logout-btn"
                    onClick={async () => {
                        try {
                            await makeRequest.post(`auth/logout`);
                            localStorage.removeItem('user');
                            window.location.reload();
                        } catch (error) {}
                    }}
                >
                    Logout
                </button>
                <EmailOutlinedIcon />
                <NotificationsOutlinedIcon />
                <div className="user">
                    <img src={currentUser.profile_picture} alt="" />
                    <Link
                        to={`/profile/${currentUser.id}`}
                        style={{
                            textDecoration: 'none',
                            color: 'inherit',
                        }}
                    >
                        <span className="name">{currentUser.username}</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
