import React from 'react';
import './RecentWorkouts.css';

interface Workout {
    id: number;
    name: string;
    category: string;
    date: string;
}

const RecentWorkouts: React.FC = () => {
    const RecentWorkoutsData: Workout[] = [
        { id: 1, name: 'Power HIIT Circuit', category: 'HIIT', date: 'Oct 21, 2025' },
        { id: 2, name: 'Jab-Cross Burnout', category: 'Boxing', date: 'Oct 21, 2025' },
        { id: 3, name: 'Cardio Sculpt', category: 'Cardio', date: 'Oct 21, 2025' },
        { id: 4, name: 'Core Crusher', category: 'Abs', date: 'Oct 21, 2025' },
        { id: 5, name: 'Full Body Burn', category: 'Strength', date: 'Oct 21, 2025' },
        { id: 6, name: 'Morning Yoga Flow', category: 'Yoga', date: 'Oct 21, 2025' },
        { id: 7, name: 'Lower Body Blast', category: 'Legs', date: 'Oct 21, 2025' },
        { id: 8, name: 'Dance Fit Groove', category: 'Zumba', date: 'Oct 21, 2025' },
        { id: 9, name: 'Spin & Sweat', category: 'Cycling', date: 'Oct 21, 2025' },
        { id: 10, name: 'Upper Body Power', category: 'Strength', date: 'Oct 21, 2025' },
        { id: 11, name: 'Mindful Stretch', category: 'Yoga', date: 'Oct 21, 2025' },
        { id: 12, name: 'Fat Burn Express', category: 'Cardio', date: 'Oct 21, 2025' },
        { id: 13, name: 'Combat Conditioning', category: 'Boxing', date: 'Oct 21, 2025' },
        { id: 14, name: 'Tabata Torch', category: 'HIIT', date: 'Oct 21, 2025' },
        { id: 15, name: 'Pilates Core Flow', category: 'Pilates', date: 'Oct 21, 2025' },
    ];

    return (
        <div className="recentWrkout content-admin-recnt-workout">
            <div className="search-box">
                <span className="search-icon">
                    <img src="/search_icon.png" alt="search icon" />
                </span>
                <input type="text" placeholder="Search workouts..." className="search-input" />
            </div>
            <table className="favourites-tbl">
                <thead>
                    <tr>
                        <th>Workout Name</th>
                        <th>Category</th>

                        <th>Date Completed</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {RecentWorkoutsData.map((workout) => (
                        <tr key={workout.id}>
                            <td>{workout.name}</td>
                            <td>{workout.category}</td>
                            <td>{workout.date}</td>
                            <td>
                                <div className="fav-btn">
                                    <button className="view">
                                        <img src="/view_icon.png" alt="view-icon" />
                                        <div> View</div>
                                    </button>
                                    <button className="delete">
                                        <img src="/delete_icon.png" alt="delete-icon" />
                                        <div> Delete</div>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentWorkouts;
