import React from 'react';
import './MyFavorites.css';
interface Workout {
    id: number;
    name: string;
    category: string;
    instructor: string;
}

const MyFavorites: React.FC = () => {
    const favoriteWorkouts: Workout[] = [
        { id: 1, name: 'Power HIIT Circuit', category: 'HIIT', instructor: 'John Deo' },
        { id: 2, name: 'Jab-Cross Burnout', category: 'Boxing', instructor: 'Sarah K.' },
        { id: 3, name: 'Cardio Sculpt', category: 'Cardio', instructor: 'Aman Singh' },
        { id: 4, name: 'Core Crusher', category: 'Abs', instructor: 'Priya Mehta' },
        { id: 5, name: 'Full Body Burn', category: 'Strength', instructor: 'James Parker' },
        { id: 6, name: 'Morning Yoga Flow', category: 'Yoga', instructor: 'Ananya Sharma' },
        { id: 7, name: 'Lower Body Blast', category: 'Legs', instructor: 'Vikram Patel' },
        { id: 8, name: 'Dance Fit Groove', category: 'Zumba', instructor: 'Kavya R.' },
        { id: 9, name: 'Spin & Sweat', category: 'Cycling', instructor: 'David Clark' },
        { id: 10, name: 'Upper Body Power', category: 'Strength', instructor: 'Sonia D.' },
        { id: 11, name: 'Mindful Stretch', category: 'Yoga', instructor: 'Neha Kapoor' },
        { id: 12, name: 'Fat Burn Express', category: 'Cardio', instructor: 'Ryan Lee' },
        { id: 13, name: 'Combat Conditioning', category: 'Boxing', instructor: 'Rohit Raj' },
        { id: 14, name: 'Tabata Torch', category: 'HIIT', instructor: 'Emma Wilson' },
        { id: 15, name: 'Pilates Core Flow', category: 'Pilates', instructor: 'Maya Iyer' },
    ];

    return (
        <div className="content-admin-fav">
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

                        <th>Instructor</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {favoriteWorkouts.map((workout) => (
                        <tr key={workout.id}>
                            <td>{workout.name}</td>
                            <td>{workout.category}</td>
                            <td>{workout.instructor}</td>
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

export default MyFavorites;
