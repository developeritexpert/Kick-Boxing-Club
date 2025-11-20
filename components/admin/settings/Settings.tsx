'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Settings.module.css';
// import { translations } from './translations';
import Image from 'next/image';
const Settings: React.FC = () => {
    const router = useRouter();
    // const [lang, setLang] = useState('en');
    // const [theme, setTheme] = useState('system');

    // const t = translations[lang] || translations['en'];
    // const [value, setValue] = useState(50);
    // const [fontSize, setFontSize] = useState('Medium');
    // const birthDate = new Date('2001-10-16');

    // const formattedDOB = new Intl.DateTimeFormat(lang, {
    //     year: 'numeric',
    //     month: 'long',
    //     day: 'numeric',
    // }).format(birthDate);

    // const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const selectedTheme = e.target.value;
    //     console.log('selected theme', selectedTheme);
    //     setTheme(selectedTheme);
    //     document.documentElement.setAttribute('data-theme', selectedTheme);
    // };

    // const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const value = Number(e.target.value);

    //     let label = 'Medium';
    //     let size = '16px';
    //     if (value <= 20) {
    //         label = 'extraSmall';
    //         size = '12px';
    //     } else if (value <= 40) {
    //         label = 'Small';
    //         size = '14px';
    //     } else if (value <= 60) {
    //         label = 'Medium';
    //         size = '16px';
    //     } else if (value <= 80) {
    //         label = 'Large';
    //         size = '18px';
    //     } else {
    //         label = 'extraLarge';
    //         size = '20px';
    //     }

    //     setFontSize(label);
    //     document.documentElement.style.setProperty('--dynamic-font-size', size);
    //     // Save everything to localStorage
    //     localStorage.setItem('font-size', size);
    //     localStorage.setItem('font-size-label', label);
    //     localStorage.setItem('font-size-value', String(value));
    //     localStorage.setItem('slider-value', String(value));
    // };

    // const handleAccentChange = (color) => {
    //     document.documentElement.style.setProperty('--accent-color', color);
    //     //    Save to localStorage
    //     localStorage.setItem('accent-color', color);
    // };

    // const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //     const selected = e.target.value;
    //     console.log('selected', selected);
    //     setLang(selected);

    //     localStorage.setItem('language', selected);
    // };

    // useEffect(() => {
    //     if (theme === 'system') {
    //         const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    //             ? 'dark'
    //             : 'light';
    //         document.documentElement.setAttribute('data-theme', systemTheme);
    //     }
    //     const storedLang = localStorage.getItem('language') || 'en';
    //     setLang(storedLang);
    // }, []);

    // useEffect(() => {
    //     // Set initial accent color when settings page loads
    //     //restore  font-size
    //     const storedSize = localStorage.getItem('font-size');
    //     const storedLabel = localStorage.getItem('font-size-label');
    //     const storedValue = localStorage.getItem('font-size-value');
    //     if (storedSize && storedLabel && storedValue) {
    //         document.documentElement.style.setProperty('--dynamic-font-size', storedSize);
    //         setFontSize(storedLabel);
    //         setValue(Number(storedValue));
    //     } else {
    //         document.documentElement.style.setProperty('--dynamic-font-size', '16px');
    //     }
    //     //Load stored accent color
    //     const storedAccent = localStorage.getItem('accent-color');
    //     const radios = document.querySelectorAll<HTMLInputElement>("input[name='accent']");

    //     if (storedAccent) {
    //         document.documentElement.style.setProperty('--accent-color', storedAccent);

    //         //  Match correct radio after reload
    //         radios.forEach((radio) => {
    //             radio.checked = radio.value === storedAccent;
    //         });
    //     } else {
    //         document.documentElement.style.setProperty('--accent-color', '#B40200');
    //     }
    // }, []);

    // useEffect(() => {
    //     const slider = document.getElementById('r1') as HTMLInputElement | null;
    //     if (!slider) return;
    //     // Load saved slider value
    //     const savedValue = localStorage.getItem('slider-value');
    //     if (savedValue) {
    //         slider.value = savedValue;
    //         setValue(Number(savedValue));
    //     }

    //     function updateSliderUI(el: HTMLInputElement) {
    //         const min = Number(el.min) || 0;
    //         const max = Number(el.max) || 100;
    //         const val = Number(el.value);
    //         const pct = ((val - min) / (max - min)) * 100;

    //         el.style.setProperty('--slider-progress', `${pct}%`);
    //     }

    //     updateSliderUI(slider);

    //     const handler = () => updateSliderUI(slider);

    //     slider.addEventListener('input', handler);

    //     return () => {
    //         slider.removeEventListener('input', handler);
    //     };
    // }, []);

    const handleAddLocation = () => {
        router.push('/admin/location/addLocation');
        router.refresh();
    };

    const handleAddClass = () => {
        router.push('/admin/class/addClass');
        router.refresh();
    };

    return (
        <div className="admin-setting-cntner">
            <div className={styles.profileCnt}>
                <div className={styles.profileImg}>
                    <Image src="/profile.png" alt="profile-img" width={120} height={120} />
                    <span className={styles.profileHeart}>
                        <Image src="/camera_icon.png" alt="camera-icon" width={18} height={14} />
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
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M11.0581 0.70752C11.269 0.70756 11.4722 0.780529 11.6343 0.912598L11.7017 0.973145L14.1479 3.43115C14.318 3.60205 14.4135 3.83365 14.4136 4.07471C14.4136 4.31572 14.3178 4.54731 14.1479 4.71826L14.147 4.71924L5.48877 13.3687L5.479 13.3794L5.46533 13.3823L2.01123 14.1733L2.00537 14.1753V14.1743C1.94381 14.181 1.88142 14.1806 1.81982 14.1743C1.68464 14.1735 1.55087 14.1434 1.4292 14.0845C1.30769 14.0256 1.20111 13.9399 1.1167 13.8345C1.03218 13.7288 0.971728 13.6049 0.940918 13.4731C0.910225 13.3416 0.909142 13.2047 0.937988 13.0728V13.0718L1.72998 9.65576L1.73291 9.64111L1.74365 9.63135L10.4146 0.973145C10.5855 0.803027 10.8169 0.70752 11.0581 0.70752ZM2.58154 10.1128L1.86572 13.1968L5.01123 12.5376L11.4526 6.12451L9.02393 3.6958L2.58154 10.1128ZM9.65381 3.021L12.0825 5.44971L13.4204 4.07959L11.0317 1.6499L9.65381 3.021Z"
                                fill="white"
                                stroke="white"
                                strokeWidth="0.1"
                            ></path>
                        </svg>
                        <span>Edit</span>
                    </button>
                </div>

                <div className={styles.prflInfoCnt}>
                    <div className={styles.prflName}>
                        <h4>First Name</h4>
                        <h5>John</h5>
                    </div>
                    <div className={styles.prflName}>
                        <h4>Last Name</h4>
                        <h5>Doe</h5>
                    </div>
                    <div className={styles.prflName}>
                        <h4>Email Address</h4>
                        <h5>email@gmail.com</h5>
                    </div>
                </div>

                <div className={`${styles.prflInfoCnt} ${styles.mrgntp}`}>
                    <div className={styles.prflName}>
                        <h4>Phone Numbe</h4>
                        <h5>(+62)821 525-9583</h5>
                    </div>
                    <div className={styles.prflName}>
                        <h4>User Role</h4>
                        <h5>Participate</h5>
                    </div>
                    <div className={styles.prflName}>
                        <h4>Date of birth</h4>
                        <h5>October 16, 2001</h5>
                    </div>
                </div>
            </div>
            {/* 
            <div className={styles.acntInfo}>
                <h2>{t.accountPreferences}</h2>

                <div className={`${styles.acntPreferences} ${styles.mrgntp}`}>
                    <div className={`${styles.acntInfoCnt} ${styles.mrgnTop23}`}>
                        <div className={`${styles.formGroup}`}>
                            <label htmlFor="language">{t.language}</label>
                            <select
                                id="language"
                                value={lang}
                                className={`${styles.formSelect} ${styles.mrgnRight30}`}
                                onChange={handleLanguageChange}
                            >
                                <option value="en">{t.english}</option>
                                <option value="hi">{t.hindi}</option>
                                <option value="es">{t.spanish}</option>
                                <option value="fr">{t.french}</option>
                            </select>
                        </div>

                        <div className={`${styles.formGroup}`}>
                            <label htmlFor="timezone">{t.timezone}</label>
                            <select
                                id="timezone"
                                className={`${styles.formSelect} ${styles.mrgnRight30}`}
                            >
                                <option>{t.default}</option>
                                <option>{t.india}</option>
                                <option>{t.london}</option>
                                <option>{t.newYork}</option>
                            </select>
                        </div>
                    </div>

                    <div className={`${styles.formGroup} ${styles.mrgnTop23}`}>
                        <label htmlFor="location">{t.locationText}</label>
                        <select
                            id="location"
                            className={`${styles.formSelect} ${styles.mrgnRight30}`}
                        >
                            <option>{t.chooseLocation}</option>
                            <option>{t.india}</option>
                            <option>{t.unitedStates}</option>
                            <option>{t.unitedKingdom}</option>
                            <option>{t.canada}</option>
                        </select>
                    </div>

                    <div className={`${styles.checkbxFrm} ${styles.mrgnTop23}`}>
                        <label htmlFor="notifications">{t.notificationPref}</label>
                        <div className={styles.checkboxGroup}>
                            <label className={styles.customCheckbox}>
                                <input type="checkbox" defaultChecked />
                                <span className={styles.checkmark}></span>
                                {t.email}
                            </label>
                            <label className={styles.customCheckbox}>
                                <input type="checkbox" defaultChecked />
                                <span className={styles.checkmark}></span>
                                {t.sms}
                            </label>
                        </div>
                    </div>
                </div>
            </div> */}

            {/* <div className={styles.themeInfo}>
                <h2>{t.themeAndDisplay}</h2>

                <div className={`${styles.settingsBox} ${styles.mrgnTop23}`}>
                    <div className={styles.settingGroup}>
                        <label className={`${styles.groupTitle} ${styles.mrgnBtm8}`}>
                            {t.themeMode}
                        </label>
                        <div className={styles.radioGroup}>
                            <label className={styles.customRadio}>
                                <input
                                    type="radio"
                                    name="theme"
                                    value="light"
                                    checked={theme === 'light'}
                                    onChange={handleThemeChange}
                                />
                                <span className={styles.radioBox}>{t.lightMode}</span>
                            </label>
                            <label className={styles.customRadio}>
                                <input
                                    type="radio"
                                    name="theme"
                                    value="dark"
                                    checked={theme === 'dark'}
                                    onChange={handleThemeChange}
                                />
                                <span className={styles.radioBox}>{t.darkMode}</span>
                            </label>
                            <label className={styles.customRadio}>
                                <input
                                    type="radio"
                                    name="theme"
                                    value="system"
                                    checked={theme === 'system'}
                                    onChange={handleThemeChange}
                                />
                                <span className={styles.radioBox}>{t.systemMode}</span>
                            </label>
                        </div>
                    </div>

                    <div className={styles.settingGroup}>
                        <label className={`${styles.groupTitle} ${styles.mrgnBtm8}`}>
                            {t.fontSize}
                        </label>
                        <div className={styles.sliderGroup}>
                            <input
                                id="r1"
                                type="range"
                                className={styles.slider}
                                min="0"
                                max="100"
                                value={value}
                                onChange={(e) => {
                                    handleSliderChange(e);
                                    setValue(Number(e.target.value));
                                }}
                            />
                            <span>{t[fontSize.toLowerCase()]}</span>
                        </div>
                    </div>
                </div>

                <div className={`${styles.settingsBox} ${styles.themeAccnt}`}>
                    <div className={styles.settingGroup}>
                        <label className={`${styles.groupTitle} ${styles.mrgnBtm8}`}>
                            {t.accentColor}
                        </label>
                        <div className={styles.colorOptions}>
                            <label className={`${styles.colorSwatch} ${styles.bgRed}`}>
                                <input
                                    type="radio"
                                    name="accent"
                                    value="#B40200"
                                    defaultChecked
                                    onChange={(e) => handleAccentChange(e.target.value)}
                                />
                            </label>
                            <label className={`${styles.colorSwatch} ${styles.bgBlack}`}>
                                <input
                                    type="radio"
                                    name="accent"
                                    value="black"
                                    onChange={(e) => handleAccentChange(e.target.value)}
                                />
                            </label>
                            <label className={`${styles.colorSwatch} ${styles.bgBlue}`}>
                                <input
                                    type="radio"
                                    name="accent"
                                    value="blue"
                                    onChange={(e) => handleAccentChange(e.target.value)}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div> */}

            <div className={styles.workoutLocn}>
                <h2>Workout Information</h2>
                <div className={styles.innerWrkoutLocn}>
                    <button className={styles.prsnBtn} onClick={handleAddLocation}>
                        + Location
                    </button>
                    <button className={styles.prsnBtn} onClick={handleAddClass}>
                        + Class
                    </button>
                </div>
            </div>

            <div className={styles.workoutsVdo}>
                <h2>Upload Photos and Videos for Workout</h2>
                <div className={styles.uploadBox}>
                    <input type="file" accept="video/*" id="videoUpload" />
                    <label htmlFor="videoUpload" className={styles.uploadLabel}>
                        <div className={styles.uploadIcon}>
                            <Image
                                src="/vdo_upload_icon.png"
                                alt="upload-icon"
                                width={25}
                                height={26}
                            />
                        </div>
                        <p className={styles.wrkoutVdoPara}>
                            <span className={styles.workVdioBtn}>Select to Upload</span>
                            <span>or drag your video here</span>
                        </p>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default Settings;
