'use client';

import React from 'react';
import Image from 'next/image';
// import { useRouter } from 'next/navigation';
import styles from '../../../styles/instructor/InstructorPage.module.css';

export default function InstructorPage() {
    // const router = useRouter();
    return (
        <div className={`${styles.dashboardPage} instructor-dsbrd`}>
            <div className={styles.pageHeaderSpacer} />

            <div className={styles.cardsRow}>
                <article className={styles.card}>
                    <div>
                        <div className={styles.cardTitle}>Total Workouts</div>
                        <div className={styles.cardValue}>152</div>
                        <div className={styles.cardSub}>Total number of uploaded videos</div>
                    </div>
                    <Image src="/computer_image.png" alt="computer-img" width={57} height={52} />
                </article>

                <article className={styles.card}>
                    <div>
                        <div className={styles.cardTitle}>Total Movements</div>
                        <div className={styles.cardValue}>12</div>
                        <div className={styles.cardSub}>
                            Total number of movement categories & subcategories
                        </div>
                    </div>
                    <Image src="/grid_image.png" alt="grid_image" width={52} height={52} />
                </article>

                <article className={styles.card}>
                    <div>
                        <div className={styles.cardTitle}>Published Videos</div>
                        <div className={styles.cardValue}>124</div>
                        <div className={styles.cardSub}>
                            Number of active videos visible to instructors
                        </div>
                    </div>
                    <Image src="/hand_caught.png" alt="hand_caught-img" width={48} height={52} />
                </article>
            </div>

            <div className={styles.recentActivity}>
                <div className={styles.recentActivityHdg}>
                    <h4>Recent Activity</h4>

                    {/* <div className={styles.panelActions}>
                        <button className={styles.btnBlack}>Manage Access Levels</button>
                        <button className={styles.btnRed}>Add New Role</button>
                    </div> */}
                </div>

                <div className={styles.recentCards}>
                    <div className={styles.recentActivityCard}>
                        <div className={styles.crd}>
                            <h4>Kickboxing Combo — 5 Punch Drill</h4>
                            <div className={styles.cardContent}>
                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/small_grid_icon.png"
                                            alt="grid-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Class:
                                    </div>
                                    <p>Upper Body Power Session</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/small_tick_icon.png"
                                            alt="tick-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Status:
                                    </div>
                                    <p>Published</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>Category</div>
                                    <p>Kickboxing</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/date_icon.png"
                                            alt="date-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Date:
                                    </div>
                                    <p>Oct 21, 2025</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* duplicate 2nd & 3rd card (same structure) */}
                    <div className={styles.recentActivityCard}>
                        <div className={styles.cardInner}>
                            <h4>HIIT Full Body Blast</h4>
                            <div className={styles.cardContent}>
                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/small_grid_icon.png"
                                            alt="grid-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Class:
                                    </div>
                                    <p>HIIT</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/small_tick_icon.png"
                                            alt="tick-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Status:
                                    </div>
                                    <p>Draft</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>Category</div>
                                    <p>Pushup</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/date_icon.png"
                                            alt="date-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Date:
                                    </div>
                                    <p>Oct 17, 2025</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.recentActivityCard}>
                        <div className={styles.cardInner}>
                            <h4>Core Strength Circuit</h4>
                            <div className={styles.cardContent}>
                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/small_grid_icon.png"
                                            alt="grid-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Class:
                                    </div>
                                    <p>Full Body</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/small_tick_icon.png"
                                            alt="tick-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Status:
                                    </div>
                                    <p>Removed</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>Category</div>
                                    <p>Arm Circle</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/date_icon.png"
                                            alt="date-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Date:
                                    </div>
                                    <p>Oct 15, 2025</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
