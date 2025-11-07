'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/useAuthStore';
import './CreateWorkout.css';

interface Movement {
    id: string;
    name: string;
    video_id: string | null;
    thumbnail_url: string | null;
    duration: number | null;
    category: string;
}

interface SelectedMovement extends Movement {
    order: number;
}

const CreateWorkout: React.FC = () => {
    const user = useAuthStore((state) => state.user);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [focus, setFocus] = useState('');
    const [movements, setMovements] = useState<Movement[]>([]);
    const [boxingMovements, setBoxingMovements] = useState<SelectedMovement[]>([]);
    const [kickboxingMovements, setKickboxingMovements] = useState<SelectedMovement[]>([]);
    const [hiitMovements, setHiitMovements] = useState<SelectedMovement[]>([]);
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<'boxing' | 'kickboxing' | 'hiit' | null>(
        null,
    );
    const [tempSelected, setTempSelected] = useState<SelectedMovement[]>([]);

    // ========================================================
    // const [workoutClass, setworkoutClass] = useState('');
    // const [location, setLocation] = useState('');
    // ========================================================
    // ========================= New states ====================

    const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
    const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
    const [locationId, setLocationId] = useState('');
    const [classId, setClassId] = useState('');

    // ++++++++++++++++++End new states+++++++++++++++++++++

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locRes, classRes] = await Promise.all([
                    fetch('/api/admin/location'),
                    fetch('/api/admin/class'),
                ]);
                const locData = await locRes.json();
                const classData = await classRes.json();

                // console.log(`All loctions : ${JSON.stringify(locData)} `);
                // console.log(`All Classes : ${JSON.stringify(classData)} `);

                const locationsArray = Array.isArray(locData)
                    ? locData
                    : Array.isArray(locData.data)
                      ? locData.data
                      : [];

                const classesArray = Array.isArray(classData)
                    ? classData
                    : Array.isArray(classData.data)
                      ? classData.data
                      : [];

                setLocations(locationsArray || []);
                setClasses(classesArray || []);
            } catch (error) {
                console.error('Error fetching location/class data:', error);
            }
        };

        fetchData();
    }, []);

    const MAX_MOVEMENTS_PER_CATEGORY = 5;
    useEffect(() => {
        const fetchMovements = async () => {
            try {
                const res = await fetch('/api/admin/movement');
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || 'Failed to load movements');
                setMovements(data.data || []);
            } catch (err) {
                console.error(err);
                const message = err instanceof Error ? err.message : 'Failed to load movements';
                toast.error(message);
            }
        };

        fetchMovements();
    }, []);

    const openPopup = (category: 'boxing' | 'kickboxing' | 'hiit') => {
        setCurrentCategory(category);
        const existingSelections =
            category === 'boxing'
                ? boxingMovements
                : category === 'kickboxing'
                  ? kickboxingMovements
                  : hiitMovements;
        setTempSelected([...existingSelections]);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setCurrentCategory(null);
        setTempSelected([]);
    };

    const toggleTempSelection = (movement: Movement) => {
        setTempSelected((prev) => {
            const exists = prev.find((m) => m.id === movement.id);
            if (exists) {
                return prev.filter((m) => m.id !== movement.id);
            } else {
                if (prev.length >= MAX_MOVEMENTS_PER_CATEGORY) {
                    // toast.error(`Maximum ${MAX_MOVEMENTS_PER_CATEGORY} movements allowed per category`);
                    setTimeout(() => {
                        toast.error(
                            `Maximum ${MAX_MOVEMENTS_PER_CATEGORY} movements allowed per category`,
                        );
                    }, 0);
                    return prev;
                }
                return [...prev, { ...movement, order: prev.length + 1 }];
            }
        });
    };

    const saveSelection = () => {
        if (!currentCategory) return;

        if (currentCategory === 'boxing') {
            setBoxingMovements(tempSelected);
        } else if (currentCategory === 'kickboxing') {
            setKickboxingMovements(tempSelected);
        } else {
            setHiitMovements(tempSelected);
        }

        closePopup();
        const categoryName = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
        toast.success(`${categoryName} movements updated`);
    };

    const handleMoveUp = (category: 'boxing' | 'kickboxing' | 'hiit', index: number) => {
        if (index === 0) return;

        const setter =
            category === 'boxing'
                ? setBoxingMovements
                : category === 'kickboxing'
                  ? setKickboxingMovements
                  : setHiitMovements;

        setter((prev) => {
            const updated = [...prev];
            [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
            return updated.map((m, i) => ({ ...m, order: i + 1 }));
        });
    };

    const handleMoveDown = (
        category: 'boxing' | 'kickboxing' | 'hiit',
        index: number,
        length: number,
    ) => {
        if (index === length - 1) return;

        const setter =
            category === 'boxing'
                ? setBoxingMovements
                : category === 'kickboxing'
                  ? setKickboxingMovements
                  : setHiitMovements;

        setter((prev) => {
            const updated = [...prev];
            [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
            return updated.map((m, i) => ({ ...m, order: i + 1 }));
        });
    };

    const removeMovement = (category: 'boxing' | 'kickboxing' | 'hiit', movementId: string) => {
        const setter =
            category === 'boxing'
                ? setBoxingMovements
                : category === 'kickboxing'
                  ? setKickboxingMovements
                  : setHiitMovements;

        setter((prev) => {
            const filtered = prev.filter((m) => m.id !== movementId);
            return filtered.map((m, i) => ({ ...m, order: i + 1 }));
        });
    };

    const handleCancel = () => {
        setName('');
        setDescription('');
        setFocus('');
        setBoxingMovements([]);
        setKickboxingMovements([]);
        setHiitMovements([]);

        // ==================
        // setLocation('');
        // setworkoutClass('');
        // ==================
        setLocations([]);
        setClasses([]);
        setLocationId('');
        setClassId('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Workout name is required');
            return;
        }

        const allMovements = [...boxingMovements, ...kickboxingMovements, ...hiitMovements];

        if (allMovements.length === 0) {
            toast.error('Please select at least one movement');
            return;
        }

        let created_by = '';
        if (user?.id) {
            created_by = user.id;
            console.log('workout stored by user id :');
            console.log(user.id);
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admin/workout/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    locationId,
                    classId,
                    focus,
                    created_by,
                    movements: allMovements.map((m, index) => ({
                        id: m.id,
                        order: index + 1,
                        duration: m.duration || 30,
                        rest_after: 30,
                    })),
                }),
            });
            // const res = await fetch('/api/admin/workout/create', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         name,
            //         description,
            //         location,
            //         focus,
            //         workoutClass,
            //         movements: allMovements.map((m, index) => ({
            //             id: m.id,
            //             order: index + 1,
            //             duration: m.duration || 30,
            //             rest_after: 30,
            //         })),
            //     }),
            // });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create workout');

            toast.success('Workout created successfully!');
            handleCancel();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const filteredMovements = currentCategory
        ? movements.filter((m) => m.category.toLowerCase() === currentCategory.toLowerCase())
        : [];

    const renderCategoryBox = (
        category: 'boxing' | 'kickboxing' | 'hiit',
        title: string,
        selectedMovements: SelectedMovement[],
    ) => (
        <div className="class-type-box">
            <div className="class-header">
                <h4>{title}</h4>
                <button type="button" className="add-btn" onClick={() => openPopup(category)}>
                    + Add
                </button>
            </div>
            <div className="movement-list">
                {selectedMovements.length === 0 ? (
                    <p className="empty-text">No movements selected</p>
                ) : (
                    <>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                            {selectedMovements.length}/{MAX_MOVEMENTS_PER_CATEGORY} movements
                        </p>
                        {selectedMovements.map((m, idx) => (
                            <div key={m.id} className="movement-item-with-controls">
                                <span className="movement-name">
                                    {idx + 1}. {m.name}
                                </span>
                                <div className="movement-controls">
                                    <button
                                        type="button"
                                        className="arrow-btn"
                                        onClick={() => handleMoveUp(category, idx)}
                                        disabled={idx === 0}
                                        title="Move up"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        type="button"
                                        className="arrow-btn"
                                        onClick={() =>
                                            handleMoveDown(category, idx, selectedMovements.length)
                                        }
                                        disabled={idx === selectedMovements.length - 1}
                                        title="Move down"
                                    >
                                        ↓
                                    </button>
                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={() => removeMovement(category, m.id)}
                                        title="Remove"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="create-workout-container">
            <h2>Create New Workout</h2>

            <div className="workout-layout">
                <div className="left-section">
                    <form className="create-workout-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Workout Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter workout name"
                                required
                            />
                        </div>

                        {/* New location and class section */}
                        <div className="form-row">
                            <div className="form-group">
                                <label>Location</label>
                                <select
                                    value={locationId}
                                    onChange={(e) => setLocationId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Location</option>
                                    {locations.map((loc) => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Class</label>
                                <select
                                    value={classId}
                                    onChange={(e) => setClassId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* <div className="form-row">
                            <div className="form-group">
                                <label>Location</label>
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                >
                                    <option value="">Select Location</option>
                                    <option value="Lakewood">Lakewood</option>
                                    <option value="Orange">Orange</option>
                                    <option value="Downey">Downey</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Class</label>
                                <select
                                    value={workoutClass}
                                    onChange={(e) => setworkoutClass(e.target.value)}
                                >
                                    <option value="">Select Class</option>
                                    <option value="Fitness Kickboxing">Fitness Kickboxing</option>
                                    <option value="Jus' Kickboxing">Jus&apos; Kickboxing</option>
                                    <option value="Power Kickboxing">Power Kickboxing</option>
                                </select>
                            </div>
                        </div> */}

                        <div className="form-group focus-group">
                            <label>Focus</label>
                            <div className="focus-buttons">
                                {['Upper Body', 'Lower Body', 'Full Body'].map((f) => (
                                    <button
                                        key={f}
                                        type="button"
                                        className={`focus-btn ${focus === f ? 'active' : ''}`}
                                        onClick={() => setFocus(f)}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="workout-list-section">
                            <h4>Workout List</h4>
                            <div className="workout-items hide-scrollbar">
                                {movements.map((m) => (
                                    <div key={m.id} className="workout-item">
                                        {m.name}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="button-group">
                            <button type="button" className="btn cancel" onClick={handleCancel}>
                                Cancel
                            </button>
                            <button type="submit" className="btn create" disabled={loading}>
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="right-section">
                    <h3>Class Type</h3>

                    {renderCategoryBox('boxing', 'Boxing', boxingMovements)}
                    {renderCategoryBox('kickboxing', 'Kickboxing', kickboxingMovements)}
                    {renderCategoryBox('hiit', 'HIIT', hiitMovements)}
                </div>
            </div>

            {/* modal */}
            {showPopup && (
                <div className="modal-overlay" onClick={closePopup}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                Select {currentCategory ? currentCategory.toUpperCase() : ''}{' '}
                                Movements
                            </h3>
                            <button className="close-btn" onClick={closePopup}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            {filteredMovements.length === 0 ? (
                                <p className="empty-text">
                                    No movements available for this category
                                </p>
                            ) : (
                                <>
                                    <p style={{ marginBottom: '16px', color: '#666' }}>
                                        Selected: {tempSelected.length}/{MAX_MOVEMENTS_PER_CATEGORY}
                                    </p>
                                    <div className="movements-grid">
                                        {filteredMovements.map((m) => {
                                            const isSelected = tempSelected.some(
                                                (sel) => sel.id === m.id,
                                            );
                                            const selectionOrder = tempSelected.findIndex(
                                                (sel) => sel.id === m.id,
                                            );

                                            return (
                                                <div
                                                    key={m.id}
                                                    className={`movement-card ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => toggleTempSelection(m)}
                                                >
                                                    {isSelected && (
                                                        <div className="selection-badge">
                                                            {selectionOrder + 1}
                                                        </div>
                                                    )}
                                                    <img
                                                        src={
                                                            m.thumbnail_url ||
                                                            '/placeholder-thumb.png'
                                                        }
                                                        alt={m.name}
                                                        className="movement-thumb"
                                                    />
                                                    <p>{m.name}</p>
                                                    <small>
                                                        {m.duration
                                                            ? `${m.duration}s`
                                                            : 'No duration'}
                                                    </small>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn cancel" onClick={closePopup}>
                                Cancel
                            </button>
                            <button className="btn create" onClick={saveSelection}>
                                Save ({tempSelected.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateWorkout;
