'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useAuthStore } from '@/stores/useAuthStore';
import './MovementLibrary.css';

type Movement = {
    id: string;
    name: string;
    category: string;
    created_by: string;
    video_url?: string;
    video_provider?: string;
};

const MovementLibraryWorkouts: React.FC = () => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const [movements, setMovements] = useState<Movement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [openCategory, setOpenCategory] = useState(false);
    const [categoryValue, setCategoryValue] = useState('ALL');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (user?.id) {
            setLoading(true);
            fetchMovements(user.id);
        }
    }, [user]);

    const fetchMovements = async (userId: string) => {
        try {
            // const res = await fetch('/api/admin/movement');
            const res = await fetch(`/api/content-admin/movement?userId=${userId}`);
            const data = await res.json();

            if (res.ok && data.success) {
                setMovements(data.data);
            } else {
                console.error('Error fetching movements:', data.error);
                toast.error('Failed to load movements');
            }
        } catch (err: unknown) {
            if (err instanceof Error) toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const categoryOptions = ['ALL', ...Array.from(new Set(movements.map((m) => m.category)))];

    const filteredMovements = movements.filter(
        (m) =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (categoryValue === 'ALL' || m.category === categoryValue),
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
    const indexOfLastMovement = currentPage * itemsPerPage;
    const indexOfFirstMovement = indexOfLastMovement - itemsPerPage;
    const currentMovements = filteredMovements.slice(indexOfFirstMovement, indexOfLastMovement);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, categoryValue]);

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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this movement?')) return;

        try {
            const res = await fetch(`/api/content-admin/movement/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok) {
                toast.success('Movement deleted!');
                setMovements((prev) => prev.filter((m) => m.id !== id));
                return;
            }

            if (res.status === 409 || data?.code === 'MOVEMENT_IN_USE') {
                toast.error(
                    data.error ||
                        'This movement is already used in a workout and cannot be deleted.',
                );
                return;
            }

            toast.error(data.error || 'Failed to delete movement.');
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error('Something went wrong while deleting movement.');
            }
        }
    };

    const handleEdit = (id: string) => {
        router.push(`/content-admin/movement/${id}/edit`);
    };

    return (
        <div className="content-admin-movemntLibrary">
            <div className="cnt-admin-all-catgry">
                <div className="search-box">
                    <span className="search-icon">
                        <Image src="/search_icon.png" alt="search icon" width={15} height={15} />
                    </span>
                    <input
                        type="text"
                        placeholder="Search workouts..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="customDropdown">
                    <button
                        type="button"
                        className={`dropdownBtn ${openCategory ? 'active' : ''}`}
                        onClick={() => setOpenCategory(!openCategory)}
                    >
                        {categoryValue}
                    </button>

                    {openCategory && (
                        <ul className="dropdownList">
                            {categoryOptions.map((opt) => (
                                <li
                                    key={opt}
                                    className="dropdownItem"
                                    onClick={() => {
                                        setCategoryValue(opt);
                                        setOpenCategory(false);
                                    }}
                                >
                                    {opt}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="table-wrapper">
                {loading ? (
                    <p style={{ textAlign: 'center', padding: '20px' }}>Loading movements...</p>
                ) : (
                    <table className="favourites-tbl">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Movement Name</th>
                                <th>Category</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentMovements.length > 0 ? (
                                currentMovements.map((movement, index) => (
                                    <tr key={movement.id}>
                                        <td>{index + 1}</td>
                                        <td>{movement.name}</td>
                                        <td>{movement.category}</td>
                                        <td>
                                            <div className="fav-btn">
                                                <button
                                                    className="view"
                                                    onClick={() => handleEdit(movement.id)}
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
                                                    onClick={() => handleDelete(movement.id)}
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
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        style={{ textAlign: 'center', padding: '20px' }}
                                    >
                                        No movements found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
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
            {!loading && totalPages > 1 && (
                <div className="pagination-info">
                    Showing {indexOfFirstMovement + 1} to {Math.min(indexOfLastMovement, filteredMovements.length)} of {filteredMovements.length} movements
                </div>
            )}

        </div>
    );
};

export default MovementLibraryWorkouts;
