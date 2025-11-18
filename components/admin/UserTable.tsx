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
                                <button
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
                                </button>
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
                    Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, users.length)} of {users.length} users
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
