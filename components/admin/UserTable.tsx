'use client';

import React, { useEffect, useState } from 'react';
import './UserTable.css'; // optional styling
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type User = {
    user_id: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'content_admin' | 'instructor';
    email?: string;
};

export default function UserTable() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/admin/users');
                if (!res.ok) throw new Error(res.statusText);

                const dataObj = await res.json();
                setUsers(dataObj.users);
            } catch (err: unknown) {
                let message = 'Unknown error';
                if (err instanceof Error) {
                    message = err.message;
                }
                setError(message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const getAssignedRoleText = (role: User['role']) => {
        switch (role) {
            case 'admin':
                return 'Full access: Manage users, content, classes';
            case 'content_admin':
                return 'Manage workouts, upload videos';
            case 'instructor':
                return 'Conduct classes, track member progress';
            default:
                return '-';
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to delete user');

            setUsers((prev) => prev.filter((u) => u.user_id !== userId));

            toast.success('User deleted successfully');
            router.push('/admin/users');
        } catch (err: unknown) {
            let message = 'Unknown error';
            if (err instanceof Error) message = err.message;
            toast.error(`Error deleting user`);
            console.log(`Error deleting user: ${message}`);
        }
    };

    const formatRole = (role: string) => {
        return role
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Pagination calculations
    const totalPages = Math.ceil(users.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    if (loading) return <p>Loading users...</p>;
    if (error) return <p className="error">Error: {error}</p>;

    return (
        <div className="user-table-container">
            <table className="user-table">
                <thead>
                    <tr>
                        <th>S.no</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Assigned Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.map((user, index) => (
                        <tr key={user.user_id}>
                            <td>{indexOfFirstUser + index + 1}</td>
                            <td>
                                <div className="user-name">
                                    {user.first_name} {user.last_name}
                                </div>
                            </td>
                            <td>{user.email}</td>
                            <td>{formatRole(user.role)}</td>
                            <td>{getAssignedRoleText(user.role)}</td>
                            <td>
                                {/* <button
                                    className="edit-btn"
                                    onClick={() => router.push(`/admin/users/${user.user_id}/edit`)}
                                >
                                    Edit
                                </button>

                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(user.user_id)}
                                >
                                    Delete
                                </button> */}
                                <div className="fav-btn">
                                    <button
                                        className="view"
                                        onClick={() =>
                                            router.push(`/admin/users/${user.user_id}/edit`)
                                        }
                                    >
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
                                            />
                                        </svg>
                                        <div>Edit</div>
                                    </button>
                                    <button
                                        className="delete"
                                        onClick={() => handleDelete(user.user_id)}
                                    >
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
                                        <div>Delete</div>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        Previous
                    </button>

                    <div className="pagination-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                            <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`pagination-number ${
                                    currentPage === pageNumber ? 'active' : ''
                                }`}
                            >
                                {pageNumber}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Optional: Show current page info */}
            {totalPages > 1 && (
                <div className="pagination-info">
                    Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, users.length)} of{' '}
                    {users.length} users
                </div>
            )}
        </div>
    );
}

// // without pagination
// 'use client';

// import React, { useEffect, useState } from 'react';
// import './UserTable.css'; // optional styling
// import { useRouter } from 'next/navigation';
// import toast from 'react-hot-toast';

// type User = {
//     user_id: string;
//     first_name: string;
//     last_name: string;
//     role: 'admin' | 'content_admin' | 'instructor';
//     email?: string;
// };

// export default function UserTable() {
//     const router = useRouter();
//     const [users, setUsers] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         const fetchUsers = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 const res = await fetch('/api/admin/users');
//                 if (!res.ok) throw new Error(res.statusText);

//                 const dataObj = await res.json();
//                 setUsers(dataObj.users);
//             } catch (err: unknown) {
//                 let message = 'Unknown error';
//                 if (err instanceof Error) {
//                     message = err.message;
//                 }
//                 setError(message);
//                 console.error(err);
//                 // setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUsers();
//     }, []);

//     const getAssignedRoleText = (role: User['role']) => {
//         switch (role) {
//             case 'admin':
//                 return 'Full access: Manage users, content, classes';
//             case 'content_admin':
//                 return 'Manage workouts, upload videos';
//             case 'instructor':
//                 return 'Conduct classes, track member progress';
//             default:
//                 return '-';
//         }
//     };

//     const handleDelete = async (userId: string) => {
//         if (!confirm('Are you sure you want to delete this user?')) return;

//         try {
//             const res = await fetch(`/api/admin/users/${userId}`, {
//                 method: 'DELETE',
//             });

//             const data = await res.json();

//             if (!res.ok) throw new Error(data.error || 'Failed to delete user');

//             setUsers((prev) => prev.filter((u) => u.user_id !== userId));

//             toast.success('User deleted successfully');
//             router.push('/admin/users');

//             // alert('User deleted successfully');
//         } catch (err: unknown) {
//             let message = 'Unknown error';
//             if (err instanceof Error) message = err.message;
//             toast.error(`Error deleting user`);
//             console.log(`Error deleting user: ${message}`);
//         }
//     };

//     const formatRole = (role: string) => {
//         return role
//             .split('_')
//             .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//             .join(' ');
//     };

//     if (loading) return <p>Loading users...</p>;
//     if (error) return <p className="error">Error: {error}</p>;

//     return (
//         <div className="user-table-container">
//             <table className="user-table">
//                 <thead>
//                     <tr>
//                         <th>S.no</th>
//                         <th>Name</th>
//                         <th>Email</th>
//                         <th>Role</th>
//                         <th>Assigned Role</th>
//                         <th>Action</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {users.map((user, index) => (
//                         <tr key={user.user_id}>
//                             {/* <td>{user.user_id}</td> */}
//                             <td>{index + 1}</td>
//                             <td>
//                                 <div className="user-name">
//                                     {/* <div className="avatar-placeholder" /> */}
//                                     {user.first_name} {user.last_name}
//                                 </div>
//                             </td>
//                             <td>{user.email}</td>
//                             <td>{formatRole(user.role)}</td>
//                             <td>{getAssignedRoleText(user.role)}</td>
//                             <td>
//                                 {/* <button className="edit-btn">Edit</button> */}

//                                 <button
//                                     className="edit-btn"
//                                     onClick={() => router.push(`/admin/users/${user.user_id}/edit`)}
//                                 >
//                                     Edit
//                                 </button>

//                                 {/* <button className="delete-btn">Delete</button> */}

//                                 <button
//                                     className="delete-btn"
//                                     onClick={() => handleDelete(user.user_id)}
//                                 >
//                                     Delete
//                                 </button>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// }
