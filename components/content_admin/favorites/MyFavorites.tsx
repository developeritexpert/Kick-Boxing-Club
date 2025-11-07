import React from 'react';
import './MyFavorites.css';
import Image from 'next/image';
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
                    <Image src="/search_icon.png" alt="search icon" width={15} height={15} />
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
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M7.59961 14.6001C11.4657 14.6001 14.5996 11.4662 14.5996 7.6001C14.5996 3.734 11.4657 0.600098 7.59961 0.600098C3.73351 0.600098 0.599609 3.734 0.599609 7.6001C0.599609 11.4662 3.73351 14.6001 7.59961 14.6001Z"
                                                stroke="white"
                                                strokeWidth="1.2"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M6.19922 7.60009V5.17529L8.29922 6.38769L10.3992 7.60009L8.29922 8.81249L6.19922 10.0249V7.60009Z"
                                                stroke="white"
                                                strokeWidth="1.2"
                                                strokeLinejoin="round"
                                            />
                                        </svg>

                                        <div> View</div>
                                    </button>
                                    <button className="delete">
                                        <svg
                                            width="12"
                                            height="15"
                                            viewBox="0 0 12 15"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M7.12012 0.050293L7.13477 0.0649414L7.85742 0.786621H11.2021V3.09717H10.4658V11.8892C10.4658 12.4885 10.2274 13.0639 9.80371 13.4878C9.37983 13.9117 8.80453 14.1498 8.20508 14.1499H3.04688C2.44738 14.1499 1.87215 13.9117 1.44824 13.4878C1.02447 13.0639 0.786133 12.4886 0.786133 11.8892V3.09717H0.0498047V0.786621H3.39453L4.11719 0.0649414L4.13184 0.050293H7.12012ZM1.62305 11.8892C1.62305 12.2666 1.77321 12.629 2.04004 12.896C2.30701 13.163 2.66933 13.313 3.04688 13.313H8.20508C8.58259 13.3129 8.94497 13.1629 9.21191 12.896C9.47871 12.629 9.62891 12.2666 9.62891 11.8892V3.09717H1.62305V11.8892ZM3.83398 4.47119V11.9399H2.99707V4.47119H3.83398ZM8.25488 4.47119V11.9399H7.41797V4.47119H8.25488ZM3.80469 1.62354H0.886719V2.26025H10.3652V1.62354H7.44727L6.71094 0.887207H4.54102L3.80469 1.62354Z"
                                                fill="black"
                                                stroke="black"
                                                strokeWidth="0.1"
                                            />
                                        </svg>

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
