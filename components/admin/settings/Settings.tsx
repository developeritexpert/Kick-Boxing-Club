'use client';
import React, { useEffect, useState } from 'react';
import styles from "./Settings.module.css";

const Settings: React.FC = () => {
    const [value, setValue] = useState(50);
     const [fontSize, setFontSize] = useState("Medium");
     
       const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);

    let label = "Medium";
    let size = "16px";

    if (value <= 33) {
      label = "Small";
      size = "14px";
    } else if (value <= 66) {
      label = "Medium";
      size = "16px";
    } else {
      label = "Large";
      size = "18px";
    }

    setFontSize(label);
     document.documentElement.style.setProperty('--dynamic-font-size', size);
    // document.body.style.fontSize = size; //  Apply font size globally
  };
  const handleAccentChange = (color) => {
  document.documentElement.style.setProperty('--accent-color', color);
};
useEffect(() => {
  // Set initial accent color when settings page loads
  document.documentElement.style.setProperty('--accent-color', '#B40200');
}, []);
useEffect(() => {
    
    const slider = document.getElementById('r1') as HTMLInputElement | null;
    if (!slider) return;

    function updateSliderUI(el: HTMLInputElement) {
        const min = Number(el.min) || 0;
        const max = Number(el.max) || 100;
        const val = Number(el.value);
        const pct = ((val - min) / (max - min)) * 100;

        el.style.setProperty('--slider-progress', `${pct}%`);
    }

    updateSliderUI(slider);

    const handler = () => updateSliderUI(slider);

    slider.addEventListener('input', handler);

    return () => {
        slider.removeEventListener('input', handler);
    };
}, []);

    return (
        <div>
            <div className={styles.profileCnt}>
                <div className={styles.profileImg}>
                    <img src="/profile.png" alt="profile-img" />
                    <span className={styles.profileHeart}>
                        <img src="/camera_icon.png" alt="heart-icon" />
                    </span>
                </div>
                <div className={styles.profileName}>
                    <h3>John Doe</h3>
                    <p>Participate</p>
                    <p>Leeds, United Kingdom</p>
                </div>
            </div>

            <div className={styles.personInfo}>
                <div className={styles.prsnHd}>
                    <h2>Personal Information</h2>
                    <button className={styles.prsnBtn}>
                        <img src="/edit_icon.png" alt="edit-icon" />
                        <span>Edit</span>
                    </button>
                </div>

                <div className={styles.prflInfoCnt}>
                    <div className={styles.prflName}>
                        <h4>First Name</h4><h5>John</h5>
                    </div>
                    <div className={styles.prflName}>
                        <h4>Last Name</h4><h5>Doe</h5>
                    </div>
                    <div className={styles.prflName}>
                        <h4>Email Address</h4><h5>info@johndoe.com</h5>
                    </div>
                </div>

                <div className={`${styles.prflInfoCnt} ${styles.mrgntp}`}>
                    <div className={styles.prflName}>
                        <h4>Phone Number</h4><h5>(+62)821 525-9583</h5>
                    </div>
                    <div className={styles.prflName}>
                        <h4>User Role</h4><h5>Participate</h5>
                    </div>
                    <div className={styles.prflName}>
                        <h4>Date of birth</h4><h5>October 16, 2001</h5>
                    </div>
                </div>
            </div>

            <div className={styles.acntInfo}>
                <h2>Account Preferences</h2>

                <div className={`${styles.acntPreferences} ${styles.mrgntp}`}>
                    <div className={`${styles.acntInfoCnt} ${styles.mrgnTop23}`}>
                        <div className={`${styles.formGroup}`}>
                            <label htmlFor="language">Language</label>
                            <select id="language"  className={`${styles.formSelect}   ${styles.mrgnRight30}`}>
                                <option>English</option>
                                <option>Hindi</option>
                                <option>Spanish</option>
                                <option>French</option>
                            </select>
                        </div>

                        <div className={`${styles.formGroup}`}>
                            <label htmlFor="timezone">Time Zone</label>
                            <select id="timezone" className={`${styles.formSelect}   ${styles.mrgnRight30}`}>
                                <option>Default</option>
                                <option>GMT +5:30 (India)</option>
                                <option>GMT +1 (London)</option>
                                <option>GMT -5 (New York)</option>
                            </select>
                        </div>
                    </div>

                    <div className={`${styles.formGroup} ${styles.mrgnTop23} `}>
                        <label htmlFor="location">Location</label>
                        <select id="location" className={`${styles.formSelect}   ${styles.mrgnRight30}`}>
                            <option>Choose a Location</option>
                            <option>India</option>
                            <option>United States</option>
                            <option>United Kingdom</option>
                            <option>Canada</option>
                        </select>
                    </div>

                    <div className={`${styles.checkbxFrm} ${styles.mrgnTop23}`}>
                        <label htmlFor="notifications">Notification Preferences</label>
                        <div className={styles.checkboxGroup}>
                            <label className={styles.customCheckbox}>
                                <input type="checkbox" defaultChecked />
                                <span className={styles.checkmark}></span>
                                Email
                            </label>
                            <label className={styles.customCheckbox}>
                                <input type="checkbox" defaultChecked />
                                <span className={styles.checkmark}></span>
                                SMS
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.themeInfo}>
                <h2>Theme & Display Settings</h2>
                <div className={`${styles.settingsBox} ${styles.mrgnTop23}`}>
                    <div className={styles.settingGroup}>
                        <label className={`${styles.groupTitle} ${styles.mrgnBtm8}`}>Theme mode</label>
                        <div className={styles.radioGroup}>
                            <label className={styles.customRadio}>
                                <input type="radio" name="theme" />
                                <span className={styles.radioBox}>Light mode</span>
                            </label>
                            <label className={styles.customRadio}>
                                <input type="radio" name="theme" />
                                <span className={styles.radioBox}>Dark mode</span>
                            </label>
                            <label className={styles.customRadio}>
                                <input type="radio" name="theme" defaultChecked />
                                <span className={styles.radioBox}>System Default mode</span>
                            </label>
                        </div>
                    </div>

                    <div className={styles.settingGroup}>
                        <label className={`${styles.groupTitle} ${styles.mrgnBtm8}`}>Font Size</label>
                        <div className={styles.sliderGroup}>
                            <input
                                id="r1"
                                type="range"
                                className={styles.slider}
                                min="0"
                                max="100"
                                value={value}
                                onChange={(e) => {handleSliderChange(e)
                                      setValue(Number(e.target.value))
                                }
                                  }
                            />
                            <span>{fontSize}</span>
                        </div>
                    </div>
                </div>

                <div className={`${styles.settingsBox} ${styles.themeAccnt} `}>
                    <div className={styles.settingGroup}>
                        <label className={`${styles.groupTitle} ${styles.mrgnBtm8}`}>Accent Color</label>
                        <div className={styles.colorOptions}>
                            <label className={`${styles.colorSwatch} ${styles.bgRed}`}>
                                <input type="radio" name="accent" value="#B40200" defaultChecked 
                                  onChange={(e) => handleAccentChange(e.target.value)}
                                />
                            </label>
                            <label className={`${styles.colorSwatch} ${styles.bgBlack}`}>
                                <input type="radio" name="accent" value="black" 
                                  onChange={(e) => handleAccentChange(e.target.value)}/>
                            </label>
                            <label className={`${styles.colorSwatch} ${styles.bgBlue}`}>
                                <input type="radio" name="accent" value="blue"
                                  onChange={(e) => handleAccentChange(e.target.value)}
                                 />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.workoutLocn}>
                <h2>Workout Information</h2>
                <div className={styles.innerWrkoutLocn}>
                    <button className={styles.prsnBtn}>+ Location</button>
                    <button className={styles.prsnBtn}>+ Class</button>
                </div>
            </div>

            <div className={styles.workoutsVdo}>
                <h2>Upload Photos and Videos for Workout</h2>
                <div className={styles.uploadBox}>
                    <input type="file" accept="video/*" id="videoUpload" />
                    <label htmlFor="videoUpload" className={styles.uploadLabel}>
                        <div className={styles.uploadIcon}>
                            <img src="/vdo_upload_icon.png" alt="upload-vdo-icon" />
                        </div>
                        <p className={styles.wrkoutVdoPara}>
                            <span className={styles.workVdioBtn}>Select to Upload</span>
                            <span> or drag your video here</span>
                        </p>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default Settings;
