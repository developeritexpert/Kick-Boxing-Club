'use client';
import React, { useEffect, useState } from 'react';
import './Settings.css';
const Settings: React.FC = () => {
    const [value, setValue] = useState(50);
    // ✅ useEffect runs after component mounts
    useEffect(() => {
        const slider = document.getElementById('r1') as HTMLInputElement | null;

        if (!slider) return;

        function setGradient(el: HTMLInputElement) {
            const min = Number(el.min) || 0;
            const max = Number(el.max) || 100;
            const val = Number(el.value);
            const pct = ((val - min) / (max - min)) * 100;

            el.style.background = `linear-gradient(to right, #B40200 ${pct}%, #0000001A ${pct}%)`;
        }

        setGradient(slider);
        slider.addEventListener('input', () => setGradient(slider));

        // ✅ Cleanup event listener on unmount
        return () => {
            slider.removeEventListener('input', () => setGradient(slider));
        };
    }, []);

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
                        <h4>User Role</h4>
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
                    <div className="checkbx-frm mrgn-top-23">
                        <label htmlFor="notifications">Notification Preferences</label>
                        <div className="checkbox-group">
                            <label className="custom-checkbox">
                                <input type="checkbox" defaultChecked />
                                <span className="checkmark"></span>
                                Email
                            </label>
                            <label className="custom-checkbox">
                                <input type="checkbox" defaultChecked />
                                <span className="checkmark"></span>
                                SMS
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
                        <div className="radio-group mt-8">
                            <label className="custom-radio">
                                <input type="radio" name="theme" />
                                <span className="radio-box">Light mode</span>
                            </label>
                            <label className="custom-radio">
                                <input type="radio" name="theme" />
                                <span className="radio-box">Dark mode</span>
                            </label>
                            <label className="custom-radio">
                                <input type="radio" name="theme" defaultChecked />
                                <span className="radio-box">System Default mode</span>
                            </label>
                        </div>
                    </div>
                    <div className="setting-group">
                        <label className="group-title">Font Size</label>
                        <div className="slider-group mt-8">
                            <input
                                id="r1"
                                type="range"
                                className="slider"
                                min="0"
                                max="100"
                                value={value}
                                onChange={(e) => setValue(Number(e.target.value))}
                            />
                            <span>Medium</span>
                        </div>
                    </div>
                </div>
                <div className="settings-box theme-accnt">
                    {/* <div className="setting-group">
                        <label className="group-title">Layout Style</label>
                        <div className="layout-options mt-8">
                            <div className="layout-box active">
                                <div className="red-bar" />
                                <div className="gray-box" />
                            </div>
                            <div className="layout-box">
                                <div className="gray-box2" />
                                <div className="gray-box2" />
                            </div>
                        </div>
                    </div> */}
                    <div className="setting-group">
                        <label className="group-title">Accent Color</label>
                        <div className="color-options mt-8">
                            <label className="color-swatch bg-red">
                                <input type="radio" name="accent" value="red" defaultChecked />
                            </label>{' '}
                            <label className="color-swatch bg-black">
                                <input type="radio" name="accent" value="black" />
                            </label>
                            <label className="color-swatch bg-blue">
                                <input type="radio" name="accent" value="blue" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="workout-locn">
                <h2>Workout Information</h2>
                    <div className="inner-wrkout-locn">
                <button className="prsn-btn">+ Location</button>
                <button className="prsn-btn">+ Class</button>
            </div>
            </div>
        
            <div className="workouts-vdo">
                <h2>Upload Photos and Videos for Workout</h2>
                <div className="upload-box">
                    <input type="file" accept="video/*" id="videoUpload" />
                    <label htmlFor="videoUpload" className="upload-label">
                        <div className="upload-icon">
                            <img src="/vdo_upload_icon.png" alt="upload-vdo-icon" />
                        </div>
                        <p className="wrkout-vdo-para">
                            <span className="work-vdio-btn">Select to Upload</span>

                            <span> or drag your video here</span>
                        </p>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default Settings;
