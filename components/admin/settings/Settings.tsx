import React from 'react';
import './Settings.css';
const Settings: React.FC = () => {
    return (
        <div>
            <div className="profile-cnt">
                <div className="profile-img">
                    <img src="/profile.png" alt="profile-img" />
                    <span className="profile-heart">
                        <img src="/camera_icon.png" alt="heart-icon" />
                    </span>
                </div>
                <div className="profile-name">
                    <h3>John Doe</h3>
                    <p>Participate</p>
                    <p>Leeds, United Kingdom</p>
                </div>
            </div>
            <div className="person-info">
                <div className="prsn-hd">
                    <h2>Personal Information</h2>
                    <button className="prsn-btn">
                        <img src="/edit_icon.png" alt="edit-icon" />
                        <span>Edit</span>
                    </button>
                </div>
                <div className="prfl-info-cnt">
                    <div className="prfl-name">
                        <h4>First Name</h4>
                        <h5>John</h5>
                    </div>
                    <div className="prfl-name">
                        <h4>Last Name</h4>
                        <h5>Doe</h5>
                    </div>
                    <div className="prfl-name">
                        <h4>Email Address</h4>
                        <h5>info@johndoe.com</h5>
                    </div>
                </div>
                <div className="prfl-info-cnt mrgntp">
                    <div className="prfl-name">
                        <h4>Phone Number</h4>
                        <h5>J(+62)821 525-9583</h5>
                    </div>
                    <div className="prfl-name">
                        <h4>LUser Role</h4>
                        <h5>Participate </h5>
                    </div>
                    <div className="prfl-name">
                        <h4>Date of birth</h4>
                        <h5>October 16, 2001</h5>
                    </div>
                </div>
            </div>
            <div className="acnt-info">
                <h2>Account Preferences</h2>
                <div className="acnt-preferences mrgntp">
                    <div className="acnt-info-cnt mrgn-top-23">
                        <div className="form-group">
                            <label htmlFor="language">Language</label>
                            <select id="language" className="form-select">
                                <option>English</option>
                                <option>Hindi</option>
                                <option>Spanish</option>
                                <option>French</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="timezone">Time Zone</label>
                            <select id="timezone" className="form-select">
                                <option>Default</option>
                                <option>GMT +5:30 (India)</option>
                                <option>GMT +1 (London)</option>
                                <option>GMT -5 (New York)</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group mrgn-top-23">
                        <label htmlFor="location">Location</label>
                        <select id="location" className="form-select">
                            <option>Choose a Location</option>
                            <option>India</option>
                            <option>United States</option>
                            <option>United Kingdom</option>
                            <option>Canada</option>
                        </select>
                    </div>
                    <div className="form-group mrgn-top-23">
                        <label htmlFor="notifications">Notification Preferences</label>
                        <div className="checkbox-group">
                            <label>
                                <input type="checkbox" defaultChecked /> Email
                            </label>
                            <label>
                                <input type="checkbox" defaultChecked /> SMS
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="theme-info  ">
                <h2>Theme & Display Settings </h2>
                <div className="settings-box mrgn-top-23">
                    {/* Theme mode */}
                    <div className="setting-group">
                        <label className="group-title">Theme mode</label>
                        <div className="radio-group">
                            <label>
                                <input type="radio" name="theme" /> Light mode
                            </label>
                            <label>
                                <input type="radio" name="theme" /> Dark mode
                            </label>
                            <label>
                                <input type="radio" name="theme" defaultChecked /> System Default
                                mode
                            </label>
                        </div>
                    </div>
                    <div className="setting-group">
                        <label className="group-title">Font Size</label>
                        <div className="slider-group">
                            <input
                                type="range"
                                min="12"
                                max="24"
                                defaultValue="16"
                                className="slider"
                            />
                            <span>Medium</span>
                        </div>
                    </div>
                </div>
                <div className="settings-box theme-accnt">
                    <div className="setting-group">
                        <label className="group-title">Layout Style</label>
                        <div className="layout-options">
                            <div className="layout-box active">
                                <div className="red-bar" />
                                <div className="gray-box" />
                            </div>
                            <div className="layout-box">
                                <div className="gray-box2" />
                                <div className="gray-box2" />
                            </div>
                        </div>
                    </div>
                    <div className="setting-group">
                        <label className="group-title">Accent Color</label>
                        <div className="color-options">
                            <div className="color-swatch active" />
                            <div className="color-swatch" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
