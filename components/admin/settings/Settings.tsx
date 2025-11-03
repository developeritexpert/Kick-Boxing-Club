'use client';
import React, { useEffect, useState } from 'react';
import styles from './Settings.module.css';
import { translations } from './translations';

const Settings: React.FC = () => {
    const [lang, setLang] = useState('en');
    const [theme, setTheme] = useState('system');

    const t = translations[lang] || translations['en'];
    const [value, setValue] = useState(50);
    const [fontSize, setFontSize] = useState('Medium');
    const birthDate = new Date('2001-10-16');

    const formattedDOB = new Intl.DateTimeFormat(lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(birthDate);

  

    const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedTheme = e.target.value;
        console.log('selected theme', selectedTheme);
        setTheme(selectedTheme);
        document.documentElement.setAttribute('data-theme', selectedTheme);
    };
    
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);

        let label = 'Medium';
        let size = '16px';
        if (value <= 20) {
            label = 'extraSmall';
            size = '12px';
        } else if (value <= 40) {
            label = 'Small';
            size = '14px';
        } else if (value <= 60) {
            label = 'Medium';
            size = '16px';
        } else if (value <= 80) {
            label = 'Large';
            size = '18px';
        } else {
            label = 'extraLarge';
            size = '20px';
        }

        setFontSize(label);
        document.documentElement.style.setProperty('--dynamic-font-size', size);
        // Save everything to localStorage
        localStorage.setItem('font-size', size);
        localStorage.setItem('font-size-label', label);
        localStorage.setItem('font-size-value', String(value));
        localStorage.setItem('slider-value', String(value));
    };

    const handleAccentChange = (color) => {
        document.documentElement.style.setProperty('--accent-color', color);
        //    Save to localStorage
        localStorage.setItem('accent-color', color);
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        console.log('selected', selected);
        setLang(selected);

        localStorage.setItem('language', selected);
    };

    useEffect(() => {
          if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);
    }
        const storedLang = localStorage.getItem('language') || 'en';
        setLang(storedLang);
    }, []);

    useEffect(() => {
        // Set initial accent color when settings page loads
        //restore  font-size
        const storedSize = localStorage.getItem('font-size');
        const storedLabel = localStorage.getItem('font-size-label');
        const storedValue = localStorage.getItem('font-size-value');
        if (storedSize && storedLabel && storedValue) {
            document.documentElement.style.setProperty('--dynamic-font-size', storedSize);
            setFontSize(storedLabel);
            setValue(Number(storedValue));
        } else {
            document.documentElement.style.setProperty('--dynamic-font-size', '16px');
        }
        //Load stored accent color
        const storedAccent = localStorage.getItem('accent-color');
        const radios = document.querySelectorAll<HTMLInputElement>("input[name='accent']");

        if (storedAccent) {
            document.documentElement.style.setProperty('--accent-color', storedAccent);

            //  Match correct radio after reload
            radios.forEach((radio) => {
                radio.checked = radio.value === storedAccent;
            });
        } else {
            document.documentElement.style.setProperty('--accent-color', '#B40200');
        }
    }, []);

    useEffect(() => {
        const slider = document.getElementById('r1') as HTMLInputElement | null;
        if (!slider) return;
        // Load saved slider value
        const savedValue = localStorage.getItem('slider-value');
        if (savedValue) {
            slider.value = savedValue;
            setValue(Number(savedValue));
        }

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
                        <img src="/camera_icon.png" alt="camera-icon" />
                    </span>
                </div>
                <div className={styles.profileName}>
                    <h3>{t.userName}</h3>
                    <p>{t.participate}</p>
                    <p>{t.locationText}</p>
                </div>
            </div>

            <div className={styles.personInfo}>
                <div className={styles.prsnHd}>
                    <h2>{t.personalInfo}</h2>
                    <button className={styles.prsnBtn}>
                        <img src="/edit_icon.png" alt="edit-icon" />
                        <span>{t.edit}</span>
                    </button>
                </div>

                <div className={styles.prflInfoCnt}>
                    <div className={styles.prflName}>
                        <h4>{t.firstName}</h4>
                        <h5>{t.lastNameValue}</h5>
                    </div>
                    <div className={styles.prflName}>
                        <h4>{t.lastName}</h4>
                        <h5>{t.firstNameValue}</h5>
                    </div>
                    <div className={styles.prflName}>
                        <h4>{t.email}</h4>
                        <h5>{t.emailValue}</h5>
                    </div>
                </div>

                <div className={`${styles.prflInfoCnt} ${styles.mrgntp}`}>
                    <div className={styles.prflName}>
                        <h4>{t.phone}</h4>
                        <h5>(+62)821 525-9583</h5>
                    </div>
                    <div className={styles.prflName}>
                        <h4>{t.role}</h4>
                        <h5>{t.participate}</h5>
                    </div>
                    <div className={styles.prflName}>
                        <h4>{t.dob}</h4>
                        <h5>{formattedDOB}</h5>
                    </div>
                </div>
            </div>

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
            </div>

            <div className={styles.themeInfo}>
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
            </div>

            <div className={styles.workoutLocn}>
                <h2>{t.workoutInformation}</h2>
                <div className={styles.innerWrkoutLocn}>
                    <button className={styles.prsnBtn}> {t.addLocation}</button>
                    <button className={styles.prsnBtn}>{t.addClass}</button>
                </div>
            </div>

            <div className={styles.workoutsVdo}>
                <h2>{t.uploadHeading}</h2>
                <div className={styles.uploadBox}>
                    <input type="file" accept="video/*" id="videoUpload" />
                    <label htmlFor="videoUpload" className={styles.uploadLabel}>
                        <div className={styles.uploadIcon}>
                            <img src="/vdo_upload_icon.png" alt="upload-icon" />
                        </div>
                        <p className={styles.wrkoutVdoPara}>
                            <span className={styles.workVdioBtn}>{t.selectToUpload}</span>
                            <span> {t.orDragVideo}</span>
                        </p>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default Settings;
