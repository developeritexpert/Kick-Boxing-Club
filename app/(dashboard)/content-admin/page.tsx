'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function ContentAdminPage() {
    const router = useRouter();
    return (
        <div className="dashboard-page">
            <div className="page-header-spacer" />
            <div className="cards-row">
                <article className="card">
                    <div>
                        <div className="card-title">Total Workouts</div>
                        <div className="card-value">152</div>
                        <div className="card-sub">Total number of uploaded videos</div>
                    </div>

                    <img src="/computer_image.png" alt="computer-img" />
                </article>

                <article className="card">
                    <div>
                        <div className="card-title">Total Movements</div>
                        <div className="card-value">12</div>
                        <div className="card-sub">
                            Total number of movement categories & subcategories
                        </div>
                    </div>
                    <img src="/grid_image.png" alt="grid_image" />
                </article>

                <article className="card">
                    <div>
                        <div className="card-title">Published Videos</div>
                        <div className="card-value">124</div>
                        <div className="card-sub">
                            Number of active videos visible to instructors
                        </div>
                    </div>
                    <img src="/hand_caught.png" alt="hand_caught-img" />
                </article>
            </div>
            <div className="recent-activity">
                <div className="recent-activity-hdg">
                    <h4>Recent Activity</h4>

                    <div className="panel-actions">
                        <button className="btn btn-black">Manage Access Levels</button>
                        <button
                            className="btn btn-red"
                            // onClick={() => router.push('//content-admin/users/add')}
                        >
                            Add New Role
                        </button>
                    </div>
                </div>
                <div className="recnt-cards">
                <div className="recent-activity-card">
                    <div className="crd">
                        <h4>Kickboxing Combo — 5 Punch Drill</h4>
                        <div className="inside-crd">
                        <div className="cls">
                            <div className="grid-cls">
                                <img src="/small_grid_icon.png" alt="small-grid-icon" />
                                Class:
                            </div>
                            <p>Upper Body Power Session</p>
                        </div>
                        <div className="status">
                            <div className="tick-cls">
                                <img src="/small_tick_icon.png" alt="small-tick-icon" />
                                Status:
                            </div>
                            <p>Published</p>
                        </div>
                            <div className="category">
                        <div className="category-cls">Category</div>
                        <p>Kickboxing</p>
                    </div>
                    <div className="status">
                        <div className="tick-cls">
                             <img src="/date_icon.png" alt="small-tick-icon" />
                            Date::
                        </div>
                        <p>Oct 21, 2025</p>
                    </div>
                    </div>
                    </div>
                
                </div>
                   <div className="recent-activity-card">
                    <div className="crd">
                        <h4>HIIT Full Body Blast</h4>
                        <div className="inside-crd">
                        <div className="cls">
                            <div className="grid-cls">
                                <img src="/small_grid_icon.png" alt="small-grid-icon" />
                                Class:
                            </div>
                            <p>HIIT</p>
                        </div>
                        <div className="status">
                            <div className="tick-cls">
                                <img src="/small_tick_icon.png" alt="small-tick-icon" />
                                Status:
                            </div>
                            <p>Draft</p>
                        </div>
                            <div className="category">
                        <div className="category-cls">Category</div>
                        <p>Pushup</p>
                    </div>
                    <div className="status">
                        <div className="tick-cls">
                               <img src="/date_icon.png" alt="small-tick-icon" />
                            Date::
                        </div>
                        <p>Oct 17, 2025</p>
                    </div>
                    </div>
                    </div>
                
                </div>
                      <div className="recent-activity-card">
                    <div className="crd">
                        <h4>Core Strength Circuit</h4>
                        <div className="inside-crd">
                        <div className="cls">
                            <div className="grid-cls">
                                <img src="/small_grid_icon.png" alt="small-grid-icon" />
                                Class:
                            </div>
                            <p>Full Body</p>
                        </div>
                        <div className="status">
                            <div className="tick-cls">
                                <img src="/small_tick_icon.png" alt="small-tick-icon" />
                                Status:
                            </div>
                            <p>Removed</p>
                        </div>
                            <div className="category">
                        <div className="category-cls">Category</div>
                        <p>Arm Circle</p>
                    </div>
                    <div className="status">
                        <div className="tick-cls">
                            <img src="/date_icon.png" alt="small-tick-icon" />
                            Date::
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
